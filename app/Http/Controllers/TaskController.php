<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use App\Models\Project;
use App\Models\Comment; // Import the Comment model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Validation\Rule; // Import the Rule class for 'in' validation

class TaskController extends Controller
{
    /**
     * Memeriksa apakah pengguna yang diautentikasi adalah Admin atau Manajer Proyek.
     * Menghentikan eksekusi dengan error 403 jika tidak.
     */
    private function checkIfProjectManager()
    {
        $user = Auth::user();
        if (!in_array($user->role, ['Admin', 'Manajer Proyek'])) {
            abort(403, 'Tindakan tidak sah.');
        }
    }

    /**
     * Memeriksa apakah pengguna yang diautentikasi dapat memperbarui tugas tertentu.
     * Izin diberikan kepada Admin, Manajer Proyek, atau Anggota Tim yang ditugaskan pada tugas tersebut.
     */
    private function canUpdateTask(Task $task)
    {
        $user = Auth::user();
        return $user->role === 'Admin' ||
               $user->role === 'Manajer Proyek' ||
               ($user->role === 'Anggota Tim' && $task->assigned_to === $user->id);
    }

    /**
     * Memvalidasi apakah pengguna yang ditugaskan adalah anggota proyek.
     * Melempar exception jika tidak.
     */
    private function validateProjectMember($projectId, $userId)
    {
        $project = Project::with(['members', 'leader'])->findOrFail($projectId);
        $isMember = $project->members->contains('id', $userId) || $project->leader_id === $userId;
        
        if (!$isMember) {
            throw new \Exception('Pengguna yang ditugaskan harus menjadi anggota proyek.');
        }
        
        return true;
    }

    /**
     * Menampilkan daftar semua tugas, difilter berdasarkan peran pengguna.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $user = Auth::user();

        $tasks = Task::with(['project', 'owner', 'assignedTo', 'comments.user', 'project.members', 'project.leader'])
            ->when($user->role === 'Anggota Tim', function($query) use ($user) {
                $query->where(function($q) use ($user) {
                    $q->where('assigned_to', $user->id)
                      ->orWhereHas('project', function($q) use ($user) {
                          $q->where('leader_id', $user->id)
                            ->orWhereHas('members', function($q) use ($user) {
                                $q->where('users.id', $user->id);
                            });
                      });
                });
            })
            ->get();

        Log::info('Data tugas sedang dikirim ke view:', [
            'jumlah' => $tasks->count(),
            'peran_pengguna' => $user->role,
            'id_pengguna' => $user->id,
            'tugas_pertama' => $tasks->first() ? [
                'id' => $tasks->first()->id,
                'judul' => $tasks->first()->title,
                'proyek' => $tasks->first()->project ? [
                    'id' => $tasks->first()->project->id,
                    'nama' => $tasks->first()->project->name
                ] : null,
                'ditugaskan_kepada' => $tasks->first()->assignedTo ? [
                    'id' => $tasks->first()->assignedTo->id,
                    'nama' => $tasks->first()->assignedTo->name
                ] : null
            ] : null
        ]);

        return Inertia::render('Tasks', [
            'tasks' => $tasks,
            'projects' => Project::with(['members', 'leader'])->get(),
            'teamMembers' => User::where('role', 'Anggota Tim')->get(),
            'can' => [
                'create' => in_array($user->role, ['Admin', 'Manajer Proyek']),
                'edit' => in_array($user->role, ['Admin', 'Manajer Proyek', 'Anggota Tim']),
                'delete' => in_array($user->role, ['Admin', 'Manajer Proyek'])
            ]
        ]);
    }

    /**
     * Menampilkan tugas berdasarkan proyek tertentu.
     *
     * @param  \App\Models\Project  $project
     * @return \Inertia\Response
     */
    public function indexByProject(Project $project)
    {
        $user = Auth::user();

        // Check if user has access to this project
        if ($user->role === 'Anggota Tim' && 
            $project->leader_id !== $user->id && 
            !$project->members->contains('id', $user->id)) {
            abort(403, 'Anda tidak memiliki akses ke proyek ini.');
        }

        $tasks = Task::with(['project', 'owner', 'assignedTo', 'comments.user'])
            ->where('project_id', $project->id)
            ->get();

        return Inertia::render('Tasks', [
            'tasks' => $tasks,
            'projects' => Project::with(['members', 'leader'])->get(),
            'teamMembers' => User::where('role', 'Anggota Tim')->get(),
            'can' => [
                'create' => in_array($user->role, ['Admin', 'Manajer Proyek']),
                'edit' => in_array($user->role, ['Admin', 'Manajer Proyek', 'Anggota Tim']),
                'delete' => in_array($user->role, ['Admin', 'Manajer Proyek'])
            ],
            'projectId' => $project->id
        ]);
    }

    /**
     * Menyimpan tugas baru ke database.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $this->checkIfProjectManager();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'project_id' => 'required|exists:projects,id',
            // Field 'assigned_to' digunakan untuk menugaskan tugas ke seorang user
            'assigned_to' => 'required|exists:users,id',
            'status' => ['required', 'string', Rule::in(['Not Started', 'Working on it', 'Stuck', 'Done'])],
            'due_date' => 'nullable|date',
            'priority' => ['nullable', 'string', Rule::in(['Low', 'Medium', 'High'])],
            'notes' => 'nullable|string',
            'timeline_start' => 'nullable|date',
            'timeline_end' => 'nullable|date|after_or_equal:timeline_start',
        ]);

        try {
            $this->validateProjectMember($validated['project_id'], $validated['assigned_to']);
            $task = Task::create([
                'title' => $validated['title'],
                'description' => $validated['notes'], // Menggunakan notes sebagai deskripsi untuk saat ini
                'project_id' => $validated['project_id'],
                'owner_id' => Auth::id(),
                'assigned_to' => $validated['assigned_to'],
                'status' => $validated['status'],
                'due_date' => $validated['due_date'],
                'priority' => $validated['priority'],
                'notes' => $validated['notes'],
                'timeline_start' => $validated['timeline_start'],
                'timeline_end' => $validated['timeline_end'],
            ]);
            return redirect()->route('tasks.index')->with('success', 'Tugas berhasil dibuat.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['assigned_to' => $e->getMessage()]);
        }
    }

    /**
     * Memperbarui tugas yang ada di database.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Task  $task
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Task $task)
    {
        // Check authorization
        if (!$this->canUpdateTask($task)) {
            return redirect()->back()->withErrors(['authorization' => 'Anda tidak diizinkan untuk memperbarui tugas ini.']);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'project_id' => 'required|exists:projects,id',
            // Field 'assigned_to' digunakan untuk menugaskan tugas ke seorang user
            'assigned_to' => 'required|exists:users,id',
            'status' => ['required', 'string', Rule::in(['Not Started', 'Working on it', 'Stuck', 'Done'])],
            'due_date' => 'nullable|date',
            'priority' => ['nullable', 'string', Rule::in(['Low', 'Medium', 'High'])],
            'notes' => 'nullable|string',
            'timeline_start' => 'nullable|date',
            'timeline_end' => 'nullable|date|after_or_equal:timeline_start',
        ]);

        try {
            $this->validateProjectMember($validated['project_id'], $validated['assigned_to']);
            $task->update([
                'title' => $validated['title'],
                'description' => $validated['notes'], // Menggunakan notes sebagai deskripsi untuk saat ini
                'project_id' => $validated['project_id'],
                'assigned_to' => $validated['assigned_to'],
                'status' => $validated['status'],
                'due_date' => $validated['due_date'],
                'priority' => $validated['priority'],
                'notes' => $validated['notes'],
                'timeline_start' => $validated['timeline_start'],
                'timeline_end' => $validated['timeline_end'],
            ]);
            return redirect()->route('tasks.index')->with('success', 'Tugas berhasil diperbarui.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['assigned_to' => $e->getMessage()]);
        }
    }

    /**
     * Menghapus tugas dari database.
     *
     * @param  \App\Models\Task  $task
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Task $task)
    {
        $user = Auth::user();
        if (!in_array($user->role, ['Admin', 'Manajer Proyek'])) {
            abort(403, 'Tindakan tidak sah.');
        }

        $task->delete();
        return redirect()->route('tasks.index')->with('success', 'Tugas berhasil dihapus.');
    }

    /**
     * Memperbarui status tugas melalui AJAX (untuk fungsionalitas drag and drop Kanban).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Task  $task
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, Task $task)
    {
        // 1. Otorisasi: Memeriksa apakah pengguna diizinkan untuk memperbarui tugas ini.
        if (!$this->canUpdateTask($task)) {
            return response()->json(['message' => 'Anda tidak diizinkan untuk memperbarui tugas ini.'], 403);
        }

        // 2. Validasi: Memastikan 'status' yang dikirim adalah salah satu nilai yang diizinkan.
        // Nilai-nilai ini HARUS cocok dengan array 'statusLabels' di frontend React Anda.
        $validated = $request->validate([
            'status' => [
                'required',
                'string',
                Rule::in(['Working on it', 'Stuck', 'Done', 'Not Started']), // Ini adalah bagian krusial!
            ],
        ]);

        // 3. Pembaruan Database: Memperbarui status tugas.
        try {
            $task->status = $validated['status'];
            $task->save();

            // 4. Merespons dengan pesan sukses.
            return response()->json(['success' => true, 'message' => 'Status tugas berhasil diperbarui.']);
        } catch (\Exception $e) {
            // 5. Merespons dengan pesan error jika terjadi kesalahan.
            Log::error('Error saat memperbarui status tugas: ' . $e->getMessage(), ['task_id' => $task->id, 'new_status' => $validated['status']]);
            return response()->json(['message' => 'Gagal memperbarui status tugas. Silakan coba lagi.'], 500);
        }
    }

    /**
     * Menyimpan komentar baru untuk tugas tertentu.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Task  $task
     * @return \Illuminate\Http\JsonResponse
     */
    public function storeComment(Request $request, Task $task)
    {
        // Otorisasi: Hanya anggota tim yang ditugaskan, manajer proyek, atau admin yang dapat berkomentar
        $user = Auth::user();
        $canComment = $user->role === 'Admin' ||
                      $user->role === 'Manajer Proyek' ||
                      ($task->assigned_to === $user->id) || // Jika ditugaskan ke tugas ini
                      ($task->owner_id === $user->id) || // Jika pemilik tugas
                      ($task->project->leader_id === $user->id) || // Jika pemimpin proyek
                      $task->project->members->contains('id', $user->id); // Jika anggota proyek

        if (!$canComment) {
            return response()->json(['message' => 'Anda tidak diizinkan untuk menambahkan komentar pada tugas ini.'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        try {
            $comment = $task->comments()->create([
                'user_id' => $user->id,
                'content' => $validated['content'],
            ]);
            // Eager load user untuk komentar yang baru dibuat untuk respons
            $comment->load('user');
            return response()->json(['success' => true, 'message' => 'Komentar berhasil ditambahkan.', 'comment' => $comment]);
        } catch (\Exception $e) {
            Log::error('Error adding comment: ' . $e->getMessage(), ['task_id' => $task->id, 'user_id' => $user->id]);
            return response()->json(['message' => 'Gagal menambahkan komentar. Silakan coba lagi.'], 500);
        }
    }
}

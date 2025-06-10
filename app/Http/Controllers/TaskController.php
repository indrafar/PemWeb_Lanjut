<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TaskController extends Controller
{
    private function checkIfProjectManager()
    {
        if (!in_array(auth()->user()->role, ['Admin', 'Manajer Proyek'])) {
            abort(403, 'Unauthorized action.');
        }
    }

    public function index()
    {
        $user = auth()->user();
        
        $tasks = Task::with(['project', 'owner', 'assignedTo', 'comments.user'])
            ->when($user->role === 'Anggota Tim', function($query) use ($user) {
                return $query->where('assigned_to', $user->id);
            })
            ->get();

        return Inertia::render('Tasks', [
            'tasks' => $tasks,
            'projects' => Project::all(),
            'teamMembers' => User::where('role', 'Anggota Tim')->get(),
            'can' => [
                'create' => in_array($user->role, ['Admin', 'Manajer Proyek']),
                'edit' => in_array($user->role, ['Admin', 'Manajer Proyek', 'Anggota Tim']),
                'delete' => in_array($user->role, ['Admin', 'Manajer Proyek'])
            ]
        ]);
    }

    public function store(Request $request)
    {
        $this->checkIfProjectManager();

        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'project_id' => 'required|exists:projects,id',
                'assigned_to' => 'required|exists:users,id',
                'status' => 'required|in:Working on it,Done,Stuck',
                'due_date' => 'required|date',
                'notes' => 'nullable|string',
                'timeline_start' => 'required|date',
                'timeline_end' => 'required|date|after_or_equal:timeline_start'
            ]);

            $task = Task::create([
                ...$validated,
                'owner_id' => auth()->id()
            ]);

            return redirect()->back()->with('success', 'Task created successfully');
        } catch (\Exception $e) {
            Log::error('Task creation failed', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return redirect()->back()
                ->withErrors(['error' => 'Failed to create task'])
                ->withInput();
        }
    }

    public function update(Request $request, Task $task)
    {
        $user = auth()->user();
        
        // Check if user can update this task
        if (!($user->role === 'Admin' || 
            $user->role === 'Manajer Proyek' || 
            ($user->role === 'Anggota Tim' && $task->assigned_to === $user->id))) {
            abort(403, 'Unauthorized action.');
        }

        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'project_id' => 'required|exists:projects,id',
                'assigned_to' => 'required|exists:users,id',
                'status' => 'required|in:Working on it,Done,Stuck',
                'due_date' => 'required|date',
                'notes' => 'nullable|string',
                'timeline_start' => 'required|date',
                'timeline_end' => 'required|date|after_or_equal:timeline_start'
            ]);

            $task->update($validated);

            return redirect()->back()->with('success', 'Task updated successfully');
        } catch (\Exception $e) {
            \Log::error('Task update failed', [
                'error' => $e->getMessage(),
                'task_id' => $task->id,
                'request' => $request->all()
            ]);

            return redirect()->back()
                ->withErrors(['error' => 'Failed to update task'])
                ->withInput();
        }
    }

    public function destroy(Task $task)
    {
        $this->checkIfProjectManager();
        
        $task->delete();

        return redirect()->back()->with('message', 'Task deleted successfully');
    }

    public function toggleStatus(Task $task)
    {
        if (!$this->canUpdateTask($task)) {
            abort(403, 'Unauthorized action.');
        }

        $newStatus = $task->status === 'Done' ? 'Working on it' : 'Done';
        $task->update(['status' => $newStatus]);

        return redirect()->back()->with('message', 'Task status updated successfully');
    }
}
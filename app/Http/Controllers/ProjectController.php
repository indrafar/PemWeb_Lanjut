<?php
namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    private function checkIfAdmin()
    {
        if (Auth::user()->role !== 'Admin') {
            abort(403, 'Unauthorized action.');
        }
        return true;
    }

    private function checkIfManagerOrAdmin()
    {
        if (!in_array(Auth::user()->role, ['Admin', 'Manajer Proyek'])) {
            abort(403, 'Unauthorized action.');
        }
        return true;
    }

    public function index()
    {
        $projects = Project::with(['leader', 'members'])->get();
        $teamMembers = User::all();

        return Inertia::render('Projects', [
            'projects' => $projects,
            'teamMembers' => $teamMembers,
            'can' => [
                'create' => in_array(Auth::user()->role, ['Admin', 'Manajer Proyek']),
                'edit' => in_array(Auth::user()->role, ['Admin', 'Manajer Proyek']),
                'delete' => Auth::user()->role === 'Admin'
            ]
        ]);
    }

    public function store(Request $request)
    {
        $this->checkIfManagerOrAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|in:Active,Completed,Pending',
            'deadline' => 'required|date',
            'leader_id' => 'required|exists:users,id',
            'member_ids' => 'required|array',
            'member_ids.*' => 'exists:users,id',
            'description' => 'required|string'
        ]);

        $project = Project::create([
            'name' => $validated['name'],
            'status' => $validated['status'],
            'deadline' => $validated['deadline'],
            'leader_id' => $validated['leader_id'],
            'description' => $validated['description'],
        ]);

        $project->members()->attach($validated['member_ids']);

        return redirect()->back()->with('message', 'Project created successfully');
    }

    public function update(Request $request, Project $project)
    {
        $this->checkIfManagerOrAdmin();

        $data = $request->validate([
            'name' => 'required|string',
            'status' => 'required|string',
            'deadline' => 'required|date',
            'leader_id' => 'required|exists:users,id',
            'member_ids' => 'array',
            'member_ids.*' => 'exists:users,id',
            'description' => 'required|string',
        ]);

        $project->update([
            'name' => $data['name'],
            'status' => $data['status'],
            'deadline' => $data['deadline'],
            'leader_id' => $data['leader_id'],
            'description' => $data['description'],
        ]);

        // Sync members jika pakai relasi many-to-many
        if (isset($data['member_ids'])) {
            $project->members()->sync($data['member_ids']);
        }

        return redirect()->back()->with('success', 'Project updated!');
    }

    public function destroy(Project $project)
    {
        $this->checkIfAdmin();
        $project->delete();
        return redirect()->back()->with('message', 'Project deleted successfully');
    }
}
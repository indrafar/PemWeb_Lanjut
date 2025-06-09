<?php
namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    private function checkIfAdmin()
    {
        if (auth()->user()->role !== 'Admin') {
            abort(403, 'Unauthorized action.');
        }
        return true;
    }

    private function checkIfManagerOrAdmin()
    {
        if (!in_array(auth()->user()->role, ['Admin', 'Manajer Proyek'])) {
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
                'create' => in_array(auth()->user()->role, ['Admin', 'Manajer Proyek']),
                'edit' => in_array(auth()->user()->role, ['Admin', 'Manajer Proyek']),
                'delete' => auth()->user()->role === 'Admin'
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

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|in:Active,Completed,Pending',
            'deadline' => 'required|date',
            'leader_id' => 'required|exists:users,id',
            'member_ids' => 'required|array',
            'member_ids.*' => 'exists:users,id',
            'description' => 'required|string'
        ]);

        $project->update([
            'name' => $validated['name'],
            'status' => $validated['status'],
            'deadline' => $validated['deadline'],
            'leader_id' => $validated['leader_id'],
            'description' => $validated['description'],
        ]);

        $project->members()->sync($validated['member_ids']);

        return redirect()->back()->with('message', 'Project updated successfully');
    }

    public function destroy(Project $project)
    {
        $this->checkIfAdmin();
        $project->delete();
        return redirect()->back()->with('message', 'Project deleted successfully');
    }
}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Task;

class ProjectTaskController extends Controller
{
    public function store(Request $request, Project $project)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'owner' => 'nullable|string',
            'status' => 'required|string',
            'due_date' => 'nullable|date',
            'priority' => 'required|string',
        ]);

        $data['project_id'] = $project->id;
        Task::create($data);

        return back()->with('success', 'Task added!');
    }
}
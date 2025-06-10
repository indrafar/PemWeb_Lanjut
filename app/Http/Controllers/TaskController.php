<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index()
    {
        return inertia('Tasks', [
            'tasks' => Task::with('project')->get(),
            'projects' => Project::all(),
        ]);
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'owner' => 'nullable|string|max:255',
            'status' => 'required|string|max:255',
            'due_date' => 'nullable|date',
            'priority' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'files' => 'nullable|string',
            'timeline_start' => 'nullable|date',
            'timeline_end' => 'nullable|date',
        ]);
        $task->update($validated);

        return redirect()->route('tasks');
    }
}
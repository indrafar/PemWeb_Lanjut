<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrashController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        if (!in_array($user->role, ['Admin', 'Manajer Proyek'])) {
            abort(403);
        }

        return Inertia::render('Trash', [
            'deletedProjects' => Project::onlyTrashed()
                ->with(['leader'])
                ->get(),
            'deletedTasks' => Task::onlyTrashed()
                ->with(['project', 'owner', 'assignedTo'])
                ->get(),
            'can' => [
                'restore' => in_array($user->role, ['Admin', 'Manajer Proyek']),
                'forceDelete' => $user->role === 'Admin'
            ]
        ]);
    }

    public function restore(Request $request)
    {
        if (!in_array(auth()->user()->role, ['Admin', 'Manajer Proyek'])) {
            abort(403);
        }

        if ($request->type === 'project') {
            Project::withTrashed()->findOrFail($request->id)->restore();
        } else {
            Task::withTrashed()->findOrFail($request->id)->restore();
        }

        return redirect()->back()->with('success', 'Item restored successfully');
    }

    public function forceDelete(Request $request)
    {
        if (auth()->user()->role !== 'Admin') {
            abort(403);
        }

        if ($request->type === 'project') {
            Project::withTrashed()->findOrFail($request->id)->forceDelete();
        } else {
            Task::withTrashed()->findOrFail($request->id)->forceDelete();
        }

        return redirect()->back()->with('success', 'Item permanently deleted');
    }
}
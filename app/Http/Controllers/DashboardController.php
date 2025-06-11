<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Get task counts based on status
        $taskCounts = Task::when($user->role === 'Anggota Tim', function($query) use ($user) {
            return $query->where('assigned_to', $user->id);
        })
        ->selectRaw('
            COUNT(*) as total,
            COUNT(CASE WHEN status = "Working on it" THEN 1 END) as in_progress,
            COUNT(CASE WHEN status = "Stuck" THEN 1 END) as stuck,
            COUNT(CASE WHEN status = "Done" THEN 1 END) as done
        ')
        ->first();

        // Tasks by due date
        $tasksByDueDate = Task::when($user->role === 'Anggota Tim', function($query) use ($user) {
            return $query->where('assigned_to', $user->id);
        })
        ->selectRaw('DATE(due_date) as date, COUNT(*) as tasks')
        ->groupBy('date')
        ->orderBy('date')
        ->limit(7)
        ->get();

        // Overdue tasks (due_date < today & not done)
        $overdueTasks = Task::when($user->role === 'Anggota Tim', function($query) use ($user) {
            return $query->where('assigned_to', $user->id);
        })
        ->where('due_date', '<', now())
        ->where('status', '!=', 'Done')
        ->get(['id', 'title', 'due_date']);

        // Tasks by owner
        $tasksByOwner = Task::when($user->role === 'Anggota Tim', function($query) use ($user) {
            return $query->where('assigned_to', $user->id);
        }, function($query) {
            return $query->selectRaw('users.name as owner_name, COUNT(*) as tasks_count')
                         ->join('users', 'tasks.assigned_to', '=', 'users.id')
                         ->groupBy('users.name');
        })->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'total' => $taskCounts->total ?? 0,
                'inProgress' => $taskCounts->in_progress ?? 0,
                'stuck' => $taskCounts->stuck ?? 0,
                'done' => $taskCounts->done ?? 0
            ],
            'chartData' => $tasksByDueDate,
            'overdueTasks' => $overdueTasks,
            'tasksByOwner' => $tasksByOwner
        ]);
    }
}

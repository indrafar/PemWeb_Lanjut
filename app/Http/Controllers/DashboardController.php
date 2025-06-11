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

        // Get tasks by due date for chart
        $tasksByDueDate = Task::when($user->role === 'Anggota Tim', function($query) use ($user) {
            return $query->where('assigned_to', $user->id);
        })
        ->selectRaw('DATE(due_date) as date, COUNT(*) as tasks')
        ->groupBy('date')
        ->orderBy('date')
        ->limit(7)
        ->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'total' => $taskCounts->total,
                'inProgress' => $taskCounts->in_progress,
                'stuck' => $taskCounts->stuck,
                'done' => $taskCounts->done
            ],
            'chartData' => $tasksByDueDate
        ]);
    }
}
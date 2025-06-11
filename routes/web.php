<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TrashController;
use App\Http\Controllers\CalendarController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Guest Routes
Route::middleware('guest')->group(function () {
    // Redirect root to login
    Route::get('/', function () {
        return redirect()->route('login');
    });

    // Authentication Routes
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
});

// Authenticated Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');


    Route::get('/dashboard/stats', [DashboardController::class, 'stats'])->name('api.dashboard.stats');

    // ✅ Tambahkan route chart-data di sini
    Route::get('/dashboard/chart-data', [DashboardController::class, 'chartData'])->name('api.dashboard.chartData');

    // Profile Routes
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    });

    // Project Routes
    Route::prefix('projects')->name('projects.')->group(function () {
        Route::get('/', [ProjectController::class, 'index'])->name('index');
        Route::post('/', [ProjectController::class, 'store'])->name('store');
        Route::put('/{project}', [ProjectController::class, 'update'])->name('update');
        Route::delete('/{project}', [ProjectController::class, 'destroy'])->name('destroy');
        Route::post('/{project}/tasks/assign', [TaskController::class, 'assignTask'])->name('tasks.assign');
    });

    // Task Routes
    Route::prefix('tasks')->name('tasks.')->group(function () {
        Route::get('/', [TaskController::class, 'index'])->name('index');
        Route::get('/project/{project}', [TaskController::class, 'indexByProject'])->name('by-project');
        Route::post('/', [TaskController::class, 'store'])->name('store');
        Route::put('/{task}', [TaskController::class, 'update'])->name('update');
        Route::delete('/{task}', [TaskController::class, 'destroy'])->name('destroy');
        Route::patch('/{task}/toggle-status', [TaskController::class, 'toggleStatus'])->name('toggle-status');
        Route::patch('/{task}/status', [TaskController::class, 'updateStatus'])->name('update-status');
        Route::post('/{task}/comments', [TaskController::class, 'storeComment'])->name('comments.store');
    });

    // Admin Routes (Manage Users)
    Route::prefix('manage-users')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::put('/{user}', [UserController::class, 'update'])->name('update');
        Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');
    });

    Route::middleware(['auth'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::get('stats', [DashboardController::class, 'getStats'])->name('stats');
    Route::get('chart-data', [DashboardController::class, 'getChartData'])->name('chartData');
    Route::get('overdue-tasks', [DashboardController::class, 'getOverdueTasks'])->name('overdueTasks');
    Route::get('tasks-by-owner', [DashboardController::class, 'getTasksByOwner'])->name('tasksByOwner');
});

    // Static Pages
    Route::get('/notifications', function () {
        return Inertia::render('Notifications');
    })->name('notifications');

    Route::get('/roles', function () {
        return Inertia::render('Roles');
    })->name('roles');

    // Trash Routes
    Route::get('/trash', [TrashController::class, 'index'])->name('trash.index');
    Route::post('/trash/restore', [TrashController::class, 'restore'])->name('trash.restore');
    Route::delete('/trash/force-delete', [TrashController::class, 'forceDelete'])->name('trash.force-delete');

    // Comment Delete Route
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');

    // Calendar Route
    Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar.index');
});

// Tambahan route dari Laravel Breeze
require __DIR__.'/auth.php';

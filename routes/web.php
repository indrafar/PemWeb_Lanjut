<?php



use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\API\AuthController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Route root: redirect to login (hapus duplikat)
Route::get('/', function () {
    return redirect()->route('login');
});

// Tambahkan route login AuthController
Route::post('/login', [AuthController::class, 'login'])->name('auth.login');

// Dashboard
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Role Routes
Route::prefix('roles')->group(function () {
    Route::get('/', [RoleController::class, 'index'])->name('roles');
    Route::post('/', [RoleController::class, 'store'])->name('roles.store');
    Route::post('/{id}', [RoleController::class, 'update'])->name('roles.update');
    Route::delete('/{id}', [RoleController::class, 'destroy'])->name('roles.destroy');
});

// Profile Routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/tasks', function () {
    return Inertia::render('Tasks');
})->middleware(['auth', 'verified'])->name('tasks');

Route::get('/projects', function () {
    return Inertia::render('Projects');
})->middleware(['auth', 'verified'])->name('projects');

Route::get('/notifications', function () {
    return Inertia::render('Notifications');
})->middleware(['auth', 'verified'])->name('notifications');

Route::get('/roles', function () {
    return Inertia::render('Roles');
})->middleware(['auth', 'verified'])->name('roles');

Route::get('/trash', function () {
    return Inertia::render('Trash');
})->middleware(['auth', 'verified'])->name('trash');


// Route login/register bawaan Laravel Breeze (atau Jetstream, dll)
require __DIR__.'/auth.php';

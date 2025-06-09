<?php



use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProjectController;
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

// Project Routes
Route::middleware(['auth'])->group(function () {
    Route::prefix('projects')->group(function () {
        Route::get('/', [ProjectController::class, 'index'])->name('projects.index');
        Route::post('/', [ProjectController::class, 'store'])->name('projects.store');
        Route::put('/{project}', [ProjectController::class, 'update'])->name('projects.update');
        Route::delete('/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');
    });
});

Route::get('/notifications', function () {
    return Inertia::render('Notifications');
})->middleware(['auth', 'verified'])->name('notifications');

Route::get('/roles', function () {
    return Inertia::render('Roles');
})->middleware(['auth', 'verified'])->name('roles');

Route::get('/trash', function () {
    return Inertia::render('Trash');
})->middleware(['auth', 'verified'])->name('trash');


// Admin Routes
Route::group(['middleware' => ['auth', 'verified']], function () {
    Route::get('/manage-users', [UserController::class, 'index'])->name('users.index');
    Route::post('/manage-users', [UserController::class, 'store'])->name('users.store');
    Route::put('/manage-users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/manage-users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
});

// Route login/register bawaan Laravel Breeze (atau Jetstream, dll)
require __DIR__.'/auth.php';

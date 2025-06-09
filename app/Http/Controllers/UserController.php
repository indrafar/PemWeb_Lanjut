<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserController extends Controller
{
    private function checkIfAdmin()
    {
        if (!auth()->check() || auth()->user()->role !== 'Admin') {
            abort(403, 'Unauthorized access.');
        }
        return true;
    }

    public function index()
    {
        $this->checkIfAdmin();
        
        try {
            $users = User::all();
            return Inertia::render('ManageUsers', [
                'users' => $users,
                'isAdmin' => auth()->user()->role === 'Admin'
            ]);
        } catch (\Exception $e) {
            return redirect()->route('dashboard')->with('error', 'Error loading users.');
        }
    }

    public function store(Request $request)
    {
        $this->checkIfAdmin();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', Rules\Password::defaults()],
            'role' => 'required|in:Admin,Manajer Proyek,Anggota Tim',
        ]);

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        return redirect()->back()->with('message', 'User created successfully');
    }

    public function update(Request $request, User $user)
    {
        $this->checkIfAdmin();

        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $user->id,
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|in:Admin,Manajer Proyek,Anggota Tim',
        ]);

        $data = [
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'role' => $request->role,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return redirect()->back()->with('message', 'User updated successfully');
    }

    public function destroy(User $user)
    {
        $this->checkIfAdmin();

        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'You cannot delete your own account');
        }

        $user->delete();
        return redirect()->back()->with('message', 'User deleted successfully');
    }
}
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Providers\RouteServiceProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
        {
            return Inertia::render('Auth/Login', [
                'canResetPassword' => Route::has('password.request'),
                'status' => session('status'),
            ]);
        }

        public function store(LoginRequest $request): RedirectResponse
        {
            try {
                $request->authenticate();
                $request->session()->regenerate();

                $user = Auth::user();
                
                // Redirect based on user role
                switch ($user->role) {
                    case 'Admin':
                        return redirect()->route('dashboard')->with('message', 'Welcome Admin');
                    case 'Manajer Proyek':
                        return redirect()->route('projects')->with('message', 'Welcome Project Manager');
                    case 'Anggota Tim':
                        return redirect()->route('tasks')->with('message', 'Welcome Team Member');
                    default:
                        return redirect()->route('dashboard');
                }
            } catch (\Exception $e) {
                return back()->withErrors([
                    'email' => 'The provided credentials do not match our records.',
                ]);
            }
        }

        public function destroy(Request $request): RedirectResponse
        {
            Auth::guard('web')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect('/');
        }
    }
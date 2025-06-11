<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia; // Jika Anda menggunakan Inertia.js

class CalendarController extends Controller
{
    /**
     * Tampilkan halaman kalender.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        return Inertia::render('Calendar/Index'); // Ganti 'Calendar/Index' dengan path komponen React/Vue kalender Anda
    }
}
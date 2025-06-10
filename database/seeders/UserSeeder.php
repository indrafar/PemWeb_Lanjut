<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Project;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Nonaktifkan foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('projects')->truncate();
        DB::table('users')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Buat user admin dan simpan ke variabel
        $admin = User::create([
            'name' => 'Admin User',
            'username' => 'admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'Admin'
        ]);

        User::create([
            'name' => 'Project Manager',
            'username' => 'pm',
            'email' => 'pm@example.com',
            'password' => bcrypt('password'),
            'role' => 'Project Manager'
        ]);

        User::create([
            'name' => 'Team Member',
            'username' => 'member',
            'email' => 'member@example.com',
            'password' => bcrypt('password'),
            'role' => 'Anggota Tim'
        ]);

        User::create([
            'name' => 'Test User',
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role' => 'Anggota Tim'
        ]);

        // Buat project dengan leader_id dari $admin
        $project = Project::create([
            'name' => 'Project Contoh',
            'status' => 'Active',
            'deadline' => now()->addMonth(),
            'leader_id' => $admin->id,
            'description' => 'Deskripsi project contoh',
        ]);

        $project->tasks()->create([
            'name' => 'Task Baru',
            'owner' => 'User 1',
            'status' => 'To-Do',
            'due_date' => now()->addDays(7),
            'priority' => 'High',
            // ...kolom lain jika ada
        ]);
    }
}
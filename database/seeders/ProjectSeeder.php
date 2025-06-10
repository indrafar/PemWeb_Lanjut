<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Project;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Project::create([
            'name' => 'Project Contoh',
            'status' => 'Active',
            'deadline' => now()->addMonth(),
            'leader_id' => 1, // pastikan user dengan id 1 ada
            'description' => 'Deskripsi project contoh',
        ]);

        Project::create([
            'name' => 'Project Kedua',
            'status' => 'Active',
            'deadline' => now()->addMonths(2),
            'leader_id' => 2, // pastikan user dengan id 2 ada
            'description' => 'Deskripsi project kedua',
        ]);
    }
}
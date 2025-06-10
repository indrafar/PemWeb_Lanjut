<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('tasks')->insert([
            [
                'project_id' => 1,
                'name' => 'Design Landing Page',
                'owner' => 'Alice',
                'status' => 'Not Started',
                'due_date' => '2025-06-15',
                'priority' => 'High',
                'notes' => 'Initial design for client review',
                'files' => '',
                'timeline_start' => '2025-06-10',
                'timeline_end' => '2025-06-12',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'project_id' => 1,
                'name' => 'Develop API',
                'owner' => 'Bob',
                'status' => 'Working on it',
                'due_date' => '2025-06-20',
                'priority' => 'Medium',
                'notes' => '',
                'files' => '',
                'timeline_start' => '2025-06-13',
                'timeline_end' => '2025-06-18',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'project_id' => 2,
                'name' => 'Testing',
                'owner' => 'Charlie',
                'status' => 'Done',
                'due_date' => '2025-06-10',
                'priority' => 'Low',
                'notes' => 'All tests passed',
                'files' => '',
                'timeline_start' => '2025-06-09',
                'timeline_end' => '2025-06-10',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

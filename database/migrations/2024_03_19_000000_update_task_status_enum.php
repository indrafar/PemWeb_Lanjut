<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // First, modify the column to allow any string temporarily
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('status')->change();
        });

        // Then, update the enum values
        DB::statement("ALTER TABLE tasks MODIFY COLUMN status ENUM('Not Started', 'Working on it', 'Done', 'Stuck') DEFAULT 'Not Started'");
    }

    public function down(): void
    {
        // Revert back to original enum values
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('status')->change();
        });

        DB::statement("ALTER TABLE tasks MODIFY COLUMN status ENUM('Working on it', 'Done', 'Stuck') DEFAULT 'Working on it'");
    }
}; 
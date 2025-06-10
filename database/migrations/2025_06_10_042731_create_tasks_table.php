<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('owner')->nullable();
            $table->string('status');
            $table->date('due_date')->nullable();
            $table->string('priority');
            $table->text('notes')->nullable();
            $table->string('files')->nullable();
            $table->date('timeline_start')->nullable(); // langsung di sini
            $table->date('timeline_end')->nullable();   // langsung di sini
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Jalankan migrasi.
     */
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Komentar dibuat oleh user
            $table->foreignId('task_id')->constrained()->onDelete('cascade'); // Komentar milik sebuah task
            $table->text('content'); // Konten komentar
            $table->timestamps();
        });
    }

    /**
     * Jalankan rollback migrasi.
     */
    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};

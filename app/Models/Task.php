<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'title',
        'project_id',
        'owner_id',
        'assigned_to',
        'status',
        'due_date',
        'notes',
        'timeline_start',
        'timeline_end'
    ];

    protected $casts = [
        'due_date' => 'date',
        'timeline_start' => 'date',
        'timeline_end' => 'date'
    ];

    protected $with = ['owner', 'assignedTo', 'project'];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

     public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->latest();
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'status',
        'deadline',
        'leader_id',
        'description'
    ];

    protected $casts = [
        'deadline' => 'date'
    ];

    public function leader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'leader_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_members')
                    ->wherePivot('user_id', '!=', $this->leader_id);
    }

    public function tasks()
    {
        return $this->hasMany(\App\Models\Task::class, 'project_id');
    }

}
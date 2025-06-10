<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'name',
        'owner',
        'status',
        'due_date',
        'priority',
        'notes',
        'files',
        'timeline_start',
        'timeline_end',
        'project_id',
    ];

    public function project()
    {
        return $this->belongsTo(\App\Models\Project::class, 'project_id');
    }
}

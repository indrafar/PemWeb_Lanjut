<?php
namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Task;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(Request $request, Task $task)
    {
        $validated = $request->validate([
            'content' => 'required|string'
        ]);

        $task->comments()->create([
            'user_id' => auth()->id(),
            'content' => $validated['content']
        ]);

        return redirect()->back()->with('message', 'Comment added successfully');
    }

    public function destroy(Comment $comment)
    {
        if ($comment->user_id !== auth()->id() && auth()->user()->role !== 'Manajer Proyek') {
            abort(403);
        }

        $comment->delete();
        return redirect()->back()->with('message', 'Comment deleted successfully');
    }
}
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

interface Comment {
    id: number;
    content: string;
    user: {
        id: number;
        name: string;
    };
    created_at: string;
}

interface Props {
    taskId: number;
    comments: Comment[];
    canDelete: boolean;
}

export default function Comments({ taskId, comments, canDelete }: Props) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        content: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tasks.comments.store', taskId), {
            onSuccess: () => {
                reset('content');
            }
        });
    };

    return (
        <div className="mt-2">
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-blue-600 hover:text-blue-800"
            >
                {isExpanded ? 'Hide Comments' : `Show Comments (${comments.length})`}
            </button>

            {isExpanded && (
                <div className="mt-2 space-y-4">
                    {/* Comment Form */}
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={data.content}
                            onChange={e => setData('content', e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            Post
                        </button>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-2">
                        {comments.map(comment => (
                            <div key={comment.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-md">
                                <div>
                                    <p className="text-sm font-medium">{comment.user.name}</p>
                                    <p className="text-sm text-gray-600">{comment.content}</p>
                                    <p className="text-xs text-gray-400">{comment.created_at}</p>
                                </div>
                                {canDelete && (
                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this comment?')) {
                                                router.delete(route('comments.destroy', comment.id));
                                            }
                                        }}
                                        className="text-sm text-red-600 hover:text-red-800"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
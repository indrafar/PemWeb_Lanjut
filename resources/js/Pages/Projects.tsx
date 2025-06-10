import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react'; // Add router import
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    role: string;
}

interface Project {
    id: number;
    name: string;
    status: 'Active' | 'Completed' | 'Pending';
    deadline: string;
    leader: User;
    members: User[];
    description: string;
}

interface Task {
    id: number;
    name: string;
    project: Project;
    owner: string;
    status: string;
    due: string;
    priority: string;
}

interface Props {
    projects: Project[];
    teamMembers: User[];
    can: {
        create: boolean;
        edit: boolean;
        delete: boolean;
    };
}

const FormInput: React.FC<{ label: string } & React.InputHTMLAttributes<HTMLInputElement>> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            {...props}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
    </div>
);

const FormSelect: React.FC<{ label: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>> = ({ label, children, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select
            {...props}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
            {children}
        </select>
    </div>
);

function AddTaskForm({ projectId, onTaskAdded }: { projectId: number; onTaskAdded: () => void }) {
    const { data, setData, post, processing, reset } = useForm({
        name: '',
        owner: '',
        status: 'Not Started', // default harus sama dengan status di kanban/tabel
        due_date: '',
        priority: 'Low',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('projects.tasks.store', projectId), {
            onSuccess: () => {
                reset();
                if (onTaskAdded) onTaskAdded();
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="mt-2 flex flex-wrap gap-2">
            <input name="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Task name" className="border px-2 py-1" required />
            <input name="owner" value={data.owner} onChange={(e) => setData('owner', e.target.value)} placeholder="Owner" className="border px-2 py-1" />
            <select name="status" value={data.status} onChange={(e) => setData('status', e.target.value)} className="border px-2 py-1">
                <option value="Not Started">Not Started</option>
                <option value="Working on it">Working on it</option>
                <option value="Stuck">Stuck</option>
                <option value="Done">Done</option>
            </select>
            <input name="due_date" type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} className="border px-2 py-1" />
            <select name="priority" value={data.priority} onChange={(e) => setData('priority', e.target.value)} className="border px-2 py-1">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
            </select>
            <button type="submit" disabled={processing} className="bg-blue-500 text-white px-3 py-1 rounded">Add Task</button>
        </form>
    );
}

function TableComponent({ tasks = [] }: { tasks?: Task[] }) {
    return (
        <table>
            <thead>
                <tr>
                    <th>Task</th>
                    <th>Project</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Priority</th>
                </tr>
            </thead>
            <tbody>
                {Array.isArray(tasks) && tasks.map((task, idx) => (
                    <tr key={task.id}>
                        <td>{task.name}</td>
                        <td>{task.project?.name ?? '-'}</td>
                        <td>{task.owner}</td>
                        <td>{task.status}</td>
                        <td>{task.due}</td>
                        <td>{task.priority}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default function Projects({ projects, teamMembers, can }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const { data, setData, post, put, processing, reset } = useForm({
        name: '',
        status: 'Pending',
        deadline: '',
        leader_id: '',
        member_ids: [] as number[],
        description: ''
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (editingProject) {
            put(route('projects.update', editingProject.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    setEditingProject(null);
                }
            });
        } else {
            post(route('projects.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                }
            });
        }
    };

    const handleDelete = (projectId: number) => {
        if (confirm('Are you sure you want to delete this project?')) {
            router.delete(route('projects.destroy', projectId), {
                onSuccess: () => {
                    // Optional: Show success message
                },
                onError: (errors) => {
                    // Optional: Handle errors
                    alert('Failed to delete project');
                },
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Projects" />
            <div className="p-6 bg-white min-h-screen">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Project Dashboard</h1>
                    {can.create && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Create New Project
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow hover:shadow-md transition">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-xl font-semibold">{project.name}</h2>
                                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                                    project.status === 'Active' ? 'bg-green-100 text-green-700' :
                                    project.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                    {project.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700">Project Leader</h3>
                                    <p className="text-sm text-gray-600">{project.leader.name}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700">Team Members</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {project.members.map(member => (
                                            <span key={member.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                {member.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        <strong>Deadline:</strong> {project.deadline}
                                    </p>
                                </div>
                            </div>
                            <AddTaskForm projectId={project.id} onTaskAdded={() => {}} />
                            {(can.edit || can.delete) && (
                                <div className="mt-4 flex justify-end space-x-2">
                                    {can.edit && (
                                        <button
                                            onClick={() => {
                                                setEditingProject(project);
                                                setData({
                                                    name: project.name,
                                                    status: project.status,
                                                    deadline: project.deadline,
                                                    leader_id: project.leader.id.toString(),
                                                    member_ids: project.members.map(m => m.id),
                                                    description: project.description
                                                });
                                                setIsModalOpen(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {can.delete && (
                                        <button
                                            onClick={() => handleDelete(project.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Project Form Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-lg w-full max-w-2xl mx-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-semibold text-gray-800">
                                    {editingProject ? 'Edit Project' : 'Create New Project'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingProject(null);
                                        reset();
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-6">
                                        <FormInput
                                            label="Project Name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                                            required
                                        />

                                        <FormSelect
                                            label="Status"
                                            value={data.status}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('status', e.target.value)}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Pending">Pending</option>
                                        </FormSelect>

                                        <FormSelect
                                            label="Project Leader"
                                            value={data.leader_id}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('leader_id', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Leader</option>
                                            {teamMembers
                                                .filter(user => ['Admin', 'Manajer Proyek'].includes(user.role))
                                                .map(user => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.name}
                                                    </option>
                                                ))}
                                        </FormSelect>

                                        <FormInput
                                            label="Deadline"
                                            type="date"
                                            value={data.deadline}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('deadline', e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Team Members
                                            </label>
                                            <div className="border border-gray-300 rounded-md p-2 max-h-32 overflow-y-auto">
                                                {teamMembers
                                                    .filter(user => user.role === 'Anggota Tim')
                                                    .map(user => (
                                                        <label key={user.id} className="flex items-center p-2 hover:bg-gray-50">
                                                            <input
                                                                type="checkbox"
                                                                value={user.id}
                                                                checked={data.member_ids.includes(user.id)}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                    const newMemberIds = e.target.checked
                                                                        ? [...data.member_ids, user.id]
                                                                        : data.member_ids.filter(id => id !== user.id);
                                                                    setData('member_ids', newMemberIds);
                                                                }}
                                                                className="rounded border-gray-300 text-blue-600"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700">{user.name}</span>
                                                        </label>
                                                    ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                value={data.description}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                                rows={5}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-6 border-t">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setEditingProject(null);
                                            reset();
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {editingProject ? 'Update Project' : 'Create Project'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

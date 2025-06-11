import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { SidebarProvider } from "@/Components/ui/sidebar";
import { AppSidebar } from "@/Components/Appsidebar";
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

interface Props {
    projects: Project[];
    teamMembers: User[]; // These are the Manajer Proyek
    teamMembersList: User[]; // These are the Anggota Tim
    can: {
        create: boolean;
        edit: boolean;
        delete: boolean;
    };
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    children: React.ReactNode;
}

const FormInput = ({ label, ...props }: FormInputProps) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            {...props}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
    </div>
);

const FormSelect = ({ label, children, ...props }: FormSelectProps) => (
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

export default function Projects({ projects, teamMembers, teamMembersList, can }: Props) {
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingProject) {
            put(route('projects.update', editingProject.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    setEditingProject(null);
                },
                onError: (errors) => {
                    console.error('Error updating project:', errors);
                }
            });
        } else {
            post(route('projects.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
                onError: (errors) => {
                    console.error('Error creating project:', errors);
                }
            });
        }
    };

    const handleDelete = (projectId: number) => {
        if (confirm('Are you sure you want to delete this project?')) {
            router.delete(route('projects.destroy', projectId), {
                onSuccess: () => {
                    // Handle successful deletion
                },
                onError: (errors) => {
                    console.error('Error deleting project:', errors);
                }
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
                                            onChange={e => setData('name', e.target.value)}
                                            required
                                        />

                                        <FormSelect
                                            label="Status"
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value)}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Pending">Pending</option>
                                        </FormSelect>

                                        <FormSelect
                                            label="Project Leader"
                                            value={data.leader_id}
                                            onChange={e => setData('leader_id', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Leader</option>
                                            {teamMembers.map(user => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name}
                                                </option>
                                            ))}
                                        </FormSelect>

                                        <FormInput
                                            label="Deadline"
                                            type="date"
                                            value={data.deadline}
                                            onChange={e => setData('deadline', e.target.value)}
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
                                                {teamMembersList.map(user => (
                                                    <label key={user.id} className="flex items-center p-2 hover:bg-gray-50">
                                                        <input
                                                            type="checkbox"
                                                            value={user.id}
                                                            checked={data.member_ids.includes(user.id)}
                                                            onChange={(e) => {
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
                                                onChange={e => setData('description', e.target.value)}
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

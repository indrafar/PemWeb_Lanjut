import { useState, useEffect } from "react";
import { Head, useForm, router } from '@inertiajs/react';
import { toast } from 'react-hot-toast'; // Assuming you have react-hot-toast installed
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // Assuming this import path is correct
import { SidebarProvider } from "@/Components/ui/sidebar"; // Assuming this import path is correct
import { AppSidebar } from "@/Components/Appsidebar"; // Assuming this import path is correct
import axios from 'axios';

// --- Interface Definitions (Copied from previous context or assumed) ---
interface Project {
    id: number;
    name: string;
    description: string;
    status: 'Active' | 'Completed' | 'Pending';
    leader: { id: number; name: string };
    members: Array<{ id: number; name: string }>;
    deadline: string;
}

interface User { // Simplified, adjust if your User model has more properties
    id: number;
    name: string;
    email: string; // Added email for team member selection
    // Add other user properties like role if needed for filtering
}

interface Props {
    projects: Project[];
    teamMembers: User[]; // All available team members
    can: {
        create: boolean;
        edit: boolean;
        delete: boolean;
    };
}

// Interface for Form Input Props
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

// Interface for Form Select Props
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    children: React.ReactNode;
    error?: string;
}

// Interface for Form Textarea Props
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
}

// FormInput Component: Renders a labeled input field with error display
const FormInput = ({ label, error, ...props }: FormInputProps) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            {...props}
            className={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
            } px-3 py-2`} // Added px-3 py-2 for better padding
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

// FormSelect Component: Renders a labeled select dropdown with error display
const FormSelect = ({ label, children, error, ...props }: FormSelectProps) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select
            {...props}
            className={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
            } px-3 py-2`} // Added px-3 py-2 for better padding
        >
            {children}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

// FormTextarea Component: Renders a labeled textarea with error display
const FormTextarea = ({ label, error, ...props }: FormTextareaProps) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea
            {...props}
            className={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
            } px-3 py-2`} // Added px-3 py-2 for better padding
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

// Define task status and priority labels (assuming from previous TaskPage context)
const taskStatusLabels = ["Not Started", "Working on it", "Stuck", "Done"];
const taskPriorityLabels = ["Low", "Medium", "High"];

// ProjectPage Component
export default function ProjectPage({ projects: initialProjects, teamMembers, can }: Props) {
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    // State for Assign Task Modal
    const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
    const [selectedProjectForTask, setSelectedProjectForTask] = useState<Project | null>(null);

    // Project Form data and errors
    const {
        data,
        setData,
        post,
        put,
        processing,
        errors: projectErrors,
        reset: resetProjectForm
    } = useForm({
        name: '',
        description: '',
        status: 'Active' as 'Active' | 'Completed' | 'Pending',
        leader_id: '',
        member_ids: [] as number[],
        deadline: '',
    });

    // Task Form data and errors (for Assign Task modal)
    const {
        data: taskData,
        setData: setTaskData,
        post: postTask,
        processing: taskProcessing,
        errors: taskErrors,
        reset: resetTaskForm
    } = useForm({
        title: '',
        project_id: '', // Will be set from selectedProjectForTask
        assigned_to: '',
        status: 'Not Started', // Default status for new tasks
        due_date: '',
        priority: 'Medium',
        notes: '',
        timeline_start: '',
        timeline_end: ''
    });

    // Sync initial projects to state
    useEffect(() => {
        setProjects(initialProjects);
    }, [initialProjects]);

    // Update taskData.project_id when selectedProjectForTask changes
    useEffect(() => {
        if (selectedProjectForTask) {
            setTaskData('project_id', selectedProjectForTask.id.toString());
        } else {
            setTaskData('project_id', '');
        }
    }, [selectedProjectForTask]);

    // Get available team members for the currently selected project in Assign Task modal
    const getAvailableTeamMembersForTask = () => {
        if (!selectedProjectForTask) {
            return teamMembers; // If no project selected, show all team members
        }
        const project = projects.find(p => p.id === selectedProjectForTask.id);
        if (!project) {
            return teamMembers;
        }
        // Combine project members and leader, ensuring no duplicates
        return [...project.members, project.leader].filter((member, index, self) =>
            index === self.findIndex(m => m.id === member.id)
        );
    };


    // Project Modal Functions
    const openEditProjectModal = (project: Project) => {
        setEditingProject(project);
        setData({
            name: project.name,
            description: project.description,
            status: project.status,
            leader_id: project.leader.id.toString(),
            member_ids: project.members.map(member => member.id),
            deadline: project.deadline,
        });
        setIsModalOpen(true);
    };

    const closeProjectModal = () => {
        setIsModalOpen(false);
        setEditingProject(null);
        resetProjectForm();
    };

    const handleSubmitProject = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProject) {
            put(route('projects.update', editingProject.id), {
                onSuccess: () => {
                    closeProjectModal();
                    toast.success('Project updated successfully!');
                },
                onError: (errors) => {
                    console.error('Error updating project:', errors);
                    toast.error('Failed to update project. Please check the form.');
                }
            });
        } else {
            post(route('projects.store'), {
                onSuccess: () => {
                    closeProjectModal();
                    toast.success('Project created successfully!');
                },
                onError: (errors) => {
                    console.error('Error creating project:', errors);
                    toast.error('Failed to create project. Please check the form.');
                }
            });
        }
    };

    const handleDeleteProject = (projectId: number) => {
        if (confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
            router.delete(route('projects.destroy', projectId), {
                onSuccess: () => {
                    toast.success('Project deleted successfully!');
                },
                onError: (errors) => {
                    console.error('Error deleting project:', errors);
                    toast.error('Failed to delete project.');
                }
            });
        }
    };

    // Assign Task Modal Functions
    const openAssignTaskModal = (project: Project) => {
        setSelectedProjectForTask(project);
        resetTaskForm(); // Reset task form when opening
        setTaskData('project_id', project.id.toString()); // Pre-fill project_id
        setIsAssignTaskModalOpen(true);
    };

    const closeAssignTaskModal = () => {
        setIsAssignTaskModalOpen(false);
        setSelectedProjectForTask(null);
        resetTaskForm();
    };

    const handleAssignTaskSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postTask(route('tasks.store'), { // Using tasks.store route to create the task
            onSuccess: () => {
                closeAssignTaskModal();
                toast.success('Task assigned successfully!');
            },
            onError: (errors) => {
                console.error('Error assigning task:', errors);
                toast.error('Failed to assign task. Please check the form.');
            }
        });
    };


    return (
        <AuthenticatedLayout>
            <Head title="Projects" />
            <SidebarProvider>
                <div className="flex">
            
                    <div className="flex-1 p-6 bg-gray-50 min-h-screen font-inter"> {/* Changed to bg-gray-50 for subtle background */}
                        <div className="flex justify-between items-center mb-8"> {/* Increased mb */}
                            <h1 className="text-4xl font-extrabold text-[#1B355E]">Project Dashboard</h1> {/* Dark blue header */}
                            {can.create && (
                                <button
                                    onClick={() => {
                                        setEditingProject(null);
                                        resetProjectForm(); // Reset form data for new project
                                        setIsModalOpen(true);
                                    }}
                                    className="bg-[#1B355E] text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-800 transition-colors flex items-center gap-2" // Styled button
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                    Create New Project
                                </button>
                            )}
                        </div>

                        {/* Project Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project) => (
                                <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out"> {/* Enhanced card styling */}
                                    <div className="flex justify-between items-start mb-3">
                                        <h2 className="text-2xl font-bold text-[#1B355E]">{project.name}</h2> {/* Dark blue project name */}
                                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                                            project.status === 'Active' ? 'bg-green-100 text-green-700' :
                                            project.status === 'Completed' ? 'bg-blue-100 text-blue-700' : // Changed Completed to blue hue
                                            'bg-yellow-100 text-yellow-700' // Pending
                                        }`}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-4 leading-relaxed">{project.description}</p> {/* Better text styling */}
                                    
                                    <div className="space-y-4 text-sm"> {/* Increased space-y */}
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Project Leader</h3>
                                            <p className="text-gray-600">{project.leader.name}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Team Members</h3>
                                            <div className="flex flex-wrap gap-2 mt-1"> {/* Added mt-1 */}
                                                {project.members && project.members.length > 0 ? (
                                                    project.members.map(member => (
                                                        <span key={member.id} className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-700"> {/* Rounded full badge */}
                                                            {member.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-500">No members assigned</span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">
                                                <strong>Deadline:</strong> <span className="font-medium text-gray-800">{project.deadline}</span>
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {(can.edit || can.delete || can.create) && (
                                        <div className="mt-5 flex justify-end space-x-3 border-t pt-4"> {/* Added border-t pt-4 */}
                                            {can.create && (
                                                <button
                                                    onClick={() => openAssignTaskModal(project)}
                                                    className="px-4 py-2 text-[#1B355E] hover:bg-gray-100 rounded-md transition-colors font-medium text-sm" // Styled button
                                                >
                                                    Assign Task
                                                </button>
                                            )}
                                            {can.edit && (
                                                <button
                                                    onClick={() => openEditProjectModal(project)}
                                                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium text-sm"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            {can.delete && (
                                                <button
                                                    onClick={() => handleDeleteProject(project.id)}
                                                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium text-sm"
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
                            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"> {/* Darker overlay, added p-4 */}
                                <div className="bg-white p-8 rounded-xl w-full max-w-3xl mx-auto shadow-2xl max-h-[90vh] overflow-y-auto"> {/* Larger max-w, rounded-xl, shadow-2xl */}
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-3xl font-bold text-[#1B355E]"> {/* Dark blue header */}
                                            {editingProject ? 'Edit Project' : 'Create New Project'}
                                        </h3>
                                        <button
                                            onClick={closeProjectModal}
                                            className="text-gray-500 hover:text-gray-700 transition-colors"
                                        >
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmitProject} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Left Column */}
                                            <div className="space-y-6">
                                                <FormInput
                                                    label="Project Name"
                                                    type="text"
                                                    value={data.name}
                                                    onChange={e => setData('name', e.target.value)}
                                                    required
                                                    error={projectErrors.name}
                                                />

                                                <FormSelect
                                                    label="Status"
                                                    value={data.status}
                                                    onChange={e => setData('status', e.target.value as 'Active' | 'Completed' | 'Pending')}
                                                    error={projectErrors.status}
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
                                                    error={projectErrors.leader_id}
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
                                                    error={projectErrors.deadline}
                                                />
                                            </div>

                                            {/* Right Column */}
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Team Members
                                                    </label>
                                            
                                            <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto bg-gray-50">
                                                {teamMembers.map(user => (
                                                    <label key={user.id} className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors">
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
                                                            className="rounded border-gray-300 text-[#1B355E] focus:ring-[#1B355E]"
                                                        />
                                                        <span className="ml-3 text-sm text-gray-800">{user.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                                    {projectErrors.member_ids && <p className="mt-1 text-sm text-red-600">{projectErrors.member_ids}</p>}
                                                </div>

                                                <FormTextarea
                                                    label="Description"
                                                    value={data.description}
                                                    onChange={e => setData('description', e.target.value)}
                                                    rows={8} // Increased rows for more space
                                                    error={projectErrors.description}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200"> {/* Added border-t */}
                                            <button
                                                type="button"
                                                onClick={closeProjectModal}
                                                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="px-6 py-2 bg-[#1B355E] text-white rounded-md shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B355E] disabled:opacity-50 transition-colors"
                                            >
                                                {processing ? 'Saving...' : (editingProject ? 'Update Project' : 'Create Project')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Assign Task Modal */}
                        {isAssignTaskModalOpen && selectedProjectForTask && (
                            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"> {/* Darker overlay, added p-4 */}
                                <div className="bg-white p-8 rounded-xl w-full max-w-xl mx-auto shadow-2xl max-h-[90vh] overflow-y-auto"> {/* Wider max-w, rounded-xl, shadow-2xl */}
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-3xl font-bold text-[#1B355E]">Assign New Task to {selectedProjectForTask.name}</h3> {/* Dark blue header */}
                                        <button
                                            onClick={closeAssignTaskModal}
                                            className="text-gray-500 hover:text-gray-700 transition-colors"
                                        >
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>

                                    <form onSubmit={handleAssignTaskSubmit} className="space-y-6"> {/* Increased space-y */}
                                        <FormInput
                                            label="Task Title"
                                            type="text"
                                            value={taskData.title}
                                            onChange={e => setTaskData('title', e.target.value)}
                                            required
                                            error={taskErrors.title}
                                        />

                                        {/* Project ID is hidden and pre-filled */}
                                        <input type="hidden" name="project_id" value={taskData.project_id} />

                                        <FormSelect
                                            label="Assigned To"
                                            value={taskData.assigned_to}
                                            onChange={e => setTaskData('assigned_to', e.target.value)}
                                            required
                                            error={taskErrors.assigned_to}
                                        >
                                            <option value="">Select Team Member</option>
                                            {getAvailableTeamMembersForTask().map(member => (
                                                <option key={member.id} value={member.id}>
                                                    {member.name}
                                                </option>
                                            ))}
                                        </FormSelect>

                                        <FormSelect
                                            label="Status"
                                            value={taskData.status}
                                            onChange={e => setTaskData('status', e.target.value as any)}
                                            error={taskErrors.status}
                                        >
                                            {taskStatusLabels.map(status => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </FormSelect>

                                        <FormInput
                                            label="Due Date"
                                            type="date"
                                            value={taskData.due_date}
                                            onChange={e => setTaskData('due_date', e.target.value)}
                                            error={taskErrors.due_date}
                                        />

                                        <FormSelect
                                            label="Priority"
                                            value={taskData.priority}
                                            onChange={e => setTaskData('priority', e.target.value)}
                                            error={taskErrors.priority}
                                        >
                                            {taskPriorityLabels.map(priority => (
                                                <option key={priority} value={priority}>
                                                    {priority}
                                                </option>
                                            ))}
                                        </FormSelect>

                                        <FormTextarea
                                            label="Notes/Description"
                                            value={taskData.notes}
                                            onChange={e => setTaskData('notes', e.target.value)}
                                            rows={4} // Consistent rows
                                            error={taskErrors.notes}
                                        />

                                        <FormInput
                                            label="Timeline Start"
                                            type="date"
                                            value={taskData.timeline_start}
                                            onChange={e => setTaskData('timeline_start', e.target.value)}
                                            error={taskErrors.timeline_start}
                                        />

                                        {/* Complete the form with Timeline End and action buttons */}
                                        <FormInput
                                            label="Timeline End"
                                            type="date"
                                            value={taskData.timeline_end}
                                            onChange={e => setTaskData('timeline_end', e.target.value)}
                                            error={taskErrors.timeline_end}
                                        />

                                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                            <button
                                                type="button"
                                                onClick={closeAssignTaskModal}
                                                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={taskProcessing}
                                                className="px-6 py-2 bg-[#1B355E] text-white rounded-md shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B355E] disabled:opacity-50 transition-colors"
                                            >
                                                {taskProcessing ? 'Assigning...' : 'Assign Task'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </SidebarProvider>
        </AuthenticatedLayout>
    );
}

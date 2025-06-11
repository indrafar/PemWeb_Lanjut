import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import { useState } from "react";
import Modal from "@/Components/Modal";
import TaskForm from "@/Components/TaskForm";
import { Task, TaskStatus } from "@/types/task";

interface Props {
  tasks: Task[];
  projects: Array<{ id: number; name: string }>;
  teamMembers: Array<{ id: number; name: string }>;
  can: {
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

export default function Tasks({ tasks, projects, teamMembers, can }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null | undefined>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Working on it":
        return "bg-orange-400 text-white";
      case "Done":
        return "bg-green-500 text-white";
      case "Stuck":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-200";
    }
  };

  const handleDelete = (taskId: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      router.delete(route("tasks.destroy", taskId));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  return (
    <AuthenticatedLayout>
      <Head title="Tasks" />
      <div className="p-6">
        {can.create && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create New Task
          </button>
        )}

        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Project</th>
                <th className="px-4 py-3 text-left">Assigned To</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Due Date</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{task.title}</td>
                  <td className="px-4 py-3">{task.project?.name || 'No Project'}</td>
                  <td className="px-4 py-3">{task.owner?.name || 'Unassigned'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                  </td>
                  <td className="px-4 py-3">
                    {can.edit && (
                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        Edit
                      </button>
                    )}
                    {can.delete && (
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal show={isModalOpen} onClose={closeModal}>
          <div className="p-6">
            <TaskForm
              task={editingTask}
              projects={projects}
              teamMembers={teamMembers}
              onClose={closeModal}
            />
          </div>
        </Modal>
      </div>
    </AuthenticatedLayout>
  );
}

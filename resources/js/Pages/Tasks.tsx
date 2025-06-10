import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  ClockIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline"; // Updated import path
import Modal from "@/Components/Modal";
import TaskForm from "@/Components/TaskForm";
import Comments from "@/Components/Comments";
import { router } from "@inertiajs/react";

interface Task {
  id: number;
  title: string;
  project: {
    id: number;
    name: string;
  };
  owner: {
    id: number;
    name: string;
    avatar?: string;
  };
  status: "Working on it" | "Done" | "Stuck";
  due_date: string;
  notes: string;
  timeline_start: string;
  timeline_end: string;
  comments: Array<{
    id: number;
    content: string;
    user: {
      id: number;
      name: string;
    };
    created_at: string;
  }>;
}

interface Props {
  tasks: Task[];
  projects: {
    id: number;
    name: string;
  }[];
  teamMembers: {
    id: number;
    name: string;
  }[];
  can: {
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

export default function Tasks({ tasks, projects, teamMembers, can }: Props) {
  const [isToDoExpanded, setIsToDoExpanded] = useState(true);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

        {/* To-Do Section */}
        <div className="mb-8">
          <button
            className="flex items-center space-x-2 mb-4"
            onClick={() => setIsToDoExpanded(!isToDoExpanded)}
          >
            {isToDoExpanded ? (
              <ChevronDownIcon className="w-5 h-5 text-blue-500" />
            ) : (
              <ChevronRightIcon className="w-5 h-5 text-blue-500" />
            )}
            <span className="text-lg font-medium text-blue-500">To-Do</span>
          </button>

          {isToDoExpanded && (
            <div className="bg-white rounded-lg shadow">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="w-8 px-4 py-3"></th>
                    <th className="px-4 py-3 text-left">Task</th>
                    <th className="px-4 py-3 text-left">Owner</th>
                    <th className="px-4 py-3 text-left">
                      Status
                      <InformationCircleIcon className="w-4 h-4 inline ml-1 text-gray-400" />
                    </th>
                    <th className="px-4 py-3 text-left">
                      Due date
                      <ClockIcon className="w-4 h-4 inline ml-1 text-gray-400" />
                    </th>
                    <th className="px-4 py-3 text-left">Notes</th>
                    <th className="px-4 py-3 text-left">
                      Timeline
                      <InformationCircleIcon className="w-4 h-4 inline ml-1 text-gray-400" />
                    </th>
                    <th className="px-4 py-3 text-left">Last updated</th>
                    <th className="w-8 px-4 py-3">
                      <PlusIcon className="w-5 h-5 text-gray-400" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-4 py-3">{task.title}</td>
                      <td className="px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{task.due_date}</td>
                      <td className="px-4 py-3">{task.notes}</td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-400 text-white px-3 py-1 rounded-full text-sm">
                          {task.timeline_start} - {task.timeline_end}
                        </span>
                      </td>
                      <td className="px-4 py-3">Just now</td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          {can.edit && (
                            <button
                              onClick={() => {
                                setEditingTask(task);
                                setIsModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
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
                        </div>
                        <Comments
                          taskId={task.id}
                          comments={task.comments}
                          canDelete={can.delete}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Completed Section */}
        <div>
          <button
            className="flex items-center space-x-2 mb-4"
            onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
          >
            {isCompletedExpanded ? (
              <ChevronDownIcon className="w-5 h-5 text-green-500" />
            ) : (
              <ChevronRightIcon className="w-5 h-5 text-green-500" />
            )}
            <span className="text-lg font-medium text-green-500">Completed</span>
          </button>

          {isCompletedExpanded && (
            <div className="bg-white rounded-lg shadow">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="w-8 px-4 py-3"></th>
                    <th className="px-4 py-3 text-left">Task</th>
                    <th className="px-4 py-3 text-left">Owner</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Due date</th>
                    <th className="px-4 py-3 text-left">Notes</th>
                    <th className="px-4 py-3 text-left">Timeline</th>
                    <th className="px-4 py-3 text-left">Last updated</th>
                    <th className="w-8 px-4 py-3">
                      <PlusIcon className="w-5 h-5 text-gray-400" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Completed tasks will go here */}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal show={isModalOpen} onClose={closeModal}>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">
              {editingTask ? "Edit Task" : "Create New Task"}
            </h2>
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

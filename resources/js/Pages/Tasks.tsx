import { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task, TaskStatus } from "@/types/task";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { SidebarProvider } from "@/Components/ui/sidebar";
import { AppSidebar } from "@/Components/Appsidebar";

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

const statusLabels: TaskStatus[] = ["Working on it", "Stuck", "Done", "Not Started"];
const statusColors: Record<TaskStatus, string> = {
  "Working on it": "bg-orange-400",
  "Stuck": "bg-red-500",
  "Done": "bg-green-500",
  "Not Started": "bg-gray-400",
};

export default function TasksPage({ tasks, projects, teamMembers, can }: Props) {
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const [activeTab, setActiveTab] = useState<'kanban' | 'table'>('kanban');

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = taskList.find((t) => t.id === parseInt(active.id));
    if (activeTask && over.id !== activeTask.status) {
      const updatedTasks = taskList.map((task) =>
        task.id === activeTask.id ? { ...task, status: over.id as TaskStatus } : task
      );
      setTaskList(updatedTasks);
    }
  };

  return (
    <AuthenticatedLayout>
      <SidebarProvider>
      <div className="flex">
        
        <div className="flex-1 p-6">
          {/* Tab navigation */}
          <div className="border-b mb-4">
            <nav className="flex space-x-6 text-sm">
              <button
                onClick={() => setActiveTab("table")}
                className={`pb-2 ${activeTab === "table" ? "border-b-2 border-blue-600 text-blue-600 font-semibold" : "text-gray-600"}`}
              >
                Main table
              </button>
              <button
                onClick={() => setActiveTab("kanban")}
                className={`pb-2 ${activeTab === "kanban" ? "border-b-2 border-blue-600 text-blue-600 font-semibold" : "text-gray-600"}`}
              >
                Kanban
              </button>
            </nav>
          </div>

          {/* Main Table View */}
          {activeTab === "table" && (
            <table className="w-full table-auto border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">Title</th>
                  <th className="border px-2 py-1">Status</th>
                  <th className="border px-2 py-1">Due Date</th>
                  <th className="border px-2 py-1">Priority</th>
                  <th className="border px-2 py-1">Owner</th>
                </tr>
              </thead>
              <tbody>
                {taskList.map(task => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="border px-2 py-1">{task.title}</td>
                    <td className="border px-2 py-1">{task.status}</td>
                    <td className="border px-2 py-1">{task.due_date}</td>
                    <td className="border px-2 py-1">{task.priority}</td>
                    <td className="border px-2 py-1">{task.owner?.name || "Unassigned"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Kanban Board */}
          {activeTab === "kanban" && (
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="flex gap-4 overflow-x-auto mt-4">
                {statusLabels.map((status) => (
                  <div key={status} className="bg-gray-100 rounded-lg w-72 flex-shrink-0">
                    <div className={`text-white px-4 py-2 rounded-t-lg ${statusColors[status]}`}>
                      {status} <span className="ml-1 text-sm">({taskList.filter(t => t.status === status).length})</span>
                    </div>
                    <div className="p-2 space-y-2 min-h-[200px]" id={status}>
                      {taskList.filter(task => task.status === status).map(task => (
                        <div key={task.id} className="bg-white rounded p-3 shadow border border-gray-200">
                          <div className="font-semibold text-sm mb-1">{task.title}</div>
                          <div className="text-xs text-gray-600 mb-1">{task.description}</div>
                          <div className="flex flex-wrap gap-1 text-xs">
                            <span className={`px-2 py-0.5 rounded-full text-white ${statusColors[task.status]}`}>{task.status}</span>
                            {task.due_date && (
                              <span className="bg-gray-200 px-2 py-0.5 rounded-full">{new Date(task.due_date).toLocaleDateString()}</span>
                            )}
                            {task.priority && (
                              <span className="bg-purple-300 text-white px-2 py-0.5 rounded-full">{task.priority}</span>
                            )}
                          </div>
                          <div className="mt-2 text-xs text-gray-400">
                            <span>{task.owner?.name || "Unassigned"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </DndContext>
          )}
        </div>
      </div>
      </SidebarProvider>
    </AuthenticatedLayout>
  );
}

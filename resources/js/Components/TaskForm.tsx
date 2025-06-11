import { Task, TaskStatus } from "@/types/task";
import { useForm } from "@inertiajs/react";
import { FormEvent, ChangeEvent } from "react";

type FormData = {
  title: string;
  project_id: string;
  assigned_to: string;
  status: TaskStatus;
  due_date: string;
  notes: string;
  timeline_start: string;
  timeline_end: string;
}

interface Props {
  task: Task | null | undefined;
  projects: Array<{ id: number; name: string }>;
  teamMembers: Array<{ id: number; name: string }>;
  onClose: () => void;
}

export default function TaskForm({ task, projects, teamMembers, onClose }: Props) {
  const { data, setData, post, put, processing, errors } = useForm({
    title: task?.title || "",
    project_id: task?.project?.id?.toString() || "",
    assigned_to: task?.assigned_to?.toString() || "",
    status: task?.status || "Working on it",
    due_date: task?.due_date || new Date().toISOString().split('T')[0],
    notes: task?.notes || "",
    timeline_start: task?.timeline_start || new Date().toISOString().split('T')[0],
    timeline_end: task?.timeline_end || new Date().toISOString().split('T')[0],
  });

  const handleChange = (key: keyof FormData, value: string) => {
    setData(key, value);
  };

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setData("status", e.target.value as TaskStatus);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (task) {
      put(route("tasks.update", task.id), {
        onSuccess: () => {
          onClose();
        },
        preserveScroll: true,
        preserveState: true,
      });
    } else {
      post(route("tasks.store"), {
        onSuccess: () => {
          onClose();
        },
        preserveScroll: true,
        preserveState: true,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Project</label>
        <select
          value={data.project_id}
          onChange={(e) => setData("project_id", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select Project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Assign To
        </label>
        <select
          value={data.assigned_to}
          onChange={(e) => setData("assigned_to", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select Team Member</option>
          {teamMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          value={data.status}
          onChange={handleStatusChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="Working on it">Working on it</option>
          <option value="Done">Done</option>
          <option value="Stuck">Stuck</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            value={data.timeline_start}
            onChange={(e) => setData("timeline_start", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            type="date"
            value={data.timeline_end}
            onChange={(e) => setData("timeline_end", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={data.notes}
          onChange={(e) => setData("notes", e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={processing}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          {task ? "Update Task" : "Create Task"}
        </button>
      </div>
    </form>
  );
}
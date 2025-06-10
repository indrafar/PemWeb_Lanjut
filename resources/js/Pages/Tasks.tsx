import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { router } from "@inertiajs/react";
import type { DroppableProvided, DraggableProvided } from "react-beautiful-dnd";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const statusOptions = [
  { value: "Done", label: "Done", color: "bg-green-500 text-white" },
  { value: "Working on it", label: "Working on it", color: "bg-yellow-500 text-black" },
  { value: "Stuck", label: "Stuck", color: "bg-red-500 text-white" },
  { value: "Not Started", label: "Not Started", color: "bg-gray-400 text-black" },
];

const priorityOptions = [
  { value: "Low", label: "Low", color: "bg-blue-400 text-white" },
  { value: "Medium", label: "Medium", color: "bg-purple-400 text-white" },
  { value: "High", label: "High", color: "bg-purple-800 text-white" },
];

export default function Tasks({ tasks = [], projects = [] }: { tasks?: any[]; projects?: any[] }) {
  const [view, setView] = useState<"table" | "kanban">("table");

  return (
    <AuthenticatedLayout header="Tasks">
      <div className="p-6 bg-white min-h-screen">
        <div className="flex items-center mb-4 border-b">
          <button
            className={`mr-4 pb-2 ${view === "table" ? "border-b-2 border-blue-500 font-bold" : ""}`}
            onClick={() => setView("table")}
          >
            Main table
          </button>
          <button
            className={`pb-2 ${view === "kanban" ? "border-b-2 border-blue-500 font-bold" : ""}`}
            onClick={() => setView("kanban")}
          >
            Kanban
          </button>
        </div>
        {view === "table" ? (
          <TableComponent tasks={tasks} projects={projects} />
        ) : (
          <KanbanComponent tasks={tasks} projects={projects} />
        )}
      </div>
    </AuthenticatedLayout>
  );
}

function TableComponent({ tasks = [], projects = [] }: { tasks?: any[]; projects?: any[] }) {
  const [editing, setEditing] = useState<{ id: number; field: string } | null>(null);
  const [editValues, setEditValues] = useState<any>({
    name: "",
    owner: "",
    status: "Not Started",
    due_date: "",
    priority: "Low",
    notes: "",
    files: "",
    timeline_start: "",
    timeline_end: "",
    project_id: "",
  });
  const [showAddDetail, setShowAddDetail] = useState(false);
  const [addTask, setAddTask] = useState<any>({
    name: "",
    owner: "",
    status: "Not Started",
    due_date: "",
    priority: "Low",
    notes: "",
    files: "",
    timeline_start: "",
    timeline_end: "",
    project_id: "",
  });

  // Inline edit
  const handleEdit = (task: any, field: string) => {
    setEditing({ id: task.id, field });
    setEditValues(task);
  };

  const handleEditChange = (e: any) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const handleEditSelect = (field: string, value: string) => {
    setEditValues({ ...editValues, [field]: value });
    // Panggil patch langsung, lalu keluar dari mode edit
    router.patch(`/tasks/${editValues.id}`, { ...editValues, [field]: value }, {
      preserveScroll: true,
      onSuccess: () => setEditing(null),
      onError: () => setEditing(null),
    });
  };

  const handleEditSave = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    router.patch(`/tasks/${editValues.id}`, editValues, {
      preserveScroll: true,
      onSuccess: () => setEditing(null),
      onError: () => setEditing(null),
    });
  };

  // Add task
  const handleAddChange = (e: any) => {
    setAddTask({ ...addTask, [e.target.name]: e.target.value });
  };

  const handleAddSelect = (field: string, value: string) => {
    setAddTask({ ...addTask, [field]: value });
  };

  const handleAddTask = () => {
    if (!showAddDetail && addTask.name.trim() !== "") {
      setShowAddDetail(true);
      return;
    }
    // Kirim ke backend
    router.post("/tasks", addTask, {
      preserveScroll: true,
      onSuccess: () => {
        setAddTask({
          name: "",
          owner: "",
          status: "Not Started",
          due_date: "", // <-- INI MASIH ADA, HARUSNYA due_date
          priority: "Low",
          notes: "",
          files: "",
          timeline_start: "",
          timeline_end: "",
          project_id: "",
        });
        setShowAddDetail(false);
      },
    });
  };

  const handleAddKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAddTask();
  };

  return (
    <table className="min-w-full bg-white border">
      <thead>
        <tr>
          <th className="px-4 py-2 border">Task</th>
          <th className="px-4 py-2 border">Project</th> {/* Tambah ini */}
          <th className="px-4 py-2 border">Owner</th>
          <th className="px-4 py-2 border">Status</th>
          <th className="px-4 py-2 border">Due date</th>
          <th className="px-4 py-2 border">Priority</th>
          <th className="px-4 py-2 border">Notes</th>
          <th className="px-4 py-2 border">Files</th>
          <th className="px-4 py-2 border">Timeline</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task: any) => (
          <tr key={task.id}>
            {/* Task Name */}
            <td className="border px-2 py-1 cursor-pointer" onClick={() => handleEdit(task, "name")}>
              {editing?.id === task.id && editing?.field === "name" ? (
                <input
                  name="name"
                  value={editValues.name}
                  onChange={handleEditChange}
                  onBlur={handleEditSave}
                  autoFocus
                  className="border rounded px-1"
                />
              ) : (
                task.name
              )}
            </td>
            {/* Project */}
            <td className="border px-2 py-1">
              {task.project?.name ?? '-'} {/* Tampilkan nama project */}
            </td>
            {/* Owner */}
            <td className="border px-2 py-1 cursor-pointer" onClick={() => handleEdit(task, "owner")}>
              {editing?.id === task.id && editing?.field === "owner" ? (
                <input
                  name="owner"
                  value={editValues.owner}
                  onChange={handleEditChange}
                  onBlur={handleEditSave}
                  autoFocus
                  className="border rounded px-1"
                />
              ) : (
                task.owner
              )}
            </td>
            {/* Status */}
            <td className="border px-2 py-1 cursor-pointer" onClick={() => handleEdit(task, "status")}>
              {editing?.id === task.id && editing?.field === "status" ? (
                <div className="relative">
                  <div className="absolute z-10 bg-white border rounded shadow">
                    {statusOptions.map(opt => (
                      <div
                        key={opt.value}
                        className={`px-3 py-1 cursor-pointer ${opt.color} mb-1 rounded`}
                        onClick={() => handleEditSelect("status", opt.value)}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <span className={`px-2 py-1 rounded ${statusOptions.find(o => o.value === task.status)?.color}`}>
                  {task.status}
                </span>
              )}
            </td>
            {/* Due Date */}
            <td className="border px-2 py-1 cursor-pointer" onClick={() => handleEdit(task, "due_date")}>
              {editing?.id === task.id && editing?.field === "due_date" ? (
                <input
                  type="date"
                  name="due_date"
                  value={editValues.due_date}
                  onChange={handleEditChange}
                  onBlur={handleEditSave}
                  autoFocus
                  className="border rounded px-1"
                />
              ) : (
                task.due_date
              )}
            </td>
            {/* Priority */}
            <td className="border px-2 py-1 cursor-pointer" onClick={() => handleEdit(task, "priority")}>
              {editing?.id === task.id && editing?.field === "priority" ? (
                <div className="relative">
                  <div className="absolute z-10 bg-white border rounded shadow">
                    {priorityOptions.map(opt => (
                      <div
                        key={opt.value}
                        className={`px-3 py-1 cursor-pointer ${opt.color} mb-1 rounded`}
                        onClick={() => handleEditSelect("priority", opt.value)}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <span className={`px-2 py-1 rounded ${priorityOptions.find(o => o.value === task.priority)?.color}`}>
                  {task.priority}
                </span>
              )}
            </td>
            {/* Notes */}
            <td className="border px-2 py-1">{task.notes}</td>
            {/* Files */}
            <td className="border px-2 py-1">{task.files}</td>
            {/* Timeline */}
            <td className="border px-2 py-1 cursor-pointer" onClick={() => handleEdit(task, "timeline")}>
              {editing?.id === task.id && editing?.field === "timeline" ? (
                <div className="flex gap-1">
                  <input
                    type="date"
                    name="timeline_start"
                    value={editValues.timeline_start}
                    onChange={handleEditChange}
                    onBlur={handleEditSave}
                    className="border rounded px-1"
                  />
                  <span>-</span>
                  <input
                    type="date"
                    name="timeline_end"
                    value={editValues.timeline_end}
                    onChange={handleEditChange}
                    onBlur={handleEditSave}
                    className="border rounded px-1"
                  />
                </div>
              ) : (
                task.timeline_start && task.timeline_end
                  ? `${formatDate(task.timeline_start)} - ${formatDate(task.timeline_end)}`
                  : "-"
              )}
            </td>
          </tr>
        ))}
        {/* Add Task Row */}
        <tr>
          <td className="border px-2 py-1" colSpan={8}>
            {!showAddDetail ? (
              <input
                name="name"
                value={addTask.name}
                onChange={handleAddChange}
                onKeyDown={handleAddKeyDown}
                placeholder="+ Add task"
                className="border rounded px-2 w-full"
                onFocus={() => setShowAddDetail(false)}
              />
            ) : (
              <div className="flex gap-2 flex-wrap">
                <input
                  name="name"
                  value={addTask.name}
                  onChange={handleAddChange}
                  placeholder="Task name"
                  className="border rounded px-2"
                />
                <input
                  name="owner"
                  value={addTask.owner}
                  onChange={handleAddChange}
                  placeholder="Owner"
                  className="border rounded px-2"
                />
                <select
                  name="project_id"
                  value={addTask.project_id}
                  onChange={handleAddChange}
                  className="border rounded px-2"
                >
                  <option value="">Pilih Project</option>
                  {projects.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <select
                  name="status"
                  value={addTask.status}
                  onChange={handleAddChange}
                  className="border rounded px-2"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <input
                  type="date"
                  name="due_date"
                  value={addTask.due_date}
                  onChange={handleAddChange}
                  className="border rounded px-2"
                />
                <select
                  name="priority"
                  value={addTask.priority}
                  onChange={handleAddChange}
                  className="border rounded px-2"
                >
                  {priorityOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <input
                  name="notes"
                  value={addTask.notes}
                  onChange={handleAddChange}
                  placeholder="Notes"
                  className="border rounded px-2"
                />
                <input
                  name="files"
                  value={addTask.files}
                  onChange={handleAddChange}
                  placeholder="Files"
                  className="border rounded px-2"
                />
                <input
                  type="date"
                  name="timeline_start"
                  value={addTask.timeline_start}
                  onChange={handleAddChange}
                  className="border rounded px-2"
                />
                <input
                  type="date"
                  name="timeline_end"
                  value={addTask.timeline_end}
                  onChange={handleAddChange}
                  className="border rounded px-2"
                />
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={handleAddTask}
                >
                  Add
                </button>
              </div>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function KanbanComponent({ tasks = [], projects = [] }: { tasks?: any[]; projects?: any[] }) {
  const statuses = [
    { value: "Done", label: "Done", color: "bg-green-400", text: "text-white" },
    { value: "Working on it", label: "Working on it", color: "bg-yellow-300", text: "text-black" },
    { value: "Stuck", label: "Stuck", color: "bg-red-400", text: "text-white" },
    { value: "Not Started", label: "Not Started", color: "bg-gray-400", text: "text-black" },
  ];

  // Group tasks by status
  const tasksByStatus: { [key: string]: any[] } = {};
  statuses.forEach(s => {
    tasksByStatus[s.value] = tasks.filter(t => t.status === s.value);
  });

  // Handle drag end
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId !== destination.droppableId) {
      // Update status di backend
      const task = tasks.find((t: any) => t.id.toString() === draggableId);
      if (task) {
        router.patch(`/tasks/${task.id}`, { ...task, status: destination.droppableId });
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto">
        {statuses.map(status => (
          <Droppable droppableId={status.value} key={status.value}>
            {(provided: DroppableProvided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex-1 min-w-[270px]"
              >
                <div className={`${status.color} ${status.text} rounded-t px-4 py-2 font-bold flex items-center justify-between`}>
                  {status.label}
                  <span className="ml-2 text-xs font-normal">{tasksByStatus[status.value].length}</span>
                </div>
                <div className="bg-gray-50 min-h-[80vh] rounded-b p-3">
                  {tasksByStatus[status.value].map((task, idx) => (
                    <Draggable draggableId={task.id.toString()} index={idx} key={task.id}>
                      {(provided: DraggableProvided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white rounded border shadow-sm mb-4 p-3"
                        >
                          <div className="font-semibold mb-1">{task.name}</div>
                          <div className="flex gap-2 mb-1 flex-wrap">
                            <span className={`text-xs px-2 py-1 rounded ${status.color} ${status.text}`}>{status.label}</span>
                            {task.due_date && (
                              <span className="text-xs px-2 py-1 rounded bg-gray-200 flex items-center gap-1">
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm12 6v2H5V8h14Zm0 4v8H5v-8h14Z"/></svg>
                                {formatDate(task.due_date)}
                              </span>
                            )}
                            {task.priority && (
                              <span className={`text-xs px-2 py-1 rounded ${priorityOptions.find(p => p.value === task.priority)?.color ?? "bg-gray-300 text-black"}`}>
                                {task.priority}
                              </span>
                            )}
                          </div>
                          {task.notes && <div className="text-xs text-gray-700 mb-2">{task.notes}</div>}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-block rounded-full bg-gray-200 p-1">
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="#222"/><path fill="#222" d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4v1H4v-1Z"/></svg>
                            </span>
                            <span className="text-xs text-gray-600">{task.owner}</span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", { month: "short", day: "numeric" });
}

import { useState, useEffect } from "react";
import { DndContext, closestCenter, DragEndEvent, useSensor, useSensors, PointerSensor, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, TaskStatus } from "@/types/task"; // Ensure TaskStatus is correctly imported
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { SidebarProvider } from "@/Components/ui/sidebar";
import { AppSidebar } from "@/Components/Appsidebar";
import { Head, useForm, router } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

// Interface untuk Props yang diterima oleh komponen TasksPage
interface Props {
  tasks: Task[]; // Array objek tugas
  projects: Array<{ // Array objek proyek
    id: number;
    name: string;
    members: Array<{ id: number; name: string }>;
    leader: { id: number; name: string };
  }>;
  teamMembers: Array<{ id: number; name: string }>; // Array semua anggota tim
  can: { // Izin untuk pengguna saat ini
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  projectId?: number; // Opsional ID proyek untuk pemfilteran awal
}

// Interface untuk Props Input Formulir
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

// Interface untuk Props Pilih Formulir
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
  error?: string;
}

// Interface untuk Props Area Teks Formulir
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

// Komponen FormInput: Merender bidang input berlabel dengan tampilan error
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

// Komponen FormSelect: Merender dropdown pilihan berlabel dengan tampilan error
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

// Komponen FormTextarea: Merender area teks berlabel dengan tampilan error
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

// Mendefinisikan label status yang valid untuk tugas
const statusLabels: TaskStatus[] = ["Not Started", "Working on it", "Stuck", "Done"];
// Mendefinisikan kelas CSS untuk warna status
const statusColors: Record<TaskStatus, string> = {
  "Working on it": "bg-orange-400",
  "Stuck": "bg-red-500",
  "Done": "bg-green-500",
  "Not Started": "bg-gray-400",
};

// Mendefinisikan kelas CSS untuk warna prioritas
const priorityColors: Record<string, string> = {
  "Low": "bg-green-100 text-green-800",
  "Medium": "bg-yellow-100 text-yellow-800",
  "High": "bg-red-100 text-red-800",
};

// Komponen TaskCard: Merepresentasikan kartu tugas yang dapat diseret secara individual di papan Kanban
const TaskCard = ({ task, onEdit, onDelete, canEdit, canDelete, onViewComments }: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  canEdit: boolean;
  canDelete: boolean;
  onViewComments: (task: Task) => void; // Prop baru untuk melihat komentar
}) => {
  // Hook useSortable menyediakan props untuk membuat komponen dapat diseret dan diurutkan
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id.toString(), // ID unik untuk DND-Kit
    data: {
      type: 'task', // Tipe data kustom untuk mengidentifikasi elemen yang dapat diseret
      task, // Objek tugas yang sebenarnya
      status: task.status // Sertakan status saat ini untuk logika penyeretan yang lebih mudah
    }
  });

  // Terapkan gaya transformasi dan transisi untuk penyeretan yang mulus
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // Kurangi opasitas saat menyeret
    zIndex: isDragging ? 1 : 0, // Bawa item yang diseret ke depan
    // Terapkan batas atau bayangan halus saat menyeret untuk umpan balik visual yang lebih baik
    boxShadow: isDragging ? '0px 8px 16px rgba(0,0,0,0.2)' : '0px 1px 3px rgba(0,0,0,0.1)'
  };

  return (
    <div
      ref={setNodeRef} // Menghubungkan node DOM ke DND-Kit
      style={style}
      {...attributes} // Atribut untuk interaksi seret (misalnya, role="button", tabindex="0")
      {...listeners} // Event listener untuk interaksi seret (misalnya, onMouseDown, onTouchStart)
      className="bg-white rounded-xl p-4 shadow-md border border-gray-200 group cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow duration-300" // Updated card styling
    >
      <div className="flex justify-between items-start mb-2">
        <div className="font-semibold text-lg text-[#1B355E]">{task.title}</div> {/* Dark blue title */}
        {(canEdit || canDelete) && (
          // Opacity transition for action buttons on hover
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Mencegah event seret memicu
                  onEdit(task);
                }}
                className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded-md" // Styled edit button
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Mencegah event seret memicu
                  onDelete(task.id);
                }}
                className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded-md" // Styled delete button
              >
                Hapus
              </button>
            )}
          </div>
        )}
      </div>
      <div className="text-sm text-gray-700 mb-2 leading-relaxed">{task.description || task.notes}</div>
      <div className="text-xs text-gray-600 mb-3">{task.project?.name}</div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className={`px-3 py-1 rounded-full text-white ${statusColors[task.status]}`}>
          {task.status}
        </span>
        {task.due_date && (
          <span className="bg-gray-200 px-3 py-1 rounded-full text-gray-700">
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
        {task.priority && (
          <span className={`px-3 py-1 rounded-full text-xs ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        )}
        {/* Tombol komentar baru */}
        {task.comments && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Mencegah event seret memicu
              onViewComments(task);
            }}
            className="bg-gray-200 px-3 py-1 rounded-full hover:bg-gray-300 transition text-gray-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            Komentar ({task.comments.length})
          </button>
        )}
      </div>
      <div className="mt-3 text-sm text-gray-500">
        <span>{task.assignedTo?.name || task.owner?.name || "Tidak Ditugaskan"}</span>
      </div>
    </div>
  );
};

// Komponen CommentsModal: Modal untuk melihat dan menambahkan komentar pada tugas
interface CommentsModalProps {
  task: Task;
  onClose: () => void;
  onSubmitComment: (taskId: number, content: string) => Promise<void>; // Make it async
  canComment: boolean;
}

const CommentsModal = ({ task, onClose, onSubmitComment, canComment }: CommentsModalProps) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false); // State untuk loading komentar

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error("Komentar tidak boleh kosong.");
      return;
    }
    setIsSubmittingComment(true); // Start loading
    try {
      await onSubmitComment(task.id, newComment);
      setNewComment('');
    } finally {
      setIsSubmittingComment(false); // Stop loading
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"> {/* Darker overlay, added p-4 */}
      <div className="bg-white p-8 rounded-xl w-full max-w-lg mx-auto shadow-2xl max-h-[90vh] overflow-y-auto"> {/* Wider max-w, rounded-xl, shadow-2xl */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-3xl font-bold text-[#1B355E]">Komentar untuk "{task.title}"</h3> {/* Dark blue header */}
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-3 custom-scrollbar"> {/* Increased space-y, mb, pr-3, and added custom-scrollbar class for styling */}
          {task.comments && task.comments.length > 0 ? (
            task.comments.map(comment => (
              <div key={comment.id} className="bg-gray-100 p-4 rounded-lg text-sm border border-gray-200"> {/* Added border and padding */}
                <div className="font-semibold text-gray-800 flex justify-between items-center">
                  <span>{comment.user.name}</span>
                  <span className="text-gray-500 text-xs">{new Date(comment.created_at).toLocaleString()}</span>
                </div>
                <p className="text-gray-700 mt-2 leading-relaxed">{comment.content}</p> {/* Increased mt and leading-relaxed */}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-base text-center py-4">Belum ada komentar.</p> // Centered text and larger font
          )}
        </div>

        {canComment && ( // Hanya tampilkan formulir komentar jika pengguna memiliki izin
          <form onSubmit={handleCommentSubmit} className="mt-6 border-t pt-6 border-gray-200"> {/* Increased mt, pt, and added border-t */}
            <FormTextarea
              label="Tambahkan komentar"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3} // Adjusted rows for better look
              placeholder="Ketik komentar Anda di sini..."
              error={undefined} // Not using error prop for simplicity in this modal for now
            />
            <div className="flex justify-end mt-4"> {/* Increased mt */}
              <button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className="px-6 py-2 bg-[#1B355E] text-white rounded-md shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B355E] disabled:opacity-50 transition-colors"
              >
                {isSubmittingComment ? 'Memposting...' : 'Kirim Komentar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};


// TasksPage Component: Komponen utama untuk menampilkan dan mengelola tugas
export default function TasksPage({ tasks, projects, teamMembers, can, projectId }: Props) {
  // State untuk struktur data utama papan Kanban: tugas dikelompokkan berdasarkan status
  const [columns, setColumns] = useState<Record<TaskStatus, Task[]>>(() => {
    const initialColumns: Record<TaskStatus, Task[]> = {
      "Not Started": [],
      "Working on it": [],
      "Stuck": [],
      "Done": [],
    };
    // Kelompokkan tugas yang masuk berdasarkan statusnya
    tasks.forEach(task => {
      if (initialColumns[task.status]) {
        initialColumns[task.status].push(task);
      } else {
        // Fallback untuk status tugas yang tidak terduga, default ke "Not Started"
        initialColumns["Not Started"].push(task);
      }
    });
    return initialColumns;
  });

  // State untuk mengelola tab aktif (Kanban atau Tabel)
  const [activeTab, setActiveTab] = useState<'kanban' | 'table'>('kanban');
  // State untuk mengontrol visibilitas modal buat/edit
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // State untuk menyimpan tugas yang sedang diedit
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  // State untuk filter proyek yang dipilih (mempengaruhi tabel dan Kanban)
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId?.toString() || '');
  // State untuk tugas yang sedang aktif (diseret) untuk DragOverlay
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // State untuk visibilitas modal komentar dan tugas yang dipilih
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [selectedTaskForComments, setSelectedTaskForComments] = useState<Task | null>(null);
  // isSubmittingComment dihapus dari state lokal di TasksPage dan hanya di CommentsModal

  // Tugas yang difilter untuk Tampilan Tabel dan tampilan Kanban (berasal dari `columns`)
  const filteredTasks = Object.values(columns).flat().filter(task =>
    selectedProjectId ? task.project_id.toString() === selectedProjectId : true
  );

  // Efek untuk memperbarui state `columns` saat prop `tasks` berubah (misalnya, setelah operasi CRUD dari modal)
  useEffect(() => {
    const newColumns: Record<TaskStatus, Task[]> = {
      "Not Started": [],
      "Working on it": [],
      "Stuck": [],
      "Done": [],
    };
    tasks.forEach(task => {
      if (newColumns[task.status]) {
        newColumns[task.status].push(task);
      } else {
        newColumns["Not Started"].push(task); // Fallback untuk status yang tidak dikenal
      }
    });
    // Periksa apakah struktur baru benar-benar berbeda sebelum memperbarui untuk mencegah loop tak terbatas
    // Pemeriksaan kesetaraan mendalam yang sederhana akan ideal tetapi untuk kesederhanaan, kita bergantung pada rekonsiliasi React.
    setColumns(newColumns);
  }, [tasks]); // Jalankan ulang saat prop 'tasks' dari Inertia berubah

  // Hook useForm Inertia.js untuk menangani data formulir dan pengiriman
  const { data, setData, post, put, processing, errors, reset } = useForm({
    title: '',
    project_id: selectedProjectId,
    assigned_to: '',
    status: 'Not Started' as TaskStatus,
    due_date: '',
    priority: 'Medium',
    notes: '',
    timeline_start: '',
    timeline_end: ''
  });

  // Fungsi untuk mendapatkan anggota tim yang tersedia untuk proyek yang dipilih di modal tugas
  const getAvailableTeamMembers = () => {
    if (!data.project_id) return teamMembers; // Jika tidak ada proyek yang dipilih dalam formulir, kembalikan semua anggota tim (Manajer Proyek + Anggota Tim)

    const project = projects.find(p => p.id.toString() === data.project_id);
    if (!project) return teamMembers; // Jika proyek tidak ditemukan, kembalikan semua anggota tim

    // Gabungkan anggota proyek dan pemimpin, filter duplikat berdasarkan ID
    return [...project.members, project.leader].filter((member, index, self) =>
      index === self.findIndex(m => m.id === member.id)
    );
  };

  // Efek untuk mereset assigned_to saat proyek yang dipilih dalam formulir berubah
  useEffect(() => {
    // Hanya reset jika proyek dipilih DAN assigned_to belum valid untuk proyek baru
    if (data.project_id) {
        const currentAssignedTo = parseInt(data.assigned_to);
        const availableMembers = getAvailableTeamMembers();
        if (currentAssignedTo && !availableMembers.some(member => member.id === currentAssignedTo)) {
             setData('assigned_to', ''); // Reset jika assigned_to saat ini tidak ada di tim proyek baru
        }
    } else {
        setData('assigned_to', ''); // Kosongkan assigned_to jika tidak ada proyek yang dipilih
    }
  }, [data.project_id, projects, teamMembers]); // Bergantung pada data dan proyek yang relevan untuk daftar anggota

  // Konfigurasi sensor DND-Kit untuk interaksi seret
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Diperlukan gerakan 8px sebelum penyeretan dimulai
      },
    })
  );

  // handleDragStart: Mengatur activeTask untuk DragOverlay saat penyeretan dimulai
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = parseInt(active.id as string);
    // Temukan tugas aktif dari state `columns` saat ini
    for (const status of statusLabels) {
        const task = columns[status].find(t => t.id === taskId);
        if (task) {
            setActiveTask(task);
            break;
        }
    }
  };

  // handleDragEnd: Menangani logika saat operasi seret berakhir
  // Fungsi ini bertanggung jawab untuk memperbarui state `columns` untuk keduanya
  // penyusunan ulang dalam kolom dan pemindahan antar kolom, dan kemudian mengirim
  // pembaruan status ke backend jika kolom berubah.
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null); // Hapus tugas aktif dari DragOverlay

    if (!over) return; // Jika tidak ada area yang dapat dijatuhkan ditemukan, jangan lakukan apa-apa

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Tentukan ID kontainer sumber dan tujuan
    const activeContainerId = active.data.current?.status; // Status tugas yang diseret
    const overContainerId = over.data.current?.status || (statusLabels.includes(over.id as TaskStatus) ? over.id : null); // Status kolom/tugas target

    if (!activeContainerId || !overContainerId) return;

    const oldStatus = activeContainerId as TaskStatus;
    const newStatus = overContainerId as TaskStatus;

    // Snapshot state saat ini untuk potensi rollback
    const previousColumns = JSON.parse(JSON.stringify(columns)) as Record<TaskStatus, Task[]>;

    // --- Pembaruan UI Optimis ---
    setColumns(prevColumns => {
        const tempColumns = JSON.parse(JSON.stringify(prevColumns)) as Record<TaskStatus, Task[]>;

        const currentItemsInActiveContainer = tempColumns[oldStatus];
        const currentItemsInOverContainer = tempColumns[newStatus];

        const activeIndex = currentItemsInActiveContainer.findIndex(item => item.id.toString() === activeId);
        let overIndex = currentItemsInOverContainer.findIndex(item => item.id.toString() === overId);

        // Jika 'over' adalah ID kolom, sisipkan di akhir daftar kolom tersebut
        if (overIndex === -1 && statusLabels.includes(overId as TaskStatus)) {
            overIndex = currentItemsInOverContainer.length;
        } else if (overIndex === -1 && activeContainerId === overContainerId) {
            // Kasus ini menangani penyeretan ke kolom kosong.
            // Saat berpindah ke kolom kosong, overId akan menjadi ID kolom itu sendiri.
            // Jika activeContainerId === overContainerId, ini adalah penyeretan intra-kolom tetapi di atas tempat kosong.
            overIndex = currentItemsInOverContainer.length;
        }

        // Jika tugas diseret dalam kolom yang sama (status tidak berubah)
        if (oldStatus === newStatus) {
            tempColumns[oldStatus] = arrayMove(currentItemsInActiveContainer, activeIndex, overIndex);
        } else {
            // Tugas diseret ke kolom yang berbeda (status berubah)
            const [movedItem] = currentItemsInActiveContainer.splice(activeIndex, 1);
            if (movedItem) {
                // Perbarui properti status objek tugas yang dipindahkan
                movedItem.status = newStatus;
                currentItemsInOverContainer.splice(overIndex, 0, movedItem);
            }
        }
        return tempColumns;
    });

    // --- Pembaruan Backend ---
    // Hanya kirim pembaruan status, karena backend saat ini tidak mengelola urutan dalam kolom.
    if (oldStatus !== newStatus) { // Hanya kirim permintaan jika status benar-benar berubah
      try {
        const response = await axios.patch(route('tasks.update-status', activeId), {
          status: newStatus // Kirim status baru ke backend
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        if (response.data.success || response.status === 200) {
          toast.success(response.data.message || 'Status berhasil diperbarui');
        } else {
          throw new Error(response.data.message || 'Pembaruan status gagal');
        }
      } catch (error) {
        // Rollback pembaruan optimis jika panggilan API gagal
        setColumns(previousColumns); // Kembali ke snapshot state sebelum penyeretan

        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data?.message ||
                                 error.response?.data?.errors?.status?.[0] ||
                                 error.message;
          toast.error(errorMessage);
        } else {
          toast.error('Terjadi kesalahan tak terduga saat memperbarui status tugas.');
        }
      }
    }
  };

  // handleSubmit: Menangani pengiriman formulir untuk membuat atau memperbarui tugas
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTask) {
      // Jika mengedit tugas yang sudah ada, gunakan permintaan PUT
      put(route('tasks.update', editingTask.id), {
        onSuccess: () => {
          setIsCreateModalOpen(false); // Tutup modal saat berhasil
          reset(); // Reset bidang formulir
          setEditingTask(null); // Hapus tugas yang diedit
          toast.success('Tugas berhasil diperbarui!'); // Tampilkan toast sukses
        },
        onError: (errors) => {
          console.error('Error memperbarui tugas:', errors);
          toast.error('Gagal memperbarui tugas. Silakan periksa formulir.'); // Tampilkan toast error
        }
      });
    } else {
      // Jika membuat tugas baru, gunakan permintaan POST
      post(route('tasks.store'), {
        onSuccess: () => {
          setIsCreateModalOpen(false); // Tutup modal saat berhasil
          reset(); // Reset bidang formulir
          toast.success('Tugas berhasil dibuat!'); // Tampilkan toast sukses
        },
        onError: (errors) => {
          console.error('Error membuat tugas:', errors);
          toast.error('Gagal membuat tugas. Silakan periksa formulir.'); // Tampilkan toast error
        }
      });
    }
  };

  // handleDelete: Menangani penghapusan tugas
  const handleDelete = (taskId: number) => {
    // Show confirmation dialog (consider using a custom modal instead of native confirm for better UX)
    if (confirm('Anda yakin ingin menghapus tugas ini?')) { // Consider replacing with a custom modal
      router.delete(route('tasks.destroy', taskId), {
        onSuccess: () => {
          // Remove task from `columns` state
          setColumns(prevColumns => {
            const newCols = JSON.parse(JSON.stringify(prevColumns));
            for (const status of statusLabels) {
                newCols[status] = newCols[status].filter((task: Task) => task.id !== taskId);
            }
            return newCols;
          });
          toast.success('Tugas berhasil dihapus!'); // Tampilkan toast sukses
        },
        onError: (errors) => {
          console.error('Error menghapus tugas:', errors);
          toast.error('Gagal menghapus tugas.'); // Tampilkan toast error
        }
      });
    }
  };

  // openEditModal: Membuka modal untuk mengedit tugas
  const openEditModal = (task: Task) => {
    setEditingTask(task); // Atur tugas yang akan diedit
    // Atur proyek yang dipilih untuk formulir berdasarkan project_id tugas
    setData({
      title: task.title,
      project_id: task.project_id.toString(),
      assigned_to: task.assigned_to?.toString() || '',
      status: task.status,
      due_date: task.due_date || '',
      priority: task.priority || 'Medium',
      notes: task.notes || '',
      timeline_start: task.timeline_start || '',
      timeline_end: task.timeline_end || ''
    });
    setIsCreateModalOpen(true); // Buka modal
  };

  // closeModal: Menutup modal buat/edit tugas
  const closeModal = () => {
    setIsCreateModalOpen(false); // Tutup modal
    setEditingTask(null); // Hapus tugas yang diedit
    reset(); // Reset bidang formulir
  };

  // openCommentsModal: Membuka modal komentar untuk tugas tertentu
  const openCommentsModal = (task: Task) => {
    setSelectedTaskForComments(task);
    setIsCommentsModalOpen(true);
  };

  // closeCommentsModal: Menutup modal komentar
  const closeCommentsModal = () => {
    setIsCommentsModalOpen(false);
    setSelectedTaskForComments(null);
  };

  // handleSubmitComment: Menangani pengiriman komentar baru
  const handleSubmitComment = async (taskId: number, commentContent: string) => {
      try {
          const response = await axios.post(route('tasks.comments.store', taskId), {
              content: commentContent
          });
          if (response.data.success && response.data.comment) {
              toast.success(response.data.message || 'Komentar berhasil ditambahkan!');

              // Perbarui state `columns` secara optimis dengan komentar baru
              setColumns(prevColumns => {
                  const newCols = JSON.parse(JSON.stringify(prevColumns)); // Deep copy
                  for (const status of statusLabels) {
                      const taskIndex = newCols[status].findIndex((t: Task) => t.id === taskId);
                      if (taskIndex !== -1) {
                          if (!newCols[status][taskIndex].comments) {
                              newCols[status][taskIndex].comments = [];
                          }
                          newCols[status][taskIndex].comments.push(response.data.comment);
                          break;
                      }
                  }
                  return newCols;
              });
              // Tidak perlu menutup modal, pengguna mungkin ingin menambahkan komentar lagi.
          } else {
              throw new Error(response.data.message || 'Gagal menambahkan komentar.');
          }
      } catch (error) {
          if (axios.isAxiosError(error)) {
              const errorMessage = error.response?.data?.message || error.response?.data?.errors?.content?.[0] || error.message;
              toast.error(errorMessage);
          } else {
              toast.error('Terjadi kesalahan tak terduga saat menambahkan komentar.');
          }
      }
  };


  return (
    <AuthenticatedLayout>
      <Head title="Tasks" />
      <SidebarProvider>
        <div className="flex">
          <div className="flex-1 p-6 bg-gray-50 min-h-screen font-inter"> {/* Changed to bg-gray-50 for subtle background */}
            {/* Bagian header */}
            <div className="flex justify-between items-center mb-8"> {/* Increased mb */}
              <h1 className="text-4xl font-extrabold text-[#1B355E]">Task Management</h1> {/* Dark blue header */}
              {can.create && (
                <button
                  onClick={() => {
                    setData('project_id', selectedProjectId); // Isi otomatis proyek jika ada yang dipilih
                    setIsCreateModalOpen(true); // Buka modal buat tugas
                  }}
                  className="bg-[#1B355E] text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-800 transition-colors flex items-center gap-2" // Styled button
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Buat Tugas Baru
                </button>
              )}
            </div>

            {/* Dropdown Filter Proyek */}
            <div className="mb-6">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="mt-1 block w-full md:w-64 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2" // Styled select
              >
                <option value="">Semua Proyek</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Navigasi Tab untuk tampilan Tabel dan Kanban */}
            <div className="border-b border-gray-200 mb-6"> {/* Added border-gray-200, increased mb */}
              <nav className="flex space-x-6 text-sm">
                <button
                  onClick={() => setActiveTab("table")}
                  className={`pb-3 px-1 transition-colors font-semibold ${activeTab === "table" ? "border-b-2 border-[#1B355E] text-[#1B355E]" : "text-gray-600 hover:text-gray-800"}`} // Styled tabs
                >
                  Tabel Utama
                </button>
                <button
                  onClick={() => setActiveTab("kanban")}
                  className={`pb-3 px-1 transition-colors font-semibold ${activeTab === "kanban" ? "border-b-2 border-[#1B355E] text-[#1B355E]" : "text-gray-600 hover:text-gray-800"}`} // Styled tabs
                >
                  Kanban
                </button>
              </nav>
            </div>

            {/* Tampilan Tabel Utama */}
            {activeTab === "table" && (
              <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200"> {/* Styled table container */}
                <table className="w-full table-auto">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Judul</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Proyek</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal Jatuh Tempo</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Prioritas</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ditugaskan Kepada</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Komentar</th> {/* Kolom komentar baru */}
                      {(can.edit || can.delete) && (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTasks && filteredTasks.length > 0 ? (
                      filteredTasks.map(task => (
                        <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">{task.title}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{task.project?.name || 'Tidak Ada Proyek'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs text-white ${statusColors[task.status]}`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Tidak ada tanggal jatuh tempo'}
                          </td>
                          <td className="px-4 py-3">
                            {task.priority && (
                              <span className={`px-3 py-1 rounded-full text-xs ${priorityColors[task.priority]}`}>
                                {task.priority}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {task.assignedTo?.name || task.owner?.name || "Tidak Ditugaskan"}
                          </td>
                          <td className="px-4 py-3"> {/* Sel untuk tombol komentar */}
                            <button
                              onClick={() => openCommentsModal(task)}
                              className="text-[#1B355E] hover:text-blue-800 text-sm font-medium flex items-center gap-1" // Styled button
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                              Komentar ({task.comments?.length || 0})
                            </button>
                          </td>
                          {(can.edit || can.delete) && (
                            <td className="px-4 py-3 text-sm">
                              <div className="flex space-x-2">
                                {can.edit && (
                                  <button
                                    onClick={() => openEditModal(task)}
                                    className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-md"
                                  >
                                    Edit
                                  </button>
                                )}
                                {can.delete && (
                                  <button
                                    onClick={() => handleDelete(task.id)}
                                    className="text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded-md"
                                  >
                                    Hapus
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={can.edit || can.delete ? 8 : 7} className="px-4 py-6 text-center text-gray-500 text-base">
                          Tidak ada tugas ditemukan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tampilan Papan Kanban */}
            {activeTab === "kanban" && (
              <DndContext
                sensors={sensors} // Lewati sensor yang dikonfigurasi
                collisionDetection={closestCenter} // Strategi deteksi tabrakan
                onDragStart={handleDragStart} // Event untuk memulai seret
                onDragEnd={handleDragEnd} // Event untuk mengakhiri seret
              >
                <div className="flex gap-6 overflow-x-auto mt-6 pb-6 custom-scrollbar"> {/* Increased gap, mt, pb and added custom-scrollbar */}
                  {statusLabels.map((status) => (
                    <div
                      key={status}
                      className="bg-white rounded-xl w-72 flex-shrink-0 shadow-lg border border-gray-200" // Updated column styling
                      data-status={status}
                      id={status}
                    >
                      <div className={`text-white px-4 py-3 rounded-t-xl font-semibold text-lg ${statusColors[status]}`}> {/* Updated header styling */}
                        {status} <span className="ml-2 text-sm">({columns[status]?.length || 0})</span>
                      </div>
                      <div
                        className="p-3 space-y-4 min-h-[250px] bg-gray-50 rounded-b-xl" // Increased padding, space-y, min-h, and added rounded-b-xl
                      >
                        <SortableContext
                          items={columns[status]?.map(task => task.id.toString()) || []}
                          strategy={verticalListSortingStrategy}
                        >
                          {columns[status]?.map(task => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onEdit={openEditModal}
                              onDelete={handleDelete}
                              canEdit={can.edit}
                              canDelete={can.delete}
                              onViewComments={openCommentsModal} // Lewati prop ke TaskCard
                            />
                          ))}
                        </SortableContext>
                      </div>
                    </div>
                  ))}
                </div>
                {/* DragOverlay: Menampilkan representasi visual dari item yang diseret */}
                <DragOverlay>
                  {activeTask ? (
                    <div className="bg-white rounded-xl p-4 shadow-xl border border-gray-300 opacity-90">
                      <div className="font-semibold text-lg text-[#1B355E]">{activeTask.title}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {activeTask.description || activeTask.notes}
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}

            {/* Modal Buat/Edit Tugas */}
            {isCreateModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"> {/* Darker overlay, added p-4 */}
                <div className="bg-white p-8 rounded-xl w-full max-w-3xl mx-auto shadow-2xl max-h-[90vh] overflow-y-auto"> {/* Larger max-w, rounded-xl, shadow-2xl */}
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-3xl font-bold text-[#1B355E]"> {/* Dark blue header */}
                      {editingTask ? 'Edit Tugas' : 'Buat Tugas Baru'}
                    </h3>
                    <button
                      onClick={closeModal}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Kolom Kiri */}
                      <div className="space-y-6"> {/* Increased space-y */}
                        <FormInput
                          label="Judul Tugas"
                          type="text"
                          value={data.title}
                          onChange={e => setData('title', e.target.value)}
                          required
                          error={errors.title}
                        />

                        <FormSelect
                          label="Proyek"
                          value={data.project_id}
                          onChange={e => {
                            setData('project_id', e.target.value);
                          }}
                          required
                          error={errors.project_id}
                        >
                          <option value="">Pilih Proyek</option>
                          {projects.map(project => (
                            <option key={project.id} value={project.id}>
                              {project.name}
                            </option>
                          ))}
                        </FormSelect>

                        <FormSelect
                          label="Ditugaskan Kepada"
                          value={data.assigned_to}
                          onChange={e => setData('assigned_to', e.target.value)}
                          required
                          error={errors.assigned_to}
                        >
                          <option value="">Pilih Anggota Tim</option>
                          {getAvailableTeamMembers().map(member => (
                            <option key={member.id} value={member.id}>
                              {member.name} {member.id === projects.find(p => p.id.toString() === data.project_id)?.leader.id ? '(Pemimpin Proyek)' : ''}
                            </option>
                          ))}
                        </FormSelect>

                        <FormSelect
                          label="Status"
                          value={data.status}
                          onChange={e => setData('status', e.target.value as TaskStatus)}
                          error={errors.status}
                        >
                          {statusLabels.map(status => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </FormSelect>

                        <FormSelect
                          label="Prioritas"
                          value={data.priority}
                          onChange={e => setData('priority', e.target.value)}
                          error={errors.priority}
                        >
                          <option value="Low">Rendah</option>
                          <option value="Medium">Sedang</option>
                          <option value="High">Tinggi</option>
                        </FormSelect>
                      </div>

                      {/* Kolom Kanan */}
                      <div className="space-y-6"> {/* Increased space-y */}
                        <FormInput
                          label="Tanggal Jatuh Tempo"
                          type="date"
                          value={data.due_date}
                          onChange={e => setData('due_date', e.target.value)}
                          error={errors.due_date}
                        />

                        <FormInput
                          label="Mulai Linimasa"
                          type="date"
                          value={data.timeline_start}
                          onChange={e => setData('timeline_start', e.target.value)}
                          error={errors.timeline_start}
                        />

                        <FormInput
                          label="Akhir Linimasa"
                          type="date"
                          value={data.timeline_end}
                          onChange={e => setData('timeline_end', e.target.value)}
                          error={errors.timeline_end}
                        />

                        <FormTextarea
                          label="Catatan"
                          value={data.notes}
                          onChange={e => setData('notes', e.target.value)}
                          rows={4}
                          error={errors.notes}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200"> {/* Added border-t */}
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2 bg-[#1B355E] text-white rounded-md shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B355E] disabled:opacity-50 transition-colors"
                      >
                        {processing ? 'Menyimpan...' : (editingTask ? 'Perbarui Tugas' : 'Buat Tugas')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal Komentar */}
            {isCommentsModalOpen && selectedTaskForComments && (
              <CommentsModal
                task={selectedTaskForComments}
                onClose={closeCommentsModal}
                onSubmitComment={handleSubmitComment}
                canComment={can.edit} // Asumsi can.edit memberikan izin komentar untuk anggota tim
              />
            )}
          </div>
        </div>
      </SidebarProvider>
    </AuthenticatedLayout>
  );
}

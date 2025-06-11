export type TaskStatus = "Not Started" | "Working on it" | "Done" | "Stuck";


export interface Task {
  id: number;
  title: string;
  project: {
    id: number;
    name: string;
  } | null;
  project_id: number;
  owner: {
    id: number;
    name: string;
  } | null;
  assigned_to: number;
  status: TaskStatus;
  due_date: string;
  notes: string;
  timeline_start: string;
  timeline_end: string;
  priority?: 'Low' | 'Medium' | 'High'; 
  description?: string;
}
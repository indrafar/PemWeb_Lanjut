// Define the possible statuses for a task.
// This type is used within the Task interface.
export type TaskStatus = 'Not Started' | 'Working on it' | 'Stuck' | 'Done';

// Define the Task interface, representing the structure of a task object.
export interface Task {
  id: number; // Unique identifier for the task
  title: string; // The title of the task
  description: string | null; // Optional detailed description of the task

  project_id: number; // The ID of the project this task belongs to
  project?: { // Optional nested project object
    id: number;
    name: string;
  };

  owner_id: number; // The ID of the user who created this task
  owner?: { // Optional nested owner user object
    id: number;
    name: string;
  };

  assigned_to: number | null; // The ID of the user assigned to this task (can be null if unassigned)
  assignedTo?: { // Optional nested assigned user object
    id: number;
    name: string;
  };

  status: TaskStatus; // The current status of the task, using the defined TaskStatus type
  due_date: string | null; // The due date of the task (can be null)

  priority: 'Low' | 'Medium' | 'High'; // The priority level of the task

  notes: string | null; // Optional notes for the task

  timeline_start: string | null; // The planned start date for the task's timeline
  timeline_end: string | null; // The planned end date for the task's timeline

  created_at: string; // Timestamp when the task was created
  updated_at: string; // Timestamp when the task was last updated

  comments?: Array<{ // Optional array of comments associated with the task
    id: number; // Unique identifier for the comment
    user_id: number; // The ID of the user who made the comment
    user: { id: number; name: string }; // Nested user object for the commenter
    content: string; // The content of the comment
    created_at: string; // Timestamp when the comment was created
    updated_at: string; // Timestamp when the comment was last updated
  }>;
}

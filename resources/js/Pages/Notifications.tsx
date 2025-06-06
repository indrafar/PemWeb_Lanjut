import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useState } from "react";

type Notification = {
  id: number;
  title: string;
  description: string;
  time: string;
  read: boolean;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "New Comment on Task",
      description: "Alice commented on task ‘Design Landing Page’.",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      title: "Task Completed",
      description: "Bob marked ‘Fix login bug’ as done.",
      time: "5 hours ago",
      read: true,
    },
    {
      id: 3,
      title: "Project Deadline Reminder",
      description: "Reminder: ‘Website Redesign’ is due in 2 days.",
      time: "1 day ago",
      read: false,
    },
  ]);

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  return (
    <AuthenticatedLayout header="Notifications">
      <div className="p-6 bg-white min-h-screen space-y-4">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`border p-4 rounded shadow-sm cursor-pointer ${
              notif.read ? "bg-gray-100" : "bg-blue-50"
            }`}
            onClick={() => markAsRead(notif.id)}
          >
            <h3 className="font-semibold">{notif.title}</h3>
            <p className="text-sm text-gray-700">{notif.description}</p>
            <span className="text-xs text-gray-500">{notif.time}</span>
          </div>
        ))}
      </div>
    </AuthenticatedLayout>
  );
}

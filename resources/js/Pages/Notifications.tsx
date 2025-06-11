import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useState, useEffect } from "react"; // Import useEffect

// Type definition for a notification object
type Notification = {
  id: number;
  title: string;
  description: string;
  time: string;
  read: boolean;
};

// Type definition for a comment object (assuming this structure from your backend)
type Comment = {
    comment_id: number;
    task_title: string;
    commenter_name: string;
    comment_content: string;
    created_at: string; // Timestamp of the comment
};

export default function Notifications() {
  // Initial static notifications
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

  // State to hold comments data (this would come from your backend)
  const [comments, setComments] = useState<Comment[]>([]);

  // Function to mark a notification as read
  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  // Helper function to format time (e.g., "5 minutes ago")
  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  // useEffect hook to fetch/listen for comments and convert them to notifications
  useEffect(() => {
    // In a real application, you would replace this with actual data fetching from your backend.
    // This could be via:
    // 1. WebSocket connection: listen for 'new_comment' events
    // 2. Polling: periodically fetch new comments from an API endpoint
    // 3. Server-Sent Events (SSE): keep an open connection to stream updates

    const fetchComments = async () => {
      try {
        // --- REAL API CALL PLACEHOLDER ---
        // Replace '/api/comments-latest' with your actual Laravel API endpoint
        // This endpoint should return an array of comments, preferably only new ones
        // or all comments that need to be checked for new notifications.
        const response = await fetch('/api/comments-latest'); // Example API endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Comment[] = await response.json();
        
        // Update the comments state only if there are new comments
        if (data && data.length > 0) {
            setComments(data);
        }

      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    // Call it once on mount
    fetchComments(); 

    // If using polling, set up an interval:
    // This will fetch new comments every 10 seconds. Adjust as needed.
    const intervalId = setInterval(fetchComments, 10000); 
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId); 

    // If using WebSockets, your code would look something like this:
    /*
    const ws = new WebSocket('ws://your-websocket-server.com/comments');
    ws.onmessage = (event) => {
      const newComment: Comment = JSON.parse(event.data);
      setComments(prevComments => [newComment, ...prevComments]); // Add new comment to state
    };
    ws.onopen = () => console.log('WebSocket connected for comments.');
    ws.onerror = (error) => console.error('WebSocket error:', error);
    ws.onclose = () => console.log('WebSocket disconnected for comments.');
    return () => ws.close(); // Clean up WebSocket on unmount
    */
  }, []); // Empty dependency array means this effect runs only once on component mount

  // useEffect to combine comments into notifications whenever `comments` state changes
  useEffect(() => {
    const commentNotifications: Notification[] = comments.map(comment => ({
      id: comment.comment_id, // Use comment_id as notification id
      title: `New comment on: "${comment.task_title}"`,
      description: `${comment.commenter_name} commented: "${comment.comment_content.substring(0, 50)}${comment.comment_content.length > 50 ? '...' : ''}"`,
      time: formatTimeAgo(comment.created_at),
      read: false, // New comments are unread by default
    }));

    // Merge existing notifications with new comment notifications.
    // Ensure no duplicates based on ID (if comment IDs can overlap with static notification IDs).
    // For simplicity, we'll just add new comment notifications to the beginning,
    // assuming comment IDs are unique from static notification IDs.
    setNotifications(prevNotifications => {
        const uniqueCommentNotifications = commentNotifications.filter(
            newNotif => !prevNotifications.some(existingNotif => existingNotif.id === newNotif.id)
        );
        // Only prepend new notifications if there are unique ones.
        return uniqueCommentNotifications.length > 0 ? [...uniqueCommentNotifications, ...prevNotifications] : prevNotifications;
    });

  }, [comments]); // Re-run this effect whenever `comments` state changes

  return (
    <AuthenticatedLayout header="Notifications">
      <div className="p-6 bg-white min-h-screen space-y-6 font-inter">
        <h1 className="text-3xl font-bold text-[#1B355E] mb-6">Your Notifications</h1>
        
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`border border-gray-200 p-5 rounded-xl shadow-sm cursor-pointer transition-all duration-300 ease-in-out hover:shadow-md ${
                notif.read ? "bg-gray-100 text-gray-700" : "bg-blue-50 text-[#1B355E] border-[#1B355E]/30"
              }`}
              onClick={() => markAsRead(notif.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{notif.title}</h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${notif.read ? 'bg-gray-200 text-gray-600' : 'bg-[#1B355E] text-white'}`}>
                  {notif.read ? 'Read' : 'Unread'}
                </span>
              </div>
              <p className="text-sm mb-2">{notif.description}</p>
              <span className="text-xs text-gray-500">{notif.time}</span>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-10 text-lg">
            No notifications yet.
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

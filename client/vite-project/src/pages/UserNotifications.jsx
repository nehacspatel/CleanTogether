import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/UserNotifications.css";

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/notifications/${user.user_id}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch notifications", err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${user.user_id}/mark-all-read`);
    } catch (err) {
      console.error("❌ Failed to mark as read", err);
    }
  };

  useEffect(() => {
  const loadAndMark = async () => {
    await fetchNotifications();
    await markAllAsRead();

    // 👉 Tell other components (like Navbar) to re-fetch unread count
    window.dispatchEvent(new Event("notifications-read"));
  };

  loadAndMark();
}, []);


  return (
    <div className="notification-panel">
      <h3>
        {user.role === "volunteer"
          ? "🔔 Volunteer Notifications"
          : "📢 Organizer Notifications"}
      </h3>

      {isLoading ? (
        <p>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications yet</p>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className={`notification-item ${n.read_status === "unread" ? "unread" : "read"}`}
          >
            <h4>{n.title}</h4>
            <p>{n.message}</p>
            <small>{new Date(n.created_at).toLocaleString()}</small>
          </div>
        ))
      )}
    </div>
  );
};

export default UserNotifications;
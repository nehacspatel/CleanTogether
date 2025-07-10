import { Link, useNavigate } from 'react-router-dom';
import '../Styles/Navbar.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io("http://localhost:5000"); // Backend URL

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const localUser = localStorage.getItem('user');
    return localUser ? JSON.parse(localUser) : null;
  });

  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  // Sync with localStorage changes (multi-tab support)
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };

    window.addEventListener('storage', handleStorageChange);

    const interval = setInterval(() => {
      const updatedUser = localStorage.getItem('user');
      const userObj = updatedUser ? JSON.parse(updatedUser) : null;
      if (JSON.stringify(userObj) !== JSON.stringify(user)) {
        setUser(userObj);
      }
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  // Register socket and listen for real-time notifications
  useEffect(() => {
    if (user?.user_id) {
      socket.emit("register", user.user_id);

      socket.on("notification", (data) => {
        console.log("🔔 New notification received:", data);
        setHasUnreadNotifications(true);
      });
    }

    return () => {
      socket.off("notification");
    };
  }, [user]);

  // Fetch unread status
  useEffect(() => {
    const fetchUnreadStatus = async () => {
      if (user?.user_id) {
        try {
          const res = await axios.get(`http://localhost:5000/api/notifications/${user.user_id}/unread-count`);
          setHasUnreadNotifications(res.data.unread > 0);
        } catch (err) {
          console.error("❌ Failed to fetch unread status", err);
        }
      }
    };

    // ✅ Run on mount
    fetchUnreadStatus();

    // ✅ Also run when "notifications-read" is dispatched
    window.addEventListener("notifications-read", fetchUnreadStatus);

    return () => {
      window.removeEventListener("notifications-read", fetchUnreadStatus);
    };
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleNotificationClick = () => {
    navigate('/usernotifications'); // ✅ No reset here!
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/logo.png" alt="Logo" />
        <span>CleanTogether</span>
      </div>

      <ul className="navbar-links">
        <li><Link to="/about">About Us</Link></li>
        <li><Link to="/events">Our Work</Link></li>
       <Link to="/leaderboard">Leaderboard</Link>
      <>
    <li><Link to="/my-certificates">My Certificates</Link></li>
    {/* other items */}
  </>
        {user?.role === 'volunteer' && (
          <>
            <li><Link to="/volunteer-dashboard">Dashboard</Link></li>
            <li><Link to="/waste-logger">Waste Logger</Link></li>
            <li>
              <button className="notification-btn" onClick={handleNotificationClick}>
                🔔
                {hasUnreadNotifications && <span className="dot" />}
              </button>
            </li>
          </>
        )}

        {user?.role === 'organizer' && (
          <>
            <li><Link to="/admin">Add Event</Link></li>
            <li><Link to="/admin/waste-details">Waste Details</Link></li>
            <li><Link to="/admin/image-approval">Waste Approval</Link></li>
            <li>
              <button className="notification-btn" onClick={handleNotificationClick}>
                🔔
                {hasUnreadNotifications && <span className="dot" />}
              </button>
            </li>
          </>
        )}
      </ul>

      <div className="navbar-buttons">
        {!user ? (
          <>
            <Link to="/login"><button className="login-btn">Login</button></Link>
            <Link to="/signup"><button className="signup-btn">Sign Up</button></Link>
          </>
        ) : (
          <>
            <button className="profile-icon" onClick={handleProfileClick}>👤</button>
            <span className="navbar-user">Hi, {user.name || "User"}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

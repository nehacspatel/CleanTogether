import { Link, useNavigate } from 'react-router-dom';
import '../Styles/Navbar.css';
import { useEffect, useState } from 'react';

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const localUser = localStorage.getItem('user');
    return localUser ? JSON.parse(localUser) : null;
  });

  useEffect(() => {
    // Listen for login changes across the app or on refresh
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };

    window.addEventListener('storage', handleStorageChange);

    // Also update on route changes in current tab
    const interval = setInterval(() => {
      const updatedUser = localStorage.getItem('user');
      const userObj = updatedUser ? JSON.parse(updatedUser) : null;
      if (JSON.stringify(userObj) !== JSON.stringify(user)) {
        setUser(userObj);
      }
    }, 500); // Small interval to sync across views

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
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
        <li><Link to="/volunteer">Get Involved</Link></li>
        <li><Link to="/donate">Donate</Link></li>
        {user?.role === 'volunteer' && (
          <li><Link to="/waste-logger">Go to Waste Logger</Link></li>
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
            <span className="navbar-user">Hi, {user.name || "User"}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

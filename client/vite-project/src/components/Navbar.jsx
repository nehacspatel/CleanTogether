// src/components/Navbar.jsx
import { Link } from 'react-router-dom';
import '../Styles/Navbar.css';

function Navbar() {
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
      </ul>
      <div className="navbar-buttons">
        <Link to="/login"><button className="login-btn">Login</button></Link>
        <Link to="/signup"><button className="signup-btn">Sign Up</button></Link>
      </div>
    </nav>
  );
}

export default Navbar;


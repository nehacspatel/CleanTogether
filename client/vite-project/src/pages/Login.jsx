import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import "../Styles/Volunteer.css";

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/users/login', form);
      const user = res.data.user;

      // ✅ Store user and token immediately
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      alert('✅ Login successful!');

      if (user.role === 'organizer') {
        navigate('/admin');
      } else if (user.role === 'volunteer') {
        navigate('/volunteer-dashboard');
      } else {
        alert('⚠️ Unknown user role. Redirecting to home.');
        navigate('/');
      }

    } catch (err) {
      alert('❌ Invalid credentials');
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className="page">
      <h2>Login</h2>

      <form onSubmit={handleSubmit} className="login-form">
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="Enter Your Email"
        />

        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          placeholder="Enter Your Password"
        />

        <button type="submit">Login</button>
      </form>

      <p className="form-footer-text">
        Not a member?{' '}
        <Link to="/signup" className="signup-link">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default Login;
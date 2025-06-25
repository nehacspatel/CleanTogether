import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../Styles/Volunteer.css";
function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'volunteer'
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/users/signup', form); // use full backend URL in Vite
      alert('✅ Signup successful! Please log in.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed.';
      alert(`❌ ${msg}`);
    }
  };

  return (
    <div className="page">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
          placeholder="Enter Your Full Name"
        />
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
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="volunteer">Volunteer</option>
          <option value="organizer">Organizer</option>
        </select>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default Signup;
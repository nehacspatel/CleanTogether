import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'volunteer' });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/users/signup', form);
      alert('✅ Signup successful! Please log in.');
      navigate('/login');
    } catch (err) {
      alert('❌ Signup failed. Email might be taken.');
    }
  };

  return (
    <div className="page">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" type="text" onChange={handleChange} required placeholder="Full Name" />
        <input name="email" type="email" onChange={handleChange} required placeholder="Email" />
        <input name="password" type="password" onChange={handleChange} required placeholder="Password" />
        <select name="role" onChange={handleChange}>
          <option value="volunteer">Volunteer</option>
          <option value="organizer">Organizer</option>
        </select>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default Signup;



// src/components/EventForm.jsx
import { useState } from 'react';
import axios from 'axios';
import '../Styles/EventForm.css';

function EventForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    organizer_id: 1 // 🔐 Temp: hardcoded until login/auth is built
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/events', formData);
      alert('✅ Event created successfully!');
      setFormData({
        title: '',
        description: '',
        location: '',
        date: '',
        organizer_id: 1
      });
      onSuccess(); // Refresh event list
    } catch (err) {
      console.error('Error creating event:', err);
      alert('❌ Failed to create event.');
    }
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <h3>Create New Cleanup Event</h3>
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Event Title"
        required
      />
      <input
        type="text"
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="Beach Location"
        required
      />
      <input
        type="datetime-local"
        name="date"
        value={formData.date}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Event Description"
        required
      />
      <button type="submit">Add Event</button>
    </form>
  );
}

export default EventForm;


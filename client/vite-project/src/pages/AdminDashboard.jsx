import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [volunteerCounts, setVolunteerCounts] = useState({});
  const [wasteLogs, setWasteLogs] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    date: '',
    description: '',
    status: 'upcoming',
    organizer_id: 1,
  });

  useEffect(() => {
    fetchEvents();
    fetchVolunteerCounts();
    fetchWasteLogs();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/events');
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events', err);
    }
  };

  const fetchVolunteerCounts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/events/volunteer-count');
      const countMap = {};
      res.data.forEach(ev => {
        countMap[ev.event_id] = ev.volunteer_count;
      });
      setVolunteerCounts(countMap);
    } catch (err) {
      console.error('Failed to fetch volunteer counts', err);
    }
  };

  const fetchWasteLogs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/waste-logs');
      setWasteLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch waste logs', err);
    }
  };

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm('Are you sure you want to delete this event?');
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:5000/api/events/${eventId}`);
      fetchEvents();
      fetchVolunteerCounts();
    } catch (err) {
      console.error('Failed to delete event', err);
    }
  };

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/events/${eventId}/status`, { status: newStatus });
      fetchEvents();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/events', formData);
      setFormData({
        title: '',
        location: '',
        date: '',
        description: '',
        status: 'upcoming',
        organizer_id: 1,
      });
      fetchEvents();
      fetchVolunteerCounts();
    } catch (err) {
      console.error('Failed to add event', err);
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard - Manage Events</h2>

      <div className="add-event-container">
        <form className="add-event-form" onSubmit={handleAddEvent}>
          <h3>Add New Event</h3>
          <input type="text" name="title" value={formData.title} placeholder="Title" onChange={handleChange} required />
          <input type="text" name="location" value={formData.location} placeholder="Location" onChange={handleChange} required />
          <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} required />
          <textarea name="description" value={formData.description} placeholder="Description" onChange={handleChange} required />
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button type="submit">Add Event</button>
        </form>
      </div>

      <div className="event-list">
        <h3>Existing Events</h3>
        {events.length === 0 ? (
          <p>No events available.</p>
        ) : (
          events.map(event => (
            <div key={event.event_id} className="event-card">
              <h4>{event.title}</h4>
              <p><strong>Location:</strong> {event.location}</p>
              <p>
                <strong>Date & Time:</strong>{' '}
                {new Date(event.date).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
              <p><strong>Status:</strong> {event.status}</p>

              <select
                value={event.status}
                onChange={(e) => handleStatusChange(event.event_id, e.target.value)}
              >
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <p>{event.description}</p>
              <p><strong>Volunteers Registered:</strong> {volunteerCounts[event.event_id] || 0}</p>

              <button onClick={() => handleDelete(event.event_id)}>Delete</button>
            </div>
          ))
        )}
      </div>

      <div className="waste-log-section">
        <h3>Waste Logger Submissions</h3>
        {wasteLogs.length === 0 ? (
          <p>No waste submissions yet.</p>
        ) : (
          <table className="waste-log-table">
            <thead>
              <tr>
                <th>Volunteer ID</th>
                <th>Event ID</th>
                <th>Waste Type</th>
                <th>Quantity (kg)</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {wasteLogs.map((log, index) => (
                <tr key={index}>
                  <td>{log.user_id}</td>
                  <td>{log.event_id}</td>
                  <td>{log.waste_type}</td>
                  <td>{log.quantity}</td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

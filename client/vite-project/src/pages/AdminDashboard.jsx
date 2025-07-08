import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../Styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [volunteerCounts, setVolunteerCounts] = useState({});
  const [wasteLogs, setWasteLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const organizer_id = parseInt(localStorage.getItem("user_id"));

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    date: '',
    description: '',
    status: 'upcoming',
    organizer_id: organizer_id,
  });

  useEffect(() => {
    const fetchAllData = async () => {
      const myEvents = await fetchEvents();
      await fetchVolunteerCounts(myEvents);
      await fetchWasteLogs(myEvents);
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [wasteLogs, selectedStatus, searchQuery]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/events');
      const myEvents = res.data.filter(event => event.organizer_id === organizer_id);
      setEvents(myEvents);
      return myEvents;
    } catch (err) {
      console.error('Failed to fetch events', err);
      return [];
    }
  };

  const fetchVolunteerCounts = async (myEvents) => {
    try {
      const res = await axios.get('http://localhost:5000/api/events/volunteer-count');
      const eventIds = myEvents.map(ev => ev.event_id);
      const countMap = {};
      res.data.forEach(ev => {
        if (eventIds.includes(ev.event_id)) {
          countMap[ev.event_id] = ev.volunteer_count;
        }
      });
      setVolunteerCounts(countMap);
    } catch (err) {
      console.error('Failed to fetch volunteer counts', err);
    }
  };

  const fetchWasteLogs = async (myEvents) => {
    try {
      const res = await axios.get('http://localhost:5000/api/waste-logs');
      const myEventIds = myEvents.map(ev => ev.event_id);
      const logs = res.data.filter(log => myEventIds.includes(log.event_id));
      setWasteLogs(logs);
    } catch (err) {
      console.error("Failed to fetch waste logs", err);
    }
  };

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm('Are you sure you want to delete this event?');
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:5000/api/events/${eventId}`);
      const updatedEvents = await fetchEvents();
      await fetchVolunteerCounts(updatedEvents);
      await fetchWasteLogs(updatedEvents);
    } catch (err) {
      console.error('Failed to delete event', err);
    }
  };

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/events/${eventId}/status`, {
        status: newStatus,
        organizer_id: organizer_id,
      });
      const updatedEvents = await fetchEvents();
      await fetchWasteLogs(updatedEvents);
    } catch (err) {
      console.error("❌ Failed to update status", err);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    const selectedDate = new Date(formData.date);
    const now = new Date();

    if (selectedDate <= now) {
      alert('❌ Please select a future date and time for the event.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/events', formData);
      setFormData({
        title: '',
        location: '',
        date: '',
        description: '',
        status: 'upcoming',
        organizer_id: organizer_id,
      });
      const updatedEvents = await fetchEvents();
      await fetchVolunteerCounts(updatedEvents);
      await fetchWasteLogs(updatedEvents);
    } catch (err) {
      console.error('Failed to add event', err);
    }
  };

  const applyFilters = () => {
    let logs = [...wasteLogs];
    if (selectedStatus !== 'all') {
      logs = logs.filter(log => log.status === selectedStatus);
    }
    if (searchQuery) {
      logs = logs.filter(log =>
        log.user_id.toString().includes(searchQuery) ||
        (events.find(e => e.event_id === log.event_id)?.title.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    setFilteredLogs(logs);
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard - My Organized Events</h2>

      <div className="event-list">
        <h3>Create New Event</h3>
        <div className="add-event-container">
          <form className="add-event-form" onSubmit={handleAddEvent}>
            <input type="text" name="title" value={formData.title} placeholder="Event Title" onChange={handleChange} required />
            <input type="text" name="location" value={formData.location} placeholder="Location" onChange={handleChange} required />
            <input type="datetime-local" name="date" value={formData.date} min={new Date().toISOString().slice(0, 16)} onChange={handleChange} required />
            <textarea name="description" value={formData.description} placeholder="Description" onChange={handleChange} required />
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button type="submit">Add Event</button>
          </form>
        </div>

        <h3>My Events</h3>
        {events.length === 0 ? (
          <p>No events organized by you.</p>
        ) : (
          events.map(event => (
            <div key={event.event_id} className="event-card">
              <h4>{event.title}</h4>
              <p><strong>Location:</strong> {event.location}</p>
              <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
              <p><strong>Status:</strong></p>
              <select value={event.status} onChange={(e) => handleStatusChange(event.event_id, e.target.value)}>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <p>{event.description}</p>
              <p><strong>Volunteers Registered:</strong> {volunteerCounts[event.event_id] || 0}</p>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <Link to={`/volunteers/${event.event_id}`} className="btn btn-primary">View Volunteers</Link>
                <Link to={`/events/${event.event_id}/attendance`} className="btn btn-secondary">Manage Attendance</Link>
                {event.status === 'completed' && (
                  <Link to={`/admin/feedback/${event.event_id}`} className="btn btn-feedback">View Feedback</Link>
                )}
              </div>

              {event.status === "upcoming" && (
                <button onClick={() => handleDelete(event.event_id)} style={{ marginTop: '0.5rem' }}>Delete</button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="log-filters">
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <input
          type="text"
          placeholder="Search by Volunteer ID or Event Title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="waste-log-section">
        <h3>Waste Logs (Your Events Only)</h3>
        {filteredLogs.length === 0 ? (
          <p>No matching waste submissions.</p>
        ) : (
          <table className="waste-log-table">
            <thead>
              <tr>
                <th>Volunteer ID</th>
                <th>Event ID</th>
                <th>Waste Type</th>
                <th>Quantity (kg)</th>
                <th>Submitted At</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, i) => (
                <tr key={i}>
                  <td>{log.user_id}</td>
                  <td>{log.event_id}</td>
                  <td>{log.waste_type}</td>
                  <td>{log.quantity}</td>
                  <td>{new Date(log.timestamp || log.logged_at).toLocaleString()}</td>
                  <td>{log.status}</td>
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

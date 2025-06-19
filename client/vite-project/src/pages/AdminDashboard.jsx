// src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import EventForm from '../components/EventForm';
import EventCard from '../components/EventCard';
import '../Styles/AdminDashboard.css';

function AdminDashboard() {
  const [events, setEvents] = useState([]);

  // For now, mock data — will connect to backend later
  const fetchEvents = () => {
    const dummyEvents = [
      {
        id: 1,
        title: 'Juhu Beach Cleanup',
        beach: 'Juhu Beach',
        date: '2025-07-01',
        time: '09:00',
        capacity: 50,
        description: 'Join us for a community cleanup at Juhu Beach!'
      },
      {
        id: 2,
        title: 'Versova Cleanup',
        beach: 'Versova Beach',
        date: '2025-07-10',
        time: '07:30',
        capacity: 30,
        description: 'Help us tackle plastic waste at Versova shoreline.'
      }
    ];
    setEvents(dummyEvents);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="admin-dashboard page">
      <h2>Admin Dashboard</h2>
      <EventForm onSuccess={fetchEvents} />
      <hr />
      <h3>All Scheduled Events</h3>
      <div className="event-list">
        {events.length > 0 ? (
          events.map(event => (
            <EventCard key={event.id} event={event} isAdmin />
          ))
        ) : (
          <p>No events scheduled yet.</p>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;

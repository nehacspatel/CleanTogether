// src/pages/Events.jsx
import { useEffect, useState } from 'react';
import EventCard from '../components/EventCard';
import '../Styles/Events.css';

function Events() {
  const [events, setEvents] = useState([]);

  // For now, use dummy data; will connect to backend later
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
    <div className="page">
      <h2>Upcoming Beach Cleanup Events</h2>
      <div className="event-list">
        {events.length > 0 ? (
          events.map(event => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <p>No events scheduled yet. Please check back soon!</p>
        )}
      </div>
    </div>
  );
}

export default Events;

import { useEffect, useState } from 'react';
import EventCard from '../components/EventCard';
import '../Styles/Events.css';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError('Error loading events. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="page">
      <h2>Upcoming Beach Cleanup Events</h2>

      {loading ? (
        <p>Loading events...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="event-list">
          {events.length > 0 ? (
            events.map((event) => (
              <EventCard key={event.event_id} event={event} />
            ))
          ) : (
            <p>No events scheduled yet. Please check back soon!</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Events;

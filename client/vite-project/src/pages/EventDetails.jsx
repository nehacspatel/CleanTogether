import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../Styles/EventDetails.css';

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/events/${id}`);
        if (!res.ok) throw new Error('Event not found');
        const data = await res.json();
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error.message);
      }
    };

    fetchEvent();
  }, [id]);

  const handleRegister = () => {
    // TODO: Connect to backend
    setRegistered(true);
  };

  if (!event) return <p>Loading...</p>;

  return (
    <div className="event-details page">
      <h2>{event.title}</h2>
      <p><strong>Location:</strong> {event.location}</p>
      <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
      <p><strong>Status:</strong> {event.status}</p>
      <p>{event.description}</p>

      {!registered ? (
        <button onClick={handleRegister} className="register-btn">
          Register as Volunteer
        </button>
      ) : (
        <p className="registered-text">✅ You are registered for this event!</p>
      )}
    </div>
  );
}

export default EventDetails;

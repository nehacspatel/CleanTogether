import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './EventDetails.css';

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    // Temporary mock data for development
    const dummyEvent = {
      id,
      title: 'Versova Beach Cleanup',
      beach: 'Versova Beach',
      date: '2025-07-10',
      time: '07:30',
      capacity: 30,
      description: 'Help us tackle plastic waste at Versova shoreline.'
    };
    setEvent(dummyEvent);
  }, [id]);

  const handleRegister = () => {
    // TODO: Connect to backend
    setRegistered(true);
  };

  if (!event) return <p>Loading...</p>;

  return (
    <div className="event-details page">
      <h2>{event.title}</h2>
      <p><strong>Beach:</strong> {event.beach}</p>
      <p><strong>Date:</strong> {event.date}</p>
      <p><strong>Time:</strong> {event.time}</p>
      <p><strong>Max Volunteers:</strong> {event.capacity}</p>
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

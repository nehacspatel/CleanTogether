import React from 'react';
import '../Styles/EventCard.css';

function EventCard({ event }) {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString();
  const formattedTime = eventDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="event-card">
      <h3>{event.title}</h3>
      <p><strong>Location:</strong> {event.location}</p>
      <p><strong>Date:</strong> {formattedDate}</p>
      <p><strong>Time:</strong> {formattedTime}</p>
      <p>{event.description}</p>
    </div>
  );
}

export default EventCard;


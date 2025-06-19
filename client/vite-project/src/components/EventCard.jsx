// src/components/EventCard.jsx
import '../Styles/EventCard.css';

function EventCard({ event, isAdmin = false }) {
  const { title, beach, date, time, capacity, description } = event;

  return (
    <div className="event-card">
      <div className="event-header">
        <h4>{title}</h4>
        <span className="event-badge">{beach}</span>
      </div>
      <p className="event-description">{description}</p>
      <div className="event-info">
        <span><strong>Date:</strong> {date}</span>
        <span><strong>Time:</strong> {time}</span>
        <span><strong>Volunteers:</strong> {capacity}</span>
      </div>
      {isAdmin && (
        <div className="event-actions">
          <button className="edit-btn" disabled>Edit</button>
          <button className="delete-btn" disabled>Delete</button>
        </div>
      )}
    </div>
  );
}

export default EventCard;

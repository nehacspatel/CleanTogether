import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/Dashboard.css";

const VolunteerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [userId, setUserId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [volunteerCounts, setVolunteerCounts] = useState({});

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      const id = storedUser.user_id || storedUser.id;
      setUserId(id);
      fetchRegisteredEvents(id);
    }
    fetchEvents();
    fetchVolunteerCounts();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/events");
      setEvents(response.data || []);
    } catch (error) {
      console.error("Error fetching events", error);
    }
  };

  const fetchVolunteerCounts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/events/volunteer-count");
      const countMap = {};
      response.data.forEach((event) => {
        countMap[event.event_id] = event.volunteer_count;
      });
      setVolunteerCounts(countMap);
    } catch (error) {
      console.error("Error fetching volunteer counts", error);
    }
  };

  const fetchRegisteredEvents = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/events/registered/${id}`);
      setRegisteredEvents(response.data);
    } catch (error) {
      console.error("Error fetching registered events", error);
    }
  };

  const isAlreadyRegistered = (eventId) => {
    return registeredEvents.some((event) => event.event_id === eventId);
  };

  const filteredEvents = statusFilter
    ? events.filter((e) => e.status === statusFilter)
    : events;

  const formatDateTime = (datetime) => {
    const dateObj = new Date(datetime);
    return `${dateObj.toLocaleDateString()} at ${dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="dashboard-container">
      <h2>Volunteer Dashboard</h2>

      <div className="filter-section">
        <label htmlFor="statusFilter">Filter by Status:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="section">
        <h3>All Events ({statusFilter || "All"})</h3>
        {filteredEvents.length === 0 ? (
          <p>No events available.</p>
        ) : (
          <ul>
            {filteredEvents.map((event) => (
              <li key={event.event_id} className="event-card">
                <h4>{event.title}</h4>
                <p><strong>Date:</strong> {formatDateTime(event.date)}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p>{event.description}</p>
                <p><strong>Status:</strong> {event.status}</p>
                <p><strong>Volunteers Registered:</strong> {volunteerCounts[event.event_id] || 0}</p>
                {isAlreadyRegistered(event.event_id) && (
                  <span className="registered-label">✅ Already Registered</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard;

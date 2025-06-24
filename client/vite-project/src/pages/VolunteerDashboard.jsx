import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/Dashboard.css";

const VolunteerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [userId, setUserId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("upcoming");
  const [volunteerCounts, setVolunteerCounts] = useState({});

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      const id = storedUser.user_id || storedUser.id;
      setUserId(id);
      fetchRegisteredEvents(id);
    }

    fetchEvents(statusFilter);
    fetchVolunteerCounts();
  }, [statusFilter]);

  const fetchEvents = async (status) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/events?status=${status}`);
      setEvents(response.data || []);
    } catch (error) {
      console.error("Error fetching events", error);
      setEvents([]);
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
      setRegisteredEvents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching registered events", error);
      setRegisteredEvents([]);
    }
  };
const registerForEvent = async (eventId) => {
  try {
    const response = await axios.post(`http://localhost:5000/api/events/${eventId}/register`, {
      user_id: userId,
    });

    alert("✅ Registered successfully!");

    // Update registered events
    fetchRegisteredEvents(userId);

    // ✅ Update volunteer count immediately without refetching everything
    setVolunteerCounts((prevCounts) => ({
      ...prevCounts,
      [eventId]: response.data.updated_volunteer_count,
    }));
  } catch (error) {
    console.error("Registration failed", error);
    alert(
      "❌ Registration failed: " +
        (error.response?.data?.message ||
          error.response?.data?.error ||
          error.message)
    );
  }
};


  const isAlreadyRegistered = (eventId) => {
    return registeredEvents.some((event) => event.event_id === eventId);
  };

  const formatDateTime = (datetime) => {
    const dateObj = new Date(datetime);
    return `${dateObj.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })} at ${dateObj.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
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
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="">All</option>
        </select>
      </div>

      <div className="section">
        <h3>Filtered Events ({statusFilter || "All"})</h3>
        {events.length === 0 ? (
          <p>No events available.</p>
        ) : (
          <ul>
            {events.map((event) => (
              <li key={event.event_id} className="event-card">
                <h4>{event.title}</h4>
                <p>
                  <strong>Date & Time:</strong> {formatDateTime(event.date)}
                </p>
                <p>
                  <strong>Location:</strong> {event.location}
                </p>
                <p>{event.description}</p>
                <p>
                  <strong>Volunteers Registered:</strong>{" "}
                  {volunteerCounts[event.event_id] || 0}
                </p>

                {isAlreadyRegistered(event.event_id) ? (
                  <span className="registered-label">✅ Already Registered</span>
                ) : (
                  <button onClick={() => registerForEvent(event.event_id)}>
                    Register
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="section">
        <h3>My Registered Events</h3>
        {registeredEvents.length === 0 ? (
          <p>You haven't registered for any events.</p>
        ) : (
          <ul>
            {registeredEvents.map((event) => (
              <li key={event.event_id} className="registered-card">
                <h4>{event.title}</h4>
                <p>
                  {formatDateTime(event.date)} | {event.location}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard;

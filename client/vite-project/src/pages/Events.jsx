// src/pages/Events.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/Events.css";

function Events() {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [volunteerCounts, setVolunteerCounts] = useState({});

  useEffect(() => {
    // Fetch user from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      fetchRegisteredEvents(storedUser.user_id);
    }

    fetchEvents();
    fetchVolunteerCounts();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/events?status=upcoming");
      setEvents(response.data || []);
    } catch (error) {
      console.error("Error fetching events", error);
    }
  };

  const fetchVolunteerCounts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/events/volunteer-count");
      const map = {};
      response.data.forEach((event) => {
        map[event.event_id] = event.volunteer_count;
      });
      setVolunteerCounts(map);
    } catch (error) {
      console.error("Error fetching volunteer counts", error);
    }
  };

  const fetchRegisteredEvents = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/events/registered/${userId}`);
      setRegisteredEvents(response.data || []);
    } catch (error) {
      console.error("Error fetching registered events", error);
    }
  };

  const isAlreadyRegistered = (eventId) => {
    return registeredEvents.some((event) => event.event_id === eventId);
  };

  const registerForEvent = async (eventId) => {
    try {
      await axios.post(`http://localhost:5000/api/events/${eventId}/register`, {
        user_id: user.user_id,
      });
      alert("✅ Registered successfully!");
      fetchRegisteredEvents(user.user_id);
      fetchVolunteerCounts();
    } catch (error) {
      console.error("Registration failed", error);
      alert("❌ Registration failed");
    }
  };

  return (
    <div className="page">
      <h2>Upcoming Beach Cleanup Events</h2>

      <div className="event-list">
        {events.length === 0 ? (
          <p>No events scheduled yet. Please check back soon!</p>
        ) : (
          events.map((event) => (
            <div key={event.event_id} className="event-card">
              <h4>{event.title}</h4>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(event.date).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              <p><strong>Location:</strong> {event.location}</p>
              <p>{event.description}</p>
              <p><strong>Volunteers Registered:</strong> {volunteerCounts[event.event_id] || 0}</p>

              {/* ✅ Show Register button only for volunteers who are NOT registered */}
              {user?.role === "volunteer" && !isAlreadyRegistered(event.event_id) && (
                <button onClick={() => registerForEvent(event.event_id)}>
                  Register
                </button>
              )}

              {/* ✅ Show label if already registered */}
              {user?.role === "volunteer" && isAlreadyRegistered(event.event_id) && (
                <span className="registered-label">✅ Already Registered</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Events;

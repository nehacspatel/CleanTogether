import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../Styles/Events.css";

function Events() {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [volunteerCounts, setVolunteerCounts] = useState({});

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      fetchRegisteredEvents(storedUser.user_id);
    }

    fetchEvents(storedUser);
    fetchVolunteerCounts();
  }, []);

  const fetchEvents = async (storedUser) => {
    try {
      const response = await axios.get("http://localhost:5000/api/events?status=upcoming");
      let allEvents = response.data || [];

      // ✅ Filter for admins/organizers
      if (storedUser?.role === "admin" || storedUser?.role === "organizer") {
        allEvents = allEvents.filter(ev => ev.organizer_id === storedUser.user_id);
      }

      setEvents(allEvents);
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

  const cancelRegistration = async (eventId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel your registration?");
    if (!confirmCancel) return;

    try {
      await axios.delete(`http://localhost:5000/api/events/${eventId}/unregister`, {
        data: { user_id: user.user_id },
      });

      alert("❌ Registration cancelled");
      fetchRegisteredEvents(user.user_id);
      fetchVolunteerCounts();
    } catch (error) {
      console.error("❌ Cancellation failed:", error);
      alert("❌ Failed to cancel registration");
    }
  };

  return (
    <div className="pages">
      <h2>Upcoming Beach Cleanup Events</h2>

      {user && (
        <p style={{ fontStyle: "italic", color: "gray", marginBottom: "10px" }}>
          Logged in as: <strong>{user.name}</strong> ({user.role})
        </p>
      )}

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

              {/* ✅ Show organizer's name only to volunteers */}
              {user?.role === "volunteer" && (
                <p><strong>Organizer:</strong> {event.organizer_name || "N/A"}</p>
              )}

              <p>
                <strong>Volunteers Registered:</strong>{" "}
                {["admin", "organizer"].includes(user?.role?.toLowerCase()) ? (
                  <Link
                    to={`/volunteers/${event.event_id}`}
                    className="view-volunteers-link"
                  >
                    {volunteerCounts[event.event_id] || 0}
                  </Link>
                ) : (
                  volunteerCounts[event.event_id] || 0
                )}
              </p>

              {/* ✅ Volunteer Actions */}
              {user?.role === "volunteer" && (
                !isAlreadyRegistered(event.event_id) ? (
                  <button onClick={() => registerForEvent(event.event_id)}>
                    Register
                  </button>
                ) : (
                  <>
                    <span className="registered-label">✅ Already Registered</span>
                    <button
                      className="cancel-button"
                      onClick={() => cancelRegistration(event.event_id)}
                    >
                      Cancel
                    </button>
                  </>
                )
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Events;

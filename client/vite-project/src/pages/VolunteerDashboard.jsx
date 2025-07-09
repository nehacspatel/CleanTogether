import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

import FeedbackForm from "../pages/FeedbackForm";
import "../Styles/Dashboard.css";

const socket = io("http://localhost:5000"); // Socket initialized once

const VolunteerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [userId, setUserId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [volunteerCounts, setVolunteerCounts] = useState({});
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    fetchEvents();
    fetchVolunteerCounts();

    if (storedUser && storedUser.role === "volunteer") {
      const id = storedUser.user_id || storedUser.id;
      setUserId(id);
      fetchRegisteredEvents(id);

      // Register socket for volunteer
      socket.emit("register", id);

      socket.on("notification", (data) => {
        toast.info(`${data.title}: ${data.message}`);
      });

      return () => {
        socket.off("notification");
        socket.disconnect();
      };
    }
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

  const canGiveFeedback = (eventId) => {
    const event = registeredEvents.find((e) => e.event_id === eventId);
    return event && event.status === "completed" && event.attendance_status === "present";
  };

  const openFeedbackForm = (eventId) => {
    setSelectedEventId(eventId);
    setShowFeedbackForm(true);
  };

  const filteredEvents = statusFilter
    ? events.filter((e) => e.status === statusFilter)
    : events;

  const formatDateTime = (datetime) => {
    if (!datetime) return "N/A";
    const dateObj = new Date(datetime);
    return `${dateObj.toLocaleDateString()} at ${dateObj.toLocaleTimeString([], {
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
                  <>
                    <span className="registered-label">✅ Already Registered</span>

                    {canGiveFeedback(event.event_id) ? (
                      <button
                        onClick={() => openFeedbackForm(event.event_id)}
                        className="feedback-button"
                      >
                        Give Feedback
                      </button>
                    ) : (
                      <p className="info-text">
                        Feedback will be available after attending the completed event.
                      </p>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {showFeedbackForm && (
        <FeedbackForm
          eventId={selectedEventId}
          onClose={() => setShowFeedbackForm(false)}
        />
      )}
    </div>
  );
};

export default VolunteerDashboard;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../Styles/AdminViewFeedback.css";

const AdminFeedbackView = () => {
  const { eventId } = useParams();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/feedback/event/${eventId}`);
        setFeedbackList(res.data);
      } catch (err) {
        console.error("Error fetching feedback:", err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) fetchFeedback();
  }, [eventId]);

  return (
    <div className="admin-feedback-view">
      <h2>Feedback for Event ID: {eventId}</h2>
      {loading ? (
        <p>Loading...</p>
      ) : feedbackList.length === 0 ? (
        <p>No feedback available.</p>
      ) : (
        <div className="feedback-list">
          {feedbackList.map((fb) => (
            <div key={fb.feedback_id} className="feedback-card">
              <p><strong>Volunteer:</strong> {fb.volunteer_name}</p>
              <p><strong>Rating:</strong> {fb.rating ? `${fb.rating} ⭐` : "Not given"}</p>
              <p><strong>Feedback:</strong> {fb.message}</p>
              <p><em>{new Date(fb.created_at).toLocaleString()}</em></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFeedbackView;

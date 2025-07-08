import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import '../Styles/FeedbackForm.css';

const FeedbackForm = ({ eventId, onClose }) => {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      const id = storedUser.user_id || storedUser.id;
      setUser(storedUser);
      fetchExistingFeedback(id);
    }
  }, []);

  const fetchExistingFeedback = async (user_id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/feedback/event/${eventId}`);
      const existing = res.data.find(f => f.user_id === user_id);
      if (existing) {
        setFeedback(existing.message);
        setRating(existing.rating || 5);
      }
    } catch (err) {
      console.error("⚠️ Failed to load existing feedback", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      return toast.error("Feedback cannot be empty");
    }

    const user_id = user?.user_id || user?.id;
    const event_id = eventId;
    const message = feedback;

    if (!user_id || !event_id) {
      toast.error("Missing user or event ID.");
      console.log("❌ Missing info:", { user_id, event_id, message, rating });
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/feedback", {
        user_id,
        event_id,
        message,
        rating,
      });

      toast.success("✅ Feedback submitted successfully");
      if (onClose) onClose();
    } catch (err) {
      console.error("❌ Failed to submit feedback", err);
      toast.error(err.response?.data?.message || "Error submitting feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-form-modal">
      <div className="feedback-form-container">
        <h3>{feedback ? "Edit Your Feedback" : "Submit Feedback"}</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Write your feedback here..."
            rows={5}
            required
            disabled={loading}
          />
          <div className="rating-section">
            <label htmlFor="rating">Rating (1-5):</label>
            <select
              id="rating"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              disabled={loading}
              required
            >
              {[1, 2, 3, 4, 5].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="feedback-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>
            <button type="button" onClick={onClose} className="cancel-btn" disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;

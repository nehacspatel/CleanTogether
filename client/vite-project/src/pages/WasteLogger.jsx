import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../Styles/WasteLogger.css";

const WasteLogger = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    event_id: "",
    waste_type: "",
    quantity: "",
    date: "",
  });
  const [proofImage, setProofImage] = useState(null);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    if (!user?.user_id) return;

    axios
      .get(`http://localhost:5000/api/events/registered/${user.user_id}?type=waste`)
      .then((response) => {
        setEvents(response.data || []);
      })
      .catch((error) => {
        console.error("Error fetching eligible events:", error);
        toast.error("Failed to load your eligible events");
      });
  }, [user?.user_id]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setProofImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.user_id) {
      toast.error("You must be logged in to log waste.");
      return;
    }

    const selectedEvent = events.find(
      (e) => e.event_id === parseInt(formData.event_id)
    );

    if (!selectedEvent) {
      toast.error("❌ Invalid or unauthorized event selected.");
      return;
    }

    const form = new FormData();
    form.append("user_id", user.user_id);
    form.append("event_id", formData.event_id);
    form.append("waste_type", formData.waste_type);
    form.append("quantity", formData.quantity);
    form.append("date", formData.date);
    if (proofImage) form.append("proof_image", proofImage);

    try {
      await axios.post("http://localhost:5000/api/waste-logs", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("✅ Waste logged successfully! Waiting for admin approval.");

      // Reset form
      setFormData({
        event_id: "",
        waste_type: "",
        quantity: "",
        date: "",
      });
      setProofImage(null);
    } catch (err) {
      console.error("❌ Error logging waste:", err);
      toast.error("Failed to log waste.");
    }
  };

  return (
    <div className="waste-logger-wrapper">
      <h2>Log Waste</h2>

      {events.length === 0 ? (
        <p>
          No eligible events found. You can only log waste if you attended a completed event.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="waste-logger-form"
          encType="multipart/form-data"
        >
          <label>
            Select Event:
            <select
              name="event_id"
              value={formData.event_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Choose Event --</option>
              {events.map((event) => (
                <option key={event.event_id} value={event.event_id}>
                  {event.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            Waste Type:
            <select
              name="waste_type"
              value={formData.waste_type}
              onChange={handleChange}
              required
            >
              <option value="">-- Choose Type --</option>
              <option value="plastic">Plastic</option>
              <option value="glass">Glass</option>
              <option value="metal">Metal</option>
              <option value="organic">Organic</option>
              <option value="e-waste">E-Waste</option>
            </select>
          </label>

          <label>
            Waste Quantity (kg):
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
            />
          </label>

          <label>
            Date:
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Upload Proof Image:
            <input
              type="file"
              name="proof_image"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </label>

          <button type="submit">Submit</button>
        </form>
      )}
    </div>
  );
};

export default WasteLogger;

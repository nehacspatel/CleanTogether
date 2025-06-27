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

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/events")
      .then((response) => {
        setEvents(response.data);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        toast.error("Failed to load events");
      });
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.user_id) {
      toast.error("You must be logged in to log waste.");
      return;
    }

    const payload = {
      ...formData,
      user_id: user.user_id,
    };

    try {
      console.log("➡ Logging waste with:", payload);
      await axios.post("http://localhost:5000/api/waste-logs", payload);
      console.log("✅ Waste log successful");
    } catch (err) {
      console.error("❌ Error logging waste:", err);
      toast.error("Failed to log waste.");
      return; // Don't proceed if waste logging fails
    }

    try {
      const rewardPayload = {
        user_id: user.user_id,
        badge_name: `Waste Logger - ${formData.waste_type}`,
        points: Math.floor(Number(formData.quantity) * 10), // 10 points per kg
        event_id: formData.event_id,
      };

      console.log("➡ Issuing reward with:", rewardPayload);
      await axios.post("http://localhost:5000/api/rewards", rewardPayload);
      console.log("✅ Reward granted");

      toast.success("✅ Waste logged and reward granted!");
      setFormData({
        event_id: "",
        waste_type: "",
        quantity: "",
        date: "",
      });
    } catch (err) {
      console.error("❌ Error issuing reward:", err);
      toast.error("Waste logged, but reward failed.");
    }
  };

  return (
    <div className="waste-logger-wrapper">
      <h2>Log Waste</h2>
      <form onSubmit={handleSubmit} className="waste-logger-form">
        <label>
          Select Event:
          <select name="event_id" value={formData.event_id} onChange={handleChange} required>
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
          <select name="waste_type" value={formData.waste_type} onChange={handleChange} required>
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
            min="0"
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

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default WasteLogger;

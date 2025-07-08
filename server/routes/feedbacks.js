const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ Submit or update feedback with rating
router.post("/", (req, res) => {
  const { user_id, event_id, message, rating } = req.body;

  if (!user_id || !event_id || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const insertQuery = `
    INSERT INTO feedback (user_id, event_id, message, rating)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE message = VALUES(message), rating = VALUES(rating)
  `;

  db.query(insertQuery, [user_id, event_id, message, rating], (err) => {
    if (err) {
      console.error("❌ DB insert error:", err);
      return res.status(500).json({ error: "Database error during insert" });
    }
    res.status(201).json({ message: "✅ Feedback submitted/updated successfully" });
  });
});

// ✅ Get all feedback for a specific event
router.get("/event/:eventId", (req, res) => {
  const { eventId } = req.params;

  const query = `
    SELECT f.*, u.name AS volunteer_name
    FROM feedback f
    JOIN users u ON f.user_id = u.user_id
    WHERE f.event_id = ?
    ORDER BY f.created_at DESC
  `;

  db.query(query, [eventId], (err, results) => {
    if (err) {
      console.error("❌ DB ERROR in GET /event/:eventId:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

module.exports = router;

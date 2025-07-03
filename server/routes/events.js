const express = require("express");
const router = express.Router();
const db = require("../db");

// 1. Get all events (optionally filter by status)
router.get("/", (req, res) => {
  const { status } = req.query;
  let query = "SELECT * FROM events";
  const params = [];

  if (status) {
    query += " WHERE status = ?";
    params.push(status);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// 2. Create a new event
router.post("/", (req, res) => {
  const { title, description, date, location, status } = req.body;
  const query = `
    INSERT INTO events (title, description, date, location, status)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(query, [title, description, date, location, status], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Event created", event_id: results.insertId });
  });
});

// 3. Register a user for an event
router.post("/:eventId/register", (req, res) => {
  const { eventId } = req.params;
  const { user_id } = req.body;

  const query = `INSERT IGNORE INTO volunteer_event (event_id, user_id) VALUES (?, ?)`;
  db.query(query, [eventId, user_id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: "User registered for event" });
  });
});

// 4. Unregister a user from an event
router.delete("/:eventId/unregister", (req, res) => {
  const { eventId } = req.params;
  const { user_id } = req.body;

  const query = `DELETE FROM volunteer_event WHERE event_id = ? AND user_id = ?`;
  db.query(query, [eventId, user_id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: "User unregistered" });
  });
});

// 5. Get all events a user is registered for
router.get("/registered/:userId", (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT e.*
    FROM events e
    JOIN volunteer_event ve ON e.event_id = ve.event_id
    WHERE ve.user_id = ?
  `;
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// 6. Get volunteer count per event
router.get("/volunteer-count", (req, res) => {
  const query = `
    SELECT event_id, COUNT(*) AS volunteer_count
    FROM volunteer_event
    GROUP BY event_id
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// 7. Get volunteers for a specific event (with reward data)
// 8. Get volunteers for a specific event with total reward points
// 8. Get volunteers for a specific event (with reward points)
router.get("/:eventId/volunteers", (req, res) => {
  const { eventId } = req.params;

  const query = `
    SELECT 
      u.name, 
      u.email, 
      u.address, 
      COALESCE(SUM(r.points), 0) AS reward
    FROM volunteer_event ve
    JOIN users u ON ve.user_id = u.user_id
    LEFT JOIN rewards r ON ve.user_id = r.user_id AND ve.event_id = r.event_id
    WHERE ve.event_id = ?
    GROUP BY u.user_id
  `;

  db.query(query, [eventId], (err, results) => {
    if (err) {
      console.error("❌ Failed to fetch volunteers:", err.sqlMessage || err);
      return res.status(500).json({ error: "Failed to fetch volunteers" });
    }
    res.json(results);
  });
});

module.exports = router;

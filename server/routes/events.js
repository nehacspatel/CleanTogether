const express = require("express");
const router = express.Router();
const db = require("../db");

// 1. Get all events (optionally filter by status) + include organizer_name
router.get("/", (req, res) => {
  const { status } = req.query;

  let query = `
    SELECT e.*, u.name AS organizer_name
    FROM events e
    JOIN users u ON e.organizer_id = u.user_id
  `;
  const params = [];

  if (status) {
    query += " WHERE e.status = ?";
    params.push(status);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("❌ Failed to fetch events with organizer_name:", err);
      return res.status(500).json({ error: "Failed to fetch events" });
    }
    res.json(results);
  });
});

// 2. Create a new event
router.post("/", (req, res) => {
  const { title, description, date, location, status, organizer_id } = req.body;

  if (!organizer_id) {
    return res.status(400).json({ error: "Organizer ID is required" });
  }

  const query = `
    INSERT INTO events (title, description, date, location, status, organizer_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [title, description, date, location, status, organizer_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Event created", event_id: results.insertId });
  });
});

// 3. Get completed + present events a user attended (used by WasteLogger/Feedback)
// ✅ Route: /api/events/registered/:userId
router.get("/registered/:userId", (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT e.*, a.status AS attendance_status
    FROM events e
    JOIN volunteer_event ve ON e.event_id = ve.event_id
    LEFT JOIN attendance a ON ve.event_id = a.event_id AND ve.user_id = a.user_id
    WHERE ve.user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});


// 4. Get volunteer count per event
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

// 5. Register a user for an event
router.post("/:eventId/register", (req, res) => {
  const { eventId } = req.params;
  const { user_id } = req.body;

  const query = "INSERT IGNORE INTO volunteer_event (event_id, user_id) VALUES (?, ?)";

  db.query(query, [eventId, user_id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: "User registered for event" });
  });
});

// 6. Unregister a user from an event
router.delete("/:eventId/unregister", (req, res) => {
  const { eventId } = req.params;
  const { user_id } = req.body;

  const query = "DELETE FROM volunteer_event WHERE event_id = ? AND user_id = ?";

  db.query(query, [eventId, user_id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: "User unregistered" });
  });
});

// 7. Delete an event by ID
router.delete("/:eventId", (req, res) => {
  const { eventId } = req.params;

  const query = "DELETE FROM events WHERE event_id = ?";

  db.query(query, [eventId], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  });
});

// 8. Get volunteers for a specific event with reward points
router.get("/:eventId/volunteers", (req, res) => {
  const { eventId } = req.params;

  const query = `
    SELECT 
      u.user_id,
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

// 9. Update event status (only allowed for the event's organizer)
router.put("/:eventId/status", (req, res) => {
  const { eventId } = req.params;
  const { status, organizer_id } = req.body;

  if (!status || !organizer_id) {
    return res.status(400).json({ error: "Missing status or organizer_id" });
  }

  const checkQuery = "SELECT organizer_id FROM events WHERE event_id = ?";

  db.query(checkQuery, [eventId], (err, results) => {
    if (err) {
      console.error("❌ Error checking organizer:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const dbOrganizerId = results[0].organizer_id;

    if (parseInt(organizer_id) !== dbOrganizerId) {
      return res.status(403).json({ error: "You are not authorized to update this event" });
    }

    const updateQuery = `UPDATE events SET status = ? WHERE event_id = ?`;

    db.query(updateQuery, [status, eventId], (updateErr, result) => {
      if (updateErr) {
        console.error("❌ Failed to update event status:", updateErr);
        return res.status(500).json({ error: "Failed to update event status" });
      }

      res.json({ message: "✅ Event status updated successfully" });
    });
  });
});

// 10. Get all registered volunteers and their attendance
router.get("/:eventId/attendance", (req, res) => {
  const { eventId } = req.params;

  const query = `
    SELECT 
      u.user_id, u.name, u.email, 
      COALESCE(a.status, 'absent') AS status
    FROM volunteer_event ve
    JOIN users u ON ve.user_id = u.user_id
    LEFT JOIN attendance a ON ve.event_id = a.event_id AND ve.user_id = a.user_id
    WHERE ve.event_id = ?
  `;

  db.query(query, [eventId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// 11. Update attendance
router.put("/:eventId/attendance/:userId", (req, res) => {
  const { eventId, userId } = req.params;
  const { status } = req.body;

  if (!["present", "absent"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const upsert = `
    INSERT INTO attendance (event_id, user_id, status)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE status = ?
  `;

  db.query(upsert, [eventId, userId, status, status], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "✅ Attendance updated" });
  });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../db");
const {
  createNotification,
  getNotifications,
} = require("../controllers/notificationController");

// ✅ Create notification (e.g., general use)
router.post("/", createNotification);

// ✅ Get all notifications for a user (from controller)
router.get("/:userId", getNotifications);

// ✅ Get unread notification count
router.get("/:userId/unread-count", (req, res) => {
  const { userId } = req.params;
  const sql = `SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND read_status = 'unread'`;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ unread: results[0].unread });
  });
});

// ✅ Mark all notifications as read (only unread ones)
router.put("/:userId/mark-all-read", (req, res) => {
  const { userId } = req.params;
  const sql = `
    UPDATE notifications
    SET read_status = 'read'
    WHERE user_id = ? AND read_status = 'unread'
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "✅ All unread notifications marked as read" });
  });
});

// ✅ Mark a single notification as read
router.put("/:notificationId/read", (req, res) => {
  const { notificationId } = req.params;
  const sql = `
    UPDATE notifications
    SET read_status = 'read'
    WHERE id = ?
  `;

  db.query(sql, [notificationId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "✅ Notification marked as read" });
  });
});

// ✅ Send notification to event's organizer only
router.post("/event-organizer", (req, res) => {
  const { event_id, title, message } = req.body;

  const getOrganizerSql = `SELECT organizer_id FROM events WHERE id = ?`;

  db.query(getOrganizerSql, [event_id], (err, result) => {
    if (err) return res.status(500).json({ error: "❌ Failed to fetch organizer", details: err.message });
    if (result.length === 0) return res.status(404).json({ error: "❌ Event not found" });

    const organizerId = result[0].organizer_id;

    const insertSql = `
      INSERT INTO notifications (user_id, title, message, read_status, created_at)
      VALUES (?, ?, ?, 'unread', NOW())
    `;

    db.query(insertSql, [organizerId, title, message], (err2) => {
      if (err2) return res.status(500).json({ error: "❌ Failed to insert notification", details: err2.message });
      res.json({ message: `✅ Notification sent to organizer (ID: ${organizerId})` });
    });
  });
});

module.exports = router;

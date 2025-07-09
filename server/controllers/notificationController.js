const db = require("../db");

// Create a notification
exports.createNotification = (req, res) => {
  const { user_id, message, type } = req.body;

  const query = `INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)`;
  db.query(query, [user_id, message, type], (err) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.status(201).json({ message: "Notification created" });
  });
};

// Get all notifications for a user
exports.getNotifications = (req, res) => {
  const { userId } = req.params;

  const query = `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`;
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(results);
  });
};

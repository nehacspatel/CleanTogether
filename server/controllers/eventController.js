const db = require("../db");
const { sendEventReminderEmail } = require("../utils/emailSender"); // For email notifications
const { createNotificationForUser } = require("../utils/inAppNotifier"); // Optional for in-app

// GET all events
exports.getAllEvents = (req, res) => {
  const query = `SELECT * FROM events ORDER BY date ASC`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch events" });
    res.json(results);
  });
};

// GET single event by ID
exports.getEventById = (req, res) => {
  const eventId = req.params.eventId;
  const query = `SELECT * FROM events WHERE event_id = ?`;
  db.query(query, [eventId], (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch event" });
    res.json(results[0]);
  });
};

// ✅ Send Email Reminders to all users registered for upcoming event (one day before)
exports.sendEventReminders = (req, res) => {
  const query = `
    SELECT u.email, u.name, e.*
    FROM volunteer_event ve
    JOIN users u ON ve.user_id = u.user_id
    JOIN events e ON ve.event_id = e.event_id
    WHERE DATE(e.date) = CURDATE() + INTERVAL 1 DAY
  `;

  db.query(query, async (err, results) => {
    if (err) return res.status(500).json({ error: "Error fetching reminder list" });

    const promises = results.map((row) =>
      sendEventReminderEmail({
        to: row.email,
        name: row.name,
        title: row.title,
        date: row.date,
        location: row.location,
        description: row.description,
      })
    );

    await Promise.all(promises);
    res.json({ message: "Reminders sent to all registered users for tomorrow's events." });
  });
};

// server/routes/wasteLogs.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// Add waste log
router.post("/", (req, res) => {
  const { user_id, event_id, waste_type, quantity, date } = req.body;

  const sql = `INSERT INTO waste_logs (user_id, event_id, waste_type, quantity, logged_at)
               VALUES (?, ?, ?, ?, ?)`;

  db.query(sql, [user_id, event_id, waste_type, quantity, date], (err, result) => {
    if (err) {
      console.error("❌ Waste log error:", err);
      return res.status(500).json({ error: err.message });
    }
    console.log("✅ Waste log inserted:", { user_id, event_id, waste_type, quantity, date });
    res.status(201).json({ message: "Waste log added successfully", id: result.insertId });
  });
});

module.exports = router;

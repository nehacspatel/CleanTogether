// server/routes/wasteLogs.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// Add waste log
router.post("/", (req, res) => {
  const { user_id, event_id, waste_type, quantity } = req.body;

  const sql = `INSERT INTO waste_logs (user_id, event_id, waste_type, quantity)
               VALUES (?, ?, ?, ?)`;

  db.query(sql, [user_id, event_id, waste_type, quantity], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Waste log added successfully", id: result.insertId });
  });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/rewards/:userId - fetch rewards for a user
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = 'SELECT * FROM rewards WHERE user_id = ?';

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching rewards:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json(results);
  });
});

// ✅ POST /api/rewards - create a new reward
router.post('/', (req, res) => {
  const { user_id, badge_name, points, event_id } = req.body;

  if (!user_id || !badge_name || !points || !event_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const query = `
    INSERT INTO rewards (user_id, badge_name, points, event_id, awarded_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(query, [user_id, badge_name, points, event_id], (err, result) => {
    if (err) {
      console.error("Error inserting reward:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.status(201).json({ message: "Reward created successfully", reward_id: result.insertId });
  });
});

module.exports = router;

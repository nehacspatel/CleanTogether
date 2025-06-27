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

module.exports = router;

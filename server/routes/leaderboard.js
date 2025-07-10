// routes/leaderboard.js
const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const query = `
   SELECT u.user_id, u.name, u.profile_image, SUM(r.points) as points
FROM users u
JOIN rewards r ON u.user_id = r.user_id
GROUP BY u.user_id
ORDER BY points DESC
LIMIT 5;

  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching leaderboard:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    res.json(results);
  });
});

module.exports = router;
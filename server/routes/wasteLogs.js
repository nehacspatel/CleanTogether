const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// ✅ Get all waste logs
router.get("/", (req, res) => {
  const sql = "SELECT * FROM waste_logs";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Failed to fetch waste logs:", err);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
});

// ✅ Add waste log
router.post("/", upload.single("proof_image"), (req, res) => {
  const { user_id, event_id, waste_type, quantity, date } = req.body;
  const proof_image = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO waste_logs (user_id, event_id, waste_type, quantity, logged_at, proof_image, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `;

  db.query(sql, [user_id, event_id, waste_type, quantity, date, proof_image], (err, result) => {
    if (err) {
      console.error("❌ Waste log error:", err);
      return res.status(500).json({ error: err.message });
    }
    console.log("✅ Waste log inserted:", { user_id, event_id, waste_type, quantity, date, proof_image });
    res.status(201).json({ message: "Waste log added successfully", id: result.insertId });
  });
});

// ✅ Get summary for a specific organizer
router.get("/summary", (req, res) => {
  const { organizer_id } = req.query;

  if (!organizer_id) {
    return res.status(400).json({ error: "Organizer ID is required" });
  }

  const sql = `
    SELECT
      e.event_id,
      e.title AS event_title,
      u.user_id,
      u.name,
      u.email,
      COALESCE(SUM(w.quantity), 0) AS total_waste_kg,
      GROUP_CONCAT(w.proof_image) AS images,
      GROUP_CONCAT(w.status) AS statuses
    FROM events e
    JOIN volunteer_event ve ON e.event_id = ve.event_id
    JOIN users u ON ve.user_id = u.user_id
    LEFT JOIN waste_logs w ON w.event_id = e.event_id AND w.user_id = u.user_id
    WHERE e.organizer_id = ?
    GROUP BY e.event_id, u.user_id
    ORDER BY e.event_id
  `;

  db.query(sql, [organizer_id], (err, results) => {
    if (err) {
      console.error("❌ Failed to fetch filtered waste summary:", err);
      return res.status(500).json({ error: err.message });
    }

    res.status(200).json(results);
  });
});

// ✅ Approve/Reject waste log + reward on approval
router.put("/:log_id/status", (req, res) => {
  const { status } = req.body;
  const { log_id } = req.params;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  const updateSql = "UPDATE waste_logs SET status = ? WHERE log_id = ?";

  db.query(updateSql, [status, log_id], (err) => {
    if (err) {
      console.error("❌ Failed to update status:", err);
      return res.status(500).json({ error: err.message });
    }

    // If approved, fetch log details and insert reward
    if (status === "approved") {
      const fetchLogSql = "SELECT * FROM waste_logs WHERE log_id = ?";
      db.query(fetchLogSql, [log_id], (err, logs) => {
        if (err || logs.length === 0) {
          console.error("❌ Failed to fetch log for reward:", err);
          return res.status(500).json({ error: "Could not fetch log details" });
        }

        const log = logs[0];
        const { user_id, event_id, quantity } = log;

        // Assign badge & points based on quantity
        let badge_name = "Eco Starter";
        let points = 10;
        if (quantity >= 10) {
          badge_name = "Eco Warrior";
          points = 20;
        }
        if (quantity >= 20) {
          badge_name = "Green Hero";
          points = 30;
        }

        const insertRewardSql = `
          INSERT INTO rewards (user_id, badge_name, points, event_id, awarded_at)
          VALUES (?, ?, ?, ?, NOW())
        `;
        db.query(insertRewardSql, [user_id, badge_name, points, event_id], (err) => {
          if (err) {
            console.error("❌ Failed to insert reward:", err);
            return res.status(500).json({ error: "Reward creation failed" });
          }

          res.status(200).json({
            message: `✅ Log approved and reward '${badge_name}' granted to user ${user_id}`
          });
        });
      });
    } else {
      // If rejected
      res.status(200).json({ message: `❌ Log rejected for log ID ${log_id}` });
    }
  });
});

module.exports = router;

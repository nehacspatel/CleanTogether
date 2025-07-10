//certificates.js                                                                                                                                                                const express = require("express");
const express = require("express");
const router = express.Router();
const db = require("../db");
const generateCertificate = require("../utils/generateCertificate");

// 📌 POST /api/certificates/generate (Event-based certificate only)
router.post("/generate", async (req, res) => {
  const { user_id, event_id } = req.body;

  try {
    // Get user and event details
    const [userRows] = await db.promise().query("SELECT name FROM users WHERE user_id = ?", [user_id]);
    const [eventRows] = await db.promise().query("SELECT title FROM events WHERE event_id = ?", [event_id]);

    if (!userRows.length || !eventRows.length) {
      return res.status(404).json({ error: "User or Event not found" });
    }

    const userName = userRows[0].name;
    const eventName = eventRows[0].title;

    // Insert into certificates table
    const [insertResult] = await db.promise().query(
      "INSERT INTO certificates (user_id, event_id) VALUES (?, ?)",
      [user_id, event_id]
    );

    const certificateId = insertResult.insertId;

    // Generate PDF
    const fileName = await generateCertificate({ userName, eventName, certificateId });

    // Save file name in DB
    await db.promise().query(
      "UPDATE certificates SET certificate_url = ? WHERE certificate_id = ?",
      [fileName, certificateId]
    );

    res.status(201).json({
      message: "🎓 Certificate generated successfully!",
      certificate_id: certificateId,
      file: fileName,
    });
  } catch (err) {
    console.error("❌ Certificate generation error:", err);
    res.status(500).json({ error: "Certificate generation failed" });
  }
});

// 📌 GET /api/certificates/user/:user_id
router.get("/user/:user_id", (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT c.*, e.title AS event_name
    FROM certificates c
    LEFT JOIN events e ON c.event_id = e.event_id
    WHERE c.user_id = ?
    ORDER BY c.issued_at DESC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "❌ Failed to fetch certificates", details: err.message });
    }
    res.json(results);
  });
});
// 🚀 Test Certificate Generation Manually
router.get("/test-generate", async (req, res) => {
  const sampleData = {
    userName: "Test User",
    eventName: "Beach Cleanup Test Event",
    certificateId: 9999, // Just a test ID, won't be stored in DB
  };

  try {
    const fileName = await generateCertificate(sampleData);
    res.status(200).json({ message: "Test certificate generated", fileName });
  } catch (error) {
    console.error("❌ Test certificate generation failed:", error);
    res.status(500).json({ error: "Failed to generate test certificate" });
  }
});

module.exports = router;
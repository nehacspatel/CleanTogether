const express = require("express");
const router = express.Router();
const sendMail = require("../utils/mailer");

router.get("/", async (req, res) => {
  try {
    await sendMail({
      to: process.env.EMAIL_USER, // send to your own email
      subject: "✅ CleanTogether Email Test",
      html: "<h3>This is a test email from CleanTogether backend 🚀</h3>",
    });
    res.send("✅ Test email sent successfully.");
  } catch (err) {
    console.error("❌ Error sending test email:", err);
    res.status(500).send("❌ Failed to send test email.");
  }
});

module.exports = router;

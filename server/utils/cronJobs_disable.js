// File: server/utils/cronJobs.js
console.log("🛠️ cronJobs.js loaded");

const cron = require("node-cron");
const db = require("../db");
const sendMail = require("./mailer");

// 🧪 TEMP for testing: Run every 1 minute (change to "0 8 * * *" for production)
cron.schedule("* * * * *", async () => {
  console.log("⏰ Running cron job to check for tomorrow's events...");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const dd = String(tomorrow.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const query = `
    SELECT e.title, e.date, e.location, u.email
    FROM events e
    JOIN volunteer_event ve ON e.event_id = ve.event_id
    JOIN users u ON ve.user_id = u.user_id
    WHERE DATE(e.date) = ?
  `;

  db.query(query, [dateStr], async (err, results) => {
    if (err) {
      console.error("❌ Error fetching events for email cron:", err);
      return;
    }

    if (results.length === 0) {
      console.log("ℹ️ No events scheduled for tomorrow.");
      return;
    }

    for (const row of results) {
      const html = `
        <h3>Reminder: Upcoming Event Tomorrow</h3>
        <p><strong>Title:</strong> ${row.title}</p>
        <p><strong>Date:</strong> ${new Date(row.date).toLocaleString()}</p>
        <p><strong>Location:</strong> ${row.location}</p>
      `;

      try {
        await sendMail({
          to: row.email,
          subject: `📅 Reminder: ${row.title} is tomorrow!`,
          html,
        });
        console.log(`📨 Email sent to ${row.email}`);
      } catch (err) {
        console.error("❌ Email error:", err.message);
      }
    }
  });
});

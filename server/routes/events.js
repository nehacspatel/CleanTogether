const express = require('express');
const router = express.Router();
const db = require('../db');


// 1. Get all events with optional status filter
router.get('/', (req, res) => {
  const { status } = req.query;

  let query = 'SELECT * FROM events';
  const params = [];

  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});


// 2. Get volunteer count per event (✅ move this above :id)
router.get('/volunteer-count', (req, res) => {
  console.log('✅ /volunteer-count was called');
  const query = `
    SELECT event_id, COUNT(user_id) as volunteer_count 
    FROM volunteer_event 
    GROUP BY event_id`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    
    // Return empty array if no events — don't throw 404
    res.json(results);
  });
});


// 3. Get events registered by a specific user
router.get('/registered/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = `
    SELECT e.* 
    FROM events e 
    JOIN volunteer_event ve ON e.event_id = ve.event_id 
    WHERE ve.user_id = ?`;
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// 4. Create a new event
router.post('/', (req, res) => {
  const { title, location, date, description, status } = req.body;
  const query = `
    INSERT INTO events (title, location, date, description, status) 
    VALUES (?, ?, ?, ?, ?)`;
  db.query(query, [title, location, date, description, status], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: 'Event created successfully', eventId: result.insertId });
  });
});

// 5. Update event status
router.put('/:id/status', (req, res) => {
  const event_id = req.params.id;
  const { status } = req.body;
  const query = 'UPDATE events SET status = ? WHERE event_id = ?';
  db.query(query, [status, event_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Event status updated successfully' });
  });
});

// 6. Register a volunteer for an event
// 6. Register a volunteer for an event and return updated count
router.post('/:id/register', (req, res) => {
  const event_id = req.params.id;
  const { user_id } = req.body;

  const insertQuery = 'INSERT INTO volunteer_event (event_id, user_id) VALUES (?, ?)';

  db.query(insertQuery, [event_id, user_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    // After successful insert, get updated volunteer count
    const countQuery = 'SELECT COUNT(*) AS volunteer_count FROM volunteer_event WHERE event_id = ?';
    db.query(countQuery, [event_id], (err2, countResult) => {
      if (err2) return res.status(500).json({ error: err2 });

      res.status(201).json({
        message: 'Volunteer registered successfully',
        event_id,
        updated_volunteer_count: countResult[0].volunteer_count
      });
    });
  });
});
// DELETE /api/events/:id
router.delete('/:id', async (req, res) => {
  const eventId = parseInt(req.params.id, 10);
  if (isNaN(eventId)) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  console.log('Received DELETE for event:', eventId);

  try {
    const [result] = await db.query('DELETE FROM events WHERE event_id = ?', [eventId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});





// ⚠️ 7. KEEP THIS LAST — Get event by ID
router.get('/:id', (req, res) => {
  const event_id = req.params.id;
  const query = 'SELECT * FROM events WHERE event_id = ?';
  db.query(query, [event_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Event not found' });
    res.json(results[0]);
  });
});

module.exports = router;

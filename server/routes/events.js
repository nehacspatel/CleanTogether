const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all events
router.get('/', (req, res) => {
  db.query('SELECT * FROM events ORDER BY date ASC', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// GET event by ID
router.get('/:id', (req, res) => {
  const event_id = req.params.id;
  const query = 'SELECT * FROM events WHERE event_id = ?';

  db.query(query, [event_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Event not found' });
    res.json(results[0]);
  });
});

// POST create new event
router.post('/', (req, res) => {
  const { title, description, location, date, organizer_id } = req.body;
  const query = `
    INSERT INTO events (title, description, location, date, organizer_id)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(query, [title, description, location, date, organizer_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true, event_id: result.insertId });
  });
});

// POST register volunteer to an event
router.post('/:id/register', (req, res) => {
  const event_id = req.params.id;
  const { user_id } = req.body;

  const query = `
    INSERT INTO volunteer_event (user_id, event_id)
    VALUES (?, ?)
  `;

  db.query(query, [user_id, event_id], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Already registered' });
      }
      return res.status(500).json({ error: err });
    }
    res.json({ success: true, registration_id: result.insertId });
  });
});

module.exports = router;

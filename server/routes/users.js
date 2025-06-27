const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// JWT secret fallback
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Ensure upload directory exists
const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `profile_${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

/**
 * POST /signup - Register new user
 */
router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(query, [name, email, hashedPassword, role || 'volunteer'], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Email already registered.' });
        }
        return res.status(500).json({ message: 'Signup failed.', error: err });
      }
      res.status(201).json({ success: true, user_id: result.insertId });
    });
  } catch (error) {
    res.status(500).json({ message: 'Signup error.', error });
  }
});

/**
 * POST /login - Authenticate user
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = jwt.sign({ user_id: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address || null,
        profile_image: user.profile_image || null
      },
    });
  });
});

/**
 * GET /me - Get current user info using Bearer token
 */
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided.' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    db.query(
      'SELECT user_id, name, email, role, address, profile_image FROM users WHERE user_id = ?',
      [decoded.user_id],
      (err, results) => {
        if (err || results.length === 0) {
          return res.status(404).json({ message: 'User not found.' });
        }
        res.json(results[0]);
      }
    );
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token.' });
  }
});

/**
 * PUT /:id - Update user profile (with optional image)
 */
router.put('/:id', upload.single('profileImage'), (req, res) => {
  const userId = req.params.id;
  const { name, email, address } = req.body;
  const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

  let query = 'UPDATE users SET name = ?, email = ?, address = ?';
  const values = [name, email, address];

  if (profileImage) {
    query += ', profile_image = ?';
    values.push(profileImage);
  }

  query += ' WHERE user_id = ?';
  values.push(userId);

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Profile update failed:', err);
      return res.status(500).json({ message: 'Update failed', error: err });
    }

    res.json({
      message: 'Profile updated successfully',
      profile_image: profileImage || null
    });
  });
});

module.exports = router;

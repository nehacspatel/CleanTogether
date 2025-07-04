const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const eventsRouter = require('./routes/events');
const usersRouter = require('./routes/users');
const wasteLogsRoute = require("./routes/wasteLogs");
const rewardsRouter = require('./routes/rewards');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // required for form-data

// ✅ Serve uploaded profile images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/events', eventsRouter);
app.use('/api/users', usersRouter);
app.use("/api/waste-logs", wasteLogsRoute);

// Default route
app.get('/', (req, res) => {
  res.send('CleanTogether API is running');
});

app.use('/api/rewards', rewardsRouter);

const chatbotRouter = require('./routes/chatbot');
app.use('/api/chatbot', chatbotRouter);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});


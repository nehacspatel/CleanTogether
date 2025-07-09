const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const socketIo = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Store connected sockets per user
const connectedUsers = {};

// 🔌 Setup socket connection
io.on('connection', (socket) => {
  console.log('⚡ Socket connected:', socket.id);

  socket.on('register', (user_id) => {
    if (user_id) {
      connectedUsers[user_id] = socket.id;
      console.log(`🔗 Registered user ${user_id} with socket ${socket.id}`);
    }
  });

  socket.on('disconnect', () => {
    for (const [uid, sid] of Object.entries(connectedUsers)) {
      if (sid === socket.id) {
        delete connectedUsers[uid];
        console.log(`❌ Disconnected user ${uid}`);
        break;
      }
    }
  });
});

// Make io and connectedUsers accessible in routes
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// Routes
const eventsRouter = require('./routes/events');
const usersRouter = require('./routes/users');
const wasteLogsRoute = require('./routes/wasteLogs');
const rewardsRouter = require('./routes/rewards');
const chatbotRouter = require('./routes/chatbot');
const feedbackRoutes = require('./routes/feedbacks');
const notificationsRouter = require('./routes/notifications');
const testEmailRoute = require('./routes/testEmail');
const leaderboardRoutes = require("./routes/leaderboard");

app.use('/api/events', eventsRouter);
app.use('/api/users', usersRouter);
app.use('/api/waste-logs', wasteLogsRoute);
app.use('/api/rewards', rewardsRouter);
app.use('/api/chatbot', chatbotRouter);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationsRouter);
app.use('/api/send-test-email', testEmailRoute);
app.use("/api/leaderboard", leaderboardRoutes);



// Default route
app.get('/', (req, res) => {
  res.send('CleanTogether API is running');
});

// Start server
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

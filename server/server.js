
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const eventsRouter = require('./routes/events');
const usersRouter = require('./routes/users');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/events', eventsRouter);
app.use('/api/users', usersRouter);
app.get('/', (req, res) => {
  res.send('CleanTogether API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

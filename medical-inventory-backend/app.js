const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');
const logger = require('./config/logger'); // Import logger

// Connect to database
connectDB();

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Define a simple welcome route
app.get('/', (req, res) => {
  res.send('Welcome to the Medical Inventory API!');
});

// Auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Inventory routes
const inventoryRoutes = require('./routes/inventoryRoutes');
app.use('/api/inventory', inventoryRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`); // Use logger
});

// Global error handler (optional, but good practice)
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  logger.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

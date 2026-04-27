// server.js
// Main Express server entry point for Pawcare Backend

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config({ path: './.env' });
console.log("JWT_SECRET:", process.env.JWT_SECRET);

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// ===========================
// MIDDLEWARE
// ===========================

// Enable CORS for frontend requests
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://pawcare-mu.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight across-the-board

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images as static files
// Access via: http://localhost:5000/uploads/<filename>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===========================
// API ROUTES
// ===========================

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/animals', require('./routes/animalRoutes'));
app.use('/api/adoptions', require('./routes/adoptionRoutes'));
app.use('/api/blockchain', require('./routes/blockchainRoutes'));

// ===========================
// HEALTH CHECK ROUTE
// ===========================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '🐾 Pawcare API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ===========================
// 404 HANDLER
// ===========================

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ===========================
// GLOBAL ERROR HANDLER
// ===========================

app.use((err, req, res, next) => {
  console.error('Global error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ===========================
// START SERVER
// ===========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🐾 Pawcare Backend Server          ║
  ║   Running on: http://localhost:${PORT}  ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}         ║
  ╚══════════════════════════════════════╝
  `);
});

module.exports = app;

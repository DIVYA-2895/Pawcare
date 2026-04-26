// routes/authRoutes.js
// Authentication routes

const express = require('express');
const router = express.Router();
const { register, login, getMe, updatePreferences } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes (no auth required)
router.post('/register', register);
router.post('/login', login);

// Protected routes (require JWT)
router.get('/me', protect, getMe);
router.put('/preferences', protect, updatePreferences);

module.exports = router;

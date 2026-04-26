// routes/adoptionRoutes.js
// Adoption application routes

const express = require('express');
const router = express.Router();
const {
  getAdoptions, applyForAdoption, reviewAdoption, getAdoptionById,
} = require('../controllers/adoptionController');
const { protect } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');

// All adoption routes require authentication
router.use(protect);

// View adoptions (filtered by role in controller)
router.get('/', getAdoptions);
router.get('/:id', getAdoptionById);

// Apply for adoption (adopter role)
router.post('/', roleGuard('adopter', 'admin'), applyForAdoption);

// Approve or reject (admin/staff)
router.put('/:id/status', roleGuard('admin', 'staff'), reviewAdoption);

module.exports = router;

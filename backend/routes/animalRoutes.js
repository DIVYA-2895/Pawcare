// routes/animalRoutes.js
// Animal CRUD routes + AI endpoints

const express = require('express');
const router = express.Router();
const {
  getAnimals, getAnimalById, addAnimal, updateAnimal, deleteAnimal,
  addVaccination, getRecommendations, getReminders,
} = require('../controllers/animalController');
const { protect } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const upload = require('../middleware/upload');

// Public — anyone can browse animals
router.get('/', getAnimals);
router.get('/reminders', protect, roleGuard('admin', 'staff'), getReminders);
router.get('/:id', getAnimalById);

// AI Recommendations — authenticated users
router.post('/recommend', protect, getRecommendations);

// Staff/Admin — add and update animals
router.post(
  '/',
  protect,
  roleGuard('admin', 'staff'),
  upload.single('image'),   // Accept single image upload named 'image'
  addAnimal
);

router.put(
  '/:id',
  protect,
  roleGuard('admin', 'staff'),
  upload.single('image'),
  updateAnimal
);

// Vaccination records
router.post('/:id/vaccinations', protect, roleGuard('admin', 'staff'), addVaccination);

// Admin only — delete animals
router.delete('/:id', protect, roleGuard('admin'), deleteAnimal);

module.exports = router;

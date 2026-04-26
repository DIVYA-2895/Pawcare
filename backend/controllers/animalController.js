// controllers/animalController.js
// CRUD operations for animal records + AI recommendations

const Animal = require('../models/Animal');
const { addBlock, BLOCK_TYPES } = require('../modules/blockchainModule');
const { recommendAnimals, getVaccinationReminders } = require('../modules/aiModule');

/**
 * GET /api/animals
 * Get all animals (with optional filtering)
 */
const getAnimals = async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { species, status, search } = req.query;

    let filter = {};

    if (species) filter.species = species;
    if (status) filter.adoptionStatus = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },    // Case-insensitive search
        { breed: { $regex: search, $options: 'i' } },
      ];
    }

    const animals = await Animal.find(filter)
      .populate('addedBy', 'name email')  // Show who added the animal
      .sort({ createdAt: -1 });           // Newest first

    res.json({ count: animals.length, animals });
  } catch (error) {
    console.error('Get animals error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/animals/:id
 * Get a single animal by ID
 */
const getAnimalById = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id).populate('addedBy', 'name email');

    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    res.json({ animal });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/animals
 * Add a new animal record (Staff/Admin only)
 */
const addAnimal = async (req, res) => {
  try {
    const {
      name, species, breed, ageValue, ageUnit, gender, color,
      description, rescueDate, rescueLocation, rescuedBy,
      healthStatus, weight, medicalNotes, vaccinations
    } = req.body;

    // Build the animal object
    const animalData = {
      name,
      species,
      breed: breed || 'Unknown',
      age: { value: ageValue || 0, unit: ageUnit || 'years' },
      gender: gender || 'unknown',
      color,
      description,
      rescueDate: rescueDate || new Date(),
      rescueLocation,
      rescuedBy,
      healthStatus: healthStatus || 'healthy',
      weight: weight || 0,
      medicalNotes,
      vaccinations: vaccinations ? JSON.parse(vaccinations) : [],
      addedBy: req.user._id,
    };

    // If image was uploaded via Multer, store the filename with prefix
    if (req.file) {
      animalData.image = `/uploads/${req.file.filename}`;
    }

    const animal = await Animal.create(animalData);

    // 🔗 Record on blockchain — animal registration event
    const block = addBlock(BLOCK_TYPES.ANIMAL_REGISTERED, {
      animalId: animal._id.toString(),
      name: animal.name,
      species: animal.species,
      addedBy: req.user.email,
      timestamp: new Date().toISOString(),
    });

    // Store the blockchain hash in the animal record
    animal.blockchainHash = block.hash;
    await animal.save();

    res.status(201).json({ message: 'Animal added successfully', animal });
  } catch (error) {
    console.error('Add animal error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * PUT /api/animals/:id
 * Update an animal record (Staff/Admin only)
 */
const updateAnimal = async (req, res) => {
  try {
    let animal = await Animal.findById(req.params.id);

    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    // Parse body fields
    const updateData = { ...req.body };

    // Handle age sub-document
    if (req.body.ageValue || req.body.ageUnit) {
      updateData.age = {
        value: req.body.ageValue || animal.age.value,
        unit: req.body.ageUnit || animal.age.unit,
      };
    }

    // Handle vaccinations array
    if (req.body.vaccinations) {
      updateData.vaccinations = JSON.parse(req.body.vaccinations);
    }

    // Handle new image upload
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image && req.body.image !== 'null' && req.body.image !== '') {
      // If no new file but image field is provided (string from frontend), use it
      updateData.image = req.body.image;
    } else {
      // If no new file and no image string provided, keep existing image
      delete updateData.image;
    }

    // Remove raw age fields to avoid schema conflicts
    delete updateData.ageValue;
    delete updateData.ageUnit;

    // Use findByIdAndUpdate with $set to only update provided fields
    animal = await Animal.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });

    // 🔗 Record update on blockchain
    addBlock(BLOCK_TYPES.ANIMAL_UPDATED, {
      animalId: animal._id.toString(),
      name: animal.name,
      updatedBy: req.user.email,
      timestamp: new Date().toISOString(),
    });

    res.json({ message: 'Animal updated successfully', animal });
  } catch (error) {
    console.error('Update animal error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * DELETE /api/animals/:id
 * Delete an animal record (Admin only)
 */
const deleteAnimal = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);

    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    await Animal.findByIdAndDelete(req.params.id);

    res.json({ message: `Animal "${animal.name}" deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/animals/:id/vaccinations
 * Add a vaccination record to an animal (Staff/Admin)
 */
const addVaccination = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);

    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    const { name, date, nextDue, notes } = req.body;

    animal.vaccinations.push({ name, date, nextDue, notes });
    await animal.save();

    // 🔗 Record vaccination update on blockchain
    addBlock(BLOCK_TYPES.VACCINATION_UPDATED, {
      animalId: animal._id.toString(),
      animalName: animal.name,
      vaccine: name,
      date,
      nextDue,
      recordedBy: req.user.email,
    });

    res.json({ message: 'Vaccination added', vaccinations: animal.vaccinations });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/animals/recommend
 * AI-powered animal recommendations based on user preferences
 */
const getRecommendations = async (req, res) => {
  try {
    const preferences = req.body.preferences || req.user.preferences || {};
    const animals = await Animal.find({ adoptionStatus: 'available' });

    const recommendations = recommendAnimals(animals, preferences);

    res.json({
      message: 'AI recommendations generated',
      preferences,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/animals/reminders
 * Get upcoming vaccination reminders (Admin/Staff)
 */
const getReminders = async (req, res) => {
  try {
    const daysAhead = parseInt(req.query.days) || 30;
    const animals = await Animal.find({});

    const reminders = getVaccinationReminders(animals, daysAhead);

    res.json({
      daysAhead,
      count: reminders.length,
      reminders,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAnimals,
  getAnimalById,
  addAnimal,
  updateAnimal,
  deleteAnimal,
  addVaccination,
  getRecommendations,
  getReminders,
};

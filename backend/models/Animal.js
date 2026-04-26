// models/Animal.js
// Animal schema storing all rescue and health information

const mongoose = require('mongoose');

// Sub-schema for vaccination records
const vaccinationSchema = new mongoose.Schema({
  name: { type: String, required: true },       // Vaccine name (e.g., Rabies)
  date: { type: Date, required: true },          // Date administered
  nextDue: { type: Date },                       // Next due date (for reminders)
  notes: { type: String, default: '' },
});

const animalSchema = new mongoose.Schema(
  {
    // Basic Information
    name: { type: String, required: [true, 'Animal name is required'], trim: true },
    species: {
      type: String,
      required: true,
      enum: ['dog', 'cat', 'bird', 'rabbit', 'other'],
      lowercase: true,
    },
    breed: { type: String, default: 'Unknown', trim: true },
    age: {
      value: { type: Number, required: true, min: 0 },
      unit: { type: String, enum: ['months', 'years'], default: 'years' },
    },
    gender: { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
    color: { type: String, default: '' },
    description: { type: String, default: '' },

    // Rescue Information
    rescueDate: { type: Date, default: Date.now },
    rescueLocation: { type: String, default: '' },
    rescuedFrom: { type: String, default: '' },
    rescuedBy: { type: String, default: '' },

    // Health Information
    healthStatus: {
      type: String,
      enum: ['healthy', 'recovering', 'critical', 'under-treatment'],
      default: 'healthy',
    },
    weight: { type: Number, default: 0 },        // Weight in kg
    vaccinations: [vaccinationSchema],            // Array of vaccination records
    medicalNotes: { type: String, default: '' },

    // Adoption Status
    adoptionStatus: {
      type: String,
      enum: ['available', 'pending', 'adopted'],
      default: 'available',
    },

    // Image path (stored locally via Multer)
    image: { type: String, default: '' },

    // Reference to who added this record
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Blockchain hash for immutability verification
    blockchainHash: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Animal', animalSchema);

// models/Adoption.js
// Adoption application schema tracking full adoption workflow

const mongoose = require('mongoose');

const adoptionSchema = new mongoose.Schema(
  {
    // The animal being applied for
    animal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      required: true,
    },

    // The user applying for adoption
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Adoption application status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    // Message from the applicant
    message: {
      type: String,
      default: '',
      maxlength: 1000,
    },

    // Home environment details
    homeType: {
      type: String,
      enum: ['apartment', 'house-small-yard', 'house-large-yard', 'farm', 'other'],
      default: 'other',
    },
    hasOtherPets: { type: Boolean, default: false },
    hasChildren: { type: Boolean, default: false },
    experience: {
      type: String,
      enum: ['first-time', 'some-experience', 'experienced'],
      default: 'first-time',
    },

    // Admin review details
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: { type: Date },
    reviewNotes: { type: String, default: '' },

    // Blockchain hash for adoption confirmation
    blockchainHash: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Adoption', adoptionSchema);

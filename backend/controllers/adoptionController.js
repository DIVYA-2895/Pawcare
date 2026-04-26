// controllers/adoptionController.js
// Handles adoption applications, approvals, and history

const Adoption = require('../models/Adoption');
const Animal = require('../models/Animal');
const { addBlock, BLOCK_TYPES } = require('../modules/blockchainModule');

/**
 * GET /api/adoptions
 * - Admin/Staff: Get ALL adoption requests
 * - Adopter: Get only their own requests
 */
const getAdoptions = async (req, res) => {
  try {
    let filter = {};

    // Non-admin users can only see their own applications
    if (req.user.role === 'adopter') {
      filter.applicant = req.user._id;
    }

    const { status } = req.query;
    if (status) filter.status = status;

    const adoptions = await Adoption.find(filter)
      .populate('animal', 'name species breed image adoptionStatus')
      .populate('applicant', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ count: adoptions.length, adoptions });
  } catch (error) {
    console.error('Get adoptions error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/adoptions
 * Apply for adoption (Adopter role)
 */
const applyForAdoption = async (req, res) => {
  try {
    const { animalId, message, homeType, hasOtherPets, hasChildren, experience } = req.body;

    // Check if animal exists and is available
    const animal = await Animal.findById(animalId);
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    if (animal.adoptionStatus !== 'available') {
      return res.status(400).json({
        message: `This animal is not available for adoption (status: ${animal.adoptionStatus})`,
      });
    }

    // Check if user already applied for this animal
    const existingApplication = await Adoption.findOne({
      animal: animalId,
      applicant: req.user._id,
      status: 'pending',
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You already have a pending application for this animal' });
    }

    // Create the adoption application
    const adoption = await Adoption.create({
      animal: animalId,
      applicant: req.user._id,
      message,
      homeType,
      hasOtherPets,
      hasChildren,
      experience,
    });

    // Update animal status to 'pending' so others know it's being reviewed
    await Animal.findByIdAndUpdate(animalId, { adoptionStatus: 'pending' });

    // 🔗 Record on blockchain
    const block = addBlock(BLOCK_TYPES.ADOPTION_APPLIED, {
      adoptionId: adoption._id.toString(),
      animalId: animalId,
      animalName: animal.name,
      applicantEmail: req.user.email,
      timestamp: new Date().toISOString(),
    });

    adoption.blockchainHash = block.hash;
    await adoption.save();

    // Populate before returning
    await adoption.populate('animal', 'name species breed image');
    await adoption.populate('applicant', 'name email');

    res.status(201).json({ message: 'Adoption application submitted successfully', adoption });
  } catch (error) {
    console.error('Apply adoption error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * PUT /api/adoptions/:id/status
 * Approve or reject an adoption (Admin/Staff only)
 */
const reviewAdoption = async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "approved" or "rejected"' });
    }

    const adoption = await Adoption.findById(req.params.id).populate('animal');

    if (!adoption) {
      return res.status(404).json({ message: 'Adoption request not found' });
    }

    if (adoption.status !== 'pending') {
      return res.status(400).json({ message: 'This application has already been reviewed' });
    }

    // Update adoption record
    adoption.status = status;
    adoption.reviewedBy = req.user._id;
    adoption.reviewedAt = new Date();
    adoption.reviewNotes = reviewNotes || '';
    await adoption.save();

    // Update animal adoption status based on decision
    if (status === 'approved') {
      await Animal.findByIdAndUpdate(adoption.animal._id, { adoptionStatus: 'adopted' });

      // 🔗 Record adoption confirmation on blockchain
      addBlock(BLOCK_TYPES.ADOPTION_CONFIRMED, {
        adoptionId: adoption._id.toString(),
        animalId: adoption.animal._id.toString(),
        animalName: adoption.animal.name,
        approvedBy: req.user.email,
        timestamp: new Date().toISOString(),
      });
    } else {
      // If rejected, make animal available again
      await Animal.findByIdAndUpdate(adoption.animal._id, { adoptionStatus: 'available' });

      // 🔗 Record rejection on blockchain
      addBlock(BLOCK_TYPES.ADOPTION_REJECTED, {
        adoptionId: adoption._id.toString(),
        animalId: adoption.animal._id.toString(),
        animalName: adoption.animal.name,
        rejectedBy: req.user.email,
        timestamp: new Date().toISOString(),
      });
    }

    await adoption.populate('animal', 'name species breed image');
    await adoption.populate('applicant', 'name email');
    await adoption.populate('reviewedBy', 'name email');

    res.json({
      message: `Adoption ${status} successfully`,
      adoption,
    });
  } catch (error) {
    console.error('Review adoption error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * GET /api/adoptions/:id
 * Get single adoption details
 */
const getAdoptionById = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id)
      .populate('animal', 'name species breed image healthStatus')
      .populate('applicant', 'name email')
      .populate('reviewedBy', 'name email');

    if (!adoption) {
      return res.status(404).json({ message: 'Adoption not found' });
    }

    // Adopters can only see their own
    if (req.user.role === 'adopter' && adoption.applicant._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ adoption });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAdoptions, applyForAdoption, reviewAdoption, getAdoptionById };

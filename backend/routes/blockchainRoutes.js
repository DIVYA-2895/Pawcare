// routes/blockchainRoutes.js
// Blockchain ledger routes — view and verify the immutable record

const express = require('express');
const router = express.Router();
const { getChain, verifyChain } = require('../modules/blockchainModule');
const { protect } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');

/**
 * GET /api/blockchain/log
 * View the full blockchain ledger (Admin/Staff)
 */
router.get('/log', protect, roleGuard('admin', 'staff'), (req, res) => {
  const chain = getChain();
  res.json({
    totalBlocks: chain.length,
    chain,
  });
});

/**
 * GET /api/blockchain/verify
 * Verify blockchain integrity (Admin only)
 */
router.get('/verify', protect, roleGuard('admin'), (req, res) => {
  const result = verifyChain();
  res.json(result);
});

module.exports = router;

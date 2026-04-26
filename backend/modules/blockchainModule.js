// modules/blockchainModule.js
// Simplified Blockchain Simulation
// 
// This simulates a blockchain using SHA-256 hashing and linked blocks.
// Each block references the previous block's hash (like a real blockchain).
// Records are stored in memory + a local JSON file for persistence.
// 
// This is for educational/demo purposes — not a real cryptocurrency blockchain.

const crypto = require('crypto'); // Built-in Node.js module — no install needed
const fs = require('fs');
const path = require('path');

// File path to persist the blockchain ledger
const LEDGER_PATH = path.join(__dirname, '../blockchain_ledger.json');

/**
 * Load existing blockchain from file, or create genesis block
 */
const loadChain = () => {
  try {
    if (fs.existsSync(LEDGER_PATH)) {
      const data = fs.readFileSync(LEDGER_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading blockchain ledger:', err.message);
  }

  // Genesis block — the very first block in the chain
  return [
    {
      index: 0,
      timestamp: new Date().toISOString(),
      type: 'GENESIS',
      data: { message: 'Pawcare Blockchain initialized' },
      previousHash: '0000000000000000',
      hash: '0000000000000000',
    },
  ];
};

/**
 * Save blockchain to file for persistence
 */
const saveChain = (chain) => {
  try {
    fs.writeFileSync(LEDGER_PATH, JSON.stringify(chain, null, 2));
  } catch (err) {
    console.error('Error saving blockchain ledger:', err.message);
  }
};

/**
 * Create SHA-256 hash of a block's content
 * This ensures data integrity — any change to data changes the hash
 */
const calculateHash = (index, timestamp, type, data, previousHash) => {
  const content = `${index}${timestamp}${type}${JSON.stringify(data)}${previousHash}`;
  return crypto.createHash('sha256').update(content).digest('hex');
};

/**
 * Add a new record to the blockchain
 * 
 * @param {string} type - Type of record ('ANIMAL_REGISTERED', 'VACCINATION_UPDATED', 'ADOPTION_CONFIRMED')
 * @param {Object} data - Data to store in the block
 * @returns {Object} - The newly created block
 */
const addBlock = (type, data) => {
  const chain = loadChain();
  const previousBlock = chain[chain.length - 1];

  const newBlock = {
    index: chain.length,
    timestamp: new Date().toISOString(),
    type,
    data,
    previousHash: previousBlock.hash,
    hash: '', // Will be calculated below
  };

  // Calculate hash based on all block properties
  newBlock.hash = calculateHash(
    newBlock.index,
    newBlock.timestamp,
    newBlock.type,
    newBlock.data,
    newBlock.previousHash
  );

  chain.push(newBlock);
  saveChain(chain);

  console.log(`🔗 Blockchain: New block added [${type}] — Hash: ${newBlock.hash.substring(0, 16)}...`);

  return newBlock;
};

/**
 * Get the full blockchain ledger
 */
const getChain = () => {
  return loadChain();
};

/**
 * Verify blockchain integrity — check that all blocks are properly linked
 * Returns true if chain is valid, false if tampered
 */
const verifyChain = () => {
  const chain = loadChain();

  for (let i = 1; i < chain.length; i++) {
    const current = chain[i];
    const previous = chain[i - 1];

    // Recalculate hash and compare
    const recalculatedHash = calculateHash(
      current.index,
      current.timestamp,
      current.type,
      current.data,
      current.previousHash
    );

    if (current.hash !== recalculatedHash) {
      return { valid: false, tampered_at_index: i };
    }

    if (current.previousHash !== previous.hash) {
      return { valid: false, broken_link_at_index: i };
    }
  }

  return { valid: true, blocks: chain.length };
};

// Record type constants for consistency
const BLOCK_TYPES = {
  ANIMAL_REGISTERED: 'ANIMAL_REGISTERED',
  ANIMAL_UPDATED: 'ANIMAL_UPDATED',
  VACCINATION_UPDATED: 'VACCINATION_UPDATED',
  ADOPTION_APPLIED: 'ADOPTION_APPLIED',
  ADOPTION_CONFIRMED: 'ADOPTION_CONFIRMED',
  ADOPTION_REJECTED: 'ADOPTION_REJECTED',
};

module.exports = { addBlock, getChain, verifyChain, BLOCK_TYPES };

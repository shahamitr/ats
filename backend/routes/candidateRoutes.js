const express = require('express');
const { getCandidates, createCandidate } = require('../controllers/candidateController');
const { cache } = require('../middleware/cache');
// Assuming an auth middleware exists for protecting routes
// const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply caching middleware to the GET route. Cache for 5 minutes.
// Add `protect` middleware if routes need to be secured.
router.get('/', cache(300), getCandidates);

// POST route does not get cached.
router.post('/', createCandidate);

module.exports = router;
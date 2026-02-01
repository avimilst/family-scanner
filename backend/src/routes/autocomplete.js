const express = require('express');
const router = express.Router();
const autocompleteController = require('../controllers/autocompleteController');

// GET /api/autocomplete/search - Search titles for autocomplete
router.get('/search', autocompleteController.searchTitles);

// GET /api/autocomplete/popular - Get popular titles
router.get('/popular', autocompleteController.getPopularTitles);

module.exports = router;

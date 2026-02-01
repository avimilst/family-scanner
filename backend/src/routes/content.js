const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

// POST /api/content/scan - Scan a title for content
router.post('/scan', contentController.scanContent);

// GET /api/content/recent - Get recent scans
router.get('/recent', contentController.getRecentScans);

// GET /api/content/cached - Get cached result by title
router.get('/cached', contentController.getCachedResult);

module.exports = router;

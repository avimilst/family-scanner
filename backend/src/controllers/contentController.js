const db = require('../config/database');
const claudeService = require('../services/claudeService');

// Get scan results for a title (from cache or scan new)
const scanContent = async (req, res, next) => {
  try {
    const { title, content_type } = req.body;

    if (!title || !content_type) {
      return res.status(400).json({
        error: 'Title and content_type are required'
      });
    }

    const validTypes = ['tv_show', 'movie', 'book'];
    if (!validTypes.includes(content_type)) {
      return res.status(400).json({
        error: 'content_type must be one of: tv_show, movie, book'
      });
    }

    // Check cache first
    const cacheResult = await db.query(
      `SELECT results_json, scanned_at FROM content
       WHERE LOWER(title) = LOWER($1) AND content_type = $2`,
      [title, content_type]
    );

    if (cacheResult.rows.length > 0) {
      return res.json({
        ...cacheResult.rows[0].results_json,
        cached: true,
        scanned_at: cacheResult.rows[0].scanned_at
      });
    }

    // Scan with Claude API
    const scanResults = await claudeService.scanContent(title, content_type);

    // Cache results
    await db.query(
      `INSERT INTO content (title, content_type, results_json)
       VALUES ($1, $2, $3)
       ON CONFLICT (title, content_type)
       DO UPDATE SET results_json = $3, scanned_at = CURRENT_TIMESTAMP`,
      [title, content_type, JSON.stringify(scanResults)]
    );

    res.json({
      ...scanResults,
      cached: false,
      scanned_at: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// Get recent scans for a device (using recent from database)
const getRecentScans = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const result = await db.query(
      `SELECT title, content_type, scanned_at
       FROM content
       ORDER BY scanned_at DESC
       LIMIT $1`,
      [limit]
    );

    res.json({ recent_scans: result.rows });
  } catch (error) {
    next(error);
  }
};

// Get cached result by title
const getCachedResult = async (req, res, next) => {
  try {
    const { title, content_type } = req.query;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    let query = `SELECT results_json, scanned_at FROM content WHERE LOWER(title) = LOWER($1)`;
    const params = [title];

    if (content_type) {
      query += ` AND content_type = $2`;
      params.push(content_type);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Title not found in cache' });
    }

    res.json({
      ...result.rows[0].results_json,
      cached: true,
      scanned_at: result.rows[0].scanned_at
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scanContent,
  getRecentScans,
  getCachedResult
};

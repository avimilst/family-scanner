const db = require('../config/database');

// Search autocomplete titles
const searchTitles = async (req, res, next) => {
  try {
    const { q, content_type, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.json({ results: [] });
    }

    let query = `
      SELECT title, content_type, popularity_rank
      FROM autocomplete_titles
      WHERE LOWER(title) LIKE LOWER($1)
    `;
    const params = [`%${q}%`];

    if (content_type) {
      query += ` AND content_type = $2`;
      params.push(content_type);
    }

    query += ` ORDER BY
      CASE WHEN LOWER(title) LIKE LOWER($${params.length + 1}) THEN 0 ELSE 1 END,
      popularity_rank ASC,
      title ASC
      LIMIT $${params.length + 2}`;

    params.push(`${q}%`); // For prioritizing titles that START with query
    params.push(parseInt(limit));

    const result = await db.query(query, params);

    res.json({ results: result.rows });
  } catch (error) {
    next(error);
  }
};

// Get popular titles
const getPopularTitles = async (req, res, next) => {
  try {
    const { content_type, limit = 20 } = req.query;

    let query = `
      SELECT title, content_type, popularity_rank
      FROM autocomplete_titles
    `;
    const params = [];

    if (content_type) {
      query += ` WHERE content_type = $1`;
      params.push(content_type);
    }

    query += ` ORDER BY popularity_rank ASC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const result = await db.query(query, params);

    res.json({ results: result.rows });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchTitles,
  getPopularTitles
};

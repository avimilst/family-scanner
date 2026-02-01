require('dotenv').config();
const db = require('../config/database');

const migrate = async () => {
  try {
    console.log('Running database migrations...');

    // Create content table for caching scan results
    await db.query(`
      CREATE TABLE IF NOT EXISTS content (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('tv_show', 'movie', 'book')),
        results_json JSONB NOT NULL,
        source_info TEXT,
        scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(title, content_type)
      )
    `);
    console.log('✓ Created content table');

    // Create index for faster title lookups
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_content_title_lower
      ON content (LOWER(title))
    `);
    console.log('✓ Created content title index');

    // Create autocomplete_titles table
    await db.query(`
      CREATE TABLE IF NOT EXISTS autocomplete_titles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('tv_show', 'movie', 'book')),
        popularity_rank INTEGER DEFAULT 9999,
        UNIQUE(title, content_type)
      )
    `);
    console.log('✓ Created autocomplete_titles table');

    // Create index for autocomplete search
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_autocomplete_title_lower
      ON autocomplete_titles (LOWER(title))
    `);
    console.log('✓ Created autocomplete title index');

    // Create index for popularity sorting
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_autocomplete_popularity
      ON autocomplete_titles (popularity_rank)
    `);
    console.log('✓ Created autocomplete popularity index');

    console.log('\n✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();

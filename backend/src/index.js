require('dotenv').config();
const express = require('express');
const cors = require('cors');
const contentRoutes = require('./routes/content');
const autocompleteRoutes = require('./routes/autocomplete');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/content', contentRoutes);
app.use('/api/autocomplete', autocompleteRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Family Scanner API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Family Scanner API running on port ${PORT}`);
});

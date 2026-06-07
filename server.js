require('dotenv').config();
const express = require('express');

// Initialize databases
require('./config/mongodb');
require('./config/sqlite');

const app = express();
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "CampusCore Backend is running"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

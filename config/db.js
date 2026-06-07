const mongoose = require('mongoose');

const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/studentvault';

mongoose.connect(dbURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

module.exports = mongoose.connection;

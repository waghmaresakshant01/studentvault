require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// ── Database Connections ─────────────────────────────────────────────────
// MongoDB (primary database)
require('./config/db');

// Firebase Admin SDK (secondary database — lazy-loaded)
// Only initialise if credentials are present in env
const FIREBASE_ENABLED =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

if (FIREBASE_ENABLED) {
  require('./config/firebase'); // initialise on startup
} else {
  console.warn('[Firebase] Env vars not set — Firebase sync disabled. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY to enable.');
}

const studentRoutes = require('./routes/studentRoutes');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Static Files ──────────────────────────────────────────────────────────
app.use(express.static('public'));

// ── API Routes ────────────────────────────────────────────────────────────
app.use('/api/students', studentRoutes);

// ── Health Check ──────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  // MongoDB status
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  // Firebase status (ping Firestore)
  let firebaseStatus = 'disabled';
  if (FIREBASE_ENABLED) {
    try {
      const firebaseService = require('./services/firebaseStudentService');
      const ok = await firebaseService.ping();
      firebaseStatus = ok ? 'connected' : 'unreachable';
    } catch {
      firebaseStatus = 'error';
    }
  }

  const allHealthy = mongoStatus === 'connected';

  res.status(allHealthy ? 200 : 503).json({
    success: allHealthy,
    message: 'StudentVault Backend',
    version: '2.0.0',
    databases: {
      mongodb: mongoStatus,
      firebase: firebaseStatus
    },
    timestamp: new Date().toISOString()
  });
});

// ── Start Server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
if (process.env.NODE_ENV !== 'test' && !process.env.FIREBASE_CONFIG && !process.env.FUNCTIONS_EMULATOR) {
  app.listen(PORT, () => {
    console.log(`🚀 StudentVault server running on port ${PORT}`);
    console.log(`   MongoDB: ${process.env.MONGO_URI || 'mongodb://localhost:27017/studentvault'}`);
    console.log(`   Firebase: ${FIREBASE_ENABLED ? `project ${process.env.FIREBASE_PROJECT_ID}` : 'disabled (no env vars)'}`);
  });
}

module.exports = app;

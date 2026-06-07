const admin = require('firebase-admin');

// Guard against double-initialization (e.g. hot-reload in dev)
if (!admin.apps.length) {
  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    // The private key in .env has literal \n — replace them with real newlines
    private_key: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('[Firebase] Admin SDK initialized — project:', process.env.FIREBASE_PROJECT_ID);
}

const db = admin.firestore();

module.exports = { admin, db };

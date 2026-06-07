'use strict';

/**
 * Firebase Firestore Student Service
 * -----------------------------------
 * Handles all Firestore sync operations for student records.
 * Uses the MongoDB _id (as string) as the Firestore document ID
 * so both databases are perfectly correlated.
 *
 * Design: NON-BLOCKING secondary sync.
 * The controller calls these methods but does NOT await them in the
 * response path — if Firebase fails, MongoDB still succeeds.
 */

let db;

function getDb() {
  if (!db) {
    // Lazy-load to avoid crashing if Firebase env vars are missing
    try {
      const firebase = require('../config/firebase');
      db = firebase.db;
    } catch (err) {
      console.error('[Firebase Service] Failed to load Firebase config:', err.message);
      return null;
    }
  }
  return db;
}

const COLLECTION = 'students';

/**
 * Sync a newly created student to Firestore.
 * @param {Object} student - Mongoose document (has ._id, .toObject())
 */
async function syncCreate(student) {
  const firestore = getDb();
  if (!firestore) return;

  const id = student._id.toString();
  const data = toFirestoreData(student);

  await firestore.collection(COLLECTION).doc(id).set(data);
  console.log(`[Firebase Sync] Created student doc: ${id}`);
}

/**
 * Sync an updated student to Firestore.
 * @param {string} mongoId - The MongoDB _id string
 * @param {Object} student - Mongoose document after update
 */
async function syncUpdate(mongoId, student) {
  const firestore = getDb();
  if (!firestore) return;

  const id = mongoId.toString();
  const data = toFirestoreData(student);

  await firestore.collection(COLLECTION).doc(id).set(data, { merge: true });
  console.log(`[Firebase Sync] Updated student doc: ${id}`);
}

/**
 * Delete a student document from Firestore.
 * @param {string} mongoId - The MongoDB _id string
 */
async function syncDelete(mongoId) {
  const firestore = getDb();
  if (!firestore) return;

  const id = mongoId.toString();
  await firestore.collection(COLLECTION).doc(id).delete();
  console.log(`[Firebase Sync] Deleted student doc: ${id}`);
}

/**
 * Read all students directly from Firestore (mirror endpoint).
 * @returns {Array} Array of student objects from Firestore
 */
async function getAll() {
  const firestore = getDb();
  if (!firestore) throw new Error('Firebase not initialized');

  const snapshot = await firestore
    .collection(COLLECTION)
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map(doc => ({
    _id: doc.id,
    ...doc.data(),
    // Convert Firestore Timestamp → ISO string for consistency
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
  }));
}

/**
 * Check if Firestore is reachable.
 * @returns {boolean}
 */
async function ping() {
  const firestore = getDb();
  if (!firestore) return false;
  try {
    await firestore.collection(COLLECTION).limit(1).get();
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert a Mongoose document to a plain Firestore-safe object.
 */
function toFirestoreData(student) {
  const obj = student.toObject ? student.toObject() : { ...student };
  return {
    name: obj.name || '',
    rollNo: obj.rollNo || '',
    branch: obj.branch || '',
    year: obj.year || 0,
    email: obj.email || '',
    phone: obj.phone || '',
    address: obj.address || '',
    createdAt: obj.createdAt || new Date(),
    mongoId: obj._id ? obj._id.toString() : '',
  };
}

module.exports = { syncCreate, syncUpdate, syncDelete, getAll, ping };

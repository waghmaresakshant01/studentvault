# Phase 6: Firebase Firestore Dual-Database Backend

**Phase Goal:** Add Firebase Firestore as a real-time secondary database that mirrors all student CRUD operations from MongoDB, enabling dual-database architecture without breaking existing functionality.

**Status:** In Progress — 2026-06-07

---

## Scope

### What This Phase Delivers
- `firebase-admin` SDK integrated and initialized via environment variables
- `config/firebase.js` — Admin SDK bootstrap with double-init guard
- `services/firebaseStudentService.js` — Isolated Firestore service layer
- Dual-write in `controllers/studentController.js`:
  - `POST /api/students` → saves to MongoDB + syncs to Firestore (non-blocking)
  - `PUT /api/students/:id` → updates MongoDB + syncs to Firestore (non-blocking)
  - `DELETE /api/students/:id` → deletes from MongoDB + deletes from Firestore (non-blocking)
- New `GET /api/students/firebase` endpoint — reads directly from Firestore to verify sync
- Enhanced `/api/health` endpoint — reports `mongodb` and `firebase` connection status

### What Is NOT in Scope
- Firebase Authentication
- Firestore as the primary read source (MongoDB remains primary)
- Real-time Firestore listeners / websocket updates (deferred to v2)

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Sync mode | Non-blocking | Firebase outage must never break the app |
| Document ID | MongoDB `_id.toString()` | 1:1 correlation between databases |
| Read source | MongoDB | Existing behavior unchanged |
| Firebase init | Conditional (env var gate) | Server runs without Firebase credentials |
| Error strategy | Log + continue | MongoDB success = API success |

---

## Acceptance Criteria

1. ✅ `npm install firebase-admin` succeeds
2. ✅ Server starts without crashing when Firebase env vars are empty (logs a warning)
3. ✅ Server starts and connects to Firebase when valid env vars are set
4. ✅ `GET /api/health` returns `{ databases: { mongodb: "connected", firebase: "connected/disabled" } }`
5. ✅ Creating a student via POST writes to MongoDB AND syncs to Firestore
6. ✅ Updating a student via PUT updates MongoDB AND Firestore doc
7. ✅ Deleting a student via DELETE removes from MongoDB AND Firestore
8. ✅ `GET /api/students/firebase` returns students directly from Firestore
9. ✅ Firebase failure does NOT cause API to return an error (non-blocking confirmed)

---

## File Changes

| File | Change |
|------|--------|
| `package.json` | Added `firebase-admin` dependency, `start`/`dev` scripts |
| `config/firebase.js` | NEW — Admin SDK init |
| `services/firebaseStudentService.js` | NEW — Firestore CRUD service |
| `controllers/studentController.js` | MODIFIED — dual-write after each mutation |
| `routes/studentRoutes.js` | MODIFIED — added `/firebase` mirror route |
| `server.js` | MODIFIED — conditional Firebase init, enhanced health check |
| `.env` | MODIFIED — added Firebase env var placeholders |

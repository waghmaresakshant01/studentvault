# Requirements: CampusCore

**Defined:** 2026-06-07
**Core Value:** Demonstrates production-ready integration of dual database technologies (MongoDB and SQLite) in a secure, authenticated, and schema-validated Node.js + Express.js API.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Database Configuration

- [x] **DB-01**: Connect to MongoDB via Mongoose using MONGO_URI from env vars.
- [x] **DB-02**: Connect to SQLite database file `auditlog.db` (created under `/database/`) via better-sqlite3.

### Authentication System (Module 1)

- [x] **AUTH-01**: User can register with name, email, password, and role (enum: admin/student).
- [x] **AUTH-02**: User password must be hashed using bcrypt with saltRounds: 10.
- [x] **AUTH-03**: Registration validates that no fields are empty, email is valid format, password is at least 6 characters.
- [x] **AUTH-04**: User can login with email and password, returning a JWT token (7d expiry, custom secret).
- [x] **AUTH-05**: User can fetch own profile data via protected route.
- [x] **AUTH-06**: Auth middleware verifies JWT from Authorization Bearer token header, attaching user to req.user. Returning 401 if token is missing or invalid.

### Student Management (Module 2)

- [x] **STUD-01**: Add student with name, rollNo (unique), branch, year, email, phone.
- [x] **STUD-02**: Get all student records.
- [x] **STUD-03**: Get single student record by ID.
- [x] **STUD-04**: Update student record by ID.
- [x] **STUD-05**: Delete student record by ID.
- [x] **STUD-06**: Validation requires name, rollNo, branch, year, and enforces unique rollNo constraint.
- [x] **STUD-07**: All student routes are protected by auth middleware.

### Expense Tracker (Module 3)

- [ ] **EXPN-01**: Add expense with studentId (ref Student), amount, category (enum: Mess, Lab, Library, Transport, Other), date, and description.
- [ ] **EXPN-02**: Get all expenses with student details (populated student name).
- [ ] **EXPN-03**: Get single expense by ID.
- [ ] **EXPN-04**: Update expense record by ID.
- [ ] **EXPN-05**: Delete expense record by ID.
- [ ] **EXPN-06**: Filter expenses by category (e.g. GET /api/expenses/filter?category=Mess).
- [ ] **EXPN-07**: Get all expenses of a specific student (GET /api/expenses/student/:studentId).
- [ ] **EXPN-08**: Get total expenses spent per category for a specific student (GET /api/expenses/summary/:studentId).
- [ ] **EXPN-09**: All expense routes are protected by auth middleware.

### SQLite Audit Logger

- [x] **LOGG-01**: Initialize `audit_logs` table (id, method, route, userId, timestamp) in SQLite automatically on server start.
- [ ] **LOGG-02**: Middleware logs every API hit (method, route path, userId if authenticated, timestamp) to SQLite.

### Documentation & Packaging

- [x] **DOCS-01**: Include proper `.gitignore` (node_modules, .env, auditlog.db).
- [ ] **DOCS-02**: Write README.md containing creative framing, stack list, setup steps, route table with sample request bodies, Git setup steps, and Postman guide.

## v2 Requirements

- **NOTF-01**: Email alert triggered when student's library fine exceeds a threshold.
- **DASH-01**: Admin dashboard listing top spending categories across the college.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Frontend Web App | CampusCore is strictly a backend REST API project. |
| Automatic Email Delivery | Keeping local, low-dependency code without external SMTP requirements. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DB-01 | Phase 1 | Complete |
| DB-02 | Phase 1 | Complete |
| AUTH-01 | Phase 2 | Complete |
| AUTH-02 | Phase 2 | Complete |
| AUTH-03 | Phase 2 | Complete |
| AUTH-04 | Phase 2 | Complete |
| AUTH-05 | Phase 2 | Complete |
| AUTH-06 | Phase 2 | Complete |
| STUD-01 | Phase 3 | Complete |
| STUD-02 | Phase 3 | Complete |
| STUD-03 | Phase 3 | Complete |
| STUD-04 | Phase 3 | Complete |
| STUD-05 | Phase 3 | Complete |
| STUD-06 | Phase 3 | Complete |
| STUD-07 | Phase 3 | Complete |
| EXPN-01 | Phase 4 | Pending |
| EXPN-02 | Phase 4 | Pending |
| EXPN-03 | Phase 4 | Pending |
| EXPN-04 | Phase 4 | Pending |
| EXPN-05 | Phase 4 | Pending |
| EXPN-06 | Phase 4 | Pending |
| EXPN-07 | Phase 4 | Pending |
| EXPN-08 | Phase 4 | Pending |
| EXPN-09 | Phase 4 | Pending |
| LOGG-01 | Phase 1 | Complete |
| LOGG-02 | Phase 5 | Pending |
| DOCS-01 | Phase 1 | Complete |
| DOCS-02 | Phase 5 | Pending |
| NOTF-01 | Defer | Deferred |
| DASH-01 | Defer | Deferred |

**Coverage:**

- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-07*
*Last updated: 2026-06-07 after initial definition*

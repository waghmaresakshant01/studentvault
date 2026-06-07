# Roadmap: CampusCore

## Overview

This roadmap lays out the implementation of CampusCore in 5 progressive phases. We start by configuring dependencies and the dual-database environment, move through authentication and model core structures, build the REST endpoints, integrate the SQLite audit logging middleware, and verify the overall flow.

## Phases

- [x] **Phase 1: Project setup & dual database connection** - Establish dependencies, environments, Mongoose setup, and SQLite auto-initialization. (completed 2026-06-07)
- [x] **Phase 2: Authentication & Middleware** - Create the User model, bcrypt password hashing, and JWT authorization middleware. (completed 2026-06-07)
- [x] **Phase 3: Student Management API** - Implement the Student model, database unique validation, and CRUD operations. (completed 2026-06-07)
- [ ] **Phase 4: Expense Tracker API** - Implement the Expense model, CRUD routes, filters, and aggregations.
- [ ] **Phase 5: SQLite Logging & Delivery** - Integrate the SQLite-based hit tracker middleware and output the README.md documentation.

## Phase Details

### Phase 1: Project setup & dual database connection

**Goal**: Set up basic boilerplate, establish package dependencies, configure environment, and initialize MongoDB and SQLite.
**Depends on**: Nothing
**Requirements**: DB-01, DB-02, LOGG-01, DOCS-01
**Success Criteria**:

  1. Express server successfully starts and listens on `PORT` specified in `.env`.
  2. Server establishes a connection to MongoDB via Mongoose.
  3. Server auto-creates `/database/auditlog.db` and creates the `audit_logs` table on start.

**Plans**: 1 plan

Plans:

- [x] 01-01: Set up config files, MongoDB connection, better-sqlite3 database initialization, and Git/env parameters.

---

### Phase 2: Authentication & Middleware

**Goal**: Implement User model, hash user passwords, generate JWT tokens, and configure auth verification middleware.
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06
**Success Criteria**:

  1. Users can register via POST `/api/auth/register` with validation (valid email, min 6-char password, required fields) and hashed passwords.
  2. Users can log in via POST `/api/auth/login` and receive a valid JWT token expiring in 7 days.
  3. Decoded user profiles can be retrieved using GET `/api/auth/profile` with the authorization header.

**Plans**: 1 plan

Plans:

- [x] 02-01: Create User model, auth controller logic, auth middleware, and validation checks.

---

### Phase 3: Student Management API

**Goal**: Implement Student model with unique rollNo and full REST CRUD endpoints.
**Depends on**: Phase 2
**Requirements**: STUD-01, STUD-02, STUD-03, STUD-04, STUD-05, STUD-06, STUD-07
**Success Criteria**:

  1. Student records can be successfully added, retrieved, updated, and deleted using REST CRUD.
  2. rollNo constraint ensures duplicate student records cannot be created.
  3. All routes return 401 if accessed without a valid JWT token.

**Plans**: 1 plan

Plans:

- [x] 03-01: Implement Student mongoose model, student controller, routes, and link with auth middleware.

---

### Phase 4: Expense Tracker API

**Goal**: Implement Expense model with category enums, populate student info, filter, and aggregate student spending.
**Depends on**: Phase 3
**Requirements**: EXPN-01, EXPN-02, EXPN-03, EXPN-04, EXPN-05, EXPN-06, EXPN-07, EXPN-08, EXPN-09
**Success Criteria**:

  1. Expense records can be added, updated, retrieved, and deleted with active validation.
  2. All expense list queries populate student details (specifically the student name).
  3. Expense summary route dynamically aggregates total spending per category for a single student.

**Plans**: 1 plan

Plans:

- [ ] 04-01: Implement Expense model, controller endpoints (CRUD + Filter + Student list + Category summary aggregation).

---

### Phase 5: SQLite Logging & Delivery

**Goal**: Bind SQLite audit logger middleware globally to trace API hits, write README.md, and perform project checks.
**Depends on**: Phase 4
**Requirements**: LOGG-02, DOCS-02
**Success Criteria**:

  1. Every hit to any API endpoint logs method, route, userId (if authorized), and timestamp into the SQLite DB.
  2. Complete README.md includes creative framing, setup instructions, endpoints, Git steps, and Postman guide.

**Plans**: 1 plan

Plans:

- [ ] 05-01: Implement Express hit-logger middleware, hook it to all routes, write README.md, and run final checks.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project setup & DB | 1/1 | Complete    | 2026-06-07 |
| 2. Auth & Middleware | 1/1 | Complete    | 2026-06-07 |
| 3. Student Management | 1/1 | Complete    | 2026-06-07 |
| 4. Expense Tracker | 0/1 | Not started | - |
| 5. SQLite Logger & Delivery | 0/1 | Not started | - |

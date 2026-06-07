# Roadmap: StudentVault

## Overview

This roadmap lays out the implementation of StudentVault in 4 progressive phases. We begin by setting up the Express + MongoDB backend and building the basic CRUD endpoints. We then add strict data validation rules and category filtering. Next, we build the core Single-Page Application (SPA) frontend layout with forms and tables. Finally, we implement modals for editing/deleting, live client search, and dynamic statistics reporting.

## Phases

- [x] **Phase 1: Core Backend CRUD API** - Establish project base, connect MongoDB, and build primary REST endpoints. (completed 2026-06-07)
- [ ] **Phase 2: API Validation & Filtering** - Integrate input validation checks and implement branch/year query endpoints.
- [ ] **Phase 3: Single-Page Frontend Interface** - Serve frontend statically, construct forms and tables, and show toast notifications.
- [ ] **Phase 4: Frontend Modals, Filtering, and Stats** - Add edit modal, delete confirmation, live search, and stats counters.

## Phase Details

### Phase 1: Core Backend CRUD API

**Goal**: Setup boilerplate project files, connect to MongoDB, and implement standard REST CRUD endpoints.
**Depends on**: Nothing
**Requirements**: API-01, API-02, API-03, API-04, API-05, API-08
**Success Criteria**:

  1. Express server successfully starts and connects to MongoDB.
  2. POST `/api/students` creates a new record in MongoDB and returns `201 Created` with a standard JSON response.
  3. GET, PUT, and DELETE endpoints fetch, update, and remove student records by ID correctly.

**Plans**: 1 plan

Plans:

- [x] 01-01: Establish dependencies, MongoDB connection, Student schema model, CRUD controller, routes, and server setup.

---

### Phase 2: API Validation & Filtering

**Goal**: Integrate validation middleware for data inputs and add branch/year filtering routes.
**Depends on**: Phase 1
**Requirements**: VAL-01, VAL-02, VAL-03, VAL-04, VAL-05, VAL-06, API-06, API-07
**Success Criteria**:

  1. Invalid fields, duplicate email/rollNo, or incorrect formats are blocked with `400 Bad Request` and descriptive error messages.
  2. GET `/api/students/branch/:branch` and GET `/api/students/year/:year` return filtered records correctly.

**Plans**: 1 plan

Plans:

- [ ] 02-01: Create validateStudent middleware using express-validator, enforce constraints, and implement filter routes.

---

### Phase 3: Single-Page Frontend Interface

**Goal**: Configure static file serving, build the layout (Header, Form, Table), and implement toast alerts.
**Depends on**: Phase 2
**Requirements**: FE-01, FE-02, FE-03, FE-04, FE-05, FE-06
**Success Criteria**:

  1. Server serves static files under `public/` directory, loading index.html on root `/` access.
  2. Add Student Form successfully creates a student via fetch and displays a 3-second auto-dismissing success/error toast.
  3. Students Table lists records dynamically on page load.

**Plans**: 1 plan

Plans:

- [ ] 03-01: Set up static public folder, write HTML structure, styling system, and base JS fetch/rendering logic.

---

### Phase 4: Frontend Modals, Filtering, and Stats

**Goal**: Integrate the edit modal, delete confirmation, client-side live search, branch/year dropdown filtering, and the live stats bar.
**Depends on**: Phase 3
**Requirements**: FE-07, FE-08, FE-09, FE-10, FE-11, FE-12
**Success Criteria**:

  1. Live search filters table rows dynamically in the browser without calling the API.
  2. Dropdowns filter student table rows using the branch/year backend endpoints.
  3. Edit button opens a pre-filled Modal popup, and save changes calls PUT /api/students/:id.
  4. Delete button triggers a confirm dialog, calling DELETE /api/students/:id on approval.
  5. Stats Bar updates student counts dynamically after additions/deletions.

**Plans**: 1 plan

Plans:

- [ ] 04-01: Implement modal overlays, search/filter listeners, stats logic, and wire confirmation dialogs.

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Core Backend CRUD API | 1/1 | Complete    | 2026-06-07 |
| 2. API Validation & Filtering | 0/1 | Not started | - |
| 3. Single-Page Frontend Interface | 0/1 | Not started | - |
| 4. Frontend Modals, Filtering, and Stats | 0/1 | Not started | - |

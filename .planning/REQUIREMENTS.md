# Requirements: StudentVault

**Defined:** 2026-06-07
**Core Value:** Enable seamless, zero-page-reload management and filtering of student records through a high-performance REST API and a premium responsive frontend interface.

## v1 Requirements

### Backend REST API

- [x] **API-01**: POST `/api/students` adds a student record to MongoDB.
- [x] **API-02**: GET `/api/students` retrieves all student records.
- [x] **API-03**: GET `/api/students/:id` retrieves a single student record by MongoDB ID.
- [x] **API-04**: PUT `/api/students/:id` updates a student record by ID.
- [x] **API-05**: DELETE `/api/students/:id` deletes a student record by ID.
- [x] **API-06**: GET `/api/students/branch/:branch` retrieves student records filtered by branch.
- [x] **API-07**: GET `/api/students/year/:year` retrieves student records filtered by year.
- [x] **API-08**: Enforce standard JSON response format `{ success: true/false, message: "...", data: {...} }` for all endpoints.

### Backend Input Validation

- [x] **VAL-01**: Validation requires `name`, `rollNo`, `branch`, `year`, `email`, and `phone` to be present.
- [x] **VAL-02**: Enforce unique `rollNo` constraint.
- [x] **VAL-03**: Enforce unique `email` constraint and format regex.
- [x] **VAL-04**: Enforce `branch` to be one of the enum values: `CSE`, `IT`, `ECE`, `ME`, `CE`.
- [x] **VAL-05**: Enforce `year` to be an integer between 1 and 4.
- [x] **VAL-06**: Enforce `phone` to be exactly 10 digits.

### Frontend UI & Layout (Module 1)

- [x] **FE-01**: Express serves the `public/` directory statically under `/` (SPA layout, no page reload).
- [x] **FE-02**: Header/Navbar showing "StudentVault" and tagline "Manage your college students effortlessly" in a dark navy theme.
- [x] **FE-03**: Add Student Form with inputs for Name, Roll No, Branch (dropdown), Year (dropdown), Email, Phone, and Address.
- [x] **FE-04**: Toast notifications (green for success, red for error) that auto-dismiss after 3 seconds on form submit or API action.
- [x] **FE-05**: Students Table showing columns (Name, Roll No, Branch, Year, Email, Phone, Actions [Edit / Delete]).
- [x] **FE-06**: Total student count shown dynamically above the table, with an empty state message when no records exist.

### Frontend Modals & Filtering (Module 2)

- [x] **FE-07**: Live search bar to filter table rows by name or roll number without calling the API.
- [x] **FE-08**: Branch and Year filter dropdowns that trigger backend filtering API calls.
- [x] **FE-09**: Clear filters button that resets the table to show all student records.
- [x] **FE-10**: Edit modal pre-filled with the student's current details, calling PUT `/api/students/:id` on save.
- [x] **FE-11**: Delete confirmation dialog calling DELETE `/api/students/:id` on approval.
- [x] **FE-12**: Stats Bar displaying live counts (Total Students, CSE, IT, ECE) that update automatically on additions/deletions.

### Student & Analytics Navigation (Module 3)

- [ ] **FE-13**: Implement client-side Tab Navigation/Router in Navbar to toggle active views (`#dashboard`, `#students`, `#analytics`) without full-page refresh.
- [ ] **FE-14**: Create dedicated Dashboard View featuring a quick-action card deck, recent student registrations (last 3-5 students), and an animated summary visualization.
- [ ] **FE-15**: Create dedicated Students Directory View housing the full-width student records table, count indicator, and live search/filter bar.
- [ ] **FE-16**: Create dedicated Analytics View embedding dynamic, interactive data charts (using Chart.js) for Branch Distribution and Year-wise Enrollment.

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

- **AUTH-01**: User login and role-based access control.
- **DOCS-01**: Swagger/OpenAPI documentation for the backend endpoints.

## Out of Scope

| Feature | Reason |
|---------|--------|
| React/Angular/Vue | Strictly Vanilla JS frontend requested. |
| JWT Authentication | Out of scope to simplify ERP operations. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| API-01 | Phase 1 | Complete |
| API-02 | Phase 1 | Complete |
| API-03 | Phase 1 | Complete |
| API-04 | Phase 1 | Complete |
| API-05 | Phase 1 | Complete |
| API-08 | Phase 1 | Complete |
| VAL-01 | Phase 2 | Complete |
| VAL-02 | Phase 2 | Complete |
| VAL-03 | Phase 2 | Complete |
| VAL-04 | Phase 2 | Complete |
| VAL-05 | Phase 2 | Complete |
| VAL-06 | Phase 2 | Complete |
| API-06 | Phase 2 | Complete |
| API-07 | Phase 2 | Complete |
| FE-01 | Phase 3 | Complete |
| FE-02 | Phase 3 | Complete |
| FE-03 | Phase 3 | Complete |
| FE-04 | Phase 3 | Complete |
| FE-05 | Phase 3 | Complete |
| FE-06 | Phase 3 | Complete |
| FE-07 | Phase 4 | Complete |
| FE-08 | Phase 4 | Complete |
| FE-09 | Phase 4 | Complete |
| FE-10 | Phase 4 | Complete |
| FE-11 | Phase 4 | Complete |
| FE-12 | Phase 4 | Complete |
| FE-13 | Phase 5 | Proposed |
| FE-14 | Phase 5 | Proposed |
| FE-15 | Phase 5 | Proposed |
| FE-16 | Phase 5 | Proposed |

**Coverage:**

- v1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-07*
*Last updated: 2026-06-07 with Phase 5 view navigation requirements*

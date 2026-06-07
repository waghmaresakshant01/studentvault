# StudentVault

## What This Is

StudentVault is a complete full stack web application for managing college student records. It features a Node.js + Express backend with a MongoDB database, and a clean, responsive single-page HTML/CSS/Vanilla JS frontend that communicates with the backend API via dynamic fetch() calls.

## Core Value

Enable seamless, zero-page-reload management and filtering of student records through a high-performance REST API and a premium responsive frontend interface.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Add student with validated name, rollNo, branch, year, email, phone, and address (POST /api/students).
- [ ] Retrieve all student records (GET /api/students).
- [ ] Retrieve a single student by ID (GET /api/students/:id).
- [ ] Update student record by ID (PUT /api/students/:id).
- [ ] Delete student record by ID (DELETE /api/students/:id).
- [ ] Filter student records by branch (GET /api/students/branch/:branch).
- [ ] Filter student records by year (GET /api/students/year/:year).
- [ ] Single-page application frontend with interactive search, branch/year filters, and live stats counters.
- [ ] Modal-based student editing and delete confirmation dialogs.

### Out of Scope

- Frontend Frameworks (React, Vue, Angular) — strictly Vanilla HTML/CSS/JS frontend to keep dependencies lightweight and performance high.
- Authentication/Authorization — this project is a local-scoped ERP tool, keeping it simple without user access control.
- Automated Email Delivery — keeping it low-dependency without SMTP configuration.

## Context

This is a clean-slate full-stack development workspace designed to replace the previous CampusCore backend with a unified, interactive student management dashboard.

## Constraints

- **Tech Stack Backend**: Node.js + Express, Mongoose (MongoDB), dotenv, express-validator, cors, nodemon — mandated for backend stability and validator capabilities.
- **Tech Stack Frontend**: HTML + CSS (Vanilla) + Vanilla JS — pure frontend without compilation or bundlers.
- **Single Page Application**: No page reloads allowed; all database interactions and UI updates must happen dynamically in the DOM via fetch().

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Serve Static Frontend | Express serves the `public/` directory statically using `app.use(express.static('public'))` for easy local development. | — Pending |
| Clean Slate Re-init | Dropped previous CampusCore project files to start StudentVault fresh. | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-07 after initialization*

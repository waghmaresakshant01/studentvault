# CampusCore

## What This Is

CampusCore is a unified backend system for a smart college ERP. It links student profiles with academic records, administrator operations, and tracked expense modules (mess fees, library fines, etc.), while actively demonstrating a dual database configuration by utilizing MongoDB for application data and SQLite for API hit audit logs.

## Core Value

Demonstrates production-ready integration of dual database technologies (MongoDB and SQLite) in a secure, authenticated, and schema-validated Node.js + Express.js API.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Implement dual database configuration (MongoDB/Mongoose and SQLite/better-sqlite3)
- [ ] Implement JWT-based registration, login, and profile authorization
- [ ] Implement Student Management REST CRUD endpoints with unique validation
- [ ] Implement Expense Tracker CRUD endpoints with student aggregation summaries
- [ ] Implement SQLite-based middleware logging every API hit to `audit_logs`

### Out of Scope

- Frontend User Interface — CampusCore is designed strictly as a REST API backend.
- Email verification integration (e.g., SMTP transport) — JWT session state is sufficient for this milestone.
- Real-time notifications — Defer to v2+ roadmap.

## Context

CampusCore combines student records, expense tracking, and admin auth. It requires double data storage architecture: MongoDB handles transactional ERP records, while SQLite handles low-latency audit trail logs.

## Constraints

- **Backend Stack**: Node.js, Express.js.
- **Primary Database**: MongoDB / Mongoose.
- **Audit Database**: SQLite (via better-sqlite3).
- **Security**: bcrypt (10 rounds) for passwords, JWT (7-day expiration) for tokens.
- **Configuration**: Env variables managed via `dotenv`.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| SQLite for Auditing | Local, fast, serverless storage suitable for low-overhead write-only audit logs | — Pending |
| Mongoose for Main Models | Flexible schema modeling, document referencing (Expense -> Student), validation | — Pending |

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

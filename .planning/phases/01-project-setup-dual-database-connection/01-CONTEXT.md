---
phase: "01"
name: "project-setup-dual-database-connection"
created: 2026-06-07
---

# Phase 1: project-setup-dual-database-connection — Context

## Decisions

- **Express Server**: Use Express.js as the core REST API framework.
- **Mongoose / MongoDB**: Use MongoDB as the main transactional database.
- **better-sqlite3 / SQLite**: Use better-sqlite3 for the local audit database, auto-created in `database/auditlog.db`.

## Discretion Areas

- Folder structure: The files will be organized under `config/`, `middleware/`, `models/`, `routes/`, `controllers/`, `database/`.

## Deferred Ideas

- None.

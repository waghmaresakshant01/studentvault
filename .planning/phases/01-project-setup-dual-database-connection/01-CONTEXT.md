# Phase 1: Project setup & dual database connection — Context

## Decisions

- **Framework**: Express.js with Node.js.
- **Main Database**: MongoDB configured via Mongoose, pulling `MONGO_URI` from `.env`.
- **Audit Database**: SQLite configured via `better-sqlite3`, pointing to `database/auditlog.db` (auto-created on server boot).
- **Structure**:
  - `config/mongodb.js` and `config/sqlite.js`.
  - `database/auditlog.db`.
  - `.env` and `.gitignore`.
  - `package.json` and `server.js`.
- **Audit logs table structure**: `audit_logs` (id INTEGER PRIMARY KEY AUTOINCREMENT, method TEXT, route TEXT, userId TEXT NULL, timestamp TEXT).

## Discretion Areas

- Choice of schema-defining syntax in Mongoose. We will use CommonJS imports/exports consistently.
- Explicit folder setup for `database` where the SQLite database file is stored.

## Deferred Ideas

- None for this phase.

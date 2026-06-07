# Phase 1: project-setup-dual-database-connection — Research

## Dual Database Architecture

CampusCore uses a dual database setup:
1. **MongoDB (via Mongoose)**:
   - Primary database for student records, user authentication, and expenses.
   - Run via local URI (e.g. `mongodb://localhost:27017/campuscore`).
2. **SQLite (via better-sqlite3)**:
   - Local storage for logging every HTTP request method, path, authenticated user ID, and timestamp.
   - SQLite file will be placed at `database/auditlog.db`.

## Dependencies

- `express`
- `mongoose`
- `better-sqlite3`
- `bcrypt`
- `jsonwebtoken`
- `dotenv`

## Implementation Steps

1. Configure `.env` and `.gitignore`.
2. Construct MongoDB connection script in `config/mongodb.js`.
3. Construct SQLite database file initialization in `config/sqlite.js` with table `audit_logs`.
4. Initialize simple `server.js` starting the connections.

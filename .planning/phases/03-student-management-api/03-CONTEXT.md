# Phase 3: Student Management API - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase implements the Student Mongoose model, database unique validation, and protected REST CRUD endpoints under `/api/students` for managing student records.

</domain>

<decisions>
## Implementation Decisions

### Access Control / Authorization
- **D-01:** Only users with the 'admin' role are permitted to create, update, or delete student records.
- **D-02:** Any authenticated user (both 'admin' and 'student' roles) is permitted to read student records (GET /api/students and GET /api/students/:id).

### Student Schema & Field Validation
- **D-03:** Enforce a basic unique string value for the Student `rollNo` with no specific format validation.
- **D-04:** Enforce a standard email format validation for `email` using regex.
- **D-05:** Enforce a 10-digit phone number format validation for `phone` using regex.
- **D-06:** Enforce `year` to be an integer between 1 and 4.
- **D-07:** Fields `name`, `rollNo`, `branch`, `year`, `email`, and `phone` are required.

### Student Deletion Behavior
- **D-08:** Student deletion will perform a hard delete from MongoDB. During Phase 4 (Expense Tracker), we will check and block student deletion if there are any associated expense records.

### the agent's Discretion
- The choice of Express route parameter names and exact error message texts is left to the agent's discretion, following the standard response format.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Configuration & Requirements
- `.planning/PROJECT.md` — Project definition and technology boundary details.
- `.planning/REQUIREMENTS.md` — Core and module requirements (`STUD-01` to `STUD-07`).
- `.planning/ROADMAP.md` — Phase definition and success criteria.

### Prior Phase Contexts
- `.planning/phases/01-project-setup-dual-database-connection/01-CONTEXT.md` — Project setup and database configs.
- `.planning/phases/02-authentication-middleware/02-CONTEXT.md` — User schema, roles, and auth middleware.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `middleware/auth.js` — Protects all student endpoints, decodes the token, and attaches the user payload `{ id, role }` to `req.user`.

### Established Patterns
- standard JSON responses: `{ success: true, message: "...", data: {...} }` or `{ success: false, message: "..." }`.
- Controller logic encapsulated inside try/catch blocks with correct status codes (e.g. 201 for Created, 200 for OK, 400 for Bad Request, 401 for Unauthorized, 403 for Forbidden, 404 for Not Found, 500 for Internal Server Error).

### Integration Points
- `server.js` — Mount the student routes under `app.use('/api/students', studentRoutes)`.

</code_context>

<specifics>
## Specific Ideas

No specific design/theme references — open to standard RESTful API approaches.

</specifics>

<deferred>
## Deferred Ideas

- None.

</deferred>

---

*Phase: 03-student-management-api*
*Context gathered: 2026-06-07*

# Phase 2: API Validation & Filtering - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase implements input validation middleware using `express-validator` for creating student records, and implements route-parameter based filtering endpoints (branch and year query filters).

</domain>

<decisions>
## Implementation Decisions

### Input Validation
- **D-01:** Implement `middleware/validateStudent.js` using `express-validator` to validate all fields for student creation (POST /api/students).
- **D-02:** When validation fails, return a `400 Bad Request` status code containing an array of detailed error objects under the `data` or `errors` field in our standard response:
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
  ```
- **D-03:** Validation middleware rules for creation (POST):
  - `name`: required, not empty.
  - `rollNo`: required, not empty.
  - `branch`: required, must be one of `CSE`, `IT`, `ECE`, `ME`, `CE` (case-insensitive checks, but normalized to uppercase on saving).
  - `year`: required, integer between 1 and 4.
  - `email`: required, valid format.
  - `phone`: required, exactly 10 digits.
- **D-04:** Apply validation middleware to POST `/api/students`. Let the controller dynamically check and validate fields for updates (PUT `/api/students/:id`).

### API Filtering Routes
- **D-05:** Implement `GET /api/students/branch/:branch` and `GET /api/students/year/:year` as route-parameter based filters.
- **D-06:** Make branch and year filtering case-insensitive (e.g. `GET /api/students/branch/cse` matches branch value `CSE` in database).
- **D-07:** Do not support query parameter filters (e.g. `/api/students?branch=CSE`); keep filtering strictly route-parameter based.

### the agent's Discretion
- The exact format of the mapped validation error keys and response messages is left to the agent's discretion.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Configuration & Requirements
- `.planning/PROJECT.md` — Active requirements and tech constraints.
- `.planning/REQUIREMENTS.md` — Core validation requirements (`VAL-01` to `VAL-06`, `API-06` to `API-07`).
- `.planning/ROADMAP.md` — Phase 2 success criteria.

### Prior Phase Contexts
- `.planning/phases/01-core-backend-crud-api/01-CONTEXT.md` — Greenfield setup and server bootstrap details.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `models/Student.js` — Schema definition that contains field names and database types.

### Established Patterns
- Response format: `{ success: true/false, message: "...", data: {...} }`.

### Integration Points
- `routes/studentRoutes.js` — Map filtering routes and insert validation middleware on the POST route.

</code_context>

<specifics>
## Specific Ideas

No frontend integration details are scoped in this backend phase.

</specifics>

<deferred>
## Deferred Ideas

- Serving static folder public, HTML UI form, stats bars, and modals deferred to Phase 3 and Phase 4.

</deferred>

---
*Phase: 02-api-validation-filtering*
*Context gathered: 2026-06-07*

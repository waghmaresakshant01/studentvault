# Phase 2: API Validation & Filtering - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-07
**Phase:** 02-api-validation-filtering
**Areas discussed:** Error Response Structure, Filtering Case-Sensitivity, Route vs Query params, POST vs PUT Validation

---

## Validation Error Response Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Return a single combined message string containing all validation errors (e.g., 'Email is invalid, Phone must be 10 digits') inside the standard response envelope { success: false, message: '...' } | |
| Option 2 | Return an array of detailed error objects (e.g., [ { field: 'email', message: 'Invalid email' } ]) inside the standard response data/errors field. | ✓ |

**User's choice:** Option 2
**Notes:** Detailed error lists allow the client interface to highlight invalid inputs individually.

---

## Filtering Case-Sensitivity

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Yes, make branch and year filtering case-insensitive/flexible (e.g., 'cse' or 'CSE' match CSE). | ✓ |
| Option 2 | No, enforce exact matching of branch enum values (CSE, IT, ECE, ME, CE). | |

**User's choice:** Option 1
**Notes:** Provides a better user experience by handling casing discrepancies automatically.

---

## Query Parameter Filtering support

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Keep it strictly route-parameter based (/api/students/branch/:branch and /api/students/year/:year) to match the specification. | ✓ |
| Option 2 | Support query parameters (e.g., GET /api/students?branch=CSE&year=3) on the main GET route as well. | |

**User's choice:** Option 1 (interpreted from "dont use api")
**Notes:** Avoid query param pollution; stick to the route parameters defined in the specification.

---

## Validation Middleware Scope (Create vs Update)

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Apply the validation middleware for POST (all fields required), and let the controller handle PUT updates dynamically. | ✓ |
| Option 2 | Implement separate validation rules for POST and PUT in the middleware (PUT makes fields optional but validates formats if present). | |

**User's choice:** Option 1
**Notes:** Allows updates to remain flexible at the controller level without duplicate middleware checks.

---

## the agent's Discretion

Standard key mapping for validation errors.

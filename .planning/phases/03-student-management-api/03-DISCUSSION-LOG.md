# Phase 3: Student Management API - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-07
**Phase:** 03-student-management-api
**Areas discussed:** Access Control, Roll Number Formatting, Field Validations, Deletion Behavior

---

## Access Control / Authorization

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Only users with the 'admin' role can create, update, or delete student records; any authenticated user can read them. | ✓ |
| Option 2 | Any authenticated user (both admin and student roles) can perform all CRUD actions on student records. | |
| Option 3 | Only users with the 'admin' role can read or modify student records; student users have no access to the Student API. | |

**User's choice:** Option 1
**Notes:** Non-admin users are restricted from editing but allowed to retrieve students.

---

## Roll Number Formatting & Validation Constraint

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Enforce a basic unique string value with no specific format validation (just ensure uniqueness). | ✓ |
| Option 2 | Enforce an alphanumeric format (e.g., CS2026001) using a custom regex. | |
| Option 3 | Enforce a specific length constraint (e.g., exactly 8 characters). | |

**User's choice:** Option 1
**Notes:** Rely on uniqueness constraints of MongoDB; no custom alphanumeric format validation required.

---

## Field Validations (Email, Phone, Year)

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Enforce standard email regex, a 10-digit phone number regex, and year must be between 1 and 4. | ✓ |
| Option 2 | Enforce basic type checks (String/Number) without strict format regexes. | |
| Option 3 | Enforce only email validation; accept any string/format for phone and year. | |

**User's choice:** Option 1
**Notes:** Ensures strict format enforcement for critical student details (email, 10-digit phone number, academic year between 1 and 4).

---

## Student Deletion Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Option 1 | Perform a hard delete from MongoDB; in Phase 4 we will check and prevent deletion if there are associated expenses. | ✓ |
| Option 2 | Perform a soft delete by setting an isActive flag to false, preserving the record. | |
| Option 3 | Perform a hard delete from MongoDB and cascade-delete all associated expenses in Phase 4. | |

**User's choice:** Option 1
**Notes:** Hard deletion. Expense tracking logic (Phase 4) will block deletion if any linked expenses exist to maintain integrity.

---

## the agent's Discretion

Standard Express parameters and error phrasing.

## Deferred Ideas

None.

# Phase 2: authentication-middleware — Research

## JWT and bcrypt Implementation

1. **User Model (MongoDB)**:
   - Schema fields: name, email (unique, lowercase), password, role (enum: admin/student), createdAt (default: Date.now).
2. **Password Hashing**:
   - `bcrypt.hash(password, 10)` during registration.
   - `bcrypt.compare(password, user.password)` during login.
3. **JWT Generation**:
   - Sign payload: `{ id: user._id, role: user.role }` using `process.env.JWT_SECRET`.
   - Expires in 7 days (`{ expiresIn: '7d' }`).
4. **JWT Verification Middleware**:
   - Parse `Authorization` header: `Bearer <token>`.
   - Validate token, attach decoded payload to `req.user` (which contains `id` and `role`).
   - If invalid or missing, respond with `401 Unauthorized`.
5. **Endpoints**:
   - POST `/api/auth/register`
   - POST `/api/auth/login`
   - GET `/api/auth/profile` (Protected)

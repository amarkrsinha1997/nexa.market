# 2026-02-06 - SQL Management Documentation

**Original Chat Prompt:**
"How can I make admin to any userId and find the users using user email in postgressql write it as well"

**Chat Summary:**
The user requested SQL queries to manage users in PostgreSQL, specifically finding a user by email and promoting a user to the ADMIN role.

**Actions Taken:**
- Verified the `User` table schema in `prisma/schema.prisma`.
- Added section "13. Common Database Management Tasks" to `docs/deployment.md`.
- Provided SQL queries for:
    - Finding a user by email.
    - Promoting a user to ADMIN by ID.
    - Listing all admins.
    - Fuzzy searching users by email.
- Documented how to access the PostgreSQL shell on the server.

**Files Touched:**
- `docs/deployment.md`

**Confirmation:**
Business logic was unchanged.

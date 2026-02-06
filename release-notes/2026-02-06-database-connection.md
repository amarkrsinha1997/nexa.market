# 2026-02-06 - Database Connection Documentation

**Original Chat Prompt:**
"How can I connect with the db inside vm instance"

**Chat Summary:**
The user requested instructions for connecting to the PostgreSQL database hosted on a GCP VM instance. I provided procedures for SSH tunneling (secure) and direct connection (less secure).

**Actions Taken:**
- Researched existing database setup in `docs/deployment.md` and `docker-compose.yml`.
- Created an implementation plan for documentation.
- Updated `docs/deployment.md` with section "11. Remote Database Connection".
- Provided step-by-step instructions for SSH tunneling with port mapping.
- Provided instructions for configuring PostgreSQL for direct remote access (GCP firewall, `postgresql.conf`, `pg_hba.conf`).

**Files Touched:**
- `docs/deployment.md`

**Confirmation:**
Business logic was unchanged.

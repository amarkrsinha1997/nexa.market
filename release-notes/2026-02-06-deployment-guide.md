# Release Notes - Deployment Documentation
**Date**: 2026-02-06

## Original Prompt
"How to deploy this repo in a new compute engine vm all the commands"

## Summary
Created a comprehensive deployment guide to assist with setting up the application on a Google Cloud Platform (GCP) Compute Engine VM. The guide was updated to support a **non-Docker** setup, using native PostgreSQL for database management. It covers system dependencies, application setup, database initialization, process management with PM2, and reverse proxy configuration with Nginx and SSL.

## Actions Taken
- Created and updated [deployment.md](file:///Users/apple/Documents/Nekka/nexa.market/docs/deployment.md) in the `/docs` directory.
- Documented native system-level setup (Node.js, PostgreSQL, Nginx).
- Documented application-specific setup without Docker (Prisma, Build, PM2).
- Provided manual PostgreSQL configuration commands (user/db creation).
- Added DNS setup instructions (A and CNAME records).
- Detailed GCP Firewall rule configuration for port 3000.
- **Improved Nginx Configuration**: Added standard proxy headers and used forced symbolic links (`ln -sf`) to prevent duplication errors.
- **[NEW] Multi-App Guide**: Documented how to use Nginx as a reverse proxy to host multiple apps/subdomains on different internal ports.
- Updated database name to `nexa.market` and ensured correct PostgreSQL quoting syntax.
- Provided a curated table of useful commands for maintenance.

## Files Touched
- [docs/deployment.md](file:///Users/apple/Documents/Nekka/nexa.market/docs/deployment.md)

## Business Logic
- [x] No business logic was changed.

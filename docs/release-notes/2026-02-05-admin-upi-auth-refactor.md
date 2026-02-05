# Release Notes - 2026-02-05

## Original Chat Prompt
" 대신 (audio request) instead of using this go to the utils folder or service auth service, check out from there and use the verify admin, there is a is admin or not function is there, check from that not from here. (regarding src/app/api/admin/upi/route.ts)"

## Chat Summary
The user requested to centralize the admin verification logic for the UPI management API routes. Previously, each route had its own `verifyAdmin` helper. I moved this logic to `AuthService.verifyAdmin` and updated all relevant routes to use it.

## Actions Taken
- Added `verifyAdmin` static method to `AuthService` in `src/lib/services/auth.service.ts`.
- Refactored `src/app/api/admin/upi/route.ts` to use `AuthService.verifyAdmin`.
- Refactored `src/app/api/admin/upi/[id]/route.ts` to use `AuthService.verifyAdmin`.
- Refactored `src/app/api/admin/upi/[id]/toggle/route.ts` to use `AuthService.verifyAdmin`.
- Cleaned up unused imports (`ROLES`) and local helper functions in the UPI routes.

## Files Touched
- [auth.service.ts](file:///Users/apple/Documents/Nekka/nexa.market/src/lib/services/auth.service.ts)
- [route.ts (UPI)](file:///Users/apple/Documents/Nekka/nexa.market/src/app/api/admin/upi/route.ts)
- [[id]/route.ts (UPI)](file:///Users/apple/Documents/Nekka/nexa.market/src/app/api/admin/upi/[id]/route.ts)
- [[id]/toggle/route.ts (UPI)](file:///Users/apple/Documents/Nekka/nexa.market/src/app/api/admin/upi/[id]/toggle/route.ts)

## Business Logic Status
- **Unchanged**: The core logic for fetching, creating, updating, and deleting UPIs remains exactly the same. Only the authentication and authorization check mechanism was refactored for better maintainability.

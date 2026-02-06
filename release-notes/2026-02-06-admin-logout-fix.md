# Release Note - Admin Logout Fix
**Date:** 2026-02-06

### Original Request
On clicking logout in the admin setting page it takes to the user home page it should clear the cache and logout.

### Summary
Fixed a redirect conflict in the Admin Portal that caused users to be sent to `/users/home` during logout instead of the login page. Additionally, implemented a full page reload on logout to ensure all in-memory caches and states are completely cleared.

### Actions Taken
- **Admin Layout Update**: Modified the `useEffect` redirect logic in `AdminLayout` to avoid redirecting unauthenticated users to `/users/home`.
- **Auth Context Update**: Changed the `logout` function to use `window.location.href = "/login"` for a hard refresh, ensuring all transient browser state is wiped.
- **Cache Clearing**: verified that `LocalStorageUtils.clearAuth()` (called during logout) clears all storage keys.

### Files Touched
- [src/app/admin/layout.tsx](file:///Users/apple/Documents/Nekka/nexa.market/src/app/admin/layout.tsx)
- [src/lib/contexts/AuthContext.tsx](file:///Users/apple/Documents/Nekka/nexa.market/src/lib/contexts/AuthContext.tsx)

### Business Logic Confirmation
**Business logic was unchanged.** Only navigation and state clearing mechanisms were refined.

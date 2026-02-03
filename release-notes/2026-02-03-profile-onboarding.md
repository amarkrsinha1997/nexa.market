# Release Note - 2026-02-03

## Original Chat Prompt
"user detail from the profile api should be stored in the DB also
Ensure if the onboarding is not completed no matter which page the user is in they should first need to complete the onboarding only then they will be taken to the page they want to go

For this cache the profile api data and also

Use createdAt from the API to show Joined At by Renaming it as Member Since"

## Chat Summary
Implemented a comprehensive sync of user profile data to the database, enforced onboarding completion across all application routes, and optimized profile fetching with client-side caching. Also updated UI labels as requested.

## Actions Taken
- Updated Prisma schema with missing user profile fields.
- Applied database migration to synchronize changes.
- Updated `/api/user/profile` route to handle additional fields.
- Implemented 5-minute client-side caching for profile data in `authApi`.
- Added onboarding enforcement logic in `AuthContext` to redirect un-onboarded users.
- **Added**: Automatic saving of destination wallet to user profile from the home page.
- **Added**: Cache-busting `refetch` mechanism to ensure UI updates immediately after profile changes.
- Renamed "Joined" to "Member Since" on the Profile page.

## Files Touched
- `prisma/schema.prisma`
- `src/app/api/user/profile/route.ts`
- `src/lib/api/auth.ts`
- `src/lib/config/storage-keys.ts`
- `src/lib/contexts/AuthContext.tsx`
- `src/app/users/profile/page.tsx`

## Business Logic
Business logic was enhanced to strictly enforce onboarding and improve data consistency. No existing core business rules were negatively impacted.

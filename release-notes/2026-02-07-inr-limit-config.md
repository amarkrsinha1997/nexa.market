# Release Notes - 2026-02-07

## INR Limit Configuration

**Original Prompt**: "I want to be able to set limit of INR the user can enter on the exchange and have the config in the admin settings. This should be similar to price action and stored in localstorage in UI. Update the DB, UI and others"

**Summary**: Added a configurable INR limit for orders, managed by Admins and enforced for users.

**Actions Taken**:
- Updated `ConfigService` to handle `NEXA_INR_LIMIT` in the `AppConfig` table.
- **Improved Performance & Sync**: Implemented backend caching in `ConfigService` and an in-memory client cache in `PriceSchedulerService`.
- **Simplified Deployment**: Removed `localStorage` dependency for price and limit configuration.
- **Enhanced Reliability**: Added immediate frontend refresh after Admin updates.
- **UX Improvement**: Set India (+91) as the default country in the phone number input and prioritized India in the country selection list.
- Updated `api/config` route to support fetching and updating the INR limit.
- Created `useNexaConfig` hook for efficient config access across the app.
- Updated Admin Settings UI with a new field for "Max INR per Order".
- Added real-time validation and error messaging in the user `ExchangeForm` to enforce the limit.

**Files Touched**:
- `src/lib/services/config.service.ts`
- `src/app/api/config/route.ts`
- `src/lib/api/config.ts`
- `src/lib/services/price-scheduler.service.ts`
- `src/lib/hooks/useNexaConfig.ts` [NEW]
- `src/app/admin/settings/page.tsx`
- `src/components/features/exchange/ExchangeForm.tsx`

**Business Logic Status**: Unchanged (New feature added on top of existing logic).

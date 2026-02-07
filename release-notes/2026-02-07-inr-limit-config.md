# Release Notes - 2026-02-07

## INR Limit Configuration

**Original Prompt**: "I want to be able to set limit of INR the user can enter on the exchange and have the config in the admin settings. This should be similar to price action and stored in localstorage in UI. Update the DB, UI and others"

**Summary**: Added a configurable INR limit for orders, managed by Admins and enforced for users.

**Actions Taken**:
- Updated `ConfigService` to handle `NEXA_INR_LIMIT` in the `AppConfig` table.
- **Improved Performance & Sync**: Implemented backend caching in `ConfigService` and an in-memory client cache in `PriceSchedulerService`.
- **Simplified Deployment**: Removed `localStorage` dependency for price and limit configuration.
- **Enhanced Reliability**: Added immediate frontend refresh after Admin updates.
- **Payment UX Simplification**: Removed the "Pay" button and automatic UPI app opening to allow users to scan the QR code or copy the address manually. Only the "Confirm Payment" button is now shown for a cleaner workflow.
- **UPI Builder Refactor**: Simplified UPI payment URLs to only include essential parameters (`pa`, `pn`, `tn`, `am`).
- **Dynamic Payee Name**: Payee names are now dynamically fetched from the UPI configuration instead of being hardcoded.
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

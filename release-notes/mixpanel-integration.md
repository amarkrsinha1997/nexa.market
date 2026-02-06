# Release Notes - Mixpanel Integration

**Date**: 2026-02-06
**Summary**: Integrated Mixpanel analytics to track user interactions and profile data.

## Features
- **Mixpanel Integration**: Installed `mixpanel-browser` and configured initialization with specific parameters.
- **Deep User Integration (Super Properties)**: 
  - **All user metadata is now attached to EVERY event** (clicks, page views, etc.), not just the user profile. This satisfies the requirement for granular tracking context.
  - **Metadata includes**: User ID, Google ID, Email, Name, Phone, Role, Wallet Address, Device Type.
  - **New Field**: Added `Joined At` tracking.
- **Page Tracking**: 
  - Routes are now mapped to human-readable names (e.g., `/users/home` -> "User Dashboard").
- **Event Tracking**:
  - **Page Views**: Persistent tracking on route changes.
  - **Button Clicks**:
    - **Admin flow**: Tracking for UPI additions/toggles/deletes, settings updates, and order decisions (Verify/Approve/Reject).
    - **Ledger Actions**: Added explicit tracking for `Admin Order Checked`, `Admin Order Decision`, and `Admin Order Reprocessed`.
    - **Payment Flow**: Tracking for `Payment Confirmed By User`, `Pay via App Clicked` (deep links), and address copying.
    - **User Flow**: Tracking for Exchange buy actions, wallet address updates, and Ledger filtering.
    - **Navigation**: Tracking for "Back to Ledger" and "Return to Dashboard" from detail pages.
    - **Marketing**: Tracking for Landing Page calls-to-action.
    - **Engagement**: Tracking for Notification permission prompts.
  - **Clicks**: Autocaptured.
  - **Sidebar**: Explicit tracking for navigation.

## Technical Details
- Updated `src/lib/utils/mixpanel.ts` to use `mixpanel.register()` for super properties.
- Updated `src/components/providers/MixpanelProvider.tsx` with page name mapping logic.
- Updated `src/app/layout.tsx` to include `MixpanelProvider`.

## Files Touched
- `src/lib/utils/mixpanel.ts`: Core utility and super property registration.
- `src/components/providers/MixpanelProvider.tsx`: Global tracking and route mapping.
- `src/app/layout.tsx`: Root integration.
- `src/app/admin/layout.tsx`: Sidebar tracking.
- `src/components/layout/DesktopNavbar.tsx`: User navbar tracking.
- `src/app/admin/upi/page.tsx`: UPI management tracking.
- `src/app/admin/settings/page.tsx`: Admin settings tracking.
- `src/app/admin/profile/page.tsx`: Admin profile tracking.
- `src/app/admin/orders/[id]/page.tsx`: Admin order action tracking.
- `src/app/users/ledger/page.tsx`: User ledger tracking.
- `src/app/users/profile/page.tsx`: User profile tracking.
- `src/app/users/wallet/page.tsx`: User wallet tracking.
- `src/app/(landing)/page.tsx`: Landing page tracking.
- `src/components/onboarding/OnboardingForm.tsx`: Onboarding completion tracking.
- `src/components/features/exchange/ExchangeForm.tsx`: Buy button and wallet tracking.
- `src/components/features/notifications/NotificationPermissionRequest.tsx`: Notification prompt tracking.

## Confirmation
- **Business logic**: Unchanged. All tracking is non-blocking and descriptive.

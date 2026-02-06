# Mixpanel Event Constants Migration & Naming Standardization

**Date**: 2026-02-07
**Type**: Analytics Enhancement
**Impact**: Complete standardization of Mixpanel events across user and admin features.

---

## Original Request
> [src/app/users/home/page.tsx] ... [src/components/onboarding/OnboardingForm.tsx]
> This still needs to be fix with events constant naming convention from the config
> 
> Instead of SidebarClicked Say Home Menu Clicked for both desktop and mobile and tab

---

## Summary
Completed the migration of hardcoded Mixpanel event strings to standardized constants in `src/lib/config/mixpanel-events.ts`. This update also includes a renaming of sidebar-related events to "Home Menu Clicked" (event value: `HOME_MENU_CLICKED`) across all platforms (Mobile, Desktop, Tablet) to satisfy the new naming requirement.

---

## Actions Taken

### 1. Updated Centralized Configuration
- Added missing event constants to `src/lib/config/mixpanel-events.ts`.
- Renamed all `SIDEBAR_CLICKED` related keys and values to `MENU_CLICKED` / `HOME_MENU_CLICKED`.
- Standardized event values to `UPPERCASE_WITH_UNDERSCORES`.

### 2. Mass Migration of Components
Refactored the following files to use `MixpanelEvents` constants:
- **User Dashboard & Navigation**: `UserHomePage`, `MobileFooter`, `DesktopNavbar`
- **Transactions & Ledger**: `LedgerPage`, `LedgerList`, `OrderDetailsPage`
- **Profile & Settings**: `ProfilePage`, `WalletPage`, `OnboardingForm`
- **Key Features**: `ExchangeForm`, `NotificationPermissionRequest`
- **Admin**: `AdminLayout`

### 3. Naming Standardization
- Replaced "Sidebar Clicked" with "Home Menu Clicked" for all user and admin navigation menus.
- Ensured consistency across mobile bottom navigation and desktop sidebar drawers.

---

## Files Modified

- [mixpanel-events.ts](file:///Users/apple/Documents/Nekka/nexa.market/src/lib/config/mixpanel-events.ts)
- [home/page.tsx](file:///Users/apple/Documents/Nekka/nexa.market/src/app/users/home/page.tsx)
- [ledger/page.tsx](file:///Users/apple/Documents/Nekka/nexa.market/src/app/users/ledger/page.tsx)
- [orders/[id]/page.tsx](file:///Users/apple/Documents/Nekka/nexa.market/src/app/users/orders/[id]/page.tsx)
- [profile/page.tsx](file:///Users/apple/Documents/Nekka/nexa.market/src/app/users/profile/page.tsx)
- [wallet/page.tsx](file:///Users/apple/Documents/Nekka/nexa.market/src/app/users/wallet/page.tsx)
- [ExchangeForm.tsx](file:///Users/apple/Documents/Nekka/nexa.market/src/components/features/exchange/ExchangeForm.tsx)
- [LedgerList.tsx](file:///Users/apple/Documents/Nekka/nexa.market/src/components/features/ledger/LedgerList.tsx)
- [NotificationPermissionRequest.tsx](file:///Users/apple/Documents/Nekka/nexa.market/src/components/features/notifications/NotificationPermissionRequest.tsx)
- [MobileFooter.tsx](file:///Users/apple/Documents/Nekka/nexa.market/src/components/layout/MobileFooter.tsx)
- [DesktopNavbar.tsx](file:///Users/apple/Documents/Nekka/nexa.market/src/components/layout/DesktopNavbar.tsx)
- [OnboardingForm.tsx](file:///Users/apple/Documents/Nekka/nexa.market/src/components/onboarding/OnboardingForm.tsx)
- [layout.tsx](file:///Users/apple/Documents/Nekka/nexa.market/src/app/admin/layout.tsx)

---

## Business Logic Status
✅ **Business logic remains unchanged.**  
Only event tracking strings and constants were updated for better analytics maintainability and script compatibility.

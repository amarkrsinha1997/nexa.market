# Mixpanel Event Migration Status

**Last Updated**: 2026-02-07

## ✅ Completed Migrations

###  Core Config
- [x] `/src/lib/config/mixpanel-events.ts` - Centralized config created with UPPERCASE_WITH_UNDERSCORES format
- [x] All event names are now descriptive and context-specific

### Pages
- [x] `/src/app/(landing)/page.tsx` - All 5 events updated
- [x] `/src/app/users/payment/[id]/page.tsx` - All 3 events updated  
- [x] `/src/components/providers/MixpanelProvider.tsx` - Page view tracking updated

### Components - Payment
- [x] `/src/components/features/payment/PaymentDeeplink.tsx` - Updated
- [ ] `/src/components/features/payment/PaymentConfirmation.tsx` - No tracking currently

### Components - Navigation
- [x] `/src/components/layout/DesktopNavbar.tsx` - All 4 events updated
- [ ] `/src/components/layout/MobileFooter.tsx` - Needs 3 updates

## ⏩ Pending Migrations

### Onboarding
- [  ] `/src/components/onboarding/OnboardingForm.tsx`
  - Current: `"Onboarding Completed"`
  - New: `MixpanelEvents.USER_ONBOARDING_COMPLETED`

### Exchange/Buy Flow
- [ ] `/src/components/features/exchange/ExchangeForm.tsx` (5 events)
  - Current: `"Exchange Amount Entered"` 
  - New: `MixpanelEvents.EXCHANGE_FORM_AMOUNT_ENTERED`
  
  - Current: `"Exchange Wallet Edit Clicked"`
  - New: `MixpanelEvents.EXCHANGE_FORM_WALLET_EDIT_CLICKED`
  
  - Current: `"Exchange Wallet Saved"`
  - New: `MixpanelEvents.EXCHANGE_FORM_WALLET_SAVED`
  
  - Current: `"Exchange Wallet Address Copied"`
  - New: `MixpanelEvents.EXCHANGE_FORM_WALLET_ADDRESS_COPIED`
  
  - Current: `"Buy Nexa Clicked"`
  - New: `MixpanelEvents.EXCHANGE_FORM_BUY_NEXA_CLICKED`

### Ledger
- [ ] `/src/components/features/ledger/LedgerList.tsx` (2 events)
  - Current: `"Destination Address Copied"`
  - New: `MixpanelEvents.LEDGER_DESTINATION_ADDRESS_COPIED`
  
  - Current: `"Order History Toggled"`
  - New: `MixpanelEvents.LEDGER_ORDER_HISTORY_TOGGLED`

### Mobile Navigation
- [ ] `/src/components/layout/MobileFooter.tsx` (3 events)
  - Current: `"Sidebar Clicked"` (Home)
  - New: `MixpanelEvents.USER_HOME_SIDEBAR_CLICKED`
  
  - Current: `"Sidebar Clicked"` (Ledger)
  - New: `MixpanelEvents.USER_LEDGER_SIDEBAR_CLICKED`
  
  - Current: `"Sidebar Clicked"` (Profile)
  - New: `MixpanelEvents.USER_PROFILE_SIDEBAR_CLICKED`

### Notifications
- [ ] `/src/components/features/notifications/NotificationPermissionRequest.tsx` (2 events)
  - Current: `"Notification Subscribe Clicked"`
  - New: `MixpanelEvents.NOTIFICATION_SUBSCRIBE_CLICKED`
  
  - Current: `"Notification Later Clicked"`
  - New: `MixpanelEvents.NOTIFICATION_LATER_CLICKED`

## Summary

**Total Events**: ~25
**Migrated**: 13 (52%)
**Remaining**: 12 (48%)

##Priority Order

1. **HIGH**: Exchange Form (user journey critical)
2. **HIGH**: Mobile Footer (most users on mobile)
3. **MEDIUM**: Ledger List
4. **MEDIUM**: Onboarding
5. **LOW**: Notifications

## Migration Pattern

For each file:
1. Add import: `import { MixpanelEvents } from "@/lib/config/mixpanel-events";`
2. Replace string literals with config constants
3. Verify build passes
4. Test in browser

## Notes

- All event names now use `UPPERCASE_WITH_UNDERSCORES` for script compatibility
- Event names are descriptive with context (Page/Feature + Action)
- Properties remain unchanged - only event names updated

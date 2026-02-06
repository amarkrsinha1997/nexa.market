# Payment Page UX Enhancements

**Date**: 2026-02-07  
**Type**: Feature Enhancement  
**Impact**: User Experience Improvement

---

## Original Request

> For the user when the user clicks on the Buy Now and we take them to payment page
>
> I want to open the deeplinking of the UPI. immediately incase they cancel it, they should still have option to click on Pay button
>
> Rename Pay via App to Pay (in Hindi as well)
>
> And the confirmation text should also be in hindi in brackets
>
> also the confirmation button should be enabled after 20seconds show something like timer there

---

## Summary

Enhanced the payment page with three key improvements to streamline the UPI payment flow:
1. Auto-trigger UPI deeplink when users arrive at the payment page
2. Updated button labels to be bilingual (English + Hindi)
3. Implemented a 20-second timer before enabling the payment confirmation button

---

## Actions Taken

### 1. Auto-Trigger UPI Deeplink
- Added automatic UPI app opening when users land on the payment page
- Implemented one-time trigger using `deeplinkTriggered` state to prevent repeated redirections
- Added Mixpanel tracking for "UPI Deeplink Auto-Triggered" event
- Users can still manually click the "Pay" button if they cancel the UPI app

### 2. Bilingual Button Labels
- **PaymentDeeplink**: Changed "Pay via App" → "Pay (भुगतान करें)"
- **PaymentConfirmation**: Changed "I have made the payment" → "Confirm Payment (भुगतान पूर्ण करें)"
- Added proper text alignment and sizing for bilingual display

### 3. 20-Second Confirmation Timer
- Implemented countdown timer that starts at 20 seconds
- Button displays: "Wait {X}s to confirm" with Timer icon during countdown
- Button becomes enabled only after timer completes
- Enhanced UX with `disabled:cursor-not-allowed` styling
- Timer resets on each page visit for new payment sessions

---

## Files Modified

### Components
1. [PaymentDeeplink.tsx](file:///Users/apple/Documents/Nekka/nexa.market/src/components/features/payment/PaymentDeeplink.tsx)
   - Updated button text to bilingual format
   - Added text-center styling

2. [PaymentConfirmation.tsx](file:///Users/apple/Documents/Nekka/nexa.market/src/components/features/payment/PaymentConfirmation.tsx)
   - Implemented 20-second timer logic
   - Added countdown display with Timer icon
   - Updated button text to bilingual format
   - Enhanced disabled state styling

### Pages
3. [page.tsx](file:///Users/apple/Documents/Nekka/nexa.market/src/app/users/payment/[id]/page.tsx)
   - Added auto-deeplink functionality on page mount
   - Implemented one-time trigger logic
   - Added Mixpanel tracking for auto-triggered deeplinks

---

## Business Logic Impact

✅ **No business logic changed**

All changes are purely UX enhancements:
- Payment flow remains unchanged
- Order processing logic untouched
- API endpoints and data handling remain the same
- Only UI behavior and labels were modified

---

## Testing Notes

✅ **Build Status**: Successful - No TypeScript errors

**Manual testing recommended for**:
- UPI app auto-opening behavior on mobile devices
- Timer countdown accuracy  
- Bilingual text rendering across devices
- Full payment flow from Buy Now → Payment → Confirmation

---

## Mixpanel Events

**New Event Added**:
- `UPI Deeplink Auto-Triggered` - Fires when UPI app automatically opens on page load
  - Properties: `orderId`, `upiString`

**Existing Events Maintained**:
- `Pay via App Clicked` - Still fires when user manually clicks Pay button
- `Payment Confirmed By User` - Unchanged
- `Destination Address Copied` - Unchanged

---

## User Experience Flow

1. User clicks "Buy Now" on landing page
2. **NEW**: UPI app automatically opens
3. User can cancel and see payment page with:
   - QR code for scanning
   - "Pay (भुगतान करें)" button - accessible immediately
   - "Confirm Payment" button - shows 20s countdown timer
4. **NEW**: After 20 seconds, button changes to "Confirm Payment (भुगतान पूर्ण करें)"
5. User clicks confirm → standard verification flow proceeds

---

## Notes

- Auto-deeplink uses `window.location.href` for broad browser compatibility
- Timer provides buffer time for users to complete UPI transaction before confirming
- Bilingual labels improve accessibility for Hindi-speaking users
- All changes are backwards compatible with existing payment flows

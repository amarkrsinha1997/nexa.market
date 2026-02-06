# Payment Page Layout Restructuring

**Date**: 2026-02-07  
**Type**: UI Enhancement  
**Impact**: Layout Reorganization

---

## Original Request

> Move the Amount above the pay button
> and remove the UPI address from the UI not needed
> Dcrease the QR size and move the QR above then Amount, NEXA and Buttons and below the address

**Note**: User also updated the confirmation timer from 20 to 30 seconds.

---

## Summary

Restructured the payment page layout to improve visual hierarchy and remove unnecessary elements:
1. Decreased QR code size from 200px to 150px
2. Reorganized element order: Destination Wallet → QR Code → Amount Details → Payment Buttons
3. Removed UPI address copy section (no longer needed)
4. Timer updated from 20 to 30 seconds (user modification)

---

## Actions Taken

### 1. QR Code Size Reduction
- Reduced QR code from 200px to 150px for better mobile experience
- Maintains scannability while taking less screen space

### 2. Layout Reorganization
**New Order**:
1. Destination Wallet (NEXA address with copy button)
2. QR Code (150px, centered)
3. QR scan instructions
4. Total Payable (INR amount)
5. NEXA amount you will receive
6. Payment buttons (Pay + Confirm Payment)

**Previous Order**:
1. Total Payable (INR amount)
2. NEXA amount
3. Destination Wallet
4. QR Code (200px)
5. QR scan instructions
6. UPI address copy section
7. Payment buttons

### 3. Removed UPI Address Section
- Removed `<UPICopy>` component from payment page
- Removed import statement for `UPICopy`
- Simplified user interface

### 4. Timer Update
- User manually updated timer from 20 seconds to 30 seconds
- Provides more time for users to complete UPI transactions

---

## Files Modified

### Components
1. [PaymentQRCode.tsx](file:///Users/apple/Documents/Nekka/nexa.market/src/components/features/payment/PaymentQRCode.tsx)
   - Reduced QR code size: `size={200}` → `size={150}`

### Pages
2. [page.tsx](file:///Users/apple/Documents/Nekka/nexa.market/src/app/users/payment/[id]/page.tsx)
   - Reorganized layout structure
   - Removed UPI address copy section (`<UPICopy>` component)
   - Removed unused import for `UPICopy`
   - Moved amount display below QR code and above payment buttons

### User Modifications
3. [PaymentConfirmation.tsx](file:///Users/apple/Documents/Nekka/nexa.market/src/components/features/payment/PaymentConfirmation.tsx)
   - Timer increased: `useState(20)` → `useState(30)` (modified by user)

---

## Business Logic Impact

✅ **No business logic changed**

All changes are purely UI/UX improvements:
- Payment flow remains unchanged
- Order processing logic untouched
- API endpoints unaffected
- Data handling remains the same

---

## Visual Hierarchy Improvements

**Benefits**:
1. **QR code more prominent** - Now appears immediately after destination address
2. **Cleaner interface** - Removed redundant UPI address copy section
3. **Better mobile experience** - Smaller QR code takes less vertical space
4. **Logical flow** - Users see where funds will go (destination), how to pay (QR), what they're paying (amounts), then action buttons
5. **More time to pay** - 30-second timer gives users adequate time to complete UPI transaction

---

## User Experience Flow

1. User arrives at payment page → **UPI app auto-opens**
2. User sees **Destination Wallet** address at top
3. User sees **QR Code** prominently displayed
4. User sees **scan instructions**
5. User sees **Amount details** (INR + NEXA)
6. User can click **"Pay (भुगतान करें)"** button if they cancelled auto-deeplink
7. After **30 seconds**, user can click **"Confirm Payment (भुगतान पूर्ण करें)"**

---

## Technical Notes

- Removed unused `UPICopy` import to keep code clean
- Maintained all existing Mixpanel tracking
- Layout changes use existing Tailwind classes
- No new dependencies added
- Fully backward compatible with existing payment flow

# Release Notes: Payment Flow & Expiry Refinements

**Date:** 2026-02-03
**Original Prompt:** "It should open the next page which comes after this... Also all the orders which are older then 30min in ordercreated state should be mark rejected... Also all the UPI link will have orderId"

## Summary
Refined the payment flow to improve user experience and system integrity. Implemented auto-expiry for stale orders, restricted access to payment pages for non-active orders, and improved UPI transaction tracking.

## Actions Taken
- [x] **Backend**: Updated `cron/expire-orders` to auto-reject orders older than 30 minutes in `ORDER_CREATED` state.
- [x] **Backend**: Updated UPI builder to include "Order: [ID]" in the transaction note.
- [x] **Frontend**: Created new **Order Details** page (`/users/orders/[id]`) for viewing past order status.
- [x] **Frontend**: Added auto-redirect to Payment Page: if order is not `ORDER_CREATED`, it redirects to Order Details.
- [x] **Frontend**: Updated **Ledger** (List & Table) to be clickable, navigating to the appropriate page based on order status.

## Impact on Business Logic
- **Order Expiry**: Stale orders (>30 mins) are now automatically invalidated (set to `REJECTED`).
- **User Flow**: Users can no longer access the payment screen for orders that are already paid, verified, or rejected.

## Files Touched
- `src/app/api/cron/expire-orders/route.ts`
- `src/app/api/orders/[id]/confirm/route.ts`
- `src/app/users/orders/[id]/page.tsx` (New)
- `src/app/users/payment/[id]/page.tsx`
- `src/components/features/ledger/LedgerList.tsx`
- `src/components/features/ledger/LedgerTable.tsx`

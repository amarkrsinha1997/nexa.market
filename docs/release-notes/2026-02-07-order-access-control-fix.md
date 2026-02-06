# Order Access Control Fix

**Date**: 2026-02-07
**Type**: Security & UX Enhancement
**Impact**: Restricted data visibility for admins on personal pages.

---

## Original Request
> In the user Ledger the user should be only able to see there own ledger not others based on there Id fix the API
> I am able to see others ledger as well

---

## Summary
Fixed an issue where users with Admin or Superadmin roles could see all system orders on their personal ledger page. The API now defaults to showing only the logged-in user's orders, regardless of their role. A new `adminView` parameter must be explicitly passed (and is verified against the user's role) to see the global ledger.

---

## Actions Taken
- **API Service**: Modified `OrdersService.getOrders` to enforce `{ userId: currentUser.id }` in the database query unless `adminView` is true and the user is an admin.
- **API Route**: Updated `/api/orders` to parse the `adminView` flag from query parameters.
- **Frontend**: Updated `LedgerPage` to only request the global view when the `adminView` prop is active (used in `/admin/ledger`).

---

## Business Logic Status
✅ **Business logic remains unchanged.**  
The update improves security and UX by ensuring users only see relevant data by default.

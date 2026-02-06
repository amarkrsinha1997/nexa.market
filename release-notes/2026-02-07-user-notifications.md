# Release Note - User Notifications for Order Status Updates

**Date**: 2026-02-07

### Original Chat Prompt
Send notification to the user as well incase there order has been trasnfered or rejected. Not on approve or checking of the admin. Only when transferred or rejected.

### Chat Summary
Implemented real-time push notifications for users when their orders reach a final state (Transferred or Rejected). Previously, users were only notified on rejection in some cases, and never when funds were released. Now, users receive immediate feedback when their payment is successfully processed (Transferred) or if an admin rejects their order.

### Actions Taken
- Modified `OrdersService.processDecision` to send a notification to the user upon successful `RELEASE_PAYMENT`.
- Modified `OrdersService.reprocessPayment` to send a notification to the user upon successful manual retry of fund release.
- Ensured user rejection notifications are sent with the provided reason.
- Updated notification messages to be more user-friendly and informative.

### Files Touched
- [orders.service.ts](file:///Users/apple/Documents/Nekka/nexa.market/src/lib/services/orders.service.ts)

### Business Logic Confirmation
Business logic remains unchanged. The core order processing flow is preserved; only auxiliary notification triggers for user updates were added.

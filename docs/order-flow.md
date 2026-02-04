# Order Flow Documentation

This document outlines the complete lifecycle of a Nexa purchase order, from creation to fund release.

## 1. Order Creation
- **Action**: User enters amount INR.
- **System**:
    - Fetches current NEXA price.
    - Selects an active UPI ID using load balancing.
    - Creates `Order` record in database.
    - **Status**: `ORDER_CREATED`
    - **Lifecycle Event**: `ORDER_CREATED` (Actor: User)

## 2. Payment Confirmation
- **Action**: User scans payment QR code and enters Transaction ID (UTR).
- **System**:
    - Updates order status.
    - **Status**: `VERIFICATION_PENDING`
    - **Lifecycle Event**: `PAYMENT_CONFIRMED` (Actor: User)

## 3. Admin Verification (Locking)
- **Action**: Admin clicks "Start Checking" on an order.
- **System**:
    - "Locks" the order to that specific admin to prevent collisions.
    - **Status**: `VERIFYING`
    - **Lifecycle Event**: `CHECK` (Actor: Admin)

## 4. Admin Decision
- **Option A: Approve**
    - **Action**: Admin verifies payment in bank account and clicks "Approve".
    - **System**:
        - Moves order to transfer queue.
        - **Status**: `ADMIN_APPROVED`
        - **Lifecycle Event**: `APPROVE` (Actor: Admin)
        - *Note*: In the Admin Ledger, this appears under the "TRANSFER PENDING" tab.

- **Option B: Reject**
    - **Action**: Admin clicks "Reject" (e.g., invalid UTR).
    - **System**:
        - Marks order as rejected.
        - **Status**: `REJECTED`
        - **Lifecycle Event**: `REJECT` (Actor: Admin)

## 5. Fund Transfer (Blockchain Interaction)
- **Automatic**: System attempts to transfer NEXA tokens from Hot Wallet to User's Wallet.
- **Success**:
    - **Status**: `RELEASE_PAYMENT`
    - **Lifecycle Event**: `RELEASE_PAYMENT` (Actor: SYSTEM)
    - **UI**: Shows "NEXA RELEASED" / "Completed".

- **Failure**:
    - **Reason**: Insufficient funds, network error, etc.
    - **Status**: Remains `ADMIN_APPROVED` but adds `paymentFailureReason`.
    - **Lifecycle Event**: `PAYMENT_ATTEMPT_FAILED` (Actor: SYSTEM)
    - **UI**:
        - Shows "Transfer Pending" (Orange).
        - Displays Red Warning Flag with failure reason.
        - Shows "Retry Payment" button.

## 6. Payment Retry (Manual Intervention)
- **Action**: Admin resolves issue (e.g., tops up wallet) and clicks "Retry Payment".
- **System**:
    - Re-attempts transfer.
    - **On Success**: See Step 5 (Success).
    - **On Failure**: Adds `PAYMENT_RETRY_FAILED` event and remains in failed state.

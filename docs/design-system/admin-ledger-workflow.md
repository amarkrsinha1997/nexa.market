# Admin Ledger Workflow

## Overview

The Admin Ledger provides administrators with a comprehensive view of all payment orders in the system, organized into three distinct tabs based on order status.

## Status Categories

### 1. NEXA PENDING

Orders requiring admin attention and verification.

**Included Order Statuses:**
- `VERIFICATION_PENDING` - Payment submitted by user, awaiting admin review
- `VERIFYING` - Order locked by an admin who is currently checking it
- `ADMIN_APPROVED` - Order approved by admin, ready for payment release

**Available Actions:**
- **Check**: Lock the order for verification (only if not already locked)
- **Approve**: Mark order as approved (only for the admin who locked it)
- **Reject**: Reject the order (only for the admin who locked it)

### 2. NEXA RELEASED

Orders that have been processed and payment released.

**Included Order Statuses:**
- `VERIFIED` - Payment verified (legacy status)
- `RELEASE_PAYMENT` - Payment release in progress
- `PAYMENT_SUCCESS` - Payment successfully released to user

**Available Actions:**
- View only (no actions required)

### 3. REJECTED

Orders that have been rejected by admins.

**Included Order Statuses:**
- `REJECTED` - Order rejected during verification

**Available Actions:**
- View only (no actions required)

## Admin Workflow

### Order Verification Process

1. **Pending Orders**: Admin views orders in "NEXA PENDING" tab
2. **Lock Order**: Admin clicks "Check" button to lock order (sets `checkedBy` field)
3. **Review**: Admin reviews payment details, user information, and transaction ID
4. **Decision**: 
   - Click **Approve** to move order to `ADMIN_APPROVED` status
   - Click **Reject** to move order to `REJECTED` status
5. **Lifecycle Tracking**: Each action is recorded in the order's `lifecycle` field

### Order Locking Mechanism

- Only one admin can check an order at a time
- When an admin clicks "Check", the order status changes to `VERIFYING`
- The `checkedBy` field stores the admin's user ID
- Other admins see "Checking..." indicator and cannot modify the order
- Only the admin who locked the order can approve/reject it

### Security

All admin actions are protected:
- Admin routes verify user role (`ADMIN` or `SUPERADMIN`)
- Order check and decision APIs validate admin permissions
- Only the locking admin can make approval/rejection decisions

## API Endpoints

### GET /api/orders

Fetch orders with optional status filtering for admins.

**Query Parameters:**
- `page` (number): Page number for pagination
- `limit` (number): Items per page
- `status` (string, admin only): Filter by status category
  - `pending`: Returns NEXA_PENDING orders
  - `released`: Returns NEXA_RELEASED orders
  - `rejected`: Returns REJECTED orders

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [...],
    "hasMore": boolean,
    "total": number
  }
}
```

### POST /api/admin/orders/[id]/check

Lock an order for verification.

**Request Body:**
```json
{
  "userId": "admin-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated order */ }
}
```

### POST /api/admin/orders/[id]/decision

Approve or reject an order.

**Request Body:**
```json
{
  "userId": "admin-user-id",
  "decision": "APPROVE" | "REJECT",
  "reason": "optional reason text"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated order */ }
}
```

## Database Schema

### Order Model Fields

```prisma
model Order {
  id            String      @id @default(uuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  
  amountINR     Float
  nexaAmount    Float
  nexaPrice     Float
  
  status        OrderStatus @default(ORDER_CREATED)
  
  paymentQrId   String
  transactionId String?
  
  verifiedBy    String?     // Legacy field
  checkedBy     String?     // Admin who is checking the order
  lifecycle     Json?       // Audit log of status changes
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

enum OrderStatus {
  ORDER_CREATED
  PAYMENT_INIT
  VERIFICATION_PENDING
  VERIFYING
  ADMIN_APPROVED
  REJECTED
  VERIFIED
  RELEASE_PAYMENT
  PAYMENT_SUCCESS
  PAYMENT_FAILED
}
```

### Lifecycle Tracking

The `lifecycle` field stores an array of events:

```typescript
interface LifecycleEvent {
  status: string;
  timestamp: string; // ISO 8601
  actorId: string;   // User ID who performed the action
  note?: string;     // Optional note/reason
}
```

## UI Components

### LedgerTable

Displays orders in table format with:
- Date
- User photo, name, and email (admin view only)
- Order ID
- Transaction reference ID
- Amount (INR)
- Nexa amount
- Status badge
- Action buttons (admin view only)

### Action Buttons

**Check Button** (Blue)
- Visible when: Order status is `VERIFICATION_PENDING` and not locked
- Action: Locks order and changes status to `VERIFYING`

**Approve Button** (Green)
- Visible when: Order is locked by current admin
- Action: Changes status to `ADMIN_APPROVED`

**Reject Button** (Red)
- Visible when: Order is locked by current admin
- Action: Changes status to `REJECTED`

**Locked Indicator** (Yellow)
- Visible when: Order is locked by another admin
- Displays: "Checking..." message

## Best Practices

1. **Always verify payment details** before approving
2. **Provide reasons** when rejecting orders
3. **Don't leave orders locked** - make a decision promptly
4. **Check user information** to prevent fraud
5. **Review transaction IDs** for authenticity

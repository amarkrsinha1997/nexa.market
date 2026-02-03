# Admin Ledger Lifecycle & Audit Trail

## Overview

The Admin Ledger now includes comprehensive lifecycle tracking for all orders. Every admin action (check, approve, reject) is recorded with full admin details (name, email, photo, userId), enabling complete audit trails and transparency.

---

## Lifecycle Structure

Each lifecycle event contains:
```typescript
{
    status: string;              // New order status
    timestamp: string;           // ISO 8601
    actorId: string;             // Admin user ID
    actorName: string | null;    // Admin full name
    actorEmail: string;          // Admin email
    actorPicture: string | null; // Admin profile photo URL
    action: 'CHECK' | 'APPROVE' | 'REJECT' | 'UPDATE';
    note?: string;               // Optional reason/note
    isSuperadminOverride?: boolean; // True if superadmin overrode lock
}
```

---

## Superadmin Privileges

SUPERADMIN role has special override capabilities:

- Can check (lock) orders already locked by another admin
- Can approve/reject orders locked by other admins
- Override actions are flagged with `isSuperadminOverride: true`
- UI shows purple shield icon for override actions

### Security Note
Override events are fully logged in lifecycle for audit purposes.

---

## Admin Actions

### Check Order
**API**: `POST /api/admin/orders/[id]/check`

- Locks order for admin review
- Changes status to `VERIFYING`
- Records admin details in lifecycle
- SUPERADMIN can override existing locks

### Approve/Reject Order
**API**: `POST /api/admin/orders/[id]/decision`

**Request Body:**
```json
{
    "userId": "admin-id",
    "decision": "APPROVE" | "REJECT",
    "reason": "Optional reason text"
}
```

- Updates order status (`ADMIN_APPROVED` or `REJECTED`)
- Records decision with admin details in lifecycle
- SUPERADMIN can override lock ownership

---

## UI Features

### Admin Ledger Table
- Expandable rows (click chevron to view lifecycle)
- User details column (photo, name, email)
- Action buttons (Check, Approve, Reject)
- SUPERADMIN override indicators (purple shield)
- Lock status display

### Lifecycle Viewer
Displays timeline of all order events:
- Admin avatar and name
- Action type with icon (Check, Approve, Reject)
- Timestamp
- Notes/reasons
- SUPERADMIN badge for overrides

---

## Permission Matrix

| Action | Regular Admin | SUPERADMIN |
|--------|--------------|------------|
| Check unlocked order | ✅ | ✅ |
| Check locked order | ❌ | ✅ (Override) |
| Approve/reject own locked order | ✅ | ✅ |
| Approve/reject others' locked order | ❌ | ✅ (Override) |

---

## Audit Trail

All admin actions are permanently logged in `Order.lifecycle` field. This provides:
- Complete history of who did what and when
- Reasons for approval/rejection
- Detection of SUPERADMIN overrides
- Accountability and transparency

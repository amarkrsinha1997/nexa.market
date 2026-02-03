# UPI Management System Documentation

## Overview

The UPI Management system provides comprehensive control over payment methods with intelligent routing, time-based scheduling, and priority-based rotation. Admins can manage UPIs through a dedicated UI, and the system automatically selects the optimal UPI for each transaction.

---

## Database Schema

### UPI Model

- **vpa**: UPI Virtual Payment Address (unique identifier)
- **merchantName**: Optional display name
- **isActive**: Master switch - UPI won't be selected if false
- **scheduleStart/scheduleEnd**: Time range when UPI is available (HH:mm format). Null = 24/7
- **priority**: Selection priority (0 = highest)
- **lastUsedAt**: Timestamp of last usage (for round-robin)
- **usageCount**: Total number of times selected
- **notes**: Admin notes/comments
- **maxDailyLimit**: Optional transaction limit (future use)

---

## UPI Selection Logic

### Algorithm

1. Filter by `isActive = true`
2. Filter by schedule (current time within scheduleStart-scheduleEnd)
3. Sort by priority (ascending)
4. Round-robin within same priority (oldest lastUsedAt first)
5. Update lastUsedAt and usageCount after selection

### Time-Based Scheduling

- **Format**: HH:mm (24-hour, e.g., "09:00")
- **Timezone**: Server local timezone
- **Overnight Schedules**: Supported (e.g., "22:00" to "06:00")
- **24/7**: Leave both fields null

---

## API Endpoints

All require admin authentication.

- `GET /api/admin/upi` - Fetch all UPIs
- `POST /api/admin/upi` - Create new UPI
- `PUT /api/admin/upi/[id]` - Update UPI
- `DELETE /api/admin/upi/[id]` - Delete UPI
- `POST /api/admin/upi/[id]/toggle` - Toggle active status

---

## Admin UI (`/admin/upi`)

**Features:**
- Table showing all UPIs with status, schedule, priority, usage
- Add UPI button (opens modal)
- Toggle switches for enable/disable
- Edit/delete buttons with confirmation
- Schedule display (shows time range or "24/7")

**Form Fields:**
- UPI ID (required, unique)
- Merchant Name
- Schedule Start/End (time pickers)
- Priority (number)
- Max Daily Limit
- Notes
- Active checkbox

---

## Best Practices

1. **Always have a fallback**: Configure at least one 24/7 UPI
2. **Stagger schedules**: Ensure coverage across all hours
3. **Use priority wisely**: Priority 0 for most reliable methods
4. **Monitor usage**: Check usageCount for rotation verification

### Example Configuration
```
UPI A: priority=0, 24/7 (primary)
UPI B: priority=0, 24/7 (backup, rotates with A)
UPI C: priority=1, 09:00-17:00 (business hours only)
```

---

## Troubleshooting

**No UPIs Available:**
- Check all UPIs are not inactive
- Verify schedules cover current time
- Ensure at least one UPI exists

**UPI Not Selected:**
- Check priority (lower = higher precedence)
- Verify isActive = true
- Review schedule times
- Check lastUsedAt vs other same-priority UPIs

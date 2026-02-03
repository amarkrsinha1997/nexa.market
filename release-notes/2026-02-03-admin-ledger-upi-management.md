# Release Notes - February 3, 2026

## Date: 2026-02-03

## Summary
Implemented Admin Ledger lifecycle tracking, SUPERADMIN privileges, and comprehensive UPI Management system.

## Changes

### 1. Admin Ledger Lifecycle Tracking
- Created `LifecycleEvent` interface with full admin details
- Check/decision routes now record admin name, email, photo, userId
- Added expandable lifecycle timeline to LedgerTable
- Lifecycle events include timestamps, actions, notes

### 2. SUPERADMIN Override
- SUPERADMIN can check/approve/reject any order regardless of lock
- Override actions flagged in lifecycle
- UI shows purple shield icon for overrides

### 3. API Cleanup
- **Deleted:** `/api/admin/orders/[id]/verify` (deprecated)

### 4. UPI Management System

#### Database
**New UPI fields:**
- `scheduleStart/scheduleEnd`: Time-based scheduling (HH:mm)
- `priority`: Selection priority (lower = higher)
- `lastUsedAt`, `usageCount`: Rotation tracking
- `notes`, `maxDailyLimit`: Metadata

#### Backend
- `UPISelectorService`: Intelligent selection with scheduling & rotation
- Updated UPI API routes for new fields
- Order creation uses intelligent selector
- Added `/admin/upi/[id]` (PUT/DELETE) and `/admin/upi/[id]/toggle` endpoints

#### Admin UI
- `/admin/upi` page with full UPI management
- Add/edit modal with all fields
- Toggle, delete, priority display
- Schedule display ("24/7" or time range)

## Files Modified
- `prisma/schema.prisma` - UPI model extended
- `src/types/order.ts` - LifecycleEvent interface
- `src/app/api/admin/orders/[id]/{check,decision}/route.ts` - Lifecycle tracking
- `src/app/api/orders/route.ts` - UPI selector integration
- `src/app/api/admin/upi/route.ts` - Enhanced endpoints
- `src/components/features/ledger/LedgerTable.tsx` - Expandable lifecycle

## Files Created
- `src/lib/services/upi-selector.service.ts`
- `src/components/features/ledger/LifecycleViewer.tsx`
- `src/app/admin/upi/page.tsx`
- `src/components/features/admin/UPIFormModal.tsx`
- `src/app/api/admin/upi/[id]/route.ts`
- `src/app/api/admin/upi/[id]/toggle/route.ts`
- `docs/upi-management.md`
- `docs/admin-ledger-lifecycle.md`

## Business Logic Impact
✅ No business logic changes - All additive enhancements

## Migration
Database migration applied via `npx prisma db push`. Existing UPIs default to 24/7, priority 0.

---
**Date:** 2026-02-03  
**Chat ID:** ae8a71c9-a825-4b25-b5b3-9cb0ccf7be59

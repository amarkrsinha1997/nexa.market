# Release Note - Skeleton Loaders & Admin Contact Icons Fix

**Date**: 2026-02-07

### Original Chat Prompt
Add Skeletons in User App Views For Ledger, Profile & Home
For Admin - Ledger, Order Detail, Profile
instead of Loader

The Phone and Whatsapp icon should be only in admin page not in user page

### Chat Summary
Improved user experience by replacing all spinner/text loading states with skeleton screens across User and Admin views. Also fixed Phone and WhatsApp contact icons to only appear in admin views, removing them from user-facing ledger pages.

### Actions Taken

#### Skeleton Loaders
- Created 4 reusable skeleton components matching page structures
- Replaced spinners with skeletons in User pages (Ledger, Home, Profile)
- Replaced spinners with skeletons in Admin pages (Ledger, Order Details, Profile)
- Used `animate-pulse` for shimmer effect on all skeletons

#### Admin Contact Icons Fix  
- Added `isAdminView` conditional check to Phone/WhatsApp icons in `LedgerTable` and `LedgerList`
- Icons now only render when current user is ADMIN or SUPERADMIN
- Removed icon visibility from user-facing ledger views

### Files Touched

**Skeleton Components (New)**
- `src/components/skeletons/LedgerSkeleton.tsx`
- `src/components/skeletons/ProfileSkeleton.tsx`
- `src/components/skeletons/ExchangeFormSkeleton.tsx`
- `src/components/skeletons/OrderDetailsSkeleton.tsx`

**User Pages**
- `src/app/users/ledger/page.tsx`
- `src/app/users/home/page.tsx`
- `src/app/users/profile/page.tsx`

**Admin Pages**
- `src/app/admin/profile/page.tsx`
- `src/app/admin/orders/[id]/page.tsx`

**Ledger Components**
- `src/components/features/ledger/LedgerTable.tsx`
- `src/components/features/ledger/LedgerList.tsx`

### Business Logic Confirmation
Business logic remains unchanged. This update only improves the loading UX and restricts admin-only features (contact icons) from appearing in user views.

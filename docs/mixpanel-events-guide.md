# Mixpanel Events Configuration Guide

## Overview

All Mixpanel event names are now centralized in `/src/lib/config/mixpanel-events.ts`. This ensures consistency across the application and makes it easier to manage and update event names.

## File Location

```
/src/lib/config/mixpanel-events.ts
```

## Naming Conventions

### 1. Page Views
**Format**: `[PageName] Page View`

**Example**:
```typescript
MixpanelEvents.PAGE_VIEW("Landing Page") // "Landing Page Page View"
MixpanelEvents.PAGE_VIEW("User Dashboard") // "User Dashboard Page View"
```

### 2. Element Clicks
**Format**: `[Element Name] Clicked`

**Examples**:
- `MixpanelEvents.LANDING_BUY_NOW_CLICKED` → "Landing Buy Now Clicked"
- `MixpanelEvents.PAY_VIA_APP_CLICKED` → "Pay via App Clicked"
- `MixpanelEvents.SIDEBAR_CLICKED` → "Sidebar Clicked"

### 3. Auto-Triggered Events
**Format**: `[Event Name] Auto Triggered`

**Example**:
- `MixpanelEvents.UPI_DEEPLINK_AUTO_TRIGGERED` → "UPI Deeplink Auto Triggered"

### 4. Completed Actions
**Format**: Use past tense descriptive names

**Examples**:
- `MixpanelEvents.ONBOARDING_COMPLETED` → "Onboarding Completed"
- `MixpanelEvents.ORDER_REJECTED` → "Order Rejected"
- `MixpanelEvents.PAYMENT_CONFIRMED_BY_USER` → "Payment Confirmed By User"

## Usage

### Import the Config

```typescript
import { MixpanelEvents } from "@/lib/config/mixpanel-events";
import { MixpanelUtils } from "@/lib/utils/mixpanel";
```

### Track Events

**Simple Event:**
```typescript
MixpanelUtils.track(MixpanelEvents.LANDING_BUY_NOW_CLICKED);
```

**Event with Properties:**
```typescript
MixpanelUtils.track(MixpanelEvents.PAYMENT_CONFIRMED_BY_USER, { 
    orderId: id, 
    amount: order.amountINR 
});
```

**Dynamic Page View:**
```typescript
MixpanelUtils.track(MixpanelEvents.PAGE_VIEW("User Dashboard"), {
    "Page Name": "User Dashboard",
    path: "/users/home"
});
```

## Benefits

### 1. Consistency
All event names follow a standardized naming convention, making analytics easier to understand and filter.

### 2. Type Safety
TypeScript autocomplete helps prevent typos and ensures you're using valid event names.

### 3. Easy Updates
Change an event name in one place, and it updates everywhere it's used.

### 4. Documentation
All events are documented in one central location, making it easy to see what events exist.

### 5. Searchability
In Mixpanel, you can now easily filter events by category:
- All clicks: Search for "Clicked"
- All page views: Search for "Page View"
- All auto events: Search for "Auto Triggered"

## Updated Files

The following files have been updated to use the centralized config:

1. **MixpanelProvider.tsx** - Page view tracking
2. **PaymentDeeplink.tsx** - Pay button click tracking
3. **Payment page** - Payment confirmation, auto-deeplink, and address copy tracking

## Adding New Events

When adding a new Mixpanel event:

1. Open `/src/lib/config/mixpanel-events.ts`
2. Add the event name following the naming conventions
3. Add it to the appropriate category section
4. Use the constant in your tracking call

**Example:**
```typescript
// In mixpanel-events.ts
export const MixpanelEvents = {
    // ... existing events
    
    // NEW EVENT
    USER_AVATAR_UPLOADED: "User Avatar Uploaded",
};

// In your component
import { MixpanelEvents } from "@/lib/config/mixpanel-events";
MixpanelUtils.track(MixpanelEvents.USER_AVATAR_UPLOADED, { fileSize: size });
```

## Migration Note

Not all files have been migrated to use the centralized config yet. This is an ongoing process. When working on a file with Mixpanel tracking, update it to use `MixpanelEvents` constants.

## Event Categories

Events are organized into these categories:

- **Authentication & Onboarding**
- **Navigation**
- **Landing Page**
- **Exchange / Buy Nexa**
- **Payment Flow**
- **User Profile & Wallet**
- **Ledger**
- **Admin - Orders**
- **Admin - Profile**  
- **Admin - Settings**
- **Admin - UPI Management**
- **Notifications**

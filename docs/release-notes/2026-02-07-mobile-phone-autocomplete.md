# Mobile Phone Autocomplete Support

**Date**: 2026-02-07
**Type**: UX Enhancement
**Impact**: Improved mobile onboarding and profile updates.

---

## Original Request
> For mobile input is there a way to pick it automatically from a mobile number suggestion popup like how it is there in most application in browser?

---

## Summary
Enhanced the `PhoneInput` component with standard HTML attributes to trigger browser-level phone number suggestions. This allows users on mobile devices to quickly pick their phone number from a suggestion popup instead of typing it manually.

---

## Actions Taken
- Modified `src/components/ui/PhoneInput.tsx` to include:
    - `autoComplete="tel"`: Standard hint for browsers to suggest phone numbers.
    - `inputMode="tel"`: Signals to mobile browsers to show the telephone keypad.
    - `id="phone"` and `name="phone"`: Helps browser heuristics identify the field correctly.

---

## Business Logic Status
✅ **Business logic remains unchanged.**  
The update is purely a frontend UX enhancement using standard browser attributes.

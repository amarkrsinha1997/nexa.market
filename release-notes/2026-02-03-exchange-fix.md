# Release Notes: Exchange Rate Fix

**Date:** 2026-02-03
**Original Prompt:** "In the Home page for Exchange the Price is not being fetched and nexa is not being calculated based on that when I enter an amount??"

## Summary
Fixed an issue where the Nexa exchange rate was not being fetched from the API, causing the Exchange form to use hardcoded default values. The `useNexaPrice` hook was updated to properly await the async price fetch and update component state.

## Root Cause
The `useNexaPrice` hook was calling `PriceSchedulerService.forceFetch()` without awaiting it or handling the returned promise. This caused the hook to never receive the fetched price data.

## Actions Taken
- [x] **Frontend**: Updated `src/lib/hooks/useNexaPrice.ts` to:
  - Wrap `forceFetch()` call in an async IIFE
  - Properly await the fetch result
  - Update state with the fetched price

## Impact on Business Logic
- **None**: This is a bug fix for data fetching.

## Files Touched
- `src/lib/hooks/useNexaPrice.ts`

## Verification
- ✅ API call to `/api/config` now occurs on page load
- ✅ Exchange rate correctly displays: 10,000,000 NEXA ≈ ₹500
- ✅ Calculation verified: 500 INR → 10,000,000 NEXA


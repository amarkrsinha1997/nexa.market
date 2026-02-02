# User Onboarding Feature

## Overview
The onboarding flow is designed to collect essential user information immediately after signup/first login.

## Requirements
1.  **Trigger:** First-time login (user has no DOB/Phone/Address set).
2.  **Fields:**
    *   **Date of Birth (DOB):**
        *   Mobile: Centered calendar modal/overlay.
        *   Desktop: Inline calendar on the page.
    *   **Phone Number:** Standard input (no validation for now).
    *   **Nexa Wallet Address:** Input with validation.
3.  **Validation:**
    *   Nexa Address must be validated using `libnexa-ts` (`Address.isvalid`).

## Technical Implementation
-   **Route:** `/onboarding`
-   **State:** Form state management for the 3 fields.
-   **Backend:** Update `User` model to store these fields (if not already present).
-   **Libraries:** `libnexa-ts` (for address validation), generic UI components for DatePicker.

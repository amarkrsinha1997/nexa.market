# Onboarding Design System

## Theme
The onboarding flow enforces a **Dark Mode** aesthetic to align with the premium feel of the platform.

### Colors
-   **Background:** `#0f1016` (Deep dark blue/gray)
-   **Card Background:** `#1a1b23` (Slightly lighter dark)
-   **Input Background:** `#2a2b36`
-   **Primary Accent:** Blue 600 (`#2563eb`)
-   **Text Primary:** White (`#ffffff`)
-   **Text Secondary:** Gray 400 (`#9ca3af`)

## Icons
We use **Lucide React** for all iconography to ensure consistency and performance.
*   **Calendar:** `Calendar`
*   **Phone:** `Phone`
*   **Wallet:** `Wallet`
*   **Actions:** `Clipboard` (Paste), `CheckCircle2` (Submit)

## Components
### Onboarding Form
-   **Date Picker:** `react-day-picker` styled with custom CSS variables to match the dark theme.
-   **Inputs:** Custom styled with dark backgrounds and borders that light up on focus.
-   **Modals:** Dark backdrop (`bg-black/80`) with backdrop blur for immersive experience on mobile.

## Validation
-   Live validation with immediate feedback (Red border + Error message).
-   Nexa Address validated via `libnexa-ts`.

# Design System: Theming & Colors

## Global Theme Rule
**All pages and components within the application MUST use the Dark Theme.**
Light mode is strictly prohibited unless explicitly authorized for specific print-views or legacy integrations that frame external content.

## Color Palette

### Backgrounds
- **Page Background:** `#0f1016` (Deep dark blue/gray) -> Tailwinds: `bg-[#0f1016]`
- **Component Background:** `#1a1b23` (Card/Container) -> Tailwinds: `bg-[#1a1b23]`
- **Input/Form Background:** `#2a2b36` -> Tailwinds: `bg-[#2a2b36]`
- **Overlay/Modal:** `bg-black/80` or `bg-[#1a1b23]`

### Text
- **Primary:** `#ffffff` (White) -> `text-white`
- **Secondary:** `#9ca3af` (Gray 400) -> `text-gray-400`
- **Tertiary/Muted:** `#6b7280` (Gray 500) -> `text-gray-500`

### Accents & Borders
- **Primary Brand:** `#2563eb` (Blue 600) -> `text-blue-600` / `bg-blue-600`
- **Border:** `#374151` (Gray 700) -> `border-gray-700`
- **Border Subtle:** `#1f2937` (Gray 800) -> `border-gray-800`

## Structure Rules

### Layouts
- Main `div` containers must always have `min-h-screen` and `bg-[#0f1016]`.
- Navigation bars (Top/Bottom) must match the dark aesthetic (`bg-[#1a1b23]` or `bg-[#0f1016]` with borders).

### Components
- **Inputs**: Dark background, light text.
- **Cards**: Darker background than page, lighter than inputs (or vice-versa depending on depth).
- **Icons**: White or Gray 400 default, Brand Color for active states.

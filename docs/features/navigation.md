# Responsive Navigation Feature

## Overview
A responsive navigation system that adapts to mobile (app-like feel) and desktop environments.

## Requirements
*   **Mobile (< 768px):** Fixed Bottom Footer Menu (Native app style).
*   **Desktop (>= 768px):** Hamburger Menu (Drawer or Dropdown).

## Technical Implementation
-   **Layout Component:** A wrapper layout that conditionally renders the appropriate menu based on screen size (CSS media queries or responsive hooks).
-   **Components:**
    *   `MobileFooter`: Fixed bottom, icons + labels.
    *   `DesktopHeader`: Includes Hamburger button.
    *   `Drawer/Sidebar`: Triggered by Hamburger.

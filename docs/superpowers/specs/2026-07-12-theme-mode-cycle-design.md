# Theme Mode Cycle Design

## Goal

Make the top-right theme control clearly express and select the three supported theme modes.

## Interaction

The settings store continues to use the existing `auto`, `light`, and `dark` values. New users start in `auto`, which follows the operating system preference.

The top-right control cycles in this order:

`auto` → `light` → `dark` → `auto`

Its visible icon communicates the current mode:

- `auto`: `Monitor`
- `light`: `Sun`
- `dark`: `Moon`

The accessible label states the current mode and the mode the next activation will select.

## Scope

Update only the list page's theme button and its focused tests. Keep the current button dimensions, visual treatment, theme persistence, and document-level theme application unchanged.

## Verification

Add or update focused tests that verify the initial automatic-mode control and each step in the mode cycle. Run the relevant page test suite and the production build.

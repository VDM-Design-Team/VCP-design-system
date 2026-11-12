---
bump: major
---
### `Button`, `IconButton`, `Menu`, `DetailCardMenu`, `StatusProgression`: `danger` is now `critical-primary`, and menu tones say `critical` (November 2026)

The system's colours and its tones (`Banner`, `Toast`, `StatusTag`, the delete dialogs) already say **critical** (`accent.critical.*`). The variants and tones that said **danger** now say it too, so one idea has one word. Banner and Toast made the same move in October.

The red buttons follow the brand ones: **`critical-primary`** is the red `primary` (filled), **`critical-tertiary`** the red `tertiary` (text or glyph only), and **`critical-tonal`** (`IconButton`) the red `tonal`, the same "the red version of X is `critical-X`" the system already used. There is no `critical-secondary` (a red outline) because Figma does not draw one. A menu row's `tone` is a tone, not a variant, so it says plain `critical`, as `Banner`, `Toast` and `Modal` do.

| Component | Before | After |
|---|---|---|
| `Button` `variant` | `danger` | `critical-primary` (filled red) |
| `Button` `variant` | `danger-tertiary` | `critical-tertiary` (red text, no fill) |
| `IconButton` `variant` | `danger` | `critical-primary` (filled red) |
| `IconButton` `variant` | `critical` | `critical-tertiary` (red glyph, no fill) |
| `StatusProgression` transition `variant` | `danger` | `critical-primary` |
| `Menu` item `tone` | `danger` | `critical` |
| `DetailCardMenu`, `UserMenu` rows | `tone: 'danger'` | `tone: 'critical'` |

`IconButton` and `Button` no longer have a bare `critical` variant, so code still passing `variant="critical"` or `variant="danger"` is now a type error, not a button that quietly changes. `critical-tonal` is unchanged.

Migration: in your code, rename `variant="danger"` to `variant="critical-primary"` and `variant="danger-tertiary"` to `variant="critical-tertiary"` (on `Button`, `IconButton` and a `StatusProgression` transition), rename `IconButton variant="critical"` to `critical-tertiary`, and rename `tone: 'danger'` to `tone: 'critical'` on `Menu` items, `DetailCardMenu` and `UserMenu` rows. There is no alias for the old names, and the looks do not change. Nothing else is renamed.

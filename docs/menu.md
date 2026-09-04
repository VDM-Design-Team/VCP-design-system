# Menu

A dropdown list of actions hanging off a trigger.

It is `Popover` with a keyboard contract on top. The floating panel **is** the
`role="menu"`, the items are real `<button role="menuitem">` elements, and focus
moves into the list the moment it opens. Composing a component out of another
component is still a component — see the tiering rules in `CLAUDE.md`.

## Composed of

| Piece | Tier |
|---|---|
| `Divider` | atom |
| `Icon` | atom |
| `IconButton` | atom |
| `Popover` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use which overlay

| Use | When | Focus behaviour | Dismiss |
|---|---|---|---|
| `Tooltip` | A short description of the control it is attached to. Never interactive | Never moves | Blur, Escape |
| `Popover` | A panel of content or mixed controls beside a trigger — a filter form, a detail card | Stays on the trigger unless `autoFocus` | Escape, click outside, focus leaving |
| `Menu` | A list of **actions**: edit, duplicate, archive, delete. Every row does something and then the panel goes away | **Always** moves into the list | Escape, click outside, selecting an item |
| `Modal` | The user must finish or dismiss it first — a confirmation, a destructive step | Moves in and is **trapped** | Escape, explicit close |

The test between Menu and Popover: is every row a verb? A menu is a list of
things you can do. The moment it grows a text field, a set of checkboxes or a
paragraph, it is a Popover with a form in it, and the menu keyboard model stops
making sense.

A Menu is also not navigation. Links between pages belong in `Tabs` or the
navigation pattern, not behind an ellipsis.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `MenuItem[]` | `[]` | Actions and dividers, in order |
| `onSelect` | `(key?: string) => void` | — | Fires with the activated item's `key`, **after** that item's own `onClick` |
| `trigger` | `ReactElement` | ghost ellipsis `IconButton` labelled "More actions" | A single element — cloned to receive `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`, an id, a ref and the open keys |
| `open` | `boolean` | — | Controlled state. Pair with `onOpenChange` |
| `defaultOpen` | `boolean` | `false` | Uncontrolled starting state |
| `onOpenChange` | `(open: boolean) => void` | — | Fires on every open and close, including Escape, outside click, tabbing out and selecting |
| `align` | `left \| right` | `right` | Which edge of the menu lines up with the trigger's |
| `className` | `string` | — | Merged onto the wrapper via `cn()` |
| `panelClassName` | `string` | — | Merged onto the `role="menu"` panel via `cn()` |
| `ref` | `Ref<HTMLDivElement>` | — | Points at the positioning wrapper |

### `MenuItem`

`MenuItem` is a union of an action and a divider, so a rule cannot accidentally
carry a label and an action cannot accidentally be a rule.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `key` | `string` | — | What `onSelect` receives |
| `label` | `ReactNode` | — | **Required on an action.** A string also enables type-ahead for that item |
| `icon` | `IconName` | — | A glyph name from the Icon library — **typed**, so a name the system does not ship is a compile error. Rendered decorative |
| `shortcut` | `string` | — | Display only. Menu binds no keyboard shortcuts itself; the surrounding feature does |
| `tone` | `default \| danger` | `default` | `danger` is for destructive, irreversible actions. See below |
| `disabled` | `boolean` | `false` | Stays visible and announced, but the keyboard steps over it |
| `onClick` | `() => void` | — | Runs before `onSelect` |
| `divider` | `true` | — | Renders a `role="separator"` rule instead of an item. Takes no other props |

### Deviations from the source export

| | Source | Here | Why |
|---|---|---|---|
| `icon` | `string` | `IconName` | A glyph name that the library does not ship should not survive to runtime as an empty square. It is now a compile error |
| `MenuItem` | one shape, everything optional | `MenuActionItem \| MenuDividerItem` | `{ divider: true, label: 'Delete', tone: 'danger' }` used to type-check and render nothing but a rule |
| `style` | `CSSProperties` | **removed** | Inline styles route around the token system. Use `className` / `panelClassName` |
| keyboard | none at all | the full contract below | An action list that cannot be operated from the keyboard is a mouse feature |
| focus | never moved | moves into the list on open, returns to the trigger on close | Required for `role="menu"` |
| `divider` | a styled `<span>` | the `Divider` component, `decorative={false}` | It is a real separator, and the system already has one |
| trigger | wrapped in a click-handling `<span>` | cloned onto the real control | A `<span onClick>` cannot be focused or carry `aria-expanded` |
| — | — | added `defaultOpen`, `panelClassName` | Uncontrolled use, and styling without inline `style` |

## Tokens

| Part | Token | Utility |
|---|---|---|
| Panel fill | `surface.elevated` | `bg-surface-elevated` |
| Panel edge | `stroke.default` | `border-stroke-default` |
| Panel shadow | `shadow.menu` | `shadow-menu` |
| Panel radius | `radius.md` | `rounded-md` |
| Item radius | `radius.sm` | `rounded-sm` |
| Item type | `type.label-lg` | `text-label-lg` |
| Item resting fill | `action.tertiary.surface.default` (transparent) | `bg-action-tertiary-surface-default` |
| Item content | `text.secondary` → `text.primary` on hover/focus | `text-text-secondary`, `hover:text-text-primary`, `focus:text-text-primary` |
| Item highlight | `surface.brand.faint` | `hover:bg-surface-brand-faint`, `focus:bg-surface-brand-faint` |
| Danger content | `accent.critical.outline.content.{default,hover}` | `text-accent-critical-outline-content-*` |
| Danger highlight | `accent.critical.outline.surface.hover` | `hover:bg-accent-critical-outline-surface-hover` |
| Disabled content | `text.disabled` | `disabled:text-text-disabled` |
| Shortcut | `type.caption-md` + `text.subtle` | `text-caption-md text-text-subtle` |
| Separator | `stroke.default`, via `Divider` | `Divider decorative={false}` |
| Focus ring | `stroke.focused` | `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused` |
| Sizing | Tailwind numeric scale | `min-h-10`, `min-w-48`, `px-3 py-2`, `p-1`, `gap-2` |

The dark theme comes for free — every colour above is a semantic token that
`tokens/semantic/color.dark.json` overrides under `.dark`.

**Token gaps** (nothing was invented; these are reported, not worked around):

- **No "menu item hover" surface token.** The highlight uses
  `surface.brand.faint`. The obvious candidate, `surface.brand.base`, is the
  blue-tinted near-white the source export used — but in dark it resolves to
  almost pure black, which is *darker* than `surface.elevated` and reads as a
  hole punched in the panel rather than a highlight. `surface.brand.faint` is
  the one value in the family that reads as a raised highlight in both themes. A
  dedicated `surface.interactive.hover` would say what is meant.
- **No stacking token** — the panel uses Tailwind's `z-50`. See
  `docs/popover.md`; the gap belongs to the overlay family as a whole.
- **`shadow.menu` has no dark-theme override**, so in dark the panel's edge is
  carried by `stroke.default` alone.
- **No motion tokens** for the colour transition.

## Accessibility

### The keyboard contract, in full

Every row below is exercised by an automated pass that drives a real browser
against the built Storybook — see "How this was verified".

| Key | Where | What happens |
|---|---|---|
| `Enter` / `Space` | trigger | Opens the menu and moves focus to the **first** enabled item |
| `ArrowDown` | trigger | Opens the menu at the **first** enabled item |
| `ArrowUp` | trigger | Opens the menu at the **last** enabled item |
| `ArrowDown` | in the menu | Moves to the next enabled item, wrapping from the last to the first |
| `ArrowUp` | in the menu | Moves to the previous enabled item, wrapping from the first to the last |
| `Home` | in the menu | Jumps to the first enabled item |
| `End` | in the menu | Jumps to the last enabled item |
| `Enter` / `Space` | on an item | Activates it: the item's `onClick`, then `onSelect`, then the menu closes and focus returns to the trigger |
| a printable character | in the menu | Type-ahead — jumps to the next item whose (string) label starts with what you typed. A buffer of consecutive keystrokes, cleared after a pause. This is a bonus, not part of the required contract |
| `Escape` | anywhere while open | Closes and returns focus to the trigger |
| `Tab` / `Shift+Tab` | in the menu | Closes the menu and lets focus continue to the next control in the page — no trap, no timer |
| pointer outside | anywhere | Closes, and does **not** pull focus back to the trigger |

**Dividers and disabled items are skipped by every one of the movement keys** —
`ArrowUp`/`ArrowDown` step over them, `Home`/`End` land on the first and last
*enabled* items, wrapping skips them, and type-ahead ignores them.

**Activation never follows focus.** Arrowing onto "Delete deliverable" must not
delete anything; only `Enter`, `Space` or a click do. (`Tabs` activates on focus
because moving between panels is free and reversible. Menu items are not.)

**A menu always opens at the top.** Closing it forgets where the user was, so
reopening never lands on a previously-chosen destructive item.

### Structure

- `role="menu"` on the panel, `role="menuitem"` on the items, `role="separator"`
  on the dividers. The items are direct children of the menu, which is what the
  roles require.
- The trigger carries `aria-haspopup="menu"` and `aria-expanded`, plus
  `aria-controls` pointing at the menu — but only while the menu is in the DOM.
- The menu takes its accessible name from the trigger via `aria-labelledby`, so
  the default ellipsis button names it "More actions".
- **Roving tabindex**, exactly as `Tabs` does it: the open menu is a single tab
  stop, the active item is `tabIndex={0}` and every other item is `tabIndex={-1}`.
- The highlight rides `:focus` as well as `:hover`, not `:focus-visible` alone,
  so a menu opened with the mouse still shows where the keyboard is. The 2px
  `stroke.focused` ring is on top of that for keyboard users.

### Danger items — the tone is not the only signal

Colour is invisible to a screen reader, unreliable for a colour-blind user, and
gone entirely in high-contrast mode. A `tone: 'danger'` item therefore carries
three signals, only one of which is colour:

1. **Colour** — the `accent.critical.outline` content and hover fill.
2. **A glyph.** A danger item always renders an icon. If you gave one (`trash`)
   it is used; if you gave none, it falls back to `warning`. Shape distinguishes
   the row from its neighbours whether or not colour is perceived.
3. **Words, in the accessible name.** The item's name ends with a visually
   hidden "destructive action", so a screen reader announces
   *"Delete deliverable, destructive action, menu item"*. This is the signal that
   actually reaches a non-sighted user, and it is the one the source export had
   no way of providing.

Put danger items last, behind a divider, and pair genuinely irreversible ones
with a `Modal` confirmation — a menu item is one keystroke away from being
activated by accident.

### Sizing

Items are `min-h-10` — the 40px minimum touch target from `CLAUDE.md`, with the
label free to wrap taller. The panel is `min-w-48` so short labels do not produce
a sliver of a menu.

### Positioning — the same honest limits as Popover

Below the trigger, flush left or right. **No collision detection, no flipping, no
shifting, no portal, no repositioning on scroll.** A menu on a trigger near the
bottom of the viewport opens off-screen; a menu inside a container with
`overflow: hidden` is clipped. `align` is how you compensate: `right` (the
default) for a trigger near the right edge, `left` for one near the left. The
full explanation is in `docs/popover.md`.

### How this was verified

The keyboard contract above was driven in a real browser against a production
Storybook build, not asserted from the source: open with `Enter`, `ArrowDown` and
`ArrowUp` from the trigger; `ArrowUp`/`ArrowDown` wrapping in both directions;
`Home`/`End`; stepping over a divider; stepping over a disabled item, including
on wrap and on `End`; type-ahead; `Enter` and `Space` activation with the
resulting `onSelect` payload; focus returning to the trigger on Escape and on
activation; `Tab` closing the menu and letting focus continue; an outside click
closing without stealing focus; and the roving `tabIndex` values. All sixteen
stories also pass `axe-core` at WCAG 2.1 AA with the menus open.

## Don't

- Don't hardcode colors or spacing. `panelClassName="bg-[#336afa]"` is a bug —
  add a token instead.
- Don't put a form, a text field or a paragraph in it. Once a row is not a verb,
  you want a `Popover`.
- Don't use it for navigation between pages.
- Don't rely on `tone: 'danger'` alone to warn someone. Colour is one of three
  signals here for a reason, and an irreversible action still needs a
  confirmation.
- Don't use more than one danger item in a menu.
- Don't hide the primary action of a screen behind an ellipsis. A menu is for the
  overflow, not the point.
- Don't pass a `<div>` or a bare string as the `trigger` — it has to be a real
  focusable control.
- Don't set `shortcut` and then not bind the shortcut. The text is a promise to
  the user; Menu does not keep it for you.
- Don't disable an item with no way for the user to find out why. Disable it and
  explain the condition nearby, or leave it enabled and fail with a message.
- Don't nest menus. There is no submenu contract here, and a `role="menu"` inside
  a `role="menu"` without one is worse than a flat list.
- Don't put it inside a scrolling container and expect it to escape. It cannot.

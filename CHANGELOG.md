# Changelog

## 0.1.0 — unreleased

Initial system, seeded from the VCP Figma Variables export (Aug 2026).

- Core: 10 colour ramps (vcp-blue, slate, neutral, blue, green, red, yellow,
  pink-legacy, teal-legacy, monochrome), 14-step px spacing scale, Poppins/Inter.
- Semantic (light + dark): `surface.*`, `text.*`, `stroke.*`,
  `action.{primary,secondary,tertiary}`, `accent.{critical,success,warning,info,blue,green,red}`
  in filled/outline/tonal styles — 228 tokens per theme.
- Type ramp: display-xl … caption-sm as composite tokens → `text-*` utilities.
- Shape: radius sm/md/pill, shadows card/raised/menu/modal.
- Build targets: Tailwind v4 `@theme` CSS + `.dark` overrides, plain CSS vars,
  TypeScript, flat + nested JSON.
- Components: `Popover` / `Menu` (Overlays) — Menu is Popover plus a keyboard
  contract: focus moves into the list on open, arrows wrap, Home/End jump, Escape
  closes and restores focus to the trigger, dividers and disabled items are stepped
  over. No new tokens. `MenuItem.icon` is typed to `IconName`, so a glyph the system
  does not ship is a compile error. Danger items carry three signals, only one of
  which is colour — a forced glyph and a visually hidden "destructive action" in the
  accessible name do the rest. Positioning is deliberately simple: no flipping and no
  collision detection, documented rather than implied.
- Components: `Modal` (Overlays) — `role="dialog"`, `aria-modal`, focus into the
  panel, a real focus trap that wraps both ways, Escape restoring focus to whatever
  opened it, background marked `inert`, and a scroll lock that compensates for the
  scrollbar so the page does not shift. No new tokens. Escape closes even when
  `dismissible={false}` — that flag guards the accidental backdrop click, not the
  deliberate way out.
- Components: `Tooltip` (Overlays) — opens on keyboard focus, not hover alone, wired
  with `aria-describedby`, dismissible with Escape and hoverable across the gap
  (WCAG 1.4.13). No new tokens. Text is 10.35:1 light and 16.36:1 dark.
- Components: `Toast` / `Banner` (Feedback) — a Toast is an event, a Banner is a
  state. No new tokens; both reuse the tonal pairs `docs/badge.md` already proved.
  The live regions live on `ToastViewport` and are rendered empty from first paint,
  because a role arriving together with its content is not announced — polite for
  informational tones, assertive for errors. Auto-dismiss pauses on hover, on focus
  within, and while the tab is hidden, and a toast carrying an action never
  auto-dismisses at all (WCAG 2.2.1).
- Components: `Chip` (Display) — the interactive pill Badge's docs promised: toggleable
  filters (`aria-pressed`), removable tags, avatar and count anatomy. No new tokens;
  brand-tinted from `surface.brand.*`. The export nested a `<button>` inside a clickable
  `<span>`; rebuilt so every clickable region is a real button and no button ever
  contains another — with `onRemove` the pill becomes a passive wrapper around two
  sibling controls. 28 tall carries the same pointer-dense exemption as
  `IconButton size="sm"`.
- Components: `ProgressBar` (Feedback) — a determinate meter with real
  `aria-valuenow/min/max`, `tone` as consumption status (brand/success/warning/danger),
  `sm`/`md` sizes, optional visible label (wired via `aria-labelledby`) and value.
  **New token: `surface.track`** (slate-200 light / slate-800 dark) — no existing
  surface kept every fill ≥3:1 against the track in dark (the closest dropped the
  danger fill to 1.25:1); on the new token the floor is 3.84:1, measured per tone in
  docs/progress-bar.md. Minor bump; the token needs pushing into the Figma variables.
- Components: `EmptyState` (Display) — icon tile (`aria-hidden`), real heading with a
  movable `headingLevel`, description at a readable measure, one `action` slot. No new
  tokens. The docs carry the actual contract: name what is empty, why, and the way
  forward — an empty state without an action is a dead end and should be rare.
- Components: `DetailRow` (Display) — the 132 label column / value / optional edit
  affordance row for details panels. No new tokens. The export reached `Icon` and
  `IconButton` through a window-global registry; now ordinary imports, and the edit
  affordance is the system's `IconButton` named `Edit ${label}` / `Confirm ${label}` —
  which is why `label` is typed `string`. Label/value land on `label-md`/`body-md`
  because the export's 13px/400 is a ramp step that deliberately does not exist.
- Components: `Breadcrumb` (Navigation) — the landmark pattern in full:
  `<nav aria-label="Breadcrumb">` around a real `<ol>`, the current page as inert
  text with `aria-current="page"`, separators hidden. No new tokens. Crumbs render
  as real `<a>`s when given `href` (preferred — middle-click and copy-link work)
  and as buttons only for genuinely programmatic `onNavigate`.
- Components: `Pagination` (Navigation) — addressable page numbers with
  `aria-current="page"` on the active page and a spoken name on every control.
  No new tokens; the active page sits on `action.primary` at rest. Keeps the
  export's five-number window, clamped at the ends; deliberately no
  ellipsis variant until a data set actually needs one. 32-tall controls carry the
  pointer-dense exemption.
- Components: `PaginationDots` (Navigation) — position dots for carousels and
  onboarding. No new tokens. The export's `role="tablist"` is gone — nothing here
  owns panels; they are a named group of "Go to page N" buttons, or, with no
  `onChange`, a passive indicator with zero tab stops. Inactive dots moved from
  slate-300 to `surface.neutral.strong` so an unselected dot clears the 3:1
  UI-graphic bar (4.55:1 light at worst); the current dot is also 2.5× wider, so
  state never rides on hue alone.
- Components: `Accordion` (Navigation) — stacked disclosures wired to the APG
  pattern the export implied but skipped: heading → `button` with
  `aria-expanded`/`aria-controls` → labelled `region`. No new tokens. Controlled
  (`openKeys`/`onToggle`) or uncontrolled (`defaultOpenKeys`, `multiple`); closed
  panels are unmounted, so form state belongs outside. Native `onToggle` is
  intentionally shadowed by the accordion's own callback.
- Fixed: `IconButton` no longer sets `title` when a `Tooltip` describes it. Both would
  render, ours and the browser's native bubble on top, with no way for a caller to
  suppress the second.
- Fixed: `Menu`'s shortcut text moves from `text.subtle` to `text.tertiary`. It was
  4.76:1 on the panel but only 4.09:1 once the item was highlighted — the state where
  a keyboard user is actually reading it.
- Components: `Avatar` / `AvatarGroup` (sm/md/lg = 24/32/40) — initials or photo,
  tone derived from the name. No new tokens. The export's six pastels with white
  initials measured 1.83–2.37:1 and failed 1.4.3 across the board, so the hash now
  maps onto the `accent.{blue,green,red,yellow}` hue families rather than the status
  families — a person is not an error. AvatarGroup announces itself as one summary
  ("Ali, Eve and 3 others") rather than a list of images nobody can act on.
- Components: `Badge` (sm/md, six generic tones) — the pale tonal treatment from the
  Figma Tags page. No new tokens. **VCP's status vocabulary is deliberately not here**:
  `accepted`, `for qa`, `confirmed prod` and the rest belong to the `StatusPill`
  pattern, since they only mean something inside VCP.
- Components: `Card` (title, header action, footer, padded) — `surface.elevated` with
  `shadow.card`. No new tokens. Renders a real heading at a caller-chosen level, and
  deliberately takes no click handler: a whole-card target hides the real action from
  keyboards and screen readers.
- Components: `Divider` (horizontal/vertical, optional caption) — decorative by
  default (`role="presentation"`), opt into `separator` semantics when it genuinely
  divides sections. No new tokens.
- Components: `IconButton` (4 variants x sm/md/lg) — Button's variants, sizes and
  focus ring, in a square. No new tokens. **`label` is a required prop and the other
  naming routes are removed from the type**, so an unnamed icon-only control is a
  compile error rather than a review finding.
- Components: `Skeleton` (block/circle/lines, radius tokens) — `aria-hidden`, with the
  line boxes derived from the type ramp so a three-line skeleton occupies exactly three
  lines of body copy. No new tokens. Docs and a story carry the live-region pattern the
  placeholder needs to not be silent.
- Components: `Spinner` (sm/md/lg) — `role="status"`, never `progressbar`. No new
  tokens. Reduced motion swaps the spin for a pulse rather than freezing it, because a
  motionless spinner reads as a hang.
- Components: `Icon` (sm/md/lg = 16/20/24) — a Phosphor glyph at `regular` weight,
  filled with `currentColor`, so colour comes from a text token on the parent and
  dark theme needs no second path. No new tokens. Decorative by default
  (`aria-hidden`); pass `label` for `role="img"` and a name when the glyph is the
  only carrier of meaning. Ships the Phosphor glyphs the VCP Figma library
  references rather than all 1,512 — a `name`-driven lookup cannot be tree-shaken.
  Carries VCP's in-house glyphs alongside them (`caret-triple-up`, which Phosphor
  has no equivalent for); `docs/icon.md` covers how to add either.

- Components: `Button` (primary/secondary/tertiary/danger/link × sm/md/lg,
  loading/disabled), mapped to `action.*` and `accent.critical.*` state tokens.
- Components: `SegmentedControl` (sm/md, fullWidth, disabled options) — a radio
  group on a `surface.neutral.subtle` track. No new tokens. Sizes are 32/40px to
  match Button rather than the export's 28/36, so `md` meets the 40px target rule.
  Known: the selected segment's surface is 1.1:1 against the track, so the
  selected state is carried by the label's colour and weight — see
  `docs/segmented-control.md`.
- Components: `Tabs` (sm/md, fullWidth, counts, disabled tabs) — selected tab takes
  `action.secondary.content.default` for both label and 2px underline; count pill
  uses `type.caption-sm` on `surface.brand.faint` / `surface.neutral.subtle`.
  No new tokens. Exports `tabId()` / `tabPanelId()` so panels can be associated —
  the bar alone is not an accessible tab set.

### Not imported from the Figma export (deliberately)

- `schemes-*` and `state-layers-*` variables — Material theme-builder noise.
- `-2`/`-3` duplicate variables — Figma collection duplication artifacts.
- `button-*` component variables — they referenced the pink `primary` ramp;
  design confirmed (2026-08-18) pink is not a brand colour. The pink ramp is
  removed entirely; `action.*` (vcp-blue) is the button source.

### Fixes

- `cn()` was dropping type classes. tailwind-merge files any `text-…` it doesn't
  recognise as a colour, so `text-label-lg` and `text-action-primary-content-default`
  collided and only the last one survived. **Every `Button` has been rendering at the
  browser's inherited 16px/400 instead of `type.label-lg` (14px/500) since 0.1.0.**
  `cn()` now declares the type ramp as a font-size group, and `npm run lint:tokens`
  fails if that list drifts from `tokens/semantic/type.json`.

### Contrast fixes vs the Figma export (approved by design, 2026-08-18)

- `text.subtle`: slate-400 → slate-500 (was 2.56:1 on white — failed AA).
- `text.tertiary`: slate-500 → slate-600 (keeps the hierarchy distinct after the
  subtle fix; 7.58:1).
- `accent.success.tonal.content.default`: green-800 → green-900 (was exactly
  4.50:1; now 8.24:1).
- Dark theme: `stroke.focused` was left at vcp-blue-500, the same value as light,
  while every other `stroke.*` token was inverted. That is 2.37:1 against the dark
  surfaces — below the 3:1 WCAG 1.4.11 asks of a focus indicator, so the focus ring
  was close to invisible in dark theme on every component, Button included.
  Now vcp-blue-300 (6.33:1), mirroring how `stroke.brand.strong` flips 600 → 300.
  This corrects the earlier "dark theme already passes" note.
- These fixes live in `scripts/import-figma-tokens.mjs`, so re-importing a fresh
  Figma export cannot silently regress them. **Push the same three changes back
  to the Figma variables** so the export catches up with the code.

# VCP Design System — five PRs, ready to open

All five branches are built, `npm test` passes on each, Storybook builds, and every
story is clean under axe (WCAG 2.1 A + AA). None of them invents a token.

**Land them in this order.** 2 changes how every component renders its text, so it
should go in before the two component PRs get their Chromatic baselines.

Everything is already on your Mac, in `~/Downloads/acme-design-system/_vcp-push/`.
**Double-click `push-all.command`** in that folder. It creates all five branches off the
latest `main`, applies the commits, pushes them, and prints the five PR links. It never
force-pushes, it leaves `main` alone, and it backs out cleanly if anything doesn't apply.

Then open each link and paste the matching section below into the PR body.

PRs 4 and 5 both add a line to `src/index.ts` and to `CHANGELOG.md`, so whichever merges
second needs a one-line rebase — that's the only conflict between them.

---

## 1 — `docs/token-gallery-action-prominence`
### Storybook: group action tokens by prominence

The Action section of the token gallery was one flat alphabetical grid, so a single
control's states were scattered across it — `action.primary.content.default` sitting
next to `action.primary.surface.hover` with secondary and tertiary interleaved.

Now it's three blocks: primary, secondary, tertiary. Each block is one control's
complete state set, read top to bottom, with a short note on what each level of
prominence is for.

This is the change you thought was sitting unpushed in `~/Downloads/acme-design-system`.
It wasn't there — see the note at the end.

*Gallery only. No component or token changes.*

---

## 2 — `fix/type-scale-class-merge`
### Fix `cn()` silently dropping type classes

**Every Button in the system has been rendering at 16px/400 instead of `type.label-lg`
(14px/500) since 0.1.0.** Verified against a built Storybook: the `text-label-lg` class
is simply absent from the rendered markup on all three sizes.

The cause is a class-merging utility, `tailwind-merge`. It knows Tailwind's own
`text-*` utilities, but VCP's type ramp is custom — so it filed `text-label-lg` under
"colour" and treated it as a conflict with `text-action-primary-content-default`. Only
the last one written survived, and in Button that's the colour.

The fix teaches it that the ramp is a *size* scale. `npm run lint:tokens` now fails if
that list drifts from `tokens/semantic/type.json`, so it can't rot silently again.

**Chromatic will flag every Button snapshot.** Button labels get smaller and heavier —
which is what the tokens always said they should be.

---

## 3 — `fix/dark-focus-ring`
### Fix the dark-theme focus ring

`stroke.focused` is the one stroke token the Figma import didn't invert for dark. It
stayed at vcp-blue-500, the same blue as light theme, which is **2.37:1** against the
dark surfaces — under the 3:1 WCAG asks of a focus indicator. Keyboard users in dark
theme have had a focus ring they can barely see, on every component including Button.

Moved to vcp-blue-300: 6.33:1 on base and elevated, 7.73:1 on canvas, 4.48:1 on
neutral-subtle. That mirrors how `stroke.brand.strong` already flips 600 → 300 for dark.

The fix lives in `scripts/import-figma-tokens.mjs` next to the three light-theme AA
fixes, so re-importing from Figma can't undo it. **The same change should go back into
the Figma variables.** This also corrects the "dark theme audited: already passes" line
in the changelog.

**Chromatic will flag any snapshot that captures a dark focus state.** Light is untouched.

---

## 4 — `feat/segmented-control`
### Add SegmentedControl

A radio group styled as a segmented track, for switching how the *same* content is
shown — List / Board / Calendar. Not a tab bar: if choosing an option loads different
content, that's Tabs.

Ported from the Claude Design export and retokenised. The export carried raw `rgb()`
values with CSS-variable fallbacks; this uses semantic tokens only, so dark theme works
without a second code path. **No new tokens.**

Three changes from the export, all deliberate:

- **Sizes are 32 / 40px** (`sm` / `md`) rather than 28 / 36, so `size` means the same
  thing here as on Button, and `md` meets the 40px target minimum in CLAUDE.md.
- **Keyboard support added.** The export was mouse-only — it had the radiogroup roles
  but no arrow keys and no managed tab order. The control is now one tab stop; arrows
  move and select, Home/End jump to the ends, disabled segments are skipped.
- **Options can be disabled**, so an unavailable mode stays discoverable.

Ships with 9 stories (sizes, 2 and 5 options, disabled, full width, long labels,
controlled, light/dark) and `docs/segmented-control.md`.

**One thing worth your eye.** The selected segment is a white surface on a light grey
track — 1.1:1 apart, so the surface colour alone doesn't satisfy WCAG 1.4.11. What
carries the state is the label darkening (`text.tertiary` → `text.primary`, 6.9:1
against the track) plus the lift from `shadow.card`, which is a non-colour cue. That's
defensible and it's documented. Making the *surface* itself clear 3:1 would need a new
token — say the word and I'll propose one.

---

## 5 — `feat/tabs`
### Add Tabs

A tab bar for moving between sibling panels of one record — Overview / Activity /
Files. Counts render as a pill that picks up the brand tint when its tab is selected.

Retokenised the same way. **No new tokens** — the 10px count pill lands on
`type.caption-sm` (Inter, your dense-numerics face) and the selected blue on
`action.secondary.content.default`.

Changes from the export:

- **The tabs now point at their panels.** The export set `role="tab"` with no
  `aria-controls` and no ids, which announces a tab that controls nothing. `Tabs` now
  emits the wiring and exports two helpers so you can label the panel back. The
  `WithPanels` story is the whole pattern, ready to copy into a feature.
- **Keyboard support added** — same roving tab stop as SegmentedControl.
- **Sizes are 32 / 40px** rather than a single 36, matching Button and SegmentedControl.
- **`countLabel`**, so a screen reader hears "12 deliverables" rather than "Files 12".

Ships with 7 stories and `docs/tabs.md`.

Contrast, light / dark: selected label and underline 6.2 / 6.3:1, unselected label
7.6 / 9.9:1, count pill 5.3 / 5.7:1. All clear.

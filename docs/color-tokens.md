# Color tokens — how to choose one

Usage guidance for the semantic color tokens in `tokens/semantic/color.json`,
for anyone — designer, engineer, or an AI agent — picking a token for a UI
element. See [Foundations/Tokens](../src/foundations/Foundations.stories.tsx)
in Storybook for the swatches themselves; this doc is about which one to reach
for.

## Core rule

Choose a token by the **role** the element plays, not by which color looks
right. VCP's semantic names describe what something does — `surface.brand`,
`stroke.focused`, `accent.critical.tonal.surface.default` — never what
component it happens to sit in. That is what makes them reusable: the same
token means the same thing everywhere it appears.

Prefer the most specific category that fits. If the text belongs to a button,
use `action.*.content.*`, not a generic `text.*` token — a more specific
category, when one exists, already encodes the extra meaning (interactive,
part of a control, carries a state).

## Selection order

1. Identify the role: text, surface, action, stroke, or accent.
2. Prefer the most specific semantic category that matches — a button's label
   is `action.*.content.*`, not `text.primary`.
3. If the element is interactive, use the matching interaction-state token
   (`default`, `hover`, `pressed`, `selected`, `disabled`) rather than
   reproducing a state with opacity or a hand-picked shade.
4. Don't reach for a generic token (`surface.neutral.*`, `text.brand.*`) when
   a more specific category already covers the element.
5. Don't infer meaning from a token's underlying hex value. `blue` in
   `accent.blue.*` is a hue label for tone-hashing (see Avatar below), not a
   promise of "informational" — that's `accent.info.*`.

---

## `text.*` — text and icons

`primary`, `secondary`, `tertiary`, `subtle`, `disabled` — titles, headings,
body copy, captions, labels. Choose among them by hierarchy: `primary` is the
most important content on the surface, each step down is progressively
lower-emphasis. The repo does not define a sharper rule than that; if two
options both seem plausible, match existing usage in a similar component
rather than guessing.

**Check for a more specific token first.** A button's label is
`action.*.content.*`; a status word is `accent.*.tonal.content.*` via
`StatusPill`. `text.*` is for prose that isn't already owned by a component.

`text.link.*` (`default`, `hover`, `pressed`, `selected`) is for hyperlinks
specifically.

`text.inverted.*` mirrors the whole `text.*` hierarchy for use on a dark
surface in an otherwise-light context (e.g. content inside a brand-filled
block). **Don't use it to build dark mode** — dark mode is `tokens/semantic/
color.dark.json`, a separate theme applied via `.dark`, not a manual swap to
inverted tokens.

`text.brand.*` (`faint` → `stronger`) is for brand-colored text when no more
specific category fits. Use sparingly — most brand-colored content already has
a home (`action.*`, `accent.*`).

---

## `surface.*` — backgrounds

Hierarchy, describing what sits on top of what:

| Token | Use for |
|---|---|
| `surface.canvas` | The page background |
| `surface.base` | Main panels — side navigation, the page itself |
| `surface.elevated` | Cards, widgets, popovers |
| `surface.overlay` | The scrim separating a modal (or similar) from the page behind it |

`surface.neutral.*` (`base` → `stronger`) is the gray ramp for anything that
doesn't fit a more specific surface — used sparingly, and only when nothing
more specific applies. `surface.brand.*` is the same shape for a
brand-colored surface, same rule: sparing, and only without a better fit.

Neither ramp defines a precise rule for choosing `faint` vs `subtle` vs
`medium` vs `strong` vs `stronger` beyond "how strong should this read" — see
Known gaps below.

---

## `action.*` — buttons and controls that enact a significant action

Three prominence levels map to three visual styles:

| Level | Style | Has a border? |
|---|---|---|
| `action.primary` | filled | No |
| `action.secondary` | outline | Yes — the only one that does |
| `action.tertiary` | textual | No |

Each carries `surface`, `content`, and (secondary only) `border`, each with
interaction states (`default`, `hover`, `pressed`, `selected`, `deselected`,
`disabled`). Secondary's surface is transparent except in hover / pressed /
selected. Primary's content is white.

This is the token family for **significant actions** — the button someone
clicks to do the thing. See Neutral below for controls that exist but aren't
one of these three.

---

## Neutral treatments — components that aren't an Action

VCP has no `neutral.*` token family shaped like `action.*` (no
`neutral.tonal` / `.outline` / `.textual` / `.filled` tree). "Neutral" styling
— a tag, a non-primary button-like control, anything needing a generic
treatment — is composed directly from `surface.neutral.*` plus `text.*` or
`stroke.*`, per component. `Badge`'s `neutral` tone is the reference example:
`surface.neutral.subtle` + `text.secondary` (see `docs/badge.md`). Follow that
pattern rather than inventing a parallel token structure.

---

## `stroke.*` — borders, dividers, lines

| Token | Use for |
|---|---|
| `stroke.default` | The everyday border — panels, cards, modals |
| `stroke.focused` | The focus ring. Always the brand color |
| `stroke.field` | A form control's resting border (not `default` — see `docs/*.md` for the components that use it; it exists because `default` fails contrast against a field and `strong`/`stronger` read as an active or error state) |
| `stroke.inverse` | Like `text.inverted` — **not** a dark-mode shortcut |
| `stroke.brand.*` | Sparing use, brand-colored stroke, only without a more specific fit |

Keep stroke usage consistent across similar components — don't vary the
border color of visually-equivalent elements without a reason.

---

## `accent.*` — status and exceptional meaning, plus tone-hashing

Two different things live under `accent.*` and they are not interchangeable:

- **Semantic status**: `critical`, `success`, `warning`, `info` — each with
  `filled` / `outline` / `tonal` styles and interaction states. Use these
  because the *meaning* applies (an error, a success confirmation, a caution,
  an informational note) — never because a hue happens to look right.
- **Hue families for tone-hashing**: `blue`, `green`, `red`, `yellow` — used
  by components like `Avatar` to assign a consistent, decorative color per
  person/entity (see `docs/avatar.md`). These carry no status meaning at all;
  `accent.red` on an avatar says nothing about danger.

Don't reach for `accent.blue` on a status badge because it "looks
informational" — that's `accent.info`. Don't reach for `accent.critical` to
give something a red decorative tone with no error meaning — that's
`accent.red`.

---

## Guidance for AI agents

- Choose tokens by role, not by hue or visual similarity.
- Prefer the most specific category over a generic one (Action/Accent over
  Text/Surface, when the element is a control or a status).
- Use interaction-state tokens (`hover`, `pressed`, `selected`, `disabled`)
  instead of inventing a state color.
- Never treat `text.inverted.*` or `stroke.inverse` as a dark-mode
  implementation — dark mode is the `.dark` theme.
- Don't invent a fixed meaning for `faint`/`subtle`/`medium`/`strong`/
  `stronger` beyond "increasing intensity" — the docs don't define more than
  that (see below).
- If more than one semantic token looks plausible and nothing here or in the
  component's own `docs/<name>.md` resolves it, match existing usage in a
  similar component, or ask, rather than guessing.

## Known documentation gaps

Not precisely defined anywhere in this repo:

- The exact decision rule for `faint` vs `subtle` vs `medium` vs `strong` vs
  `stronger`, in `text.brand.*`, `surface.neutral.*`, and `surface.brand.*`.
  Treat them as an ordered intensity scale and pick by eye against the
  surface they sit on, checking contrast per `docs/<component>.md`'s own
  measurements.

If a project needs a firmer rule here, it should be decided and documented
per token family rather than inferred.

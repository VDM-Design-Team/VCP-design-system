# IconButton

A square button carrying a single icon and no visible text.

It is `Button` with the label taken away, and it is built from the same parts on
purpose: the same `variant` names off the same `action.*` families, the same
`sm` 32 / `md` 40 / `lg` 48 scale, the same `rounded-md` corner, the same focus
ring, the same `loading` contract. If you know Button, you know this.

## When to use which

| Use | When | Why |
|---|---|---|
| `Button` with `iconLeft` | Almost always. Any action with room for a word | A word is unambiguous; an icon is a guess |
| `IconButton` | Dense toolbars, table rows, card corners, close buttons — where a label genuinely does not fit **and** the glyph is conventional (×, ⋯, pencil, bin, search) | Buys horizontal space at the cost of legibility |
| `Button variant="link"` | Inline navigation that reads as text | There is no icon-only equivalent — see below |

The test: could a new user name this button's action without hovering it? If not,
it needs a visible label, not a better icon.

## When to use which variant

| Variant | Use for | Notes |
|---|---|---|
| `tertiary` | Toolbars, table rows, card affordances | **The default.** `docs/button.md` already assigns icon-only actions to the ghost treatment |
| `secondary` | A bordered icon action that must read as a control on a busy surface | |
| `primary` | The one filled icon action on a screen — a compose or add FAB | At most one |
| `danger` | Destructive, irreversible actions only | At most one. Pair with a confirmation |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `icon` | `IconName` | — | **Required.** A glyph name from the Icon library. Rendered decorative (`aria-hidden`) |
| `label` | `string` | — | **Required.** The accessible name *and* the pointer tooltip. See below |
| `variant` | `primary \| secondary \| tertiary \| danger` | `tertiary` | Same names and tokens as Button |
| `size` | `sm \| md \| lg` | `md` | 32 / 40 / 48 square. `sm` only in dense contexts |
| `loading` | `boolean` | `false` | Swaps the glyph for a spinner, disables the button, sets `aria-busy` |
| `disabled` | `boolean` | `false` | Same as Button |
| `className` | `string` | — | Merged onto the `<button>` via `cn()` |
| `ref` | `Ref<HTMLButtonElement>` | — | Points at the real `<button>` |

Everything else (`onClick`, `type`, `form`, `aria-expanded`, `aria-pressed`,
`data-*`, …) is forwarded to the `<button>`.

**Removed from the type:** `children`, `aria-label`, `aria-labelledby`, `title`.
See the accessibility notes — that is not an oversight.

### Differences from Button, and why

| | Button | IconButton | Why |
|---|---|---|---|
| `variant="link"` | yes | **no** | A link variant is underlined text. With no text there is nothing to underline, and the result is indistinguishable from `tertiary`. Use `tertiary`, or a real `Button variant="link"` with a word |
| default `variant` | `primary` | `tertiary` | An icon-only control is nearly always a toolbar or row affordance. Defaulting to `primary` would fill dense UIs with blue squares. `docs/button.md` already routes "icon-only actions" to the ghost treatment |
| `fullWidth` | yes | **no** | The control is square by definition |
| `iconLeft` / `iconRight` | yes | **no** | There is one icon and it is `icon` |
| icon size | fixed 16 | tracks `size` (16 / 20 / 24) | A 16 glyph in a 48 box is a dot in a field. Matches `Icon`'s own `sm`/`md`/`lg` |
| `label` | optional `aria-label` | **required prop** | The whole point of the component — see below |

Everything else — variant names, colour tokens, size scale, radius, transition,
focus ring, `loading` semantics, `disabled` behaviour — is identical, class for
class.

## Tokens

| Part | Token | Utility |
|---|---|---|
| Radius | `shape.radius.md` | `rounded-md` |
| Focus ring | `stroke.focused` | `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused` |
| `primary` surface | `action.primary.surface.{default,hover,pressed,disabled}` | `bg-action-primary-surface-*` |
| `primary` content | `action.primary.content.{default,disabled}` | `text-action-primary-content-*` |
| `secondary` border | `action.secondary.border.{default,hover,pressed,disabled}` | `border-action-secondary-border-*` |
| `secondary` surface | `action.secondary.surface.{default,hover,pressed}` | `bg-action-secondary-surface-*` |
| `secondary` content | `action.secondary.content.{default,disabled}` | `text-action-secondary-content-*` |
| `tertiary` surface | `action.tertiary.surface.default` | `bg-action-tertiary-surface-default` |
| `tertiary` content | `action.tertiary.content.{default,hover,pressed,disabled}` | `text-action-tertiary-content-*` |
| `danger` surface | `accent.critical.filled.surface.{default,hover,pressed,disabled}` | `bg-accent-critical-filled-surface-*` |
| `danger` content | `accent.critical.filled.content.default` | `text-accent-critical-filled-content-default` |
| Size | Tailwind numeric scale | `size-8` (32) / `size-10` (40) / `size-12` (48) |

The dark theme comes for free — every class above is a semantic token that
`tokens/semantic/color.dark.json` overrides under `.dark`.

**Token gaps:** none. Every value this component needs already exists, because it
reuses Button's families wholesale. The one thing it does *not* have is a
dedicated `action.tertiary.surface.hover` fill — the token resolves to
`transparent`, so the ghost variant's hover is a content-colour change only,
exactly as it is on Button. That is a system-wide decision, not a gap this
component should paper over locally.

## Accessibility

- **An icon-only control must have an accessible name, and here it is impossible
  to omit.** `label` is a required `string` in TypeScript. On top of that,
  `aria-label`, `aria-labelledby`, `children` and `title` are all removed from
  the prop type, so there is no second route to naming the button and no way to
  smuggle visible text into it. A missing name on an icon-only button is the most
  common and most damaging failure in this component's category — every screen
  reader announces it as an unlabelled "button", and the user has to activate it
  to find out what it does. Making it a type error is worth more than any amount
  of documentation, so the type system carries the rule rather than a lint
  rule or a review checklist.

- **Name the action, not the picture.** `label="Delete deliverable"`, not
  `label="Bin"` or `label="Trash icon"`. Screen readers already announce the role
  ("button"), so do not put it in the label either.

- **The name goes on the button; the icon stays decorative.** `Icon` is rendered
  without its own `label`, which makes it `aria-hidden` and `focusable="false"`.
  Naming both the button and the glyph makes the control announce itself twice.

- **40px minimum target.** `md` is 40×40 and is the default — it is the only size
  that meets the target in CLAUDE.md. `sm` is 32×32 and is for pointer-dense
  contexts only (toolbars, table rows, desktop-only screens), exactly as
  `Input`'s `sm` is. Never put `sm` on a touch-first screen. If a dense row must
  work on touch, keep `md` and cut the number of actions instead.

- **Visible focus.** A 2px `stroke.focused` outline at 2px offset, from
  `focus-visible` so it appears for keyboard users and not on mouse click. It is
  a shape change, not colour alone. Never remove it — an icon-only button with no
  focus ring is invisible to a keyboard user, since there is no text to follow.

- **`loading` sets `aria-busy` and disables the control**, and the accessible name
  does **not** change while it is busy. The spinner replaces the glyph only. If a
  wait exceeds ~1s, announce the outcome from a live region on the surrounding
  region rather than by mutating this button's name mid-flight.

- **The `title` attribute is a bonus, not the name.** It is set from `label` so
  pointer users get a native tooltip, but `aria-label` is what assistive tech
  reads and `title` is never announced when `aria-label` is present. A tooltip
  alone is not an accessible name: it is unreachable by keyboard on many browsers
  and invisible on touch.

- **Toggle buttons need state, not just a name.** If the button toggles
  something, pass `aria-pressed` (or `aria-expanded` for a disclosure) yourself.
  Keep `label` stable across states — "Mute" that becomes "Unmute" while
  `aria-pressed` also flips announces contradictory information.

## Don't

- Don't hardcode colors or spacing. `className="bg-[#336afa]"` is a bug — add a
  token instead.
- Don't use it where a labelled `Button` fits. Space is not usually as tight as
  it feels during design.
- Don't use an icon whose meaning is not already conventional. There is no
  glyph that reliably means "reconcile", "publish" or "archive"; those need words.
- Don't rely on the tooltip to explain the button. It is not available to
  keyboard or touch users.
- Don't use `sm` on a touch-first screen — it is 32, under the 40 minimum.
- Don't stack more than about five in one toolbar. Past that, an overflow
  `dots-three` menu is easier to scan than another glyph.
- Don't use `primary` for every action in a row. One filled control, at most.
- Don't remove the focus ring to "clean up" a toolbar.
- Don't change `label` while `loading` is true.

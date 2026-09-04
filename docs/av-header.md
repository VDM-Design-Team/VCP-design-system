# AVHeader *(pattern)*

The page-level header from the Figma `AV_Header` set: a back arrow and the
page's title on the left, the status-move buttons on the right. This is the
header `TopBar` deliberately does not carry — the two stack, app chrome
above, page identity below.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `IconButton` | atom | The back arrow, when back is a history action |
| `Icon` | atom | The back arrow's glyph, when back is an `href` |
| `StatusProgression` | component | The lifecycle buttons on the right |

The import rows are checked against the real imports — `npm test` fails if
this list drifts.

**This pattern owns no lifecycle knowledge.** It places `StatusProgression`
and forwards three props; the mapping lives in exactly one place, and that
place is not here.

## The two types

| `type` | Title | When |
|---|---|---|
| `default` | The AV's id — "VCP-1234", `body-md` | An existing Added Value |
| `new` | Words — "Added Value Creation", `heading-md` | A page being created |

Exactly the Figma `Type` variant pair. The design's boolean
`Show Move Status Buttons` is `showStatusActions`.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `ReactNode` | — | **Required.** The page's name — renders as the page's one `<h1>` |
| `type` | `'default' \| 'new'` | `'default'` | Sets the title's size and weight |
| `backHref` | `string` | — | Back as a link — middle-click and open-in-new-tab work |
| `onBack` | `() => void` | — | Back as a history action. Ignored when `backHref` is set |
| `backLabel` | `string` | `'Back'` | The back control's accessible name — say where it goes |
| `showStatusActions` | `boolean` | `true` | The design's boolean |
| `workflow` / `role` / `status` | see `StatusProgression` | — | Forwarded. The buttons render only when `role` **and** `status` are given |
| `onTransition` | `(t: AVTransition) => void` | — | A status button press |
| `actions` | `ReactNode` | — | Page actions, placed before the status buttons |
| `className` | `string` | — | On the `<header>` |
| `ref` | `Ref<HTMLElement>` | — | The `<header>` |

## Tokens

No new tokens. The frame is the design's 32 above / 16 below and sides
(`pt-8 pb-4 px-4`), which puts the 36-tall buttons in an 84-tall header
against the design's 85. The back link wears `action.tertiary.content`, the
same family `IconButton`'s ghost variant uses, so the two back affordances
are indistinguishable.

⚠️ The design's `new` title is **18px**, between our ramp's 16 (`heading-sm`)
and 20 (`heading-md`). We take the larger step rather than add an 18px token
for one header — flagged in [figma-audit.md](figma-audit.md) for a design
call.

## Accessibility

- **This carries the page's `<h1>`**, and `TopBar` carries none precisely so
  that it can. Render one AVHeader per page.
- The back control is named by `backLabel`, and the default `'Back'` is worth
  replacing: "Back to my Added Values" tells a screen-reader user where they
  land. The glyph is `aria-hidden` either way — one announcement, not two.
- Both back forms are 40px targets (`size-10`), meeting the touch guidance
  even though the design draws a bare 20px glyph.
- The status buttons come with their own named group; see
  [status-progression.md](status-progression.md).
- The header wraps (`flex-wrap`) rather than truncating the buttons off
  screen; the title truncates instead, since its full text is the page.

## Don't

- **Don't put app chrome in here** — bell, theme switch and user menu are
  `TopBar`'s. Two bars, two patterns, as designed.
- **Don't set both `backHref` and `onBack`** — `backHref` wins, and the other
  is dead code.
- **Don't branch on `status` here.** If a page needs different buttons, the
  answer is a row in `StatusProgression`'s mapping, not a condition at the
  call site.
- **Don't leave `backLabel` as "Back"** on a page that has somewhere specific
  to go back to.
- **Don't add a second `<h1>`** to the page below it.

# ChangeLogModal

What a user sees when the product has something to tell them about a release:
one announcement at a time, with arrows and dots to move between them.

Read off the Figma `Changelog_Update_Modal` (`7211:1060`) and
`_Changelog_Main_Content` (`7211:902`), audit batch 4, 11 September 2026.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Modal` | component | The dialog |
| `Carousel` | component | The arrows, the keyboard, and announcing the move |
| `Tooltip` | component | What the info glyph beside the title explains |
| `Badge` | atom | The version |
| `Button` | atom | "View Change Log" and "Got It" |
| `Icon` | atom | The kind's glyph, and the info glyph |
| `PaginationDots` | atom | The positions, below the footer |

The import rows are checked against the real imports — `npm test` fails if this
list drifts, and fails a pattern composing fewer than two pieces.

## Three kinds, and the glyph is the difference

| `kind` | Glyph | Colour |
|---|---|---|
| `experimental` | flask | `accent.green.strong` |
| `update` | megaphone | `accent.yellow.medium` |
| `feature` | rocket | `accent.info.outline.content.default` |

All three are the design's own variables, read off the file rather than matched
by eye. The glyph is decorative and the kind is also given as screen-reader-only
text, because a colour and a shape are not a label.

## The dots are below the footer, and that shaped `Carousel`

The design puts the positions *under* the two buttons, not beside the content.
That is why `Carousel` is controlled and does not render its own dots: this
pattern places `PaginationDots` in the footer and both read one index. A
self-contained carousel could not have drawn this dialog.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` | `boolean` | required | You own it |
| `onClose` | `() => void` | required | Escape, the close button, "Got It", or a backdrop click |
| `entries` | `ChangeLogEntry[]` | required | Newest first. One is shown at a time |
| `onViewChangeLog` | `() => void` | — | "View Change Log" — takes the user to the full log |
| `index` / `onIndexChange` | `number` / `(i) => void` | — | Controlled paging. Uncontrolled when omitted |

`ChangeLogEntry` is `{ kind, title, date, version, hint?, heading?, items }`.
`date` is already formatted — the caller owns what a date looks like.

**Reopening starts at the newest announcement**, not wherever the user left off,
which is never what they meant.

## Accessibility

- **The dialog is named by its announcement**, so it announces what it is about
  rather than "dialog".
- **The kind is text, not just a glyph.** The flask is `aria-hidden` and
  "Experimental feature" is available to a screen reader, because a colour and a
  shape are not a label.
- **The info glyph is a real button** with a name that says what it explains,
  not "info" — a `Tooltip` on a non-focusable element is unreachable by
  keyboard.
- **Moving is announced** by `Carousel`'s slide live region, which is safe here
  because nothing rotates itself.
- **Interaction test.** `PagingThroughIt` is a `play` story and runs under
  `npm test`: the arrows, the dots reading the same index, the wrap, and that
  reopening returns to the newest.

## Deviations from the design

| The design | Ours | Why |
|---|---|---|
| Dialog width 680 | `size="lg"` (640) | Widths ride the spacing scale; 640 is the nearest step |
| The kind glyph is 32 | `size-8` on `Icon` | `Icon`'s scale is 16 / 20 / 24 and stops there. A 32 step is a ramp decision, not something to add for one dialog |
| Title at the design's own size | `Modal`'s `heading-md` | `Modal` owns its title's size — the same note every dialog in this batch carries |

## Don't

- **Don't page it automatically.** `Carousel` has no auto-advance and this
  should not grow one.
- **Don't put a release note in `items` that needs a paragraph.** The list is
  one line each; anything longer belongs behind "View Change Log".
- **Don't show it with an empty `entries`.** It renders nothing rather than an
  empty dialog, but the decision not to open it is the caller's.

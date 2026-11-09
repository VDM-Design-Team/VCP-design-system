# TruncatedText *(component)*

One line of text that is cut with "…" when it does not fit, and **says the whole of it on hover and focus when — and only when — it has been cut**. For the name in a table's first column: an Added Value's title,
a holiday's name, a task. Every data table's long first-column text uses it, so a cut name always reads the same way.

## Composed of

| Piece | Tier |
|---|---|
| `Tooltip` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `TruncatedText` | A name or title that may be cut: the first column of a table, a list row |
| `useIsTruncated` | The same measurement where the text lives in something else (a button that opens the row) which wraps its own `Tooltip` |
| A wrapping cell | Text that should show in full — don't truncate it |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `children` | `string` | required | A string: the tooltip says exactly this |
| `className`, rest, `ref` | `<span>` props | | The type is the caller's (`text-label-sm-medium text-text-primary`) |

## Behaviour

- **The tooltip is `Tooltip`**, not the browser's `title` (slow, unstyled, shown even for text that fits, and no use from the keyboard). It is **off while the text fits**.
- **It re-measures** when its box is resized (a narrower table) and when its text changes.
- **A tab stop only while cut**, so a keyboard user reaches the full name the way a pointer does and a name that fits adds nothing to the row.

## Tokens

None new; the focus ring is the system's.

## Accessibility

The cut is only CSS: a screen reader reads the whole name from the page, so the tooltip is `describe={false}` and nothing is heard twice.

## Don't

- **Don't use the `title` attribute for a cut name.**
- **Don't put anything but text in it** — a name that is a button wraps its own `Tooltip` with `useIsTruncated`.

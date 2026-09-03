# TagEditor

Free-form labels on a thing: the tag list, a tone swatch row, a name field
and an add button. `editable={false}` is just the list.

## When to use

| Use | For |
|---|---|
| `TagEditor` | Labels users invent — grouping, filtering hints, working vocabulary |
| `Chip` | Interactive filters with fixed values |
| `Badge` | Classifications the system assigns |
| A pattern | Anything where a colour *means* something fixed — that mapping is VCP vocabulary |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `tags` | `Array<{ label, tone? }>` | `[]` | The list — the caller owns it |
| `onAdd` | `(tag) => void` | — | A new tag with the selected tone. Deduplication is the caller's |
| `onRemove` | `(tag) => void` | — | Pill ✕, named "Remove ${label}" |
| `onToneChange` | `(tone) => void` | — | Swatch changed — for persisting a preference |
| `editable` | `boolean` | `true` | `false` renders the read-only list alone |
| `className` | `string` | — | Merged via `cn()` |
| `ref` | `Ref<HTMLDivElement>` | — | The wrapper |

`TAG_TONES` exports the five in order: blue, green, red, yellow, neutral.

## Tones, not colours

The export shipped `TAG_COLOURS` as raw rgb strings — one of them the indigo
that has no core ramp — and tinted pills with an alpha suffix. Tags now carry
a `tone`, worn as the `accent.{blue,green,red,yellow}` faint/stronger pairs
**Avatar already proved**, plus a neutral from `surface.neutral` + `text.*`.
The dot rides `currentColor`. The pill is Badge's geometry with a dot and a
remove button — not a `Badge` (deliberately non-interactive) and not a `Chip`
(brand-only).

| Tone (label on its pill) | Light | Dark |
|---|---|---|
| `blue` | **8.50:1** | **7.23:1** |
| `green` | **8.24:1** | **4.50:1** |
| `red` | **8.22:1** | **6.85:1** |
| `yellow` | **8.07:1** | **6.37:1** |

`green` in dark sits exactly on AA's 4.5:1 — flagged in the token layer's
own history once already; any darkening of `accent.green.faint` breaks it
first.

## Accessibility

- Everything composed is already accessible: `Input` (labelled "New tag
  name"), `Button`, and pill ✕ buttons named per tag.
- Swatches are a named group ("Tag colour") of `aria-pressed` buttons — the
  hue is in each name ("Tag colour green"), so the selection is spoken, not
  just seen.
- Enter in the field adds, same as the button; the button disables while the
  field is blank.
- Tone is never meaning here — a red tag is not an error. If tags acquire
  meanings, they've become a pattern.

## Don't

- **Don't map tones to VCP semantics at call sites** — "red means blocked" is
  a pattern to write, not a convention to whisper.
- **Don't feed it hex colours** — five tones is the API; more hues is a token
  conversation first.
- **Don't use it for statuses** — statuses are assigned, tags are invented.
- **Don't let duplicates in silently** — `onAdd` fires for any non-empty
  name; deduplicate (the Default story shows it).

# DescriptionCardTitle *(atom)*

The card at the top of an Added Value page that names it: the AV's reference
over its title.

Read off Figma's `Description_Card_Title` (VCP Pages - Flows, the left column of
every AV page): an elevated card, 16 in, 8 radius; the reference 16 regular,
the title 16 semibold, both `text.primary`.

## When to use

| Use | For |
|---|---|
| `DescriptionCardTitle` | The top of an Added Value page's left column, above the description sections |
| `AVHeader` | The ID row above the page: back arrow, the reference as the `<h1>`, the status buttons |
| `PageTitle` | The title band of any page that is not an Added Value |

**The AV page has two headers.** `AVHeader` is the ID row and holds the page's
only `<h1>`; this card carries the title, as the `<h2>` beneath it. Use both.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `reference` | `string` | required | "VCP-1234". Plain text above the title |
| `title` | `string` | required | The AV's title. Wraps; never cut |
| `headingLevel` | `2 \| 3` | `2` | The title's heading level. `2` under `AVHeader`'s `<h1>` |
| `className` | `string` | — | Merged via `cn()`. Other `<div>` attributes pass through |

## Tokens

`surface.elevated` (the card), `text.primary` (both lines), radius `md` (8),
padding `4` (16). Type: `title-sm-regular` for the reference,
`body-md-semibold` for the title.

## Accessibility

- The title is a real heading (`<h2>` by default), so the page reads
  "VCP-1234" (the `<h1>`), then the title, then the description sections.
- The reference is not a second heading: the `<h1>` already says it.
- A long title wraps onto more lines rather than being cut with "…": this card is
  the one place the whole title is shown, so it never needs a tooltip.
- Text is `text.primary` on `surface.elevated`, well above 4.5:1 in both themes.

## Don't

- **Don't make it the `<h1>`.** `AVHeader` holds the page's one `<h1>`.
- **Don't truncate the title.** Tables cut it (`TruncatedText`); this card shows it whole.
- **Don't put actions in it.** The status buttons are `AVHeader`'s and the ⋮ menu is `DetailCardMenu`'s.
- **Don't use it outside an Added Value page.** Other pages use `PageTitle`.

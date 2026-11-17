# DescriptionCardTitle *(component)*

The card at the top of an Added Value page that names it: to read, the AV's
reference over its title; to edit, the **Title** field.

Read off Figma's `Description_Card_Title` (VCP Pages - Flows, the left column of
every AV page): an elevated card, 16 in, 8 radius; the reference 16 regular,
the title 16 semibold, both `text.primary`.

**It was an atom that only read, and the AV page built its own editing title
beside it.** The editing card holds a `Field` and an `Input`, which an atom may
not import, so it moved up a tier and the page now uses it in every state. Its
import from the package root is unchanged.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |
| `Input` | atom |
| `Field` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## States

Figma's `_Description_Card_Title_Base`:

| Figma `State` | Here |
|---|---|
| Viewing | the default: the reference over the title, an `<h2>` |
| Editing Placeholder | `editing` with an empty `title`: the **Title** label over the field, "Type in the title" as the prompt |
| Editing Filled | `editing` with a `title` |
| Disabled | `editing` and `disabled`: the value stays, greyed, and takes no focus |
| `Multipart Child` switch | `parent={{ ref: 'VCP-4321' }}`: "Multipart Child of VCP-4321" at the card's right edge when reading, in secondary text; with an `href` the reference is a link that opens the parent in a new tab, with only `onOpen` a button, with neither plain text |

An `error` shows under the field and sets `aria-invalid`, as every `Field` does.

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
| `reference` | `string` | — | "VCP-1234". Plain text above the title when reading |
| `title` | `string` | required | The AV's title (the field's value when editing). Wraps; never cut |
| `headingLevel` | `2 \| 3` | `2` | The title's heading level. `2` under `AVHeader`'s `<h1>` |
| `editing` | `boolean` | `false` | The card is the **Title** field. With no `onChange` the field is read-only |
| `onChange` | `(title: string) => void` | — | Editing: the title changed |
| `label` / `placeholder` | `string` | "Title" / "Type in the title" | Editing: the field's label and prompt |
| `error` | `string` | — | Editing: what is wrong |
| `disabled` | `boolean` | — | Editing: cannot be changed |
| `parent` | `{ ref, href?, onOpen? }` | — | Reading a multipart child: shows "Multipart Child of <ref>" |
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
- **Don't build an editing title beside it.** The Title field is this card's `editing` state.
- **Don't use it outside an Added Value page.** Other pages use `PageTitle`.

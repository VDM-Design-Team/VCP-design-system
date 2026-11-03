# DeliverableLinkForm *(component)*

The form that takes a link: its URL and its title, then Cancel and Add (or Save, when changing a link
already added).

Read off Figma's `_Deliverables_Add_Link`, `_Deliverables_Paste_Link` and `_Deliverables_Link_Title`.

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Icon` | atom |
| `Input` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DeliverableLinkForm` | Adding links to a deliverable, or changing one |
| `Field` + `Input` | Any other single field |

## Behaviour

- **Adding can take several at once.** "+ Add another link" puts another URL and title pair under the first, and
  Add hands over every pair. Editing is one pair, with Save, and no "Add another link".
- **Checked when Add or Save is pressed**, not as you type. Each message sits under its own field, which is marked
  invalid: **"Please enter a link title"** for an empty title, and **"Please enter a valid URL starting with
  https://"** for a URL that is empty or does not begin `https://`. Nothing is handed over until every pair passes.
- It only reports. The page decides what adding means.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `mode` | `'add' \| 'edit'` | `add` | `edit`: one link, the button reads "Save" |
| `initial` | `{ url, title }` | — | Edit: the link being changed |
| `onSubmit` | `(links) => void` | required | Every pair, once all pass |
| `onCancel` | `() => void` | required | |
| `className`, `ref`, rest | | | On the `<form>` |

## Tokens

`Input` (full width, a link glyph before the URL), 8 between fields, `caption-md-medium` messages in
`accent.critical.outline.content` 6 under their field, "+ Add another link" a `tertiary` small `Button`, Cancel
`tertiary`, Add / Save `secondary`, right-aligned. No new tokens.

## Accessibility

- Real inputs with names ("Link URL", "Link title", numbered when there are several).
- A message is `role="alert"` and tied to its field with `aria-describedby`; the field is `aria-invalid`.
- The form is `noValidate`: the messages are ours, in the design's words.

## Don't

- **Don't validate as the user types.** It reads as an error before they have finished.
- **Don't accept `http://`.** The design asks for `https://`.

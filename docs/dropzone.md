# Dropzone

The file target: click to browse, or drag files onto it. Hands the caller
`File[]` and nothing more.

## When to use

| Use | For |
|---|---|
| `Dropzone` | Attaching files is a real part of the task (evidence, documents) |
| A plain button + hidden input | One-off, space-tight uploads (an avatar) |
| `FileAttachment` *(to port)* | Showing what was uploaded — compose it below this |

The zone is only the *intake*. Upload progress, retries, previews and the
resulting list live with the caller — this component forgets the files the
moment it hands them over.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `onFiles` | `(files: File[]) => void` | — | From browse or drop; never fires empty |
| `label` | `string` | `'Choose files'` | The linked verb in "… or drag and drop" |
| `hint` | `string` | — | The contract line: "PDF or PNG, up to 10 MB" |
| `accept` | `string` | — | Filters the **browse dialog only** — dropped files arrive unfiltered; validate them |
| `multiple` | `boolean` | `true` | — |
| `disabled` | `boolean` | — | Also inert to drops |
| `className` | `string` | — | On the zone |
| `ref` | `Ref<HTMLInputElement>` | — | The real file input |

Everything else is forwarded to the input (`name`, `required`, `aria-*`).

## The keyboard path is real

The export hid the input with `display:none` — removing it from the tab
order, leaving a target only pointers could reach. Here the input is `sr-only`:
Tab lands on it, Enter/Space open the browse dialog, and the zone draws the
shared focus ring via `focus-within`. Drag-and-drop is the pointer bonus on
top, never the only way in. Selecting the same file twice in a row fires
again (the input resets after each hand-off).

## Tokens

Resting: dashed `stroke.field` on `surface.elevated` — the form-control
border, because this is a form control; the export's `stroke.default`
measured 2.56:1 against the 3:1 a control boundary needs. Drag-over:
`stroke.focused` over `surface.brand.base`. The browse verb wears
`text.link.default`; icon and hint `text.tertiary`; hint at `label-sm` (the
export's 11px/400 has no ramp partner). New glyph: **`cloud-arrow-up`** added
to the icon set from Phosphor, per docs/icon.md.

| Pair | Light | Dark |
|---|---|---|
| Dashed border on `surface.elevated` | **4.76:1** | **5.71:1** |
| Drag-over border on its tint | **5.76:1** | **8.88:1** |
| Browse verb on `surface.elevated` | **5.01:1** | **6.73:1** |
| Hint on `surface.elevated` | **7.58:1** | **9.85:1** |

## Accessibility

- The input is real and focusable; the whole zone is its `<label>`, so
  clicking anywhere opens the dialog and the name is the visible text.
- `accept` is a convenience, not a gate — announce actual constraints in
  `hint` and validate what arrives, because drops bypass the filter.
- Disabled is visibly quiet *and* inert to drops — not just a greyed label
  over a live target.
- Drag-over state changes border **and** fill — never colour of one element
  alone.

## Don't

- **Don't trust `accept`.** Dropped files ignore it; validate in `onFiles`.
- **Don't build upload progress into the zone** — it hands off and forgets;
  progress belongs to the list you render below.
- **Don't hide the hint when there are real constraints** — discovering the
  10 MB limit from a failed upload is the bad version.
- **Don't nest it inside another label or button** — it is a `<label>` with a
  control inside.

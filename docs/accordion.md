# Accordion

Stacked disclosure panels: FAQ entries, grouped settings, a review checklist.
Each header is a button inside a real heading; each open panel is a labelled
region.

## When to use

| Use | For |
|---|---|
| `Accordion` | Sections worth hiding: optional detail, FAQs, long grouped forms |
| `Tabs` | Peer views where exactly one is visible and comparison isn't needed |
| `Card` + headings | Content that should simply all be visible — hiding is a cost, not a feature |
| `Modal` | A task that interrupts, rather than a section that expands |

Hiding content behind a click is a tax on finding it. Reach for an accordion
when scanning the *headers* is the point (the questions, the section names) —
not to make a long page look shorter.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `AccordionItem[]` | required | `{ key?, title, meta?, content? }`. `key` defaults to the index — fine for static lists |
| `openKeys` | `readonly string[]` | — | **Providing this (even `[]`) makes it controlled** |
| `onToggle` | `(key: string) => void` | — | The toggled key. Required for controlled use; also fires uncontrolled |
| `defaultOpenKeys` | `readonly string[]` | `[]` | Uncontrolled: panels open at mount |
| `multiple` | `boolean` | — | Uncontrolled: panels accumulate instead of swapping. Controlled mode ignores it — the caller owns the policy |
| `headingLevel` | `2 \| 3 \| 4` | `3` | Level of the item titles |
| `className` | `string` | — | Merged via `cn()` |
| `ref` | `Ref<HTMLDivElement>` | — | The wrapping `<div>` |

`AccordionItem.meta` is the right-aligned hint slot — a count, "optional", a
`Badge size="sm"`. It sits inside the header button, so it is part of the
button's accessible name; keep it short and meaningful, not decorative.

## Tokens

Item: `surface.elevated` on a `stroke.subtle` border, `radius.md`. Header:
`text.primary` title at `label-lg`, `text.tertiary` meta and caret,
`surface.neutral.faint` hover, `surface.brand.base` while open. Content:
`text.secondary` at `body-md`. No new tokens.

| Pair | Light | Dark |
|---|---|---|
| Title on open header tint | **18.80:1** | **20.52:1** |
| Meta on open header tint | **7.06:1** | **13.82:1** |
| Content on `surface.elevated` | **10.35:1** | **11.87:1** |

The open state carries three signals: the brand tint, the rotated caret, and
`aria-expanded` — never colour alone.

## Accessibility

- The APG disclosure pattern, fully wired: heading → `<button aria-expanded
  aria-controls>` → `role="region" aria-labelledby`. The export had bare
  buttons and anonymous divs.
- Headings are real (`h3` by default, movable with `headingLevel`), so the
  accordion contributes its sections to the page outline and rotor.
- The focus ring draws inward (`-outline-offset`) because the item container
  clips — the ring is never swallowed.
- **Closed content is unmounted**, as in the export. The right default for
  heavy panels — but it means no browser find-in-page into closed panels, and
  form state inside a panel dies when it closes. Keep form state above the
  accordion.
- No arrow-key traversal between headers: optional in the APG pattern, and Tab
  through real buttons already works. Add it here if accordions grow long,
  not in callers.

## Don't

- **Don't put critical content only inside a closed panel** — anything the
  user *must* see doesn't belong behind a click.
- **Don't put interactive controls in `title` or `meta`** — they end up
  inside the header button; nested controls are unreachable.
- **Don't use it as navigation.** Headers toggle panels; they don't route.
  A sidebar tree is a different component.
- **Don't force `multiple` behaviour through controlled mode without need** —
  uncontrolled with `multiple` already does it; controlled is for callers with
  real state to sync (URL, persistence).
- **Don't keep form inputs inside panels that auto-close** — unmounting eats
  their state; lift it or keep the panel open while editing.

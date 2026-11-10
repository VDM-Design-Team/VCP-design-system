# ValueCards

The dashboard's count of Added Values by status: a titled card holding a row of `StatCard`s (Figma draws six: Completed, In Review, Overdue, In Progress, Pending, Draft), with an optional "whose" filter on the right of the title ("Assigned"). Built to Figma's `Value_Cards`.

## Composed of

| Piece | Tier |
|---|---|
| `Select` | atom |
| `Skeleton` | atom |
| `StatCard` | component |
| `CardHeader` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `ValueCards` | The status counts on a dashboard |
| `StatCard` | One headline number |
| `StatCardGroup` | Several numbers under one title on the super admin's dashboard |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `{ key, label, value, accent?, hint? }[]` | required | One card each, in order. `accent` is the stripe's tone: Completed `success`, In Review and In Progress `brand`, Overdue `critical`, Pending `yellow`, Draft `neutral` |
| `title` | `string` | `Value Cards` | The heading, and the region's name |
| `filter` | `{ label, value, options, onChange }` | — | The "whose" select (Figma lists All, Initiated, Assigned, Team). Omit it and there is none |
| `loading` | `boolean` | — | Placeholders and a status; the section is `aria-busy` |
| `empty` | `ReactNode` | "No Added Values to count yet." | With no items |
| `className`, `ref` | | | On the section |

## It is data

Pass the items; the cards follow. **It does no counting**, and which statuses a role sees is the page's: Figma draws six, a role may see fewer, and each is a card the page passes.

## Layout and responsiveness

A container query on the card's own width. **Six cards** (Figma's set): one row from 71rem (1136: six 176 cards and five gaps of 16, which is a 1440 window less the 256 rail), three by two from 36rem, two by three from 28rem, one column below. **Five** are one row of five at the same width; **four or fewer** are four across from 56rem, two by two from 28rem, one column below. Each `StatCard` is the dashboard's Value_Card (a stripe, left-aligned, 100 high). The card is `surface.elevated`, `radius.md`, `space.24`, `space.16` between its parts.

## Accessibility

- A `section` named by its title; the filter is a native select named by its `label`.
- Each card's label is a `<span>` (see `StatCard`), so a row of four adds no headings.
- Loading: one `status` ("Loading Value Cards").

## Don't

- **Don't count inside it.** Pass the numbers.
- **Don't make the cards links here.** Figma draws them as figures only; a click-through is a design decision first.

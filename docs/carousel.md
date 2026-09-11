# Carousel

One panel at a time, with an arrow on each side to move between them.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `IconButton` | atom | The two arrows |

The import rows are checked against the real imports — `npm test` fails if this
list drifts.

## It does not render the dots

`PaginationDots` is a separate atom and the **caller** places it, because a
design does not always put the dots beside the content: `ChangeLogModal` puts
them below its footer buttons, which a self-contained carousel could not have
done.

That is also why this is **controlled**. `index` and `onIndexChange` belong to
the caller, so the arrows here and the dots wherever they live are reading one
number rather than two that can drift apart.

```tsx
const [index, setIndex] = useState(0);

<Carousel count={3} index={index} onIndexChange={setIndex} label="What’s new">
  <Panel index={index} />
</Carousel>
<PaginationDots count={3} index={index} onChange={setIndex} label="What’s new" />
```

## When to use

| Use | For |
|---|---|
| `Carousel` | A few panels the user moves through in order, where only one fits |
| `Tabs` | Peer views with names. If the panels have labels, they are tabs |
| `Pagination` | Addressable pages someone might name — "page 7 of 40" |
| A list | Content that could simply all be visible. Hiding it behind an arrow is a cost |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `count` | `number` | required | How many panels |
| `index` | `number` | required | 0-based. Controlled |
| `onIndexChange` | `(index: number) => void` | required | |
| `label` | `string` | required | The carousel's accessible name. Say what the panels are of |
| `children` | `ReactNode` | required | The panel at `index` — one, not all of them |
| `previousLabel` / `nextLabel` | `string` | `'Previous'` / `'Next'` | Name them for the content where it helps |

## Two decisions worth knowing

**It wraps.** Next on the last panel goes to the first. The alternative was
disabling each arrow at its end; wrapping keeps both arrows live and puts the
whole of "where am I" on the dots. Decided 11 September 2026.

**It never moves on its own**, and there is no prop to make it. A panel that
changes while it is being read is the single worst thing a carousel does, and
every remedy — pause on hover, pause on focus, a stop button — is machinery
that exists only to undo the original decision. If something must rotate
itself, it is not this component.

## Accessibility

- **`aria-roledescription="carousel"`** on the group, so it is announced as a
  carousel rather than a group and the arrows are understood to change what is
  underneath them.
- **The panel is a labelled slide** — `aria-roledescription="slide"` with the
  name "2 of 3" — so position is available without counting dots.
- **The panel is a polite live region**, so moving is announced. That is only
  safe *because* nothing moves on its own; a live region that changes unbidden
  is what makes carousels unreadable.
- **Left and right arrow keys** move it from anywhere inside.
- **The arrows are real `IconButton`s** with required names, so neither can
  ship unlabelled.
- **Interaction test.** `MovingThroughIt` is a `play` story and runs under
  `npm test`: the arrows, the wrap at both ends, the arrow keys, and the dots
  reading the same index.

## Don't

- **Don't render all the panels and hide them with CSS.** Pass the one at
  `index`; a hidden panel that is still in the DOM is still in the tab order
  unless someone remembers to handle it.
- **Don't add auto-advance.** See above.
- **Don't use it for named views.** That is `Tabs`, and names are better than
  arrows.
- **Don't put more than about eight panels in it.** `PaginationDots` stops
  working past that, and so does the user's patience.

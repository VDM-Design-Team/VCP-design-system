# AvatarGroup

An overlapping stack of people, with the tail collapsed into a `+N` chip.

`AvatarGroup` composes `Avatar`. Per CLAUDE.md that keeps it a **component**, not
a pattern: composition is not the test, and nothing in here knows anything about
VCP.

## Composed of

| Piece | Tier |
|---|---|
| `Avatar` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Situation | Use | Because |
|---|---|---|
| "Who is on this?" at a glance — assignees, reviewers, attendees | `AvatarGroup` | One glance, one line, fixed width however many people there are |
| Each person needs to be clicked, linked or removed | A real list of controls | The stack is one image; there is nothing inside it to focus |
| The full roster must be readable | A list of names | The stack announces the visible people plus a count, not everyone |
| Exactly one person | `Avatar` | A stack of one is just an avatar with a ring |
| More than about eight people, all shown | A count, or a list | Past `max` the chip is the point; a wall of faces is not |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `people` | `Array<string \| { name, initials, src, tone }>` | — | In reading order. A bare string is shorthand for `{ name }` |
| `max` | `number` | `4` | Avatars drawn before the rest collapse into `+N` |
| `size` | `sm \| md \| lg` | `md` | Passed straight down to every `Avatar`. 24 / 32 / 40 |
| `label` | `string` | — | What the stack **is** — `"Assignees"`. Prefixed to the announced summary |
| `className` | `string` | — | Merged onto the row via `cn()` |
| `ref` | `Ref<HTMLSpanElement>` | — | Points at the row |

Renders `null` for an empty `people` array — handle the empty state yourself,
where you know what "nobody yet" should say.

## Tokens

Every avatar in the stack is an `Avatar` with `ring`, so the tone tokens and their
measured contrast are in [`docs/avatar.md`](./avatar.md) — 8.07:1 – 8.50:1 in
light, 4.50:1 – 7.23:1 in dark, with the `green`-in-dark caveat noted there.

The group adds only these:

| Part | Token | Utility | Contrast |
|---|---|---|---|
| Overflow chip surface | `surface.neutral.subtle` | `bg-surface-neutral-subtle` | — |
| Overflow chip text | `text.secondary` | `text-text-secondary` | **9.45:1** light, **8.40:1** dark |
| Ring on every avatar and the chip | `surface.elevated` | `ring-2 ring-surface-elevated` | — |
| Chip radius | `shape.radius.pill` | `rounded-pill` | — |
| Chip type, `sm` / `md` / `lg` | `type.label-sm` / `-md` / `-lg` | `text-label-sm` … | — |
| Overlap, `sm` / `md` / `lg` | Tailwind numeric scale | `-ml-1.5` / `-ml-2` / `-ml-2.5` | — |

The chip is deliberately neutral rather than a fifth tone: it is a count, not a
person, and a coloured chip reads as one more member of the stack.

**Token gap.** The overlap is about a quarter of the avatar at each size and comes
from the numeric scale directly. There is no `spacing.overlap` token and none is
proposed — inventing one for a single component would be a token nobody else can
use.

## Accessibility

**The group announces as one labelled image**, not as a list:

> `Assignees: Ali Rahman, Eve Chen and 3 others`

The root is a single `role="img"` with that `aria-label`; everything inside is
presentational under it, including the `+3` chip, which is additionally
`aria-hidden`.

**Why one label rather than a list.** A stack of avatars is a *glanceable summary*
— a sighted user takes the whole thing in at once and does not step through it.
`role="list"` would turn that one glance into N stops, and since the avatars are
not interactive there is nothing to do at any of those stops. A list also has to
solve the `+3` chip, which is a count and not a list item. One label gives parity:
the same information, in the same single beat, and the overflow arrives as words
("and 3 others") instead of a glyph a screen reader would read as "plus three".

**What the label says is what is drawn.** The summary names the people who are
actually visible and counts the rest. It does not enumerate everyone behind the
chip — a sighted user cannot see them either, and announcing names that are not
on screen breaks that parity. If the full roster genuinely matters, this is the
wrong component: render a list of names.

Other notes:

- **Give it a `label`.** Without one the group announces a bare run of names with
  no clue why they are there. `"Assignees"`, `"Reviewers"`, `"Attending"`.
- **A person with neither a name nor initials is counted, not dropped** — they
  join the "and N others" tail, so the count always matches the number of faces.
  That means the spoken count can exceed the visible `+N`; the label describes
  reality, the chip only describes the collapsed tail.
- **Nothing in the stack is focusable**, and that is deliberate: a focus stop with
  no action behind it is a trap for keyboard users.
- **Contrast** is `Avatar`'s, plus 9.45:1 / 8.40:1 for the chip. The `ring` is
  decoration between two avatars, not a meaningful boundary, so 1.4.11 does not
  apply to it.
- **Target size** does not apply — the group is not a control.

## Don't

- Don't wrap the group in a link or a button. That gives one control for N people
  and the accessible name becomes a sentence. Use a list of real controls.
- Don't set `max` above about six. Past that the stack stops being glanceable and
  the chip is doing the work anyway.
- Don't pass `standalone` to the avatars inside — they are already covered by the
  group's label, and it would announce every name twice.
- Don't rebuild the stack by hand with `-ml-2` and bare `Avatar`s. The ring, the
  overlap and the announcement are the component.
- Don't use it to show a queue, a rank or an order of any kind. The overlap is
  visual, not semantic.
- Don't hardcode the overlap or the chip. `className="-ml-[7px]"` is a bug.

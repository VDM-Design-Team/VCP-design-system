# DueDatePill

An Added Value's due date, worn as a pill that changes colour as the date
approaches — a component composing `Badge`, and the owner of VCP's due-date →
tone mapping.

Read off the Figma `Due_Date_Tag` set (`3429:11064`), audit batch 5,
11 September 2026.

## Composed of

| Piece | Tier |
|---|---|
| `Badge` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DueDatePill` | An AV's due date anywhere it appears with proximity meaning |
| `Badge` | A date with no urgency to it |
| `DatePicker` | **Changing** a date — this pill only shows one |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `children` | `ReactNode` | — | The date, already formatted |
| `proximity` | `DueDateProximity` | `'default'` | `default` · `due-soon` · `overdue` |
| `size` | `'sm' \| 'md'` | `'sm'` | Inherited from `Badge`. The AV table uses `sm` |

## The mapping

| Proximity | Badge tone | Resolves to |
|---|---|---|
| `default` | `neutral` | `surface.neutral.subtle` on `text.secondary` |
| `due-soon` | `warning` | `accent.warning.tonal.*` |
| `overdue` | `danger` | `accent.critical.tonal.*` |

**Two things this does not own.**

*The text.* It takes an already-formatted string. How a date reads —
"October 1, 2025", "1 Oct", "in 3 days" — is a locale and product decision a
design-system pill has no business making.

*The threshold.* `dueDateTone` does the comparing, but `soonWithinDays` has no
default and never will get one here. How many days ahead counts as "soon" is a
product rule that differs by domain, and a design system that invents one has
quietly made a product decision on someone else's behalf.

```tsx
<DueDatePill proximity={dueDateTone({ due, soonWithinDays: 7 })}>
  {due.toLocaleDateString('en-US', { dateStyle: 'long' })}
</DueDatePill>
```

Both dates are floored to local midnight before comparing, so a task due today
is never "overdue" at 4pm — whole days are the unit a due date is expressed in.

One Figma deviation: Figma's Default row is `neutral.tonal.*` (slate-200 on
slate-700); `Badge`'s neutral tonal is `surface.neutral.subtle` on
`text.secondary` — slate-100 on slate-700. One step of slate apart on the fill,
identical text. The `Badge` tone is used rather than adding a near-duplicate
token family, so every neutral pill in the system stays one colour. Modelling
the full neutral families belongs with issue #103.

## Accessibility

- Contrast on `surface.elevated`, all three proximities: **≥ 5.6:1** light,
  **≥ 5.1:1** dark. Inherited from `Badge`'s tonal pairs.
- **Colour is not the only cue** for the reader who needs the fact: the date
  itself is the text. A pill that said only "Overdue" in red would fail; this
  one says the date.
- Not interactive, so the 40px target minimum does not apply.

## Don't

- **Don't branch on the date at a call site.** `dueDateTone` is the one place
  that compares.
- **Don't pass a `Date` as `children`.** Format it first; React will not.
- **Don't give `soonWithinDays` a house default.** See above.

## Still open

**What counts as "due soon" in VCP?** Design has drawn the three states but not
said where the boundary sits, and it may differ per domain. Until it is
answered, every call site states its own rule out loud, which is the honest
version of not knowing.

# RejectionReason

The reason someone gives for rejecting an Added Value: a `Select` of named
reasons, the chosen reason's explanation underneath, and a free-text box when
the reason is `Other`.

Read off the Figma `Pending_Rejection_Reason` (`7847:105965`) and
`Handoff_Rejection_Reason` (`7262:7492`), audit batch 4, 11 September 2026.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Select` | atom | The list of reasons |
| `Input` | atom | The free text, when the reason asks for one |

The import rows are checked against the real imports — `npm test` fails if this
list drifts.

## Why it exists on its own

**Two modals need it, with different reason sets.** The pending rejection has
five reasons, the handoff rejection has six, and the shape is identical: pick a
reason, read what it covers, type something extra if the reason is `Other`.
Built inside either modal it would be built twice and drift once.

## It owns the reason vocabulary

Both sets live here as exported constants, the way `Sidebar` owns its nav
vocabulary and `StatusPill` owns status → tone. They are **drawn in the design
file**, not configured per domain, so there is one place for them:

| Set | Reasons |
|---|---|
| `PENDING_REJECTION_REASONS` | Incomplete or Unclear Submission · Duplicate · Out of Scope · Needs Refinement · Other |
| `HANDOFF_REJECTION_REASONS` | Functionality · Design Mismatch · Execution Refinement · Request Refinement · Misalignment / Not Needed · Other |

Pass one of them to `reasons`. A caller may pass its own array for a set the
design has not drawn, and the same warning applies as for `Sidebar`'s `items`:
if that starts being routine, the vocabulary has moved and this should follow.

**The explanation is data on the reason, not prose at the call site.** It is
the design's own wording for what each reason covers, and it is what tells the
person rejecting whether they have picked the right one.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `reasons` | `RejectionReasonOption[]` | required | One of the two constants above |
| `value` | `string` | — | The chosen reason's `value`. Controlled |
| `onChange` | `(value: string) => void` | — | The choice |
| `detail` | `string` | — | The free text. Controlled |
| `onDetailChange` | `(detail: string) => void` | — | The free text changing |
| `label` | `string` | `'Rejection reason'` | The select's accessible name |
| `placeholder` | `string` | `'Select Rejection Reason'` | The design's own wording |
| `detailPlaceholder` | `string` | `'Specify the rejection reason (optional)'` | Likewise |
| `disabled` / `invalid` | `boolean` | `false` | `invalid` draws the critical border — pair it with a message from `Field` |

`RejectionReasonOption` is `{ value, label, description?, freeText? }`.
`freeText` is what opens the box; exactly one reason in a set should carry it.

## Tokens

No new tokens. The select and the input are `Select` and `Input` unchanged;
the explanation is `type.body-sm` on `text.tertiary`, the same pairing `Field`
uses for helper text.

## Accessibility

- **The explanation is wired to the select** with `aria-describedby`, so it is
  announced as part of the control rather than left as loose text nearby. A
  reason with no explanation sets no `aria-describedby` at all rather than
  pointing at an empty node.
- **The free-text box is named** — "Rejection reason — details" — because a
  placeholder is not a label and this box has no visible one in the design.
- **It appears and disappears with the choice.** Nothing is hidden-but-focusable:
  when the reason does not ask for free text, the input is not rendered.
- **`invalid` sets the critical border and `aria-invalid`** via `Select`, and
  expects a real message from the `Field` around it — this component renders no
  error text of its own, the same split `Input` uses.
- **Interaction test.** `ChoosingAReason` is a `play` story and runs under
  `npm test`: it checks the explanation follows the choice and is wired to the
  control, that `Other` opens the box, and that going back to a named reason
  closes it.

## Don't

- **Don't re-derive the reason sets at a call site.** That is what the two
  constants are for.
- **Don't give two reasons `freeText`.** The design draws exactly one per set,
  and a second would make "Other" meaningless.
- **Don't render your own error text beside it.** Wrap it in a `Field` and pass
  `error`, which is what wires the message to the control.
- **Don't use it for anything but a rejection.** It names rejection reasons. A
  general "pick one and explain" control would be a different component.

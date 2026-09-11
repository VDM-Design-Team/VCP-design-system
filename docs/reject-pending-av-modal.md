# RejectPendingAVModal

Rejecting an Added Value that is still `Pending`, before anyone has worked on
it. One question: why.

Read off the Figma `Reject_Pending_AV_Modal` (`7847:106048`, audit batch 4,
11 September 2026), all three of its states.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Modal` | component | The dialog — header, focus trap, Escape, inert background |
| `RejectionReason` | component | The reason, its explanation, and the free text for `Other` |
| `Button` | atom | Cancel and Reject |

The import rows are checked against the real imports — `npm test` fails if this
list drifts, and fails a pattern composing fewer than two pieces.

## The design draws its validation

In the first state, with no reason chosen, **Reject is faded** — disabled. In
the second it is solid. So a rejection cannot be sent without a reason, and the
dialog says so by what it lets you press rather than by an error after the
fact. That is the better half of the two, and it is what the design asked for.

Compare `HandoffAVModal`, which validates on submit with a message: there the
required field sits among five others and disabling the button would leave the
user hunting for which one. Here there is exactly one field.

## Reject is `primary`, not `danger`

Rejecting a pending value is a decision, not a destruction — nothing is lost,
and the submitter is told why. The design draws it in brand blue.
`ConfirmDeleteAVModal` is where the red button lives, and it is red because
something disappears.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` | `boolean` | required | You own it |
| `onClose` | `() => void` | required | Escape, Cancel, or a backdrop click |
| `onReject` | `({ reason, detail? }) => void` | required | The rejection, once |
| `loading` | `boolean` | `false` | Spins Reject while it is in flight |

`detail` is present only when the chosen reason asks for free text, which in
the pending set is `Other` alone.

It is uncontrolled, like the other AV modals in this family, and clears itself
when it closes.

## The visible label is a wrinkle

The design shows a **visible** "Rejection Reason" label above the select.
`RejectionReason` names its own select through `label`, which is an
`aria-label` — so this pattern renders the visible text itself and passes the
same string, both from one constant, so the two cannot drift.

That works, but the tidier answer is for `RejectionReason` to render a real
`<label>` wired to its own select, and for this pattern to stop drawing one.
Worth doing when a second dialog needs the same thing — `Review`'s handoff
rejection is that second dialog, so it is close.

## Accessibility

- **The select is named** "Rejection Reason", and the explanation under it is
  wired with `aria-describedby` by `RejectionReason`.
- **Reject is genuinely disabled**, not merely faded, so it is skipped by the
  keyboard rather than being a stop that does nothing.
- **Interaction test.** `RejectingIt` is a `play` story and runs under
  `npm test`: it checks Reject is disabled with nothing chosen, enabled once a
  reason is picked, that the explanation appears, and that free text from
  `Other` travels with the rejection.

## Don't

- **Don't make Reject `danger`.** Nothing is destroyed here. The red button is
  for `ConfirmDeleteAVModal`.
- **Don't add an error message for the missing reason.** The disabled button is
  the design's answer, and two mechanisms for one rule is one too many.
- **Don't use it for a handoff rejection.** That is a different reason set —
  `HANDOFF_REJECTION_REASONS` — and it belongs to `Review`.

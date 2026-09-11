# ReviewAVModal

What an initiator or admin reads before accepting or rejecting handed-off work,
and the rejection dialog that opens on top of it.

Read off the Figma `Review_AV_Modal` (`6100:15103`, audit batch 4,
11 September 2026), all four variants.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Modal` | component | Both dialogs — the review, and the rejection over it |
| `RejectionReason` | component | The handoff reason set, in the nested dialog |
| `FileAttachment` | component | What was handed off |
| `Checkbox` | atom | The domain's one choice |
| `Button` | atom | Reject, Accept, Cancel |

The import rows are checked against the real imports — `npm test` fails if this
list drifts, and fails a pattern composing fewer than two pieces.

## The body is a read, not a form

Everything above the checkbox is what was handed off — the estimate, the
completion date, the links, the attachments — shown so the reviewer can judge
it, not edit it. There is not an input in it. The links are real `<a>`s,
because the reviewer is meant to open them.

**A missing value shows an em dash.** Without one, a field with nothing in it
and a field with an empty string look identical, and the reviewer cannot tell
"not given" from "given as blank".

**An empty attachment list is different**, and gets the design's own sentence —
"No attachments yet." — because *none* is a fact about the handoff rather than
a missing value.

## The domain has exactly one choice

| `domain` | The checkbox |
|---|---|
| `design` | Copy to Dev |
| `development` | Require Cypress Test Script |

One prop, `domainOption`, with the label from the domain. It travels out with
`onAccept({ domainOption })`, so the caller never reads it back off its own
state.

## Rejecting opens a second dialog

That is the design's `Rejection Modal=Show` variant, and it is a real nested
`Modal`. The review goes **inert** behind it — not clickable, not tabbable —
and is dimmed by the inner dialog's own backdrop, which is exactly how the
design draws the pair.

`Modal` only learned to nest on 11 September 2026. Before that the outer
dialog's focus trap answered for both: Escape closed the *review* and left the
rejection dialog orphaned, and Tab died. See `docs/modal.md`, and the
`NestedDialog` story there.

**The inner Reject is `danger` and disabled until a reason is chosen.** Both
are the design's. Note that `RejectPendingAVModal`'s Reject is `primary` —
rejecting work that was never started is a decision; rejecting work that was
done and handed off is heavier, and the design draws it red.

The reason set is `HANDOFF_REJECTION_REASONS`, six reasons, the other half of
what `RejectionReason` was built for.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` | `boolean` | required | You own it |
| `onClose` | `() => void` | required | Escape, or a backdrop click |
| `onAccept` | `({ domainOption }) => void` | required | Carries the domain's choice |
| `onReject` | `({ reason, detail? }) => void` | required | From the nested dialog |
| `domain` | `design \| development` | `design` | Decides the checkbox |
| `avName` | `string` | `'AV Name'` | In the title |
| `estimate` / `completionDate` | `string` | — | Em dash when absent |
| `links` | `string[]` | `[]` | Rendered as real links |
| `attachments` | `{ name, size?, thumb? }[]` | `[]` | Tiles, or the empty sentence |
| `domainOption` | `boolean` | `false` | Controlled |
| `onDomainOptionChange` | `(value: boolean) => void` | — | |
| `loading` | `boolean` | `false` | Spins whichever answer is in flight |

## Accessibility

- **Both dialogs are named**, and only the innermost answers the keyboard —
  that is `Modal`'s nesting contract, not something this pattern arranges.
- **The links are links.** They carry `target="_blank"` with `rel="noreferrer"`,
  and their accessible name is the URL itself, which is what the reviewer needs
  to recognise.
- **The inner Reject is genuinely disabled**, not merely faded, so the keyboard
  skips it rather than stopping on something that does nothing.
- **Interaction tests.** `Accepting` checks the body is a read — real links, no
  inputs — and that the choice travels with the answer.
  `RejectingOpensASecondDialog` is the nested case: it checks the review goes
  inert, that Escape closes only the inner dialog and the review comes back
  live, and that the reason travels out.

## ⚠️ `Review_Already_Reviewed_Popup` exists in the design and is used nowhere

A small dialog — "Already Reviewed", "This Value has already been reviewed by
the initiator.", one Close button. **A search of every page in the file finds
zero instances of it**, the same as the five Accept-modal field molecules.

Not ported. It is two lines of content in a `Modal` whenever design says where
it belongs, and guessing its trigger is guessing at a flow.

## Don't

- **Don't make the body editable.** It is the record of what was handed off; if
  a reviewer needs to change something, that is a rejection with a reason.
- **Don't close the review yourself when the rejection succeeds.** `onReject`
  reports it; the caller closes when the server agrees.
- **Don't make the inner Reject `primary`.** Rejecting finished work is the
  heavier of the two rejections, and the design draws it red.
- **Don't add a third dialog.** Two is what the design draws, and `Modal`'s
  stack is tested at two.

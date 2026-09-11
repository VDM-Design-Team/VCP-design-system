# AcceptPendingAVModal

The confirmation an admin answers to accept a pending Added Value, and the one
decision that comes with it: whether the value is **multipart**.

Read off the Figma `Accept_Added_Value_Modal` (`5939:149041`, audit batch 4,
11 September 2026). The node carries a designer's note — *"Used by Admins to
accept a pending AV"* — which is why this is scoped to admins rather than
offered as a general accept dialog.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Modal` | component | The dialog — header, focus trap, Escape, inert background |
| `Checkbox` | atom | The multipart decision; its label is the whole card |
| `Button` | atom | Cancel and Confirm |

The import rows are checked against the real imports — `npm test` fails if this
list drifts, and fails a pattern composing fewer than two pieces.

## When to use

| Use | For |
|---|---|
| `AcceptPendingAVModal` | An admin accepting a pending AV |
| `ConfirmDeleteAVModal` | The destructive counterpart — different layout, different Cancel |
| `Modal` | Any other confirmation; this one knows about multipart |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` | `boolean` | required | You own it. The dialog never closes itself |
| `onClose` | `() => void` | required | Escape, Cancel, or a backdrop click |
| `onConfirm` | `({ multipart }) => void` | required | Accepted, **carrying the decision** |
| `multipart` | `boolean` | `false` | Controlled |
| `onMultipartChange` | `(multipart: boolean) => void` | — | The tick |
| `showMultipart` | `boolean` | `true` | The design's own boolean — it draws the dialog both ways |
| `title` / `confirmLabel` / `cancelLabel` | `string` | the design's wording | |
| `loading` | `boolean` | `false` | Spins Confirm while the accept is in flight |

**The decision travels with the answer.** `onConfirm` is handed
`{ multipart }` rather than leaving the caller to read it back off its own
state, so there is no window where the two disagree.

## Benign, and drawn that way

This is the confirmation that *is not* destructive, and the design distinguishes
it from `ConfirmDeleteAVModal` in three ways worth keeping:

| | Accept | Delete |
|---|---|---|
| Layout | `Modal`'s own header, title left | Alert layout — centred glyph, question, consequence |
| Cancel | `secondary`, brand-outlined | `neutral`, grey-outlined |
| Backdrop click | Closes it | Does nothing |

The Cancel difference is the one to remember: a brand-outlined button beside a
benign Confirm reads as a peer, which is right. Beside "Delete" it would read
as a second call to action, which is why that one is grey. See
`docs/button.md`.

## Accessibility

- **The card is the checkbox's label**, so the whole 500-odd-pixel block is a
  target rather than just the 20px box.
- **The announced name is the title alone** — "Multipart Value" — with the
  explanation wired as `aria-describedby`. Reading a twenty-word explanation as
  part of the *name* would bury it; as a description it arrives after.
- **No close button**, matching the design: the two answers are the way out,
  plus Escape, which every dialog keeps.
- **Focus starts on the panel**, which is `Modal`'s default, so the first Tab is
  the checkbox rather than an answer.
- **Interaction test.** `AcceptingIt` is a `play` story and runs under
  `npm test`: it checks the name and description, ticks the card by clicking
  the explanation, confirms the decision travels with the answer, and checks
  the backdrop closes it.

## Deviations from the design

| The design | Ours | Why |
|---|---|---|
| Title at `title-sm` (16/semibold) | `Modal`'s `heading-md` (20) | `Modal` owns its title's size. A 16 title would need a size prop on `Modal`, which one dialog does not justify — if a third wants it, that is the trigger |
| Dialog width 564 | `size="md"` (512) | Widths ride the spacing scale; 512 is the nearest step |
| Card radius 8, padding 16, gap 12 | `rounded-md`, `p-4`, `gap-3` | Exact — the numeric scale lands on all three |

## ⚠️ Five field molecules exist in the design and are used nowhere

The same page carries `_Accept_Modal_Fields` with five types — Due Date, Worked
out thoroughly, Pre-consultation of domains involved, Impact of the Added
Value, Development Points. **A search of every page in the file finds zero
instances of any of them.** They are drawn but assembled into nothing, exactly
like the `Status` sidebar preset was.

They are deliberately not ported. Either the accept dialog is meant to collect
those five values and the design was never finished, or they belong to a form
elsewhere in the AV page. That is a design question, recorded in
`docs/figma-audit.md` batch 4.

## Don't

- **Don't close it yourself on confirm.** `onConfirm` reports the answer; the
  caller closes when the accept succeeds, which is what lets `loading` mean
  anything.
- **Don't use the grey `neutral` Cancel here.** This confirmation is benign and
  the design draws the brand-outlined one.
- **Don't add the five unassembled fields** until design says where they go.
- **Don't reuse it for a non-admin accept.** The design note scopes it to
  admins.

# HandoffAVModal

What an assignee fills in to hand an Added Value on: the date, the links that
show the work, and anything attached. When the value is late it also has to say
**why**.

Read off the Figma `Handoff_AV_Modal` (`5342:78539`, audit batch 4,
11 September 2026), both variants.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Modal` | component | The dialog — header, focus trap, Escape, inert background; `ModalCancel` and `ModalConfirm` are its footer |
| `HandoffForm` | pattern | The form: the date, the links, the attachments and, when late, the banner, the reason and the notes. The same one `BulkActionHandoffModal` draws |
| `Button` | atom | Development's two other footer buttons |

The import rows are checked against the real imports — `npm test` fails if this
list drifts, and fails a pattern composing fewer than two pieces.

## `overdueDays` is what switches the dialog

Pass it and the design's second variant appears: a warning `Banner` naming the
delay, a **required** overdue reason, and a notes field. Leave it out and none
of that renders.

**The form is `HandoffForm`**, shared with the bulk handoff, so a single handoff
and a bulk one ask for the same things. A **Handoff Date**, chosen from the
calendar, is **required** (design's decision for the one form); a late value must say
**why** ("Please select a reason before completing the AV", the design's own
error message); there must be **something to review, at least one demo link or
one attachment** (decided 13 Nov 2026; a file already on the value counts, and
without either the dialog says "Add a demo link or attach a file." under Demo
Links); notes are optional, and a link that is typed must be a valid `https://`
address. The dialog **asks on submit**: an incomplete
handoff is refused with the message under the field, and focus goes to the
first one. (The bulk dialog waits instead: its Handoff is disabled until every
Added Value is complete.)

The six reasons are `OVERDUE_REASONS`, exported here and owned here for the
same reason `RejectionReason` owns its sets: they are drawn in the design file,
not configured per domain.

## The footer is the domain's

| `domain` | Footer |
|---|---|
| `design-governance` (default) | Cancel (`secondary`) · **Handoff** (`primary`) |
| `development` | Cancel (`tertiary`) · Handoff (`secondary`) · **Handoff & Publish** (`primary`) |

Development can hand off *and publish*, which is a third button — so the other
two step down a weight to keep one primary in the dialog. That is
`_Handoff_AV_Modal_Buttons` in the design, and it is the only thing `domain`
changes.

`onHandoff` receives `{ publish }` as its second argument, true only from
Development's third button, so the caller never has to work out which button
was pressed.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` | `boolean` | required | You own it |
| `onClose` | `() => void` | required | Escape, Cancel, or a backdrop click |
| `onHandoff` | `(draft, { publish }) => void` | required | The draft, once |
| `domain` | `design-governance \| development` | `design-governance` | Which footer |
| `overdueDays` | `number` | — | Switches to the overdue variant |
| `attachments` | `{ id?, name, kind?, thumb?, src? }[]` | `[]` | Files already on the value: cards that preview on click and can be removed (staged: the ids come back in `removedAttachments`) |
| `defaultDate` | `string` | `''` | Prefills the date (ISO `yyyy-mm-dd`). The caller owns what "today" is; it starts blank when left out |
| `loading` | `boolean` | `false` | Spins whichever button was pressed |

`HandoffDraft` is `{ date, links, attachments, removedAttachments, overdueReason?, notes? }`. Empty
link rows are dropped before it leaves.

## It is uncontrolled, like `ReportProblemModal`

The draft lives in the pattern and leaves once through `onHandoff`, because a
handoff is composed and sent in one go. It also clears itself when it closes,
so an abandoned draft does not come back on the next one. A caller that needs
the values as they change should compose `HandoffForm` itself.

## Accessibility

- **Each link row is named by its position** — "Demo link 1", "Demo link 2" —
  because a repeatable group of identical boxes is unusable by ear otherwise.
  The `Field` label names the group.
- **The reason's error is a `Field` error**, so it is an alert and is wired to
  the select with `aria-describedby`; the select also gets `aria-invalid`.
- **The banner does not announce itself** (`live="off"`). It is present when
  the dialog opens rather than arriving, so announcing it would interrupt the
  dialog's own name.
- **The footer buttons submit the form** via `form={formId}`, so Enter in any
  field hands off and the footer still sits outside the scrolling body.
- **Interaction tests.** `HandingOff` and `OverdueNeedsAReason` are `play`
  stories and run under `npm test`: the first grows the link group and checks
  empty rows are dropped, the second checks a late handoff is refused without a
  reason and goes through once one is chosen.

## Deviations from the design

| The design | Ours | Why |
|---|---|---|
| The overdue reasons bold the label: **Dependencies:** Waiting on others | Plain text, `Dependencies: Waiting on others` | `Select` is a native `<select>` and an `<option>` cannot carry rich text. Bolding would mean replacing it with a listbox, which is a bigger decision than this dialog |
| A compact "Attach Files" row with a paperclip | `Attachments` (the cards, the `Dropzone` and the viewer), the system's only file input | The compact row is a control the system does not have. Inventing a second file input inside a pattern is what the repo forbids — flagged in the audit as a candidate `Dropzone` size |
| The date field is a text input with a calendar glyph | `DateField`: the date is chosen from the calendar | Design's decision for the one handoff form (the bulk handoff already did): a date is required and picked, not typed |
| Dialog width 564 | `size="md"` (512) | Widths ride the spacing scale |

## Don't

- **Don't make the date optional, or ask for more.** The date, (when late)
  the reason and a link or a file are required, notes are not; that is
  `HandoffForm`'s rule, and a dialog does not add its own.
- **Don't close it yourself on handoff.** `onHandoff` reports the draft; the
  caller closes when the send succeeds, which is what lets `loading` mean
  anything.
- **Don't add a fourth footer button.** The two domains are what the design
  draws; a third arrangement is a design decision, not a prop.
- **Don't build the form again.** Use `HandoffForm`.

# ReportProblemModal

The form behind "Report a problem", the row pinned to the bottom of every
`Sidebar`.

Read off the Figma `Report_A_Problem_Modal` (`7218:77431`, audit batch 4,
11 September 2026).

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Modal` | component | The dialog itself — header, close button, focus trap |
| `Field` | component | Labels each of the three inputs |
| `Dropzone` | component | The attachments area |
| `Input` | atom | The problem and its description |
| `Button` | atom | Cancel and Submit |

The import rows are checked against the real imports — `npm test` fails if this
list drifts, and fails a pattern composing fewer than two pieces.

## When to use

| Use | For |
|---|---|
| `ReportProblemModal` | The sidebar's "Report a problem" row, and nothing else |
| `Modal` + `Field` | Any other form in a dialog — compose it yourself |
| `Banner` | Telling the user about a problem, rather than collecting one |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` | `boolean` | required | You own it. The dialog never closes itself |
| `onClose` | `() => void` | required | Escape, the close button, Cancel, or a backdrop click |
| `onSubmit` | `(report: ProblemReport) => void` | required | The report, once, with everything in it |
| `loading` | `boolean` | `false` | Spins Submit while the report is in flight |

`ProblemReport` is `{ problem: string; description: string; attachments: File[] }`.

## It is uncontrolled, and that is deliberate

The three values live in the pattern and come out once, through `onSubmit`,
because a report is composed and sent in one go rather than saved as it is
typed. There is no `value`/`onChange` pair and no `status` — this is not one of
the [saving-states](saving-states.md) controls.

It also **clears itself when it closes**: a report half-typed and abandoned
does not come back on top of the next problem.

A caller that needs the values as they change should not use this. It should
compose `Modal` and the fields itself, which is three components and no
ceremony.

## Accessibility

- **`Modal`'s own header**, so the visible title and the announced name are the
  same string and cannot drift — unlike the AV confirmations, which centre
  their heading in the body.
- **Every field is labelled by `Field`**, which wires `id` and
  `aria-describedby` onto the control. No placeholder is doing a label's job.
- **Submit lives in the footer but belongs to the form**, via `form={formId}`,
  so Enter in any field submits and the footer still sits outside the scrolling
  body.
- **Interaction test.** `FillingItIn` is a `play` story and runs under
  `npm test`: it types into both fields, submits, checks the report comes out
  whole, checks focus returns to the trigger, and checks the dialog is empty
  when it opens again.

## Deviations from the design

| The design | Ours | Why |
|---|---|---|
| "Description" is a one-line field, the same height as the one above it | An `Input`, as drawn | Ported faithfully, but a field called Description that takes one line is a question for design. If it should wrap, it is a `Textarea` and a one-word change |
| Field fill `surface.neutral.faint`, border `stroke.default` (1.48:1) | `Input`'s own surface and `stroke.field` (4.76:1) | A form control's boundary has to be perceivable — the same correction `Input` already carries against the export |
| The dropzone glyph is a Heroicons photo icon | `Dropzone`'s own Phosphor `cloud-arrow-up` | Phosphor only, decided 8 September. The design file still has Heroicons here |
| Title at 18/medium | `Modal`'s `heading-md` (20/1.3 semibold) | The ramp has no 18 step — the gap `docs/modal.md` already reports |
| Dialog width 564 | `size="md"` (512) | Widths ride the spacing scale; 512 is the nearest step |

## Don't

- **Don't use it as a general "feedback" dialog.** It is the sidebar's row,
  with the sidebar's wording.
- **Don't close it yourself on submit.** `onSubmit` reports the report; the
  caller closes when the send actually succeeds, which is also what lets
  `loading` mean anything.
- **Don't add a fourth field here.** If the form grows, it stops being a
  pattern worth owning and becomes a page.

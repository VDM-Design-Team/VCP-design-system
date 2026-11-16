# AlreadyReviewedModal *(component)*

What a reviewer is told when the Added Value they came to review has already been reviewed: **"Already Reviewed"**, "This Value has already been reviewed.", and one **Close**.
Built to Figma's `Review_Already_Reviewed_Popup` (VCP Design Library, the Review AV Modal page).

## Composed of

| Piece | Tier |
|---|---|
| `Modal` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `AlreadyReviewedModal` | Telling a reviewer there is nothing left to review: the AV was reviewed while they had it open, or they followed an old link to it |
| `ReviewAVModal` | The review itself, while the AV is still waiting for one |
| `Toast` | A quiet "saved" that needs no answer |

The design draws this dialog and puts it in no flow, so **the page decides when it shows**: the pattern does not look at the AV. Pass the reviewer's name in `message` where the page has it.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` | `boolean` | required | |
| `onClose` | `() => void` | required | Close, Escape or a click outside. Nothing is changed by closing |
| `title` | `string` | "Already Reviewed" | The heading, and the dialog's name |
| `message` | `ReactNode` | "This Value has already been reviewed." | The line under it |
| `closeLabel` | `string` | "Close" | |

## Tokens

It is `Modal` at `md` (`surface.elevated`, `shadow-modal`, `md` radius), the title `title-md-semibold` in `text.primary`, the line `body-md-regular` in `text.secondary`. Close is `ModalConfirm` (`primary`, `md`), at the footer's right like every dialog's answer.

**Close is not full width, though Figma draws it so.** Figma's popup comes from the old design, where its one button spanned the dialog. No other dialog in the system has a full-width footer button (`BulkActionFailedModal`'s single "Got it" is a `ModalConfirm` at the right), so this one follows them. It is a component, not a pattern, because it is a `Modal` and nothing else: there is a second piece for a pattern to compose.

**The default line is shorter than Figma's.** Figma says "This Value has already been reviewed by the initiator."; the default drops "by the initiator" so it is true whoever reviewed it (the initiator, or a second admin), and a page that knows who passes it in `message`.

Figma sets the title at 24, the line at 18 and the dialog 554 wide; `Modal`'s own title and size steps are used so this dialog sits with every other one.

## Accessibility

- **No ✕**: Figma's popup hides it (`Show X Close Button` is off), and a second "Close" beside the button would be heard twice.
- A real dialog named by its title ("Already Reviewed"); focus goes to Close, which is the only control, and Escape closes it and returns focus to what opened it (`Modal`).
- The message is plain text under the heading, read with it.

## Don't

- Don't offer to review anyway. The dialog says the review is over; the way back is Close.
- Don't use it for an AV someone else is reviewing right now: that is a different message.
- Don't add a second button: there is nothing to decide.

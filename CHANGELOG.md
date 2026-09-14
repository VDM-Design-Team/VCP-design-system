# Changelog

## 0.1.0 — unreleased

### The AV tag vocabulary — `UrgencyTag`, `TypeTag`, `DueDatePill` (11 September 2026)

The three tags an Added Value wears beside its status, and the three mappings
they own. Built ahead of `AV_Table`, which needs all three, but none of them is
table-specific — the AV detail card and the multipart rows draw the same tags.

**Urgency and type are scales, and the glyph is the scale.** Both write their
word in one neutral and let the glyph carry the temperature: a rising caret
family for type (one, two, three strokes, heaviest first), a falling/level/
rising/flame set for urgency. That is the design's own decision and it is a
good one — four coloured words in a column read as four unrelated statuses,
whereas same-weight words with a rising glyph read as a ranking. It also means
colour is never the only cue, so both scales survive greyscale (WCAG 1.4.1).

**`TypeTag`'s vocabulary is closed; `StatusPill`'s is not.** Statuses have a
per-domain middle this repo does not own. Types do not — the design draws
exactly three and the numbering is the meaning, so a fourth is a compile error
at every call site rather than a silent fall-through.

**`DueDatePill` will not guess what "due soon" means.** `dueDateTone` does the
comparing, but `soonWithinDays` has no default and is not getting one: how many
days ahead counts as soon is a product rule that differs by domain, and a
design system that invents one has quietly made a product decision. Every call
site states its own rule out loud, which is the honest version of not knowing.
Open question for design, recorded in `docs/due-date-pill.md`.

**Two glyphs added to `Icon`**: `equals` and `fire`, both Phosphor regular.

**No new colour tokens.** Figma's tags reach for `neutral.textual.*` and
`neutral.tonal.*`, two of the four neutral families this repo does not model
yet. Both resolve to values already exported — `neutral.textual.content.default`
*is* slate-600, which is `neutral.outline.content.default`, and the neutral
due-date fill is one step of slate from `Badge`'s. Three further Figma
deviations are zero-pixel token-family corrections (a background token used as
a foreground, a control token used as decoration), listed in each doc. Modelling
the full neutral families belongs with issue #103, not here.

Minor bump: three additions, no existing API changed.

### `RejectPendingAVModal` — AV modals, 5 of 7 (11 September 2026)

Rejecting an Added Value that is still `Pending`, before anyone has worked on
it. One question: why. The reason list, its explanations and the free text for
`Other` are all `RejectionReason`, built for this dialog and for `Review`'s
handoff rejection.

**The design draws its validation**: with no reason chosen, Reject is faded —
disabled. So the dialog refuses by what it lets you press rather than by an
error after the fact. That differs from `HandoffAVModal`, which validates on
submit with a message, and deliberately: there the required field sits among
five others and a disabled button would leave the user hunting.

**Reject is `primary`, not `danger`.** Rejecting a pending value is a decision,
not a destruction — nothing is lost and the submitter is told why.
`ConfirmDeleteAVModal` is where the red button lives.

One wrinkle recorded in the audit: the design shows a **visible** label above
the select, and `RejectionReason` names its select with an `aria-label`. The
pattern renders the visible text and passes the same string from one constant.
The tidier fix is for `RejectionReason` to render a real `<label>`.

### `HandoffAVModal` — AV modals, 4 of 7 (11 September 2026)

What an assignee fills in to hand an Added Value on: the date, the links that
show the work, and anything attached. Both of the design's variants.

**`overdueDays` switches the dialog.** Pass it and the overdue variant appears
— a warning banner naming the delay, a *required* overdue reason, and a notes
field. The reason is the only validation the design draws, as an error state on
that one field, so the dialog refuses a late handoff that does not say why. The
six reasons are `OVERDUE_REASONS`, owned here for the same reason
`RejectionReason` owns its sets.

**The footer is the domain's.** Design and Governance hand off; Development can
hand off *and publish*, which is a third button, so the other two step down a
weight to keep one primary in the dialog. `onHandoff` receives `{ publish }` so
the caller never has to work out which button was pressed.

Three gaps it hit, all recorded in `docs/figma-audit.md` and none blocking: the
design's compact **"Attach Files" row** is a control the system lacks, so
`Dropzone` stands in; a native `<select>` **cannot bold half an option**, so the
overdue reasons are plain text; and **`DatePicker` inside a `Modal`** is
unsettled, because its `Popover` portals outside the focus trap — so the date is
the text field with a calendar glyph that the design actually draws.

### `Carousel`, and `ChangeLogModal` — the last of the seven AV modals (11 September 2026)

**`Carousel`** is a new component: one panel at a time, an arrow each side. It
is a component rather than an atom because the composition lint fails any atom
that imports another piece except `Icon`, and a carousel needs `IconButton`.

Two decisions worth knowing:

- **It does not render the dots.** `PaginationDots` is a separate atom and the
  caller places it, because a design does not always put the dots beside the
  content — the changelog dialog puts them *below its footer buttons*. That is
  also why `Carousel` is controlled: the arrows and the dots read one index
  rather than two that can drift.
- **It never moves on its own**, and there is no prop to make it. Every remedy
  for a self-advancing panel — pause on hover, pause on focus, a stop button —
  is machinery that exists only to undo the original decision.

It wraps at both ends rather than disabling an arrow at each.

**`ChangeLogModal`** is what a user sees when the product has something to tell
them about a release. Three kinds, and the glyph is the difference: a flask, a
megaphone, a rocket, each in the design's own variable. The kind is also
screen-reader-only text, because a colour and a shape are not a label. The
dialog is named by the heading it renders in its own body, using the
`aria-labelledby` route `Modal` gained earlier the same day — the design puts
the glyph above the title, so `Modal`'s header carries only the close button.

No new tokens. The design's 32px glyph is a `size-8` override, because `Icon`'s
ramp stops at 24 and a 32 step is a decision for the ramp, not for one dialog.

### `AcceptPendingAVModal` — AV modals, 3 of 7 (11 September 2026)

The confirmation an admin answers to accept a pending Added Value, and the one
decision that comes with it: whether the value is **multipart**. The Figma node
carries a designer's note, "Used by Admins to accept a pending AV", so the
pattern is scoped to admins rather than offered as a general accept dialog.

`onConfirm` is handed `{ multipart }` rather than leaving the caller to read
the decision back off its own state, so there is no window where the two
disagree. The multipart checkbox's label is the whole card, making the target
the block rather than the 20px box, and its announced name is the title alone
with the explanation wired as `aria-describedby`.

**It is the benign confirmation**, and the design draws that difference from
the delete one: `Modal`'s own header rather than the alert layout, a
brand-outlined `secondary` Cancel rather than the grey `neutral`, and a
backdrop click that closes it. `docs/figma-audit.md` records that as a
deliberate distinction rather than an inconsistency to normalise.

⚠️ **Five field molecules on the same Figma page are assembled into nothing.**
`_Accept_Modal_Fields` — Due Date, Worked out thoroughly, Pre-consultation,
Impact of the Added Value, Development Points — has **zero instances anywhere
in the file**. Not ported; it needs a design answer, and getting it wrong would
grow the dialog from one decision to six.

### `RejectionReason` — built once for the two modals that need it (11 September 2026)

A new component, and the third thing the AV-modal audit flagged. Rejecting an
Added Value means picking a named reason, reading what that reason covers, and
typing something extra when the reason is `Other`. **Two of the unbuilt modals
need it with different reason sets** — the pending rejection has five reasons,
the handoff rejection has six — and the shape is identical, so building it
inside either one would have built it twice.

Both sets are exported constants on the component, the way `Sidebar` owns its
nav vocabulary: they are drawn in the design file rather than configured per
domain, so there is one place for them. Each reason carries the design's own
explanation, which is what appears under the select once a reason is chosen —
data on the reason, not prose at the call site.

The explanation is wired to the select with `aria-describedby` rather than left
as loose text beside it, and the free-text box is named rather than relying on
its placeholder. No new tokens.

### A `neutral` button, and the `neutral.*` token family it needed (11 September 2026)

A minor addition, no breaking change. `Button` and `IconButton` gain a
**`neutral`** variant: outlined, but grey. It is the way *out* — the Cancel
beside a destructive answer — where `secondary`, outlined in the brand, reads
as a second call to action.

**`neutral.outline.*` is imported name-for-name** from the VCP file's own
Semantics collection, 12 tokens per theme, with the same `surface` / `content`
/ `border` × `default` / `hover` / `pressed` / `disabled` shape as
`action.secondary`, aliasing the **slate** ramp like every other grey here. The
family's other three treatments — `filled`, `textual`, `tonal` — stay
unimported until something needs them.

⚠️ **"Neutral" names two different things.** That semantic family is VCP's own.
The `colors/neutral/*` **ramp** is the *General Design Library*'s, and this
repo already carries it byte-identical as `color.neutral.*` — where it is
**unused**, because all 75 grey aliases point at `color.slate.*`. Reaching for
`color.neutral.*` will not match the greys around it. `docs/color-tokens.md`
warns about it, and reconciling the two libraries is issue #103.

Two things fell out of doing it, both recorded in `docs/figma-audit.md`:

- **`style-dictionary.config.mjs` had a hard-coded whitelist** of semantic
  families, so the light tokens generated nothing at all until `neutral` was
  added to it. The dark overrides have no such filter, so they built fine —
  which is exactly the kind of silent half-build worth knowing about before
  the next family is imported.
- **Figma's dark `neutral/outline/content` lost contrast on hover and press.**
  It went `slate/300 → 400 → 500`, which is *darker* on a dark surface: 9.85:1
  down to 5.71:1, then 3.07:1, below the 4.5:1 text needs. Its own border track
  goes the other way, so content was the one that was wrong. The repo mirrors it
  correctly as `300 → 200 → 100`, and **the VCP file's Dark mode was corrected to
  match** on the same day.

The light border is 2.56:1 against white, below the 3:1 WCAG 1.4.11 asks of a
UI boundary, and is accepted on the reasoning `Pagination` already documents:
the label identifies the control at 7.58:1 and the border is reinforcement.
`docs/button.md` says so, and says when that reasoning would stop holding.

### `Modal` can be named by a heading you render (11 September 2026)

A minor addition. Naming a dialog was `title` or `aria-label`; it is now
`title`, `aria-labelledby` or `aria-label`, and the type still refuses a
dialog with none of the three. `aria-labelledby` is for the **alert layout** —
a centred glyph, question and consequence, with no header band — where the
heading lives in the body and `Modal` has nothing of its own to point at.
Before this, such a dialog repeated its heading as an `aria-label`, which is
two copies of one string that can drift. `ConfirmDeleteAVModal` now points at
its own `<h2>`. No other component changed.

### The AV modals — batch 1 of 7 (11 September 2026)

The library has seven modal pages and **none of them was in
`docs/inventory.md`**; they are not in the Claude Design export either, so
nothing in this repo knew they existed. All seven are surveyed in
`docs/figma-audit.md` batch 4. Two are built here, as patterns:

- **`ConfirmDeleteAVModal`** — the confirmation before an Added Value is
  deleted. An *alert* layout: a centred warning glyph, the question, the
  consequence, and the AV's own title read-only so nobody deletes the wrong
  one. `role="alertdialog"`, not dismissible by a backdrop click, Escape still
  closes.
- **`ReportProblemModal`** — the form behind the sidebar's "Report a problem"
  row. `Modal`'s own header, three fields, one `onSubmit` carrying the whole
  report. Uncontrolled by design, and it clears itself when it closes.

Both ship the `play` stories the flows convention asks for. No new tokens.

Three things the audit found that the remaining five will keep hitting: the
design's Cancel is a **neutral outlined button** the system does not have; the
design **tints its form fields** with a 1.48:1 border where `Input` correctly
uses 4.76:1; and the **rejection-reason picker is shared** between two of the
unbuilt modals and should be built once. The delete confirmation's primary
button read **"Complete"** in the file, which was a copy error; it was
corrected to "Delete" in Figma on 11 September and the repo carries the label
as `confirmLabel` either way.

### Breaking — 11 September 2026

**`Card` is removed.**

Decided by the lead on the grounds that it was doing the same job as `Modal`.
The pieces count drops to 31 components.

- **`Card`, `CardProps` and `CardHeadingLevel` no longer exist**, and the
  barrel no longer exports them. `docs/card.md` is deleted.
- **There is no drop-in replacement, and that is the thing to know before
  upgrading.** `Modal` is not one: it portals to `document.body` behind a
  backdrop, traps focus, locks the page scroll and makes everything else
  inert, so it cannot sit inline in a page or be repeated down a column. A
  call site that used `Card` as a container now writes the surface itself.
  The shape `Card` rendered was:

  ```tsx
  <section className="rounded-md border border-stroke-default bg-surface-elevated">
    <header className="flex items-start justify-between gap-3 px-4 py-3.5">
      <h3 className="text-heading-sm text-text-primary">Title</h3>
    </header>
    <div className="px-4 pb-4">{children}</div>
  </section>
  ```

  `shadow.card` is a token, not the component, and is untouched.
- **`StatCard` is unaffected.** It never composed `Card`.
- Four story usages were ported to plain markup (`Banner`'s in-page story, and
  three in `AppShell`'s). Five docs that used `Card` as their comparison anchor
  — `accordion`, `stat-card`, `data-table`, `pagination`, `modal` — say what
  they mean directly instead, and `figma-audit` drops it from its list of
  pieces that draw raw markup.

Free in practice while 0.1.0 is unreleased and nothing outside this repo
imports the package, which is why the version is not bumped.

### Breaking — 9 September 2026

**`Final Completed` is gone. `Completed` is green and terminal again.**

Design ruled on 9 September (issue #80): the tag set has one `Completed`
tag, drawn success green, and there is no `Final Completed`. The 8 September
change that split them into two statuses and recoloured `Completed` to
warning is reverted (PR #74), and the model is the one that shipped on
7 September.

- **`AVStatus` loses `Final Completed`** and is ten values again. Pass
  `Completed` where you passed `Final Completed`.
- **`Completed` is success tonal**, `#dcfce7` / `#008236`, as the tag set
  draws it. Nothing else in the mapping moves.
- **`hasDeployStep` is gone; `pendingDeploy` is back.** Development's
  post-handoff gate is a property of the AV, not the domain: an admin hands
  an AV off into a `Completed` that still owes a `Deploy`. Pass
  `pendingDeploy` on `status="Completed"` for that AV and the admin gets the
  `Deploy` button; omit it and `Completed` is terminal. Every other domain's
  `Completed` is terminal.
- **`Completed` no longer offers "Move to Review."** `Review` is reached
  from the chain's handoff, and `Accept` on `Review` lands on `Completed`.

### `Toggle` — saving states, and the contract written down (10 September 2026)

A minor addition. `Toggle` takes the same parent-driven `status` prop
`SegmentedControl` got earlier today: a spinner in the knob while pending
(input `aria-busy`, further flips ignored without disabling the input), a
check on success, the critical ring and `aria-invalid` on error. The contract
is now one document, `docs/saving-states.md`, and one type, `SavingStatus` in
`src/lib/saving.ts`; `SegmentedControlStatus` is an alias of it. The parent's
half — the fake save the flow stories are built around — is one shared hook,
`useFakeSave` in `src/lib/story-saving.ts`, so `SegmentedControl`'s stories
shrank and `Toggle`'s four `play` stories (`FlipsOnClick`, `KeyboardSpace`,
`SaveSucceeds`, `SaveFails`) cost about twenty lines each. No new tokens.

### `SegmentedControl` — saving states (10 September 2026)

A minor addition, no breaking change. When choosing a segment saves something,
the parent drives a new `status` prop through `pending → success | error` and
the control shows it: a Phosphor `circle-notch` spinner in the selected
segment while pending (label muted, group `aria-busy`, further selection
ignored), a check on success, the `Input` error stroke and `aria-invalid` on
error. The control stays presentational — the parent times the return to
idle and keeps the previous value on error, so async use is controlled-only —
and the error message is `Field`'s, wired through `aria-describedby`. Four
`play` stories (`SelectsOnClick`, `KeyboardNavigation`, `SaveSucceeds`,
`SaveFails`) are the first interaction tests in the repo and run under
`npm test`. `Icon` gains `circle-notch`. No new tokens.

### Breaking — 7 September 2026

**`AVStatus` is now the spine only, and the status vocabulary is open.**

An AV's flow is a fixed spine wrapped around a per-domain middle: the flow
board's `Custom Statuses` section sits between `Accepted` and `Completed` and
holds one chain per domain. Design has two steps, Development has six, and
Content, Partners, Governance and Product bring their own — which a domain can
add to and rename (issue #68). Those names are data, so they cannot be a
compile-time union.

- **`AVStatus` drops from seventeen values to ten.** Removed as domain steps:
  `For Review`, `For QA`, `In QA`, `Ready for Deploy`, `Confirmed Prod`,
  `Design Review` — exactly the contents of `Status_Tag_Development_Only` and
  `Status_Tag_Design_Only`. Removed outright: **`Review No Action`**, which is
  not a state and never was (confirmed 7 Sep 2026); the Figma variant of that
  name is being renamed.
- **`Review` has two treatments, selected by the new `actionable` prop.** Tonal
  is the label style a user sees; filled is the button style for an admin or
  the AV's initiator. **`<StatusPill status="Review" />` is now tonal, not
  filled** — pass `actionable` for the old rendering. Every other status
  ignores the prop rather than inventing a filled variant the design has not
  drawn. **Migration:** `<StatusPill status="For QA" />` becomes
  `<StatusPill custom="For QA" />`, or `custom={step.label}` where the label
  comes from the domain.
- **Domain steps all share one treatment** — the info tonal, `#dbeafe` on
  `#1447e6`, 5.60:1 (design's call, 7 Sep 2026). Five statuses change colour:
  `For Review`, `For QA`, `Ready for Deploy` and `Design Review` were warning,
  `Confirmed Prod` was success. Note `Accepted`, `In Progress` and
  `Reopened` are also info tonal, so a domain step is not distinguishable from
  those three by colour — the text is the signal, as it always was.
- **`StatusPill`'s props are a discriminated union**: `status` (spine, typo is
  a compile error) xor `custom` (a domain label, any string). Exactly one is
  required.
- **`Accepted` → `In Progress` → the domain's chain.** `In Progress` is spine,
  so the handover out of the shared part of the flow lives in the component,
  and the first chain step returns to it.
- **`AVProgressionStatus` is gone**, and with it the `Extract<AVStatus, …>`
  guarantee added on 4 September that a lifecycle state with no tag is a
  compile error. Seven of its eleven members were domain steps; there is
  nothing left to extract from. There is no equivalent for an open vocabulary.
- **`AVWorkflow` is gone.** A workflow is now just a different `chain`, so the
  eight Figma sets (two workflows × four roles) become four. Six domains would
  otherwise have meant twenty-four.
- **`StatusProgression` takes its chain as a prop.** `<StatusProgression
  workflow="development" role="assignee" status="For QA" />` becomes
  `<StatusProgression role="assignee" chain={domain.steps} step="for-qa" />`.
  Spine positions keep `status`. `avTransitions(workflow, role, status)`
  becomes `avTransitions({ role, status })` or
  `avTransitions({ role, step, chain })`.
- **`AVTransition.to` is a `string`** — a spine status or a chain step's `id`,
  never a label. Ids survive renames; labels are what changes.
- **`AVHeader`** forwards `status` / `step` / `chain` instead of
  `workflow` / `status`.
- Removed the unused `rejectSoft` constant, dead since #58 and flagged in the
  handoff. Reintroduce it when the outlined-Reject variants in #60 are named.

### `StatusProgression` — issue #60's seven variants named (7 September 2026)

Design (Eve) named all seven placeholder Figma variants the audit found.
No breaking change — additive only.

- **`Review` is now modelled on the spine.** Initiator and admin get
  Reject/Accept; the assignee renders nothing (already handed off). Reject
  is `variant="secondary"` (outline) here, not `Pending`'s solid
  `variant="danger"` — the design draws these differently by lifecycle
  stage, not role.
- **`rejectSoft` reintroduced** (deleted 7 Sep in the spine/chain refactor,
  pending exactly this naming) — reused verbatim as the `Review` Reject.
- **New `pendingDeploy` prop, Development-only.** `Confirmed Prod` → Handoff
  lands on `Completed`, but Development's `Completed` can still owe a
  `Deploy` action (admin only) before the real terminal `Completed`. Both
  render identically on `StatusPill` — same tone, same text "Completed" —
  design was explicit this is a known, accepted exception to the "spine is
  universal" rule the same-day refactor established, not a pattern to
  extend to other domains.
- "Deploy" is not a status — the placeholder Figma variant of that name has
  been removed; it was always the button label for the above, never a
  distinct lifecycle position.
- The Dev/Admin variant that drew a lone "Handoff" under the name `Review`
  turned out not to be a separate thing — `Confirmed Prod` is the only
  status with a Handoff action.
- `docs/status-progression.md` updated: the "Not modelled" table is gone,
  replaced with how each of the seven resolved.


Initial system, seeded from the VCP Figma Variables export (Aug 2026).

- Core: 10 colour ramps (vcp-blue, slate, neutral, blue, green, red, yellow,
  pink-legacy, teal-legacy, monochrome), 14-step px spacing scale, Poppins/Inter.
- Semantic (light + dark): `surface.*`, `text.*`, `stroke.*`,
  `action.{primary,secondary,tertiary}`, `accent.{critical,success,warning,info,blue,green,red}`
  in filled/outline/tonal styles — 228 tokens per theme.
- Type ramp: display-xl … caption-sm as composite tokens → `text-*` utilities.
- Shape: radius sm/md/pill, shadows card/raised/menu/modal.
- Build targets: Tailwind v4 `@theme` CSS + `.dark` overrides, plain CSS vars,
  TypeScript, flat + nested JSON.
- Components: `Popover` / `Menu` (Overlays) — Menu is Popover plus a keyboard
  contract: focus moves into the list on open, arrows wrap, Home/End jump, Escape
  closes and restores focus to the trigger, dividers and disabled items are stepped
  over. No new tokens. `MenuItem.icon` is typed to `IconName`, so a glyph the system
  does not ship is a compile error. Danger items carry three signals, only one of
  which is colour — a forced glyph and a visually hidden "destructive action" in the
  accessible name do the rest. Positioning is deliberately simple: no flipping and no
  collision detection, documented rather than implied.
- Components: `Modal` (Overlays) — `role="dialog"`, `aria-modal`, focus into the
  panel, a real focus trap that wraps both ways, Escape restoring focus to whatever
  opened it, background marked `inert`, and a scroll lock that compensates for the
  scrollbar so the page does not shift. No new tokens. Escape closes even when
  `dismissible={false}` — that flag guards the accidental backdrop click, not the
  deliberate way out.
- Components: `Tooltip` (Overlays) — opens on keyboard focus, not hover alone, wired
  with `aria-describedby`, dismissible with Escape and hoverable across the gap
  (WCAG 1.4.13). No new tokens. Text is 10.35:1 light and 16.36:1 dark.
- Components: `Toast` / `Banner` (Feedback) — a Toast is an event, a Banner is a
  state. No new tokens; both reuse the tonal pairs `docs/badge.md` already proved.
  The live regions live on `ToastViewport` and are rendered empty from first paint,
  because a role arriving together with its content is not announced — polite for
  informational tones, assertive for errors. Auto-dismiss pauses on hover, on focus
  within, and while the tab is hidden, and a toast carrying an action never
  auto-dismisses at all (WCAG 2.2.1).
- Components: `Chip` (Display) — the interactive pill Badge's docs promised: toggleable
  filters (`aria-pressed`), removable tags, avatar and count anatomy. No new tokens;
  brand-tinted from `surface.brand.*`. The export nested a `<button>` inside a clickable
  `<span>`; rebuilt so every clickable region is a real button and no button ever
  contains another — with `onRemove` the pill becomes a passive wrapper around two
  sibling controls. 28 tall carries the same pointer-dense exemption as
  `IconButton size="sm"`.
- Components: `ProgressBar` (Feedback) — a determinate meter with real
  `aria-valuenow/min/max`, `tone` as consumption status (brand/success/warning/danger),
  `sm`/`md` sizes, optional visible label (wired via `aria-labelledby`) and value.
  **New token: `surface.track`** (slate-200 light / slate-800 dark) — no existing
  surface kept every fill ≥3:1 against the track in dark (the closest dropped the
  danger fill to 1.25:1); on the new token the floor is 3.84:1, measured per tone in
  docs/progress-bar.md. Minor bump; the token needs pushing into the Figma variables.
- Components: `EmptyState` (Display) — icon tile (`aria-hidden`), real heading with a
  movable `headingLevel`, description at a readable measure, one `action` slot. No new
  tokens. The docs carry the actual contract: name what is empty, why, and the way
  forward — an empty state without an action is a dead end and should be rare.
- Components: `DetailRow` (Display) — the 132 label column / value / optional edit
  affordance row for details panels. No new tokens. The export reached `Icon` and
  `IconButton` through a window-global registry; now ordinary imports, and the edit
  affordance is the system's `IconButton` named `Edit ${label}` / `Confirm ${label}` —
  which is why `label` is typed `string`. Label/value land on `label-md`/`body-md`
  because the export's 13px/400 is a ramp step that deliberately does not exist.
- Components: `Breadcrumb` (Navigation) — the landmark pattern in full:
  `<nav aria-label="Breadcrumb">` around a real `<ol>`, the current page as inert
  text with `aria-current="page"`, separators hidden. No new tokens. Crumbs render
  as real `<a>`s when given `href` (preferred — middle-click and copy-link work)
  and as buttons only for genuinely programmatic `onNavigate`.
- Components: `Pagination` (Navigation) — addressable page numbers with
  `aria-current="page"` on the active page and a spoken name on every control.
  No new tokens; the active page sits on `action.primary` at rest. Keeps the
  export's five-number window, clamped at the ends; deliberately no
  ellipsis variant until a data set actually needs one. 32-tall controls carry the
  pointer-dense exemption.
- Components: `PaginationDots` (Navigation) — position dots for carousels and
  onboarding. No new tokens. The export's `role="tablist"` is gone — nothing here
  owns panels; they are a named group of "Go to page N" buttons, or, with no
  `onChange`, a passive indicator with zero tab stops. Inactive dots moved from
  slate-300 to `surface.neutral.strong` so an unselected dot clears the 3:1
  UI-graphic bar (4.55:1 light at worst); the current dot is also 2.5× wider, so
  state never rides on hue alone.
- Components: `Accordion` (Navigation) — stacked disclosures wired to the APG
  pattern the export implied but skipped: heading → `button` with
  `aria-expanded`/`aria-controls` → labelled `region`. No new tokens. Controlled
  (`openKeys`/`onToggle`) or uncontrolled (`defaultOpenKeys`, `multiple`); closed
  panels are unmounted, so form state belongs outside. Native `onToggle` is
  intentionally shadowed by the accordion's own callback.
- Components: `DataTable` (Display) — the generic table the four VCP table patterns
  will specialise. No new tokens. The export drew a CSS grid of divs; rebuilt on a
  real `<table>` (`scope="col"`, an `sr-only` caption, `aria-sort`) because
  cell-by-cell navigation is the point of tabular markup. Two API changes from the
  export, both deliberate: `sort` gained a direction (`{ key, direction }` — the
  component asks and shows but never sorts `rows` itself), and **`onRowClick` is
  gone** for Card's reason — a whole-row target is invisible to keyboards; the
  row's action belongs in a cell as a real link. Selection composes `Checkbox`
  (named select-all, `indeterminate` while partial, `selectLabel` for per-row
  names); `width` takes CSS widths for `<col>`, and the container scrolls
  horizontally so the page never does.
- Components: `Logo` (Display) — the Value Chain Plus mark, full lockup or the
  diamond alone (`collapsed`), sm/md/lg on the Figma Small/Medium/Big variants.
  The export pointed at image files nobody ever had and CSS-inverted a PNG for
  dark; the vectors now come straight from the Figma "VCP logo" component set as
  inline SVG, themed by **two new tokens**: `text.logo` (a new core
  `color.brand.navy` → white in dark, exactly the Figma dark variant) and
  `text.logo-accent` (the brand blue, identical in both themes). Minor bump;
  both tokens join the Figma-variables debt with `surface.track`. This was the
  last component in the porting queue, and it unblocks the `TopBar` pattern.
- Components: `SearchSelect` (Forms) — the combobox Select's docs promised, for
  lists past the few dozen where the native popup stops scaling. Paid the custom
  tax in full: `role="combobox"` with `aria-activedescendant` over a real
  `listbox` (`aria-multiselectable` when `multiple`), arrows/Enter/Escape, focus
  never leaving the input, options picked on prevented mousedown so a click
  cannot blur mid-pick — the export was a bare input above a stack of buttons.
  Positioned inline rather than through `Popover`, which moves focus into its
  panel and a combobox must not. No new tokens.
- Components: `DatePicker` (Forms) — the calendar panel: named day buttons
  ("14 September 2026"), `IconButton` month nav with a polite live-region
  heading, range shading, `min`/`max`. **One tab stop**: the day grid roves,
  arrows move by day/week and page the view across month edges. The export's
  VCP `capacity`/`holidays` props became generic `markers` (toned dots — the
  caller owes a legend) and `flagged` (unavailable-but-selectable tint), per the
  Badge/Timeline rulings; its `toISOString()` round-trip — which shifted picked
  dates for anyone east of UTC — is replaced by local-time ISO handling. No new
  tokens.
- Components: `TagEditor` (Forms) — free-form labels: tag list, tone swatches,
  name field (composed `Input`), add button (composed `Button`). **Tones, not
  colours** — the export's raw-rgb `TAG_COLOURS` (one of them the ramp-less
  indigo) became the `accent.{blue,green,red,yellow}` faint/stronger pairs Avatar
  proved, plus a neutral; the dot rides `currentColor`. Swatches are a named
  group of `aria-pressed` buttons with the hue in each name. No new tokens.
- Components: `RichTextToolbar` (Forms) — the formatting strip, wired as a real
  APG toolbar: one tab stop with a roving tabindex, Arrow keys walk the buttons,
  Home/End jump. Only stateful commands carry `aria-pressed` (the export pressed
  undo). Active text moved to `text.brand.strong` — the letter glyphs are real
  13px text and the export-flavoured medium was 3.51:1 on the tint in dark. It
  owns no editor state; `CommentComposer` (pattern) will marry it to one. New
  glyphs `list-numbers` and `arrow-u-up-right` from Phosphor. No new tokens.
- Components: `FileAttachment` (Display) — one attached file as a tile: thumbnail
  or kind glyph, name, size, optional open and remove. The export mounted the ✕
  only while the pointer hovered — unreachable by keyboard; it is now always in
  the tab order, *revealed* by hover or focus, and a sibling of the openable
  button per the Chip never-nest-buttons rule. New glyphs `image` and
  `download-simple` from Phosphor. No new tokens.
- Components: `AttachmentPreview` (Display) — the opened attachment: header with
  name/size and the system's own `IconButton`s ("Download ${name}", "Close
  preview"), body showing the image or an honest "No inline preview" with
  download as the real path. An inline panel — `Modal` owns interruption. No new
  tokens.
- Components: `EmojiReactionPicker` (Display) — reaction pills + a "+" opening
  the palette in the system `Popover`. Pills are toggle buttons: `aria-pressed`
  for "you reacted", names like "3 reactions, 👍, you reacted", counts in the
  numeric face; state lives with the caller. No new tokens.
- Components: `Timeline` (Display) — events in order on a real `<ol>`; nodes are a
  ring + glyph in one tone. **Generic tones only** — the export's `kind` took VCP
  lifecycle names (`accepted`, `handoff`); that mapping belongs to the future
  activity pattern, per Badge's precedent, and two of its colours were raw
  literals with no ramp. Ring and glyph wear the darker `outline.content` step
  (mid borders measured down to 1.91:1); every tone now clears 3:1 both themes,
  measured in docs/timeline.md. No new tokens.
- Components: `DonutChart` (Display) — ProgressBar bent into a ring (or half-ring
  gauge): same `role="progressbar"`, same four tones on the same tokens, same
  `surface.track`. The export's built-in 75%/90% auto-escalation and its
  arbitrary-colour `tone` are gone — thresholds are domain knowledge and colours
  are tokens. Centre numeral in the numeric face, scaled with the ring. No new
  tokens.
- Components: `StatCard` (Display) — one number on a card. `deltaTone` becomes
  judgment (`positive`/`negative`/`neutral`) instead of the export's direction
  (`up` painted green — but costs up is bad news); the sign stays in the text so
  colour never carries direction alone. The label is deliberately not a heading
  and the tile deliberately does not compose `Card` (which renders one). Value in
  the numeric face at `heading-lg`. No new tokens.
- Components: `Select` (Forms) — a choice from a fixed list, on the **native**
  `<select>`: platform popup, keyboard model and mobile pickers for free. Wears
  Input's shell class for class (`stroke.field`, focus ring, invalid, disabled);
  the export's `small`/`large` renamed to `sm`/`md`; its data-URI caret replaced by
  the system's glyph, pointer-transparent. Placeholder is a disabled, hidden
  option, so it cannot be re-picked; `children` is the `<optgroup>` escape hatch.
  No new tokens.
- Components: `Stepper` (Forms) — nudge-a-number: minus, a typeable value in the
  numeric face, plus. Typing is draft-based — half-typed states pass through and
  the value commits clamped on blur/Enter (the export clamped every keystroke,
  which made "15" untypeable when the minimum was 10). Arrow Up/Down nudge; the
  buttons are named with the field's `label` folded in and disable at the ends.
  Minus/plus glyphs instead of the export's chevrons. No new tokens.
- Components: `Dropzone` (Forms) — click to browse or drag files on; hands over
  `File[]` and forgets. The export's `display:none` input was unreachable by
  keyboard; the input is now `sr-only`, so Tab + Enter work and the zone draws the
  shared `focus-within` ring. The dashed border moves to `stroke.field` (the
  export's `stroke.default` was 2.56:1 against the 3:1 a control boundary needs).
  New glyph `cloud-arrow-up` added to the icon set from Phosphor. No new tokens.
- **Restructure: the atomic tiers** (decided 3 Sep 2026). The two-tier
  components/patterns split becomes four tiers — `src/atoms/` (a single
  self-contained element: Button, Input, Badge, Logo…), `src/components/` (one
  unit assembled from atoms: Field, Chip, Menu, DataTable…), `src/patterns/`
  (2+ components forming a page section: TopBar, the planning tables…) and
  `src/templates/` (page layouts: AppShell). Tier is decided by composition, not
  domain vocabulary — the old could-another-product-use-it test is retired, and
  each VCP mapping (status → tone, …) is instead owned by exactly one piece.
  Nineteen pieces moved to `src/atoms/`; Storybook titles now mirror the tiers
  (`Atoms/…`, `Components/<group>/…`, `Patterns/…`, `Templates/…`). Import paths
  changed — a breaking move in principle, free in practice while 0.1.0 is
  unreleased and the package exports everything from the root.
- Components: `StatusPill` — an AV's status as a pill: a `Badge` plus the status
  dot, owning the seven-status vocabulary (`AVStatus` union — a typo is a
  compile error) and the status → tone mapping docs/badge.md promised would live
  in exactly one place. The export's clickable-span `interactive` mode is gone —
  changing a status is the options dropdown's job. "Ready for hand-off" borrows
  the info blue: the export's indigo has no core ramp (the same decision
  `DomainLabel` awaits). No new tokens.
- Patterns: `TopBar` — **the first pattern**, matching the Figma `Top_NavBar`
  set and its two versions: the "Create Added Value" `Button` in
  `primaryAction`, or the linked `Logo` when there is none. Right side: the
  bell (unread = the design's red dot, count in the accessible name), the
  light/dark mode `Toggle` (controlled — the app owns the theme), and the user
  chip (avatar + name + caret; a real named button only with `onUserMenu`).
  Composed entirely from existing atoms — `Logo`, `Toggle`, `IconButton`,
  `Avatar`, `Icon`. Design review (3 Sep 2026) cut the export's inventions: the
  role badge under the user's name (no design for it) and the merged page-title
  anatomy — back/title/status actions are the Figma `AV_Header`, queued as its
  own `AVHeader` pattern. No new tokens. Unblocks `AppShell` down to `Sidebar`.
- **`StatusPill` gains six statuses, closing the audit's vocabulary gap
  (minor).** Batch 3a found the progression buttons moving AVs through six
  states `Status_Tag_General` has no tag for — an AV parked in `For QA` had
  nothing to wear. Lead's call (4 Sep 2026): build them. `AVStatus` now has
  seventeen values — added `For Review`, `Design Review`, `For QA`, `In QA`,
  `Ready for Deploy`, `Confirmed Prod`. **No new treatment**: each reuses a
  tone the mapping already uses (gates warning, work info, verified success),
  and `Review` stays the one filled tag, so the tag set's visual language is
  unchanged. No new tokens.
  `StatusProgression`'s `AVProgressionStatus` is now a literal subset of
  `AVStatus` (`Extract<…>`), so a lifecycle state with no tag is a **compile
  error** — the two vocabularies cannot drift apart again.
  ⚠️ **Figma has not caught up**: the six do not exist in
  `Status_Tag_General`, and the repo is the source of truth, so they need
  adding to the design file.
- Components: `StatusProgression` (Actions) — the "move this Added Value
  along" buttons, read off the Figma **Status Progression Buttons** page
  (eight component sets: two workflows × four viewer roles). **It owns
  status → transitions**, the way `StatusPill` owns status → tone: call sites
  pass workflow/role/status and handle `onTransition`, and `avTransitions()`
  exposes the same list without buttons. Every label is the design's own
  wording rather than generated from the status name, because the design does
  not generate them either ("Move to Handoff" to an assignee, plain "Handoff"
  to an admin). A terminal status renders `null`, matching the design's empty
  variant. One atom used twice, so it is a component, not a pattern. No new
  tokens.
- Patterns: `AVHeader` — the Figma `AV_Header` set: back arrow and title on
  the left, `StatusProgression` on the right, in both `Type` variants
  (`default`, titled by AV id; `new`, titled in words and set larger). The
  design's `Show Move Status Buttons` boolean is `showStatusActions`. **This
  carries the page's `<h1>`**, which is exactly why `TopBar` carries none.
  Back is either a real link (`backHref`) or a history button (`onBack`),
  both at 40px targets against the design's bare 20px glyph. Composed of
  `IconButton`, `Icon` and `StatusProgression` — it owns no lifecycle
  knowledge, it only places it. No new tokens.
- **Audit, batch 3a (docs/figma-audit.md): the design carries two AV status
  vocabularies that disagree.** `Status_Tag_General` (eleven statuses, what
  `StatusPill` displays) and the Status Progression lifecycle share five
  names; the progression adds six QA/deploy states the tag set cannot
  display, so an AV in `For QA` has no tag to wear. Shipped as two distinct
  types (`AVStatus`, `AVProgressionStatus`) so TypeScript keeps them apart —
  **reconciling them is a design decision, not a code one.** Also flagged:
  seven progression variants carry placeholder layer names (`Status4`,
  `Status8`, `Deploy`, `Review`, `Review (completed 1)`) and are therefore
  not modelled, which leaves the `initiator` role offering moves on `Draft`
  only; and the `AV_Header` title's size falls between two ramp steps, so it
  takes the larger.
- Components: three designed states the Figma audit found missing (batch 2,
  docs/figma-audit.md). **`Toast`** gains the design's 4px timer bar — the
  countdown it already ran, made visible; CSS-transition driven so it stays
  smooth without a render per frame, freezing and resuming with the timer, and
  `aria-hidden` because the toast already communicates the wait (it is
  deliberately not `ProgressBar`, which is a semantic meter). **`Dropzone`**
  gains `error`: the design's Error state, with `aria-invalid` and
  `aria-describedby` so the rejection is announced and not merely painted, and
  the zone stays usable for the next attempt. **`EmojiReactionPicker`** gains
  `people` per reaction, rendering the design's Hover Tooltip on the system
  `Tooltip` — so the names open on keyboard focus too, not just hover. No new
  tokens.
- Fixed: `IconButton` no longer sets `title` when a `Tooltip` describes it. Both would
  render, ours and the browser's native bubble on top, with no way for a caller to
  suppress the second.
- Fixed: `Menu`'s shortcut text moves from `text.subtle` to `text.tertiary`. It was
  4.76:1 on the panel but only 4.09:1 once the item was highlighted — the state where
  a keyboard user is actually reading it.
- Components: `Avatar` / `AvatarGroup` (sm/md/lg = 24/32/40) — initials or photo,
  tone derived from the name. No new tokens. The export's six pastels with white
  initials measured 1.83–2.37:1 and failed 1.4.3 across the board, so the hash now
  maps onto the `accent.{blue,green,red,yellow}` hue families rather than the status
  families — a person is not an error. AvatarGroup announces itself as one summary
  ("Ali, Eve and 3 others") rather than a list of images nobody can act on.
- Components: `Badge` (sm/md, six generic tones) — the pale tonal treatment from the
  Figma Tags page. No new tokens. **VCP's status vocabulary is deliberately not here**:
  `accepted`, `for qa`, `confirmed prod` and the rest belong to the `StatusPill`
  pattern, since they only mean something inside VCP.
- Components: `Card` (title, header action, footer, padded) — `surface.elevated` with
  `shadow.card`. No new tokens. Renders a real heading at a caller-chosen level, and
  deliberately takes no click handler: a whole-card target hides the real action from
  keyboards and screen readers.
- Components: `Divider` (horizontal/vertical, optional caption) — decorative by
  default (`role="presentation"`), opt into `separator` semantics when it genuinely
  divides sections. No new tokens.
- Components: `IconButton` (4 variants x sm/md/lg) — Button's variants, sizes and
  focus ring, in a square. No new tokens. **`label` is a required prop and the other
  naming routes are removed from the type**, so an unnamed icon-only control is a
  compile error rather than a review finding.
- Components: `Skeleton` (block/circle/lines, radius tokens) — `aria-hidden`, with the
  line boxes derived from the type ramp so a three-line skeleton occupies exactly three
  lines of body copy. No new tokens. Docs and a story carry the live-region pattern the
  placeholder needs to not be silent.
- Components: `Spinner` (sm/md/lg) — `role="status"`, never `progressbar`. No new
  tokens. Reduced motion swaps the spin for a pulse rather than freezing it, because a
  motionless spinner reads as a hang.
- Components: `Icon` (sm/md/lg = 16/20/24) — a Phosphor glyph at `regular` weight,
  filled with `currentColor`, so colour comes from a text token on the parent and
  dark theme needs no second path. No new tokens. Decorative by default
  (`aria-hidden`); pass `label` for `role="img"` and a name when the glyph is the
  only carrier of meaning. Ships the Phosphor glyphs the VCP Figma library
  references rather than all 1,512 — a `name`-driven lookup cannot be tree-shaken.
  Carries VCP's in-house glyphs alongside them (`caret-triple-up`, which Phosphor
  has no equivalent for); `docs/icon.md` covers how to add either.

- Components: `Button` (primary/secondary/tertiary/danger/link × sm/md/lg,
  loading/disabled), mapped to `action.*` and `accent.critical.*` state tokens.
- Components: `SegmentedControl` (sm/md, fullWidth, disabled options) — a radio
  group on a `surface.neutral.subtle` track. No new tokens. Sizes are 32/40px to
  match Button rather than the export's 28/36, so `md` meets the 40px target rule.
  Known: the selected segment's surface is 1.1:1 against the track, so the
  selected state is carried by the label's colour and weight — see
  `docs/segmented-control.md`.
- Components: `Tabs` (sm/md, fullWidth, counts, disabled tabs) — selected tab takes
  `action.secondary.content.default` for both label and 2px underline; count pill
  uses `type.caption-sm` on `surface.brand.faint` / `surface.neutral.subtle`.
  No new tokens. Exports `tabId()` / `tabPanelId()` so panels can be associated —
  the bar alone is not an accessible tab set.

### Not imported from the Figma export (deliberately)

- `schemes-*` and `state-layers-*` variables — Material theme-builder noise.
- `-2`/`-3` duplicate variables — Figma collection duplication artifacts.
- `button-*` component variables — they referenced the pink `primary` ramp;
  design confirmed (2026-08-18) pink is not a brand colour. The pink ramp is
  removed entirely; `action.*` (vcp-blue) is the button source.
- `secondary` (teal) — kept as `teal-legacy` pending the same design call as
  pink. Design confirmed (2026-09-04) teal is not a brand colour either. The
  ramp is removed entirely; no semantic token ever referenced it, so nothing
  else changes. `Avatar`'s `docs/avatar.md` noted it as a possible stand-in
  for the accent hues the Figma export has that VCP does not — that note is
  updated; there is no substitute ramp for teal now.

### Fixes

- **`Modal`'s close button is neutral, not brand (11 September 2026).** The
  ghost `IconButton` variant paints its icon `action.tertiary` blue, which put
  a blue X in the corner of every dialog competing with the footer's primary
  button for the eye — and dismissing is not an action to invite. It is
  `text.primary` now, 20.17:1 on the panel in light and white in dark, with a
  neutral `surface.neutral.faint` hover. Recoloured through `className`, the
  way `Toast` and `Banner` already tone theirs. `AttachmentPreview`'s close
  button is still the brand blue and was left alone.

- **`Modal`'s stories all started closed, so nothing was testing the dialog
  (11 September 2026).** Every one of the seven stories rendered a trigger
  button and no dialog, which meant Chromatic had never diffed a single pixel
  of the panel, backdrop, header or footer, and the axe check in `npm test`
  had never seen the dialog's markup — so none of the focus-contract or
  labelling claims in `docs/modal.md` were verified by anything. The visual
  stories now render open, and the focus contract is covered by four `play`
  stories: `OpensTrapsAndCloses`, `BackgroundIsInert`, `BackdropClickCloses`
  and `NotDismissible`. `LightAndDark` becomes `DarkTheme` and sets the theme
  global, because a portalled dialog cannot be themed by a wrapper `div` and
  so cannot be shown as a side-by-side pair. `Sizes` is replaced by
  `ExtraWide`; the four widths are now each covered by an open story.

  The one component change rides along because it is the same sheet: **the
  footer loses both its tint and its divider.** It was a `surface.canvas` band
  under a `stroke.default` rule; now the panel's `surface.elevated` carries
  through and whitespace sets the actions apart from the content, the same way
  the header is already separated from the body. Neither removed element was a
  1.4.11 boundary — the buttons carry their own contrast — and `docs/modal.md`
  says so. `Card`'s footer is untouched and still has both. Everything else
  about the focus contract was already right; it was simply unproven.

- **Five findings from the first run of the story tests (10 September 2026).**
  `SidebarItem`'s selected row named a `text.brand` token that does not exist,
  so its label inherited black — 2.32:1 on the dark tint; it is `text.brand.strong`
  now (8.97:1 light, 6.14:1 dark). `ProgressBar` put a passed `aria-label` on its
  wrapper instead of the meter, leaving the meter unnamed. `Dropzone`'s "Choose
  files" kept link blue on the error tint at 4.11:1; it takes the critical content
  colour there. `TopBar` rendered an `<a aria-label>` with no `href` when `homeHref`
  was omitted; the `Logo` now stands alone and names itself. `AppShell`'s scroll
  region could not take focus, so a page of plain text was unreachable from the
  keyboard; it is a focusable group named "Page". The a11y check in `npm test`
  now fails on any violation.

- `cn()` was dropping type classes. tailwind-merge files any `text-…` it doesn't
  recognise as a colour, so `text-label-lg` and `text-action-primary-content-default`
  collided and only the last one survived. **Every `Button` has been rendering at the
  browser's inherited 16px/400 instead of `type.label-lg` (14px/500) since 0.1.0.**
  `cn()` now declares the type ramp as a font-size group, and `npm run lint:tokens`
  fails if that list drifts from `tokens/semantic/type.json`.

### Contrast fixes vs the Figma export (approved by design, 2026-08-18)

- `text.subtle`: slate-400 → slate-500 (was 2.56:1 on white — failed AA).
- `text.tertiary`: slate-500 → slate-600 (keeps the hierarchy distinct after the
  subtle fix; 7.58:1).
- `accent.success.tonal.content.default`: green-800 → green-900 (was exactly
  4.50:1; now 8.24:1).
- Dark theme: `stroke.focused` was left at vcp-blue-500, the same value as light,
  while every other `stroke.*` token was inverted. That is 2.37:1 against the dark
  surfaces — below the 3:1 WCAG 1.4.11 asks of a focus indicator, so the focus ring
  was close to invisible in dark theme on every component, Button included.
  Now vcp-blue-300 (6.33:1), mirroring how `stroke.brand.strong` flips 600 → 300.
  This corrects the earlier "dark theme already passes" note.
- These fixes live in `scripts/import-figma-tokens.mjs`, so re-importing a fresh
  Figma export cannot silently regress them. **Push the same three changes back
  to the Figma variables** so the export catches up with the code.

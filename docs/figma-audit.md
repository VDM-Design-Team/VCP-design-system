# Figma audit — what the design says vs what we shipped

Every shipped piece, checked against the VCP Design Library
(`k0XgoZM8Q23EP4489CqwIc`) by reading the real component sets — fills,
sizes, radii and variant names pulled programmatically, not eyeballed from
screenshots.

**Started 3 Sep 2026.** Batch 1 covers the atoms and the pieces whose Figma
pages are unambiguous. Later batches append below; nothing is deleted, so
the record shows what was checked when.

Verdicts: **✅ matches** · **🔧 fixed here** · **⚠️ flagged for design**

---

## Batch 1 — Buttons, Tags, Checkbox, Segmented Control, Pagination, User Elements, Feedback, Dropdown

### 🔧 StatusPill — the vocabulary was wrong

The biggest find. The Figma `Status_Tag_General` set (Tags page) carries
**eleven** statuses; the Claude Design export invented **seven**, four of
which exist nowhere in the design. StatusPill shipped with the export's list
and is now rebuilt on Figma's.

| Figma status | Fill / text | Token pair | Was in the export's list? |
|---|---|---|---|
| Draft | `#e2e8f0` / `#334155` | neutral tonal | yes |
| Initiated | `#fef9c2` / `#a65f00` | warning tonal | **no** |
| Pending | `#fef9c2` / `#a65f00` | warning tonal | **no** |
| In Progress | `#dbeafe` / `#1447e6` | info tonal | yes |
| Review | `#155dfc` / `#ffffff` | info **filled** | **no** |
| Review No Action | `#dbeafe` / `#1447e6` | info tonal | **no** |
| Accepted | `#dbeafe` / `#1447e6` | info tonal | **no** |
| Completed | `#dcfce7` / `#008236` | success tonal | yes |
| Rejected | `#ffe2e2` / `#9f0712` | danger tonal | **no** |
| Reopened | `#dbeafe` / `#1447e6` | info tonal | **no** |
| Backlog | `#e2e8f0` / `#334155` | neutral tonal | **no** |

Gone, because the design has no such state: `Ready for review`,
`Ready for hand-off`, `Blocked`, `Archive`.

Two consequences handled here:

- **`Badge` gained a `variant` (`tonal` | `filled`)** — `Review` is the one
  solid tag in the design, and the atom is where that treatment belongs, so
  the component composes it rather than hand-rolling a fill.
- **The dot is gone.** Our pill drew one; the Figma tag is text on a fill,
  nothing else. Text is what separates two statuses sharing a colour
  (Accepted / In Progress), so nothing is lost.

⚠️ **For design:** Figma labels *both* `Review` and `Review No Action` with
the visible text "Review" — same word, different fill. We render each
status's own name so the two are told apart without relying on colour. If
the product really wants both to read "Review", say so and we will add a
`label` override with a note about the colour-only distinction.

### 🔧 Badge — corner radius

Figma tags are **`radius: 6`** (`shape.radius.sm`); we shipped `rounded-md`
(8px) with a code comment claiming it was "the Figma Tag's own corner". It
wasn't. Fixed to `rounded-sm`.

### ✅ Badge — tonal colour pairs

Every tonal pair matches the design **exactly**, hex for hex:
`info` = blue-100/700, `warning` = yellow-100/700, `danger` = red-100/800,
`success` bg = green-100. Sizes match too: Figma Default 28 / Small 24 =
our `md` / `sm`.

⚠️ Two deliberate one-step differences, both already documented:
`success` text is green-900 not Figma's `#008236` (that value measured
exactly 4.50:1 — the AA fix predates this audit), and `neutral` fill is
slate-100 not slate-200 (no semantic surface token carries slate-200; the
nearest is `stroke.subtle`, which is a border role). Neither is a bug;
both are worth a design opinion.

### 🔧 Button — `sm` height and corner

Figma Small/Normal/Big = **36 / 40 / 48**; we shipped 32/40/48. Fills match
the `action.primary` chain hex for hex (default `#1a56db`, hover `#1441a4`,
pressed `#0d2b6e`, disabled `#8caaed`, white label).

Fixed on the lead's "stay loyal to Figma" call: **`sm` 32 → 36**, and the
corner **8 → 6** (Figma buttons are `radius: 6`, like the tags — we had
`rounded-md`). `IconButton` follows both, since its docs promise it is
Button's scale and corner exactly.

### ✅ Checkbox — box sizes

Figma ships **16 and 20**; ours are 16 (`sm`) and 20 (`md`). Match.

### 🔧 Pagination — control height and corner

Figma's `VCP_Pagination` controls are **36 tall with `radius: 4`**; ours were
32 with `radius.sm` (6). Both fixed.

### ✅ Segmented Control — my batch-1 flag was wrong

I first reported "Figma items are 38 tall, ours are 32/40". That 38 was the
**inner `_Segmented_Control_Item`**, not the control. Reading the outer
`Segmented_Control` set gives the real scale: **XL 48 · L 40 · M 36 · S 32 ·
XS 28**, radius 6, 4px padding.

**Our `sm`/`md` (32/40) are exactly Figma's S and L.** No size change needed.
Only the corners moved: track `md` → `sm` (6), items `sm` → the new `xs` (4).

### 🔧 New token — `shape.radius.xs` = 4px

Figma has **no radius variables** (the values sit raw on components), but it
uses a consistent pair: **6** for controls, **4** for the small cells inside
them (pagination pages, segmented items). We had no 4px token, so per rule 1
it was added before use. `radius.md` (8) is now described as what it
actually is — cards, panels, larger surfaces.

### ✅ Avatar — the sizes we ship

Figma has XXS 16 · XS 24 · S 32 · Default 36 · L 40 · XL 44 · XXL 48. Ours
(24 / 32 / 40) are three of those, chosen so `lg` meets the 40 touch
target. ⚠️ Figma's *default* is 36, which we don't have — worth knowing when
a design hands over a 36 avatar; nothing is broken.

### ✅ Menu item height

Figma `Menu_Item` rows are 40 tall at 14px — matches ours.

### ✅ Tooltip / Snackbar

Tooltip: 12px text, dark-on-light per the design. Snackbar (our `Toast`):
white surface, `radius: 6`. Both consistent with what we ship.

---

## Composition check — are we building on our own atoms?

Run alongside the visual audit: every component's imports, verified by
`npm run lint:composition` (part of `npm test`). Two things it enforces —
each docs page's "Composed of" table matches the real import graph, and no
piece hand-rolls what an atom already provides.

Result: **no component rebuilds an existing atom.** The pieces that draw
raw markup do so because nothing in the system covers it (`Popover`'s panel,
`DataTable`'s `<table>`), and each says so in its docs.
The one violation found was in this audit: `StatusPill` was about to need a
solid fill that `Badge` couldn't give — fixed by adding the variant to the
atom, not by styling around it.

---

## Decisions taken (3 Sep 2026, lead)

1. **Stay loyal to Figma** on the dense-control scale → the Button/Pagination
   fixes above. Where the audit itself proved the design and the code already
   agreed (SegmentedControl), nothing moved.
2. ~~**`Review` / `Review No Action`** keep their distinct labels for now.~~
   **Resolved 7 Sep 2026:** there is no `Review No Action` state. The two
   pills are one status with two treatments — a label for a user, the button
   style for a viewer who can act. The repo carries one `Review` and an
   `actionable` prop; the Figma variant is being renamed.
3. Badge's two documented deviations (`success` AA fix, `neutral` slate-100)
   stand.

---

## Batch 2 — Date Picker, Toasts, Edit Text Toolbar, AV Table, Comment Section, AV Attachments

Batch 1 was mostly *values* (a wrong hex, a wrong radius). Batch 2 is mostly
**missing designed states and variants** — the pieces are the right shape,
but the design asks for more than we built.

### 🔧 DatePicker — panel width

Figma `Date_Picker_VCP` is **284 wide**; the export drew 300 and we kept it.
Fixed (`w-71`, on the 4px grid).

### ⚠️ DatePicker — three designed modes we don't have

The Figma set has variants we never modelled:

| Variant | What it is | Status |
|---|---|---|
| `Mode=Month` | A month picker, not a day grid | not built |
| `Button=Yes` | Footer action buttons (apply/cancel) | not built |
| `Dual View` | Two months side by side | not built |
| `Mobile Friendly` | A 362×458 touch layout | not built |

None is a bug in what we shipped — the day grid matches. They are scope.
`Mode=Month` and `Dual View` matter most for the planning surfaces
(`PeriodSelector`, the Gantt work), so they want building before those.

### 🔧 Toast — the timer bar (built)

The Figma toast carries a **4px Timer Bar** running its auto-dismiss
countdown. We implement the *behaviour* (auto-dismiss, paused on hover and
focus) but drew no bar, so the user could not see how long they had.
**Built** — CSS-transition driven, freezing and resuming with the timer.

### ⚠️ RichTextToolbar — ours is one of several designed toolbars

The Figma Edit Text Toolbar page is far larger than our strip: **~90
commands across nine groups** (Formatting, Paragraph, Content, Files &
Images, Tables & Cells, Actions & Tools, Arrows, Generic, Misc), assembled
into named compositions:

- `_Text_Toolbar_Primary`: **Full Featured** and **Inline Editor**
- `_Text_Toolbar_Secondary`: More Text · More Paragraph · More Rich Content · Misc
- `_Text_Toolbar_Pop_Up`: Image · Table
- `_Quick_Insert`: On/Off

Every one of our eleven commands **is** a real Figma command, so nothing we
built is invented. But we ship a single fixed strip roughly equal to the
**Inline Editor**, with no overflow toolbars and no context pop-ups. Worth a
decision: model the two primary variants, or keep one strip and document it
as the inline editor.

### ⚠️ Toolbar icon size

Figma toolbar icons are **24**; ours are 16 inside 28 buttons. Deliberate on
our side (a dense strip), but it is a visible difference.

### ✅ EmojiReactionPicker — matches (tooltip built)

Figma reaction pills are **24 tall** — ours are too. `Type=Own Reaction`
maps exactly to our `mine`. ⚠️ One missing state: the design has
**Hover Tooltip** on a reaction, naming who reacted. **Built** as
composition on the existing `Tooltip`, via a new `people` field.

### ⚠️ FileAttachment — the card is a different size, and off-grid

Figma `_File_Attachment_Card_Base` is **93 × 69, radius 6**; ours is 104
wide with a 72-tall preview. **93 is not on the 4px grid** the system is
built on (92 and 96 are), so this is flagged rather than forced — rounding
to 92 would be closest, but it is design's call whether the card is 92, 96,
or genuinely 93.

Also unmodelled: a **`Domain Label=Yes`** variant (blocked on `DomainLabel`,
which is itself blocked on the two missing colour ramps) and a
**Hover Remove Only** state.

### 🔧 Dropzone — the error state (built)

Figma `_Attachment_Drop_Container` is **298 × 162, radius 8** (our radius
matches) with three states: Default, **Drag Over**, and **Error**. We had
the first two. **Built** as an `error` prop on the existing
`accent.critical.*` tokens, announced via `aria-invalid` /
`aria-describedby`.

### ⚠️ For design — the AV table cells are not using the VCP variables

The Added Value Table page draws its deadline states with **raw colours that
are not in any VCP ramp**: `#5291f7` (Safe), `#eab308` (Approaching),
`#ef4444` (Overdue), `#64748b` (Backlog). Our ramps carry `yellow-500
#f0b100` and `red-500 #fb2c36` — different values. These look like stock
Tailwind defaults left in the design rather than the library's own
variables.

Nothing to fix in code (those cells belong to the unbuilt AV-table pattern),
but **the Figma components should be rebound to the VCP variables** before
that pattern is built, or the pattern will inherit colours the token layer
cannot express.

### Batch 2 verdict

No component we shipped is *wrong* in the way StatusPill was. The pattern
here is **scope**: the design asks for states (Toast timer, Dropzone error,
reaction tooltip) and variants (DatePicker modes, toolbar compositions) that
we have not built. Each is listed above so it can be scheduled rather than
discovered later.

## Batch 3a — AV_Header and the Status Progression Buttons (4 Sep 2026)

Run just before building `AVHeader`, per the batch-3 plan below. Two findings
worth design's attention, one of them significant.

### 🔧 **There were two AV status vocabularies — resolved 4 Sep 2026**

`Status_Tag_General` (Tags page, which `StatusPill` owns) names **eleven**
statuses. The Status Progression Buttons page drives a **different**
lifecycle:

| | Statuses |
|---|---|
| `Status_Tag_General` | Draft, Initiated, Pending, In Progress, Review, Review No Action, Accepted, Completed, Rejected, Reopened, Backlog |
| Status Progression | Draft, Pending, Accepted, In Progress, **For Review, For QA, In QA, Ready for Deploy, Confirmed Prod, Design Review**, Completed |

### Tag-set structure — decided for now, revisit at the third domain

Design split the status tags into three sets: `Status_Tag_General`,
`Status_Tag_Design_Only` and `Status_Tag_Development_Only`. Issue #68 asked
whether that scales, on the assumption that Content, Partners, Governance and
Product were coming. **It was closed on 8 Sep 2026: only Design and Development
are defined, and at two domains the three sets are fine** — cheap to maintain,
and a designer inserting an exact tag gets it right.

The code does not depend on the answer either way. Nothing counts domains:
`chain` is data, and there is no domain enum. A third domain costs no code
change.

**The trigger to revisit is a third domain**, not a date. At that point the
question is whether to keep adding a set per domain, or collapse the `_Only`
sets into one `Status_Tag_Domain` component with editable text — which is what
the code already models, since every domain step renders the same blue tonal
with different text. Four or more domains is where hand-drawing a variant per
step stops paying for itself.

They share five names. The tag set has `Initiated`, `Review`, `Review No
Action`, `Rejected`, `Reopened`, `Backlog` that the progression never moves
through; the progression has six QA/deploy states the tag set cannot display.
**An AV in `For QA` has no tag to wear.**

**Decision (lead, 4 Sep 2026): the tag set gains the six states.**
`StatusPill` now carries seventeen statuses, and `AVProgressionStatus` is a
literal subset of `AVStatus` (`Extract<…>`), so a lifecycle state with no tag
is a compile error — the two cannot drift apart again.

The six reuse tones the mapping already uses, so nothing about the tag set's
visual language changes: gates are warning (as `Pending` already is), work is
info (as `In Progress` already is), verified is success (as `Completed`
already is), and `Review` stays the one filled tag.

⚠️ **Figma has not caught up.** `Status_Tag_General` still has eleven; the
repo is the source of truth, so **the six need adding to the design file**:
`For Review`, `For QA`, `In QA`, `Ready for Deploy`, `Confirmed Prod`,
`Design Review`.

### ⚠️ Seven progression variants have placeholder names

`Status4` (×2), `Status8`, `Deploy`, `Review` (×2), `Review (completed 1)`
are layer names, not statuses. They draw real buttons — mostly Reject/Accept
or Handoff — but there is no way to know which status they represent, so they
are **not modelled**; the `initiator` role consequently offers moves on
`Draft` only. Name them and they are a minor bump.

**Asked of design (Eve) on 4 Sep 2026** —
[issue #60](https://github.com/VDM-Design-Team/VCP-design-system/issues/60).
Five of the seven draw
Reject · Accept, which *suggests* they are all `Pending` seen by different
roles, but that is a guess and was deliberately not written into a public
type.

Two smaller design-file fixes while you are in there: the Design sets spell
it **"In Progess"** in three places, and Dev/Admin's Ready for Deploy button
reads **"Return to  In QA"** with a double space.

### ✅ Status progression — buttons, sizes, labels

Every label, order and treatment matches: the step back is outlined, the step
forward filled, `Reject` on an admin's Pending is the one red button, and
`Confirmed Prod` really does say "Move to Handoff" to an assignee and plain
"Handoff" to an admin (their variant widths, 360 vs 301, confirm it). Button
height 37 → our `sm` 36, the scale decision already taken in batch 1.

### 🔧 AVHeader — the title's size has no ramp step

The `Type=New` title is **18px semibold**, between our `heading-sm` (16) and
`heading-md` (20). We take the larger step rather than add a ramp size for
one header. ⚠️ Worth a design opinion: if 18 is the AV page-title size
generally, it earns a token; if it is incidental, the design should move to
20.

Everything else matches — 32 above / 16 below and sides, gap 4 between arrow
and title, space-between, and the `Show Move Status Buttons` boolean.

## Still to audit

Batch 3 ran for Navigation on 8 Sep 2026 — see below. Still to audit:
Settings Pages, Holiday Registry,
Planning Page, Assignee Availability, Dashboard Charts, Modals. These are
mostly **unbuilt** patterns, so batch 3 is less "did we get it wrong" and
more "what does the design actually ask for" — best run just before each
pattern is built rather than all at once.

---

## Batch 3 — Navigation (`SideBar`), 8 Sep 2026

Read from the Figma `SideBar` section (`2349:935`). Run because `SidebarItem`
was ported from the Claude Design export **before** this audit, which is the
wrong order and produced a component that did not match.

### 🔧 SidebarItem — the export described a different component

| What | Export (and the first port) | Design |
|---|---|---|
| Count badge | a solid blue pill with a number | **does not exist** — no item variant has one |
| `Right Icon` axis | absent | `On \| Off`; the chevron on expandable rows |
| `Dropdown Item` axis | absent | `Yes \| No`; sub-rows beneath the parent |
| Icon slot | 24 | 24 — *see correction below* |

Fixed in PR #76 before it merged.

### ⚠️ Four user types, not three

`VCP_SideBar` has eight variants — four user types, each with a minimised
twin at 76 against 256 expanded:

| Type | Items |
|---|---|
| User | Dashboard, My Values, Assigned, Drafts, Task Log Trail, Archive▾ |
| Admin | Dashboard, My Values, Manage, Assigned, Drafts, Task Log Trail, Archive▾ |
| **Admin Dev** | Dashboard, My Values, Planning▾, Manage, Assigned, Drafts, Task Log Trail, Archive▾ |
| Super Admin | Dashboard, Accounts, Domains, Contact List |

▾ = expandable. **The export had three roles and no `Admin Dev`.** All four
carry "Report a problem" in the footer.

### ⚠️ Things the export has that the design does not

- **A footer CTA** (`footerAction`, e.g. "Create Added Value") — no rail draws one.
- **A domain selector inside the sidebar** — `_Domain_Selection_Dropdown`
  exists as its own component but appears in none of the eight rails.
- **Single-chevron collapse toggle** — the design's floating button uses
  **double** chevrons (« »), with Default/Hover/Pressed states.

### ⚠️ `Status` is a preset with no home

`_VCP_SideBar_Item_Preset` has twelve types, including `Status` with its own
dropdown component — but `Status` appears in none of the four rails.
**Confirmed 8 Sep 2026: it is not a nav item.** The preset is unused.

### 🔧 Correction — the icon slot is 24, and the icons are Heroicons

An earlier pass here read **32** off the standalone `_Left_Icon` component's
frame. In actual use the slot is **24×24**: `_VCP_SideBar_Item` → `Content`
(inset 8) → `Left_Icon` 24×24, with the label starting at x=32. Fixed in
`SidebarItem`.

The same drill-down found something larger. The icon instances inside the
rail are named **`heroicons-outline/light-bulb`** and **`RectangleGroup`** —
Heroicons, not Phosphor. `docs/icon.md` states, with evidence from the Tags
and atom pages, that the library draws from Phosphor and that the export's
Heroicons claim is wrong. Both appear to be true of different pages: the
library is mixed.

**Decided 8 Sep 2026: Phosphor only.** The repo does not follow the design
into a second family. Where Phosphor has an equivalent it is used; where it
does not — Dashboard's `RectangleGroup` — the glyph is redrawn in Phosphor's
weight and added to `CUSTOM_ICONS`.

**Swapped in the design file, 9 Sep 2026.** All twelve preset rows were
checked; six carried Heroicons. Five are now the Phosphor Regular 24 variants
from the General Design Library — My Values `Lightbulb`, Drafts `File`,
Archive `Archive`, Planning `Rows`, Domains `Globe` — in the preset set and
again at row level in the four minimised rails, whose collapsed twins carried
their own overrides. "Report a problem" used a Heroicons triangle in three
rails and Phosphor `Warning` in five; all eight use `Warning` now. Every
swapped glyph is bound to `colors/text/secondary`, as the rows already on
Phosphor were. **Manage still carries `heroicons-outline/rectangle-stack`**:
Phosphor's stack glyphs are isometric and this one is face-on, so it wants a
VCP-drawn component, the way `Assigned Added Value` is (issue #80).

### ⚠️ Icons the system does not ship

The nav needs a dashboard/grid glyph, an archive box and an envelope. The
system's Phosphor set covers the rest by name-mapping
(`exclamation-triangle` → `warning`, `chevron-left` → `caret-left`), but
those three have no good equivalent and are currently stood in for by
`graph`, `database` and `chat-dots`. Three icons to add.

---

## Batch 4 — the AV modals, 11 September 2026

Seven pages in the library are modals, and **not one of them was in
`docs/inventory.md`**. They are not in the Claude Design export either, so
nothing in this repo knew they existed. This batch is the survey; two are
built, five are specced below.

| Modal | Node | Variants | Its own molecules | State |
|---|---|---|---|---|
| Confirm Delete AV | `7829:105404` | 1 | — | **Built** — `ConfirmDeleteAVModal` |
| Report a Problem | `7218:77431` | 1 | — | **Built** — `ReportProblemModal` |
| Accept Pending AV | `5939:149041` | 1 | `_Accept_Modal_Fields` (5 types), `_Accept_Modal_Enable_Multipart` (2 states) | To build |
| Reject AV (Pending) | `7847:106048` | 3 — Default / Reason Selected / Dropdown | `Pending_Rejection_Reason` (3 states), `_Selected_Pending_Rejection_Reason` (5 reasons) | To build |
| Handoff AV | `5342:78539` | 2 — Default / Overdue | `_Handoff_AV_Modal_Fields` (5 types), `…_Overdue_Reason` (3 states), `…_Buttons` (2 domains) | To build |
| Review AV | `6100:15103` | 4 — Domain × Rejection modal | `_Review_Field_Item` (6 types), `_Review_Field_Attachements_Item`, `Handoff_Rejection_Reason` (3), `_Selected_Handoff_Rejection_Reason` (6 reasons), `_Rejection_Reason_Modal` (3), `Review_Already_Reviewed_Popup` | To build |
| Change Log | `7211:1060` | 1 | `_Changelog_Main_Content` (3 types), `_Changelog_Description`, `Changelog_Description_List_Item`, `_Changelog_Tooltip` (6), `_Changelog_Pagination_Dots` | To build |

### They are patterns, and they come in two layouts

Each composes `Modal` with form pieces, which is two or more components in a
distinct section — a pattern by the CLAUDE.md test. The two layouts matter
because they decide whether `Modal`'s header is used at all:

- **The dialog layout** — left-aligned title, close button, footer. `Report a
  Problem` and, from the specs, `Accept Pending`, `Handoff` and `Review` all
  use it, so they pass `title` to `Modal`.
- **The alert layout** — a centred glyph, question and consequence, with no
  header and no close button. `Confirm Delete AV` uses it. `Modal` has no
  `title` slot for a centred heading, so the heading goes in the body and the
  name is repeated as `aria-label`.

### ✅ `Modal` could not take `aria-labelledby` — fixed

Its props deliberately omitted it, so an alert-layout dialog could not point at
the heading it renders in its own body and had to repeat the string as an
`aria-label`. **Added 11 September 2026**, before the other alert-layout modals
land: naming is now a three-way choice — `title`, `aria-labelledby`, or
`aria-label` — and `ConfirmDeleteAVModal` points at its own `<h2>`.

### 🔧 The delete confirmation's primary button read "Complete" — fixed

On a dialog whose heading is "Are you sure you want to delete?". Almost
certainly pasted from another modal. **Changed to "Delete" in the file on
11 September 2026.** It was a local text override on the `Button_Normal`
instance inside `Confirm_Delete_AV_Popup`, not text in the shared button
component, so the edit touched that one dialog and nothing else. The repo
carries the label as `confirmLabel` either way, defaulting to `Delete`, so
the two now agree.

### ⚠️ Three gaps these modals will keep hitting

1. ✅ **No neutral outlined button — fixed.** `Confirm Delete`'s Cancel is a
   grey outlined button, `#94a3b8` border and `#475569` text, and `Button`'s
   `secondary` is brand-outlined. `neutral.outline.*` is imported
   name-for-name as of 11 September 2026 and `Button` and `IconButton` have a
   `neutral` variant. The other three treatments in the family — `filled`,
   `textual`, `tonal` — stay unimported until something needs them.

   **Where "neutral" actually lives, because it is two different things.** The
   **ramp** `colors/neutral/50…950` belongs to the *General Design Library*, and
   this repo already has it byte-identical as `color.neutral.*` — where it sits
   **completely unused**: all 75 of the repo's grey aliases point at
   `color.slate.*` instead, including `surface.neutral.*` and `text.secondary`.
   The **semantic** family `colors/neutral/outline/*` is local to the VCP file's
   own Semantics collection and is built on slate, which is why the port aliases
   slate and matches every other VCP grey. The GDL has no semantic neutral
   family at all; its equivalent is a component layer,
   `button/outlined/{enabled, hovered, focused, pressed, disabled}`.

   **Two things that came out of doing it.** The build config had a hard-coded
   whitelist of semantic families, so the light tokens silently generated
   nothing until `neutral` was added to it — worth knowing before the next
   family is imported. And Figma's **dark** `neutral/outline/content` goes
   `slate/300 → 400 → 500` across default, hover and pressed, which gets
   *darker* on a dark surface: hover drops from 9.85:1 to 5.71:1 and pressed to
   3.07:1, below the 4.5:1 text needs. Its own border track goes the other way
   (500 → 400 → 300, lighter), so content is the one that is wrong. The repo
   mirrors it correctly as `300 → 200 → 100`, and **the VCP file's Dark mode was
   corrected to match on 11 September 2026** — `content/hover` slate/400 →
   slate/200, `content/pressed` slate/500 → slate/100.
2. **The design tints its form fields** — `surface.neutral.faint` fill with a
   `stroke.default` border at 1.48:1. `Input` uses `stroke.field` at 4.76:1
   because a control's boundary must be perceivable. Ours is the correct one;
   the design file should follow, as it already did for the other contrast
   fixes.
3. ✅ **The rejection-reason machinery is shared — built once, 11 September
   2026.** `Reject (Pending)` and `Review` each have a reason picker with a
   list of typed reasons and an "Other" free-text state. They are different
   sets (`Pending_Rejection_Reason` has 5, `Handoff_Rejection_Reason` has 6)
   but the same shape, so it is now the `RejectionReason` **component**, with
   both sets exported from it as constants — the way `Sidebar` owns its nav
   vocabulary. Each reason carries the design's own explanation, which is the
   line that appears under the select once a reason is chosen. The two modals
   that need it can now be built without either one owning the vocabulary.

### Suggested order

`Accept Pending` (one variant, five fields) → `Handoff` (two variants, reuses
the field shape) → the shared rejection-reason picker → `Reject (Pending)` →
`Review` (the largest, four variants, and it nests the rejection modal) →
`Change Log` (unrelated to the AV flow, and it needs a carousel nobody has
specced).

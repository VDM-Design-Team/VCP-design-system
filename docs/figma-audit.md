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
raw markup do so because nothing in the system covers it (`Card`'s shell,
`Popover`'s panel, `DataTable`'s `<table>`), and each says so in its docs.
The one violation found was in this audit: `StatusPill` was about to need a
solid fill that `Badge` couldn't give — fixed by adding the variant to the
atom, not by styling around it.

---

## Decisions taken (3 Sep 2026, lead)

1. **Stay loyal to Figma** on the dense-control scale → the Button/Pagination
   fixes above. Where the audit itself proved the design and the code already
   agreed (SegmentedControl), nothing moved.
2. **`Review` / `Review No Action`** keep their distinct labels for now.
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

### ⚠️ Toast — the timer bar is missing

The Figma toast carries a **4px Timer Bar** running its auto-dismiss
countdown. We implement the *behaviour* (auto-dismiss, paused on hover and
focus) but draw no bar, so the user cannot see how long they have. A real
gap — and cheap, because the timing logic already exists.

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

### ✅ EmojiReactionPicker — matches

Figma reaction pills are **24 tall** — ours are too. `Type=Own Reaction`
maps exactly to our `mine`. ⚠️ One missing state: the design has
**Hover Tooltip** on a reaction (presumably naming who reacted); we show no
tooltip. `Tooltip` already exists, so this is composition, not new work.

### ⚠️ FileAttachment — the card is a different size, and off-grid

Figma `_File_Attachment_Card_Base` is **93 × 69, radius 6**; ours is 104
wide with a 72-tall preview. **93 is not on the 4px grid** the system is
built on (92 and 96 are), so this is flagged rather than forced — rounding
to 92 would be closest, but it is design's call whether the card is 92, 96,
or genuinely 93.

Also unmodelled: a **`Domain Label=Yes`** variant (blocked on `DomainLabel`,
which is itself blocked on the two missing colour ramps) and a
**Hover Remove Only** state.

### ⚠️ Dropzone — no error state

Figma `_Attachment_Drop_Container` is **298 × 162, radius 8** (our radius
matches) with three states: Default, **Drag Over**, and **Error**. We have
the first two. A dropzone that cannot show a rejected file is a real gap —
and the tokens for it (`accent.critical.*`) already exist.

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

## Still to audit

Batch 3 (proposed): Navigation (Sidebar), Settings Pages, Holiday Registry,
Planning Page, Assignee Availability, Dashboard Charts, Modals. These are
mostly **unbuilt** patterns, so batch 3 is less "did we get it wrong" and
more "what does the design actually ask for" — best run just before each
pattern is built rather than all at once.

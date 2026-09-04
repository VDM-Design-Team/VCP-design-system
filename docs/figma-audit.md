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

### ✅ Button — sizes, fills, states

Figma Small/Normal/Big = **36 / 40 / 48**; our `sm`/`md`/`lg` = 32/40/48.
The `md` and `lg` match exactly. Fills match the `action.primary` chain
hex for hex: default `#1a56db`, hover `#1441a4`, pressed `#0d2b6e`,
disabled `#8caaed`, white label, radius 6.

⚠️ **Our `sm` is 32, the design's Small is 36.** We chose 32 to give the
scale a genuinely dense step and to line up with `IconButton sm`. Raising it
touches every dense surface (tables, toolbars, Pagination) — a deliberate
design call, not a quick fix. Flagged rather than changed.

### ✅ Checkbox — box sizes

Figma ships **16 and 20**; ours are 16 (`sm`) and 20 (`md`). Match.

### ⚠️ Pagination — control height

Figma's `VCP_Pagination` controls are **36 tall with `radius: 4`**; ours are
32 with `radius.sm` (6). Same family as the Button `sm` question — a scale
decision to make once, across the dense controls, rather than piecemeal.

### ⚠️ Segmented Control — item height

Figma items are **38 tall** (XL 16px text / L 14px); ours are 32/40. Again
the dense-control scale question; flagged with the two above so design can
settle all three together.

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

## Still to audit

Batch 2 (proposed): Date Picker, Notification/Toasts, Comment Section,
Filters, Edit Text Toolbar, Status Progression Buttons, Added Value Table,
AV Page cards. These pages carry the pieces most likely to have invented
props, since the export's versions of them were the most elaborate.

# MyValuesStats

The strip across the top of the My Values page: who you are, how many Added Values are yours and how many are completed, and the
rest by status as one segmented bar. Built to Figma's `My_AVs_Stats` (the `My Values Page` of `VCP Pages & Flows`).

## Composed of

| Piece | Tier |
|---|---|
| `Avatar` | atom |
| `Divider` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `MyValuesStats` | A person's own AV totals and status breakdown, above their list |
| `StatCard` | One headline figure on a dashboard |
| `ProgressBar` | One fraction of one whole |

## What it shows

- **Who.** The avatar over the person's name (`body-sm-regular`), then a vertical divider.
- **Two headline figures.** **Total AVs**, and **Completed** with its green dot.
- **The breakdown.** One segment per status, **as wide as its count** and never narrower than 100, so a status with nothing in it
  is still a visible, labelled stop. Under each bar: the count, then the status's name. A segment with a count is **filled** in its
  tone; one with none is drawn as an **empty outline** in the same tone.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `user` | `{ name: string; src?: string }` | required | Whose values these are |
| `total` / `completed` | `number` | required | The caller's. **Total is not the sum of the segments** — it includes what is completed |
| `segments` | `MyValuesStatsSegment[]` | required | `{ id, label, count, tone }`, in reading order |
| `totalLabel` / `completedLabel` | `string` | `Total AVs` / `Completed` | |
| `selected` | `string \| number \| null` | `null` | Which stat is the filter now: a segment's `id`, or `'completed'` for the Completed figure (so no segment can have the id `completed`). It is tinted and reads as pressed |
| `onSelectedChange` | `(next: string \| number \| null) => void` | — | Turns the stats into filters (below). Leave it off and the strip is display only |
| `aria-label` | `string` | `My Values statistics` | The region's name |
| `className`, `ref` | | | On the section |

A segment's `tone` is one of `neutral`, `yellow`, `blue`, `brand`, `critical`.

## As filters

With `onSelectedChange`, the stats filter the table below (Figma's `My Values Page` draws each stat's `State=Selected` and its click; design lead's brief, 20 November 2026):

- **Which stats.** Completed, Draft, Pending, Accepted, Active and Overdue. Total AVs never filters. (The brief's list leaves out Accepted, but Figma's prototype has it pressable, so it is.)
- **A second press clears it.** Pressing the selected stat reports `null`; the page also clears the selection when it resets the filters.
- **A stat whose count is 0 cannot be pressed.** It stays plain text, drawn as Figma's `State=Empty` (the outlined bar). Nothing to filter to.
- **The selected stat** is tinted `surface.brand.faint` (Figma's `#e8eefb`) and nothing else changes. **Deliberately not Figma's bold:** Figma draws Completed's figure 24 bold when selected, but the other stats keep their weight, so the design lead asked for the tint to be the only cue on all of them.
- **The strip only reports which stat. What it lists is the page's.** **Active** is **every custom status between Accepted and Completed**; **Overdue** is by due date (a derived state, not a status); the others are the status of the same name. The `MyValuesFilteredByStat` story on `AVListPage` shows a page doing it.

## It owns one mapping

**A tone → its colour,** once (`stroke.strong`, `accent.yellow.medium`, `accent.blue.medium`, `surface.brand.strong`,
`accent.critical.outline.border.default`). Everything else is the page's: which statuses there are, what they are called, which tone
each wears, and every number. The breakdown is **not** the `AVStatus` vocabulary — Figma's has *Active* (a grouping) and *Overdue* (a
derived state) — so the segments arrive as data and `StatusTag` keeps owning the statuses themselves.

## Layout

**It wraps first, then scrolls.** With room, the profile, the two figures and the breakdown share one row. When the breakdown no
longer fits beside them it **drops to its own line, full width**. The segments share it **in proportion to their counts**, each at
least 100 (when every count is 0 they share the strip equally, so the outlines span the width), so the breakdown alone has a narrowest width (100 a segment). Once it is that narrow and cannot wrap any further,
**the whole strip scrolls sideways** (`overflow-x: auto`).

## Tokens

The card is `surface.elevated` with a `stroke.subtle` outline, `radius.md`, `space.24` all round. Figures: 24 medium (the marked
exception below) in `text.primary`, over their `body-sm-medium` `text.tertiary` labels; the status counts are `body-lg-medium`.
Contrast on the card: `text.primary` **20.17:1** light / **14.63:1** dark; `text.tertiary` **7.58:1** / **9.85:1**.

**Differences from Figma, on purpose.**

- **Draft's grey is `stroke.strong`**, a border token worn as a fill. Figma's is slate-500; `stroke.strong` is slate-500 in light and slate-400 in dark, a quiet mid grey in both. The fill token that matches in light,
  `surface.neutral.strong`, is slate-300 in dark, so Draft (usually the widest segment) would read almost white and outweigh Active and Accepted; `neutral.outline.border` is slate-400 in light, lighter than Figma.

- **Active is `brand` blue** (`surface.brand.strong`), the blue the dashboards' In Progress card uses. Figma draws it `#818cf8` — an
  indigo that is bound to no variable, and the system has no indigo.
- **The avatar is 36** (`lg`, the system's largest); Figma's profile image is 40.
- **"Total AVs"** is the default label; Figma's text reads "Total Avs".
- **24 medium has no step** on the type ramp (`heading-lg` ships bold, semibold and regular), so it is the one marked exception,
  the same as `StatCard`'s and `DomainBudgetSummary`'s. A `heading-lg-medium` in GDL would remove it from all three.

**The divider between the person and the figures is the same line**: 2 thick in `stroke.subtle`, as Figma draws it (the `Divider` atom's own 1 in `stroke.default` read as a different line beside the segments').

**Each segment has a light 2 line down its left** (`stroke.subtle`, 8 from the words), under the bar and beside the count and name, as Figma's status item draws it.

## Accessibility

- A `section` named "My Values statistics". The breakdown is a **list** ("Status breakdown"), one item per status reading its
  count then its name, so the bar's meaning is in the text. The bars are decorative and hidden — colour is never the only signal.
- As filters, each pressable stat is a real `button` with `aria-pressed` (true on the selected one), named by what it shows ("12 Draft"); a stat with a count of 0 is not a button, so it is not a dead tab stop.
- The avatar is decoration (the name is beside it), the green dot likewise.
- A strip that scrolls sideways is **keyboard-focusable while it overflows** (Tab to it, then the arrow keys scroll), and adds no tab stop when it fits.

## Don't

- **Don't filter in the strip.** It reports the key; the page decides what Active, Overdue and the rest list.
- **Don't make an empty stat pressable.** With a count of 0 there is nothing to show; it stays text.
- **Don't compute the totals here.** Pass them in; Total is not the segments' sum.
- **Don't re-derive a status's tone at every call site.** The page maps its statuses to the five tones once.
- **Don't use it for a count that is not a breakdown.** A single figure is a `StatCard`.

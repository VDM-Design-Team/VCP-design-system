# StatusPill *(pattern)*

An Added Value's status, worn as a pill. The first pattern in
`src/patterns/`, and the owner of VCP's status vocabulary — this file and
its `.tsx` are where the status → tone mapping lives, and nowhere else.

## When to use

| Use | For |
|---|---|
| `StatusPill` | Any surface showing an AV's status: tables, cards, detail panels |
| `Badge` | Generic classification with no VCP vocabulary |
| The options dropdown *(pattern, to port)* | **Changing** a status — this pill only shows one |

**The tier rule, demonstrated.** StatusPill is tiny and composes exactly one
component — and it is still a pattern, because `'Ready for hand-off'` means
nothing outside VCP. That is the test from CLAUDE.md, not size.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `status` | `AVStatus` | required | The seven-value union — a typo is a compile error |
| `size` | `sm \| md` | `md` | Badge's sizes; `sm` for the AV table's cells |
| everything else | `BadgeProps` minus `tone`/`icon`/`children` | — | The pill *is* a Badge; the pattern owns what those carried |

`AV_STATUSES` exports the vocabulary in lifecycle order for pickers,
legends and tests.

## The mapping

| Status | Tone | Note |
|---|---|---|
| Draft | `neutral` | |
| In progress | `brand` | |
| Ready for review | `warning` | |
| Ready for hand-off | `info` | **Borrowed.** The export painted this the indigo that has no core ramp — the same indigo `DomainLabel` is waiting on. When that ramp decision lands, hand-off should move onto it; until then it wears the info blue, which sits close to In progress's brand blue |
| Completed | `success` | |
| Blocked | `danger` | |
| Archive | `neutral` | Shares grey with Draft; the label differentiates |

Contrast is Badge's, measured in docs/badge.md — every tone AA in both
themes. The dot rides `currentColor`, so it always matches the label.

**Vocabulary drift worth a design look:** three lists exist in the wild —
this one (from the export's `StatusPill`), the older list quoted in
docs/badge.md (`Accepted`, `For QA`, `Confirmed prod`, …), and the
role/status axes in the Figma annotations (`Default`, `Draft`, `Pending`,
`Backlog`). The export's is what shipped; if the product's real lifecycle
differs, this union is the one place to change.

## Accessibility

- Everything Badge guarantees, inherited: no focus, no events, truncation,
  AA contrast per tone.
- The dot is decorative (`bg-current`, no announcement) — the words are the
  status, so colour never carries it alone.
- **Not clickable, on purpose.** The export offered `interactive`/`onClick`
  on a span; Badge's rule holds — changing status is the options dropdown's
  job (`AV_Options_Dropdown` in docs/figma-annotations.md), which will be its
  own pattern with real menu semantics.

## Don't

- **Don't map statuses to tones anywhere else.** `tone={status === 'Blocked'
  ? 'danger' : …}` at a call site means this file failed; add here instead.
- **Don't extend `AVStatus` casually** — it is product vocabulary; a new
  status is a product decision with a lifecycle position, not a variant.
- **Don't wrap it in an `onClick`** — that control can't be reached by
  keyboard, which is why the pattern refuses to be one.
- **Don't use it for anything but AV status** — urgency is `UrgencyTag`,
  roles are `RoleBadge` (both to port).

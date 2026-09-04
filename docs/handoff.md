# Handoff

Where the design system stands, what is waiting on a person, and what to pick
up next. **Written in roles, not names** — who holds each seat is the
"Current holders" table in [workflow.md](workflow.md), the one place a role
maps to a person.

Last updated **4 September 2026**.

---

## At a glance

| | |
|---|---|
| `main` | `81bab88` — clean, all checks green |
| Open PRs | **0** |
| Open issues | **1** — [#60](https://github.com/VDM-Design-Team/VCP-design-system/issues/60), waiting on the design-system owner |
| Plugin released | **0.1.4** |
| Pieces | 19 atoms · 30 components · 2 patterns · 0 templates |

`npm test` on `main` runs four checks: token lint, composition lint, plugin
version consistency, typecheck.

---

## What shipped on 4 September

Four PRs, in the order they landed.

**[#58](https://github.com/VDM-Design-Team/VCP-design-system/pull/58) — `AVHeader` and `StatusProgression`.**
The page-level header from the Figma `AV_Header` set (back, title, status
buttons), plus the buttons themselves. `StatusProgression` is a **component**,
not a pattern: one atom used twice, presenting as one control unit. It owns
status → transitions the way `StatusPill` owns status → tone, and every button
label is the design's own wording rather than generated from a status name.

**[#59](https://github.com/VDM-Design-Team/VCP-design-system/pull/59) — the six lifecycle states got tags.**
The audit found six states the progression moves an AV through that
`Status_Tag_General` had no tag for — an AV in `For QA` could not be labelled.
`AVStatus` went from eleven values to seventeen, reusing existing tones (gates
warning, work info, verified success) so the tag set's visual language did not
change. The structural half matters more: `AVProgressionStatus` is now
`Extract<AVStatus, …>`, so **a lifecycle state with no tag is a compile
error.**

**[#61](https://github.com/VDM-Design-Team/VCP-design-system/pull/61) — the morning brief sees issues.**
The `vcp-morning` skill was entirely PR-shaped; every query was `is:pr`. Issue
#60 would never have reached its reader. "Waiting on them" now leads with
issues assigned to or mentioning them, and **issues ignore the time window** —
a PR from last month has moved on, a question from last month has not.

**[#62](https://github.com/VDM-Design-Team/VCP-design-system/pull/62) — the brief announces its own updates.**
Nothing updates an installed plugin on its own, so a release only reached
people if someone remembered to say so. The brief now reads the plugin
manifest on `main` and says one line when a newer version exists. The version
is stated in two places by necessity, so `lint:plugin-version` joins
`npm test` and fails a half-done bump.

---

## Waiting on a person

**1. The design-system owner has one question open — [issue #60](https://github.com/VDM-Design-Team/VCP-design-system/issues/60).**
Seven Figma progression variants carry placeholder layer names (`Status4`,
`Status8`, `Deploy`, `Review`, `Review (completed 1)`). They draw real buttons
but there is no way to know which status each represents, so they are not
modelled — which is why the **`initiator` role offers moves on `Draft` only**.

Five of the seven draw Reject · Accept, which *suggests* they are all `Pending`
seen by different roles. That is a guess and was deliberately not written into
a public type. Confirming it unblocks the role in a minor bump.

**2. One plugin release still needs announcing by hand.** The self-update
notice cannot announce the version that introduces it. Everyone on the team
needs this once:

```bash
claude plugin update vcp-design-system@vcp
```

Then restart Claude and start a fresh conversation. From 0.1.4 onward the
brief announces its own releases.

**3. From an earlier handoff, never actioned:** onboarding messages for the
two designers who have not had them. The lead specifically wanted the
design-system owner to hear about the owner seat directly, not via a tool.
The plugin-update nudge above is a natural moment to fold that in.

---

## Loose ends in the code

**Dead constant in `StatusProgression`.** `rejectSoft` (an outlined Reject) is
declared and never used — it exists for the placeholder variants that #60 will
name, three of which draw an *outlined* Reject rather than the red one. It
compiles because `noUnusedLocals` is off, so nothing catches it. Either delete
it and reintroduce it when #60 is answered, or add a one-line comment saying
what it is waiting for. It is currently neither, which is the worst of the
three.

**`docs/inventory.md` is the worklist.** It records tier, shipped-in PR, and
dependency notes for everything still to port. Read it before picking work.

---

## Standing debt — Figma is behind the repo

The repo is the source of truth ([CLAUDE.md](../CLAUDE.md)); these are the
places the design file has not caught up. Full detail in
[figma-audit.md](figma-audit.md).

| What | Detail |
|---|---|
| **Six status tags missing** | `For Review`, `Design Review`, `For QA`, `In QA`, `Ready for Deploy`, `Confirmed Prod` exist in `StatusPill` and not in `Status_Tag_General` |
| **Seven unnamed variants** | Issue #60 above |
| **Tokens not in Figma** | `surface.track`, `text.logo`, `text.logo-accent`, `color.brand.navy`, `shape.radius.xs`, and the dark `stroke.focused` fix |
| **AV table uses raw colours** | The deadline cells draw `#5291f7`, `#eab308`, `#ef4444`, `#64748b` — stock Tailwind values in no VCP ramp. **Rebind these before the AV-table pattern is built**, or the pattern inherits colours the token layer cannot express |
| **Two typos** | Three Design sets spell it "In Prog**e**ss"; one admin label has a double space |
| **No radius variables** | Values sit raw on components; the repo inferred 6 for controls, 4 for cells inside them |

---

## What to build next

**Unblocked and worth doing first:**

- **`Sidebar`** — the last thing between here and `AppShell`, which needs only
  `Sidebar` now that both headers have shipped. This is the highest-leverage
  piece left: it is the only blocker on the first template.
- **The four table patterns** — `PlanningTable`, `BudgetTable`, `HolidayTable`,
  `AvailabilityGrid`. `DataTable` shipped; specialise it rather than copying
  it. ⚠️ Audit the AV-table colours above **before** starting these.
- **`CommentItem` / `CommentComposer`** — every component they need has
  shipped (`EmojiReactionPicker`, `RichTextToolbar`, `AvatarGroup`).

**Blocked, and on what:**

| Piece | Blocked on |
|---|---|
| `AppShell` | `Sidebar` |
| `DomainSelector` | `DomainLabel`, which needs an indigo and a pink with **no core ramp** — a token decision, not a build task |
| `initiator` progression moves | Issue #60 |

**Flagged in the audit but never scheduled:** `DatePicker`'s Month, dual-view,
footer-button and mobile variants; `RichTextToolbar`'s Full-Featured vs
Inline-Editor compositions; `FileAttachment`'s card size (93 × 69 is off the
4px grid — needs a design call).

---

## Picking this up

1. `/latest` — fresh `main`, Storybook running.
2. Read [inventory.md](inventory.md) for the worklist and dependency notes,
   and [figma-audit.md](figma-audit.md) before touching anything the audit
   flagged.
3. One branch per task, draft PR early, and the changed-file list confirmed
   against the task's scope before committing — [workflow.md](workflow.md) has
   the full version.

**Keep this file current.** A handoff that describes last week is worse than
none, because it is believed.

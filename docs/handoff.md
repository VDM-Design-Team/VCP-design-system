# Handoff

Where the design system stands, what is waiting on a person, and what to pick
up next. **Written in roles, not names** — who holds each seat is the
"Current holders" table in [workflow.md](workflow.md), the one place a role
maps to a person.

Last updated **7 September 2026**.

---

## At a glance

| | |
|---|---|
| `main` | `066d4eb` — clean, all checks green |
| Open PRs | **2** — [#63](https://github.com/VDM-Design-Team/VCP-design-system/pull/63) (this file) and [#64](https://github.com/VDM-Design-Team/VCP-design-system/pull/64), both the engineering owner's |
| Open issues | **2** — [#68](https://github.com/VDM-Design-Team/VCP-design-system/issues/68) (the big one) and [#60](https://github.com/VDM-Design-Team/VCP-design-system/issues/60) (two variants left) |
| Plugin released | **0.1.4** — 0.1.5 waiting in #64 |
| Pieces | 19 atoms · 30 components · 2 patterns · 0 templates |

`npm test` on `main` runs four checks: token lint, composition lint, plugin
version consistency, typecheck.

---

## What shipped on 7 September

Three PRs from the design-system owner, all reviewed and merged together.

**[#65](https://github.com/VDM-Design-Team/VCP-design-system/pull/65) — the token gallery got its missing half.**
`radius.*` and `shadow.*` were defined in `tokens/semantic/shape.json` and
surfaced nowhere in Storybook; there is now a `Shape` story. The `Colors`
groups were reordered to Surface, Text, Action, Stroke, Accent, Core, and a
custom `docs.page` stops the opening heading rendering twice.

**[#66](https://github.com/VDM-Design-Team/VCP-design-system/pull/66) — `teal-legacy` is gone.**
Design confirmed teal is not a brand colour, the same call already made for
pink. The ramp is deleted and the Figma importer no longer maps `secondary`
onto it, so a fresh export cannot bring it back. No semantic token or component
referenced it. Verified on the published `main` build after merge: zero
mentions of teal, all eight remaining ramps intact.

**[#67](https://github.com/VDM-Design-Team/VCP-design-system/pull/67) — `docs/color-tokens.md`.**
Role-based guidance for choosing a semantic colour token, referenced from both
`Foundations/Tokens` and `CLAUDE.md` rather than pasted into each. Written
against the real token tree rather than copied from the supplied draft — the
"Neutral" section was rewritten, because VCP has no `neutral.*` family shaped
like `action.*`.

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

**1. The status model itself is the open question — [issue #68](https://github.com/VDM-Design-Team/VCP-design-system/issues/68).**
The flow board shows a section named **Custom Statuses** between `Accepted` and
`Completed`, holding one chain per domain: Design has two steps, Development
has six. Content, Partners and Governance exist and Product is coming, and a
domain can add its own steps with its own names.

`AVStatus` cannot survive that as a closed union. Ten of its seventeen values
are spine — fixed, and the application branches on them. The other seven are
domain chain steps, and they are the ones that get renamed. `In Progress`
already appears in *both* chains on the board, which under a flat union reads
as one shared status when it is really two domains picking the same word.

The consequence lands on this repo: `StatusPill` owns a
`Record<AVStatus, Treatment>` keyed by status **name**, and a lookup keyed by
an editable label breaks silently the moment someone edits the label.
`StatusProgression` has the same problem in its `Steps` type. The proposal is
to split along fixed-versus-configurable rather than by domain — a closed union
for the spine, domain steps as data carrying their own tone. **That is a major
bump to a shipped component**, worth doing before the four table patterns are
built on top of it.

Two questions in #68 decide the build, and neither is engineering's to answer:
who configures a custom step and when, and whether a domain picks a colour or
picks from a fixed set of intents.

**2. Two progression variants still have no name — [issue #60](https://github.com/VDM-Design-Team/VCP-design-system/issues/60).**
Five of the original seven were answered on 4 September: all map to `Review`,
and one empty variant is being deleted. Development/Admin `Deploy` and `Review`
are still open — the design-system owner is checking them with the engineering
owner. They remain the only thing holding the **`initiator` role to `Draft`
moves only**.

**3. One plugin release still needs announcing by hand.** The self-update
notice cannot announce the version that introduces it. Everyone on the team
needs this once:

```bash
claude plugin update vcp-design-system@vcp
```

Then restart Claude and start a fresh conversation. From 0.1.4 onward the
brief announces its own releases.

**4. From an earlier handoff, never actioned:** onboarding messages for the
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

**Token changes skip visual review.** Chromatic reported "no story, component,
or token files" on #66 and never built it — but #66 changed
`tokens/core/color.json`, which is exactly a token file. TurboSnap does not
trace token files to the stories that render them, so **no token PR gets a
visual diff**. It built fine on `main` after merge, which is how the teal
removal was verified at all. This is a hole in the review net for every future
token change, not a one-off.

**`preview/out.css` carries 1,701 lines of churn** from #66. The file is
generated by `npm run preview` and tracked in git; the teal removal should have
shrunk it. Regenerable, so noise rather than damage, but it is noise in the
history.

**`docs/inventory.md` is the worklist.** It records tier, shipped-in PR, and
dependency notes for everything still to port. Read it before picking work.

---

## Standing debt — Figma is behind the repo

The repo is the source of truth ([CLAUDE.md](../CLAUDE.md)); these are the
places the design file has not caught up. Full detail in
[figma-audit.md](figma-audit.md).

| What | Detail |
|---|---|
| **Where the six lifecycle tags belong** | Superseded by #68 — design wants them split out of `Status_Tag_General`, and the deeper question is whether per-domain tag sets scale to six domains at all |
| **Two unnamed variants** | Issue #60 above; five of the original seven are answered |
| **Tokens not in Figma** | `surface.track`, `text.logo`, `text.logo-accent`, `color.brand.navy`, `shape.radius.xs`, and the dark `stroke.focused` fix |
| **AV table uses raw colours** | The deadline cells draw `#5291f7`, `#eab308`, `#ef4444`, `#64748b` — stock Tailwind values in no VCP ramp. **Rebind these before the AV-table pattern is built**, or the pattern inherits colours the token layer cannot express |
| **One typo left** | The board's Development chain reads "F**o** Review". The earlier two — "In Prog**e**ss" and a double-spaced admin label — were fixed in Figma on 4 September; the repo always spelled both correctly |
| **No radius variables** | Values sit raw on components; the repo inferred 6 for controls, 4 for cells inside them |

---

## What to build next

**Unblocked and worth doing first:**

- **`Sidebar`** — the last thing between here and `AppShell`, which needs only
  `Sidebar` now that both headers have shipped. This is the highest-leverage
  piece left: it is the only blocker on the first template.
- **The four table patterns** — `PlanningTable`, `BudgetTable`, `HolidayTable`,
  `AvailabilityGrid`. `DataTable` shipped; specialise it rather than copying
  it. ⚠️ Audit the AV-table colours above **before** starting these, and if any
  of them renders a status, wait for #68 — they would inherit a model that is
  about to change.
- **`CommentItem` / `CommentComposer`** — every component they need has
  shipped (`EmojiReactionPicker`, `RichTextToolbar`, `AvatarGroup`).

**Blocked, and on what:**

| Piece | Blocked on |
|---|---|
| `AppShell` | `Sidebar` |
| `DomainSelector` | `DomainLabel`, which needs an indigo and a pink with **no core ramp** — a token decision, not a build task |
| `initiator` progression moves | Issue #60 — the last two variants |
| Anything extending `AVStatus` or the progression model | Issue #68 — the vocabulary may stop being a closed union |

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

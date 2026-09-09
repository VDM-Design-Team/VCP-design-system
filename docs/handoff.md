# Handoff

Where the design system stands, what is waiting on a person, and what to pick
up next. **Written in roles, not names** — who holds each seat is the
"Current holders" table in [workflow.md](workflow.md), the one place a role
maps to a person.

Last updated **9 September 2026**.

---

## At a glance

**These four rows link rather than state.** Every one of them changes on the
next merge — including the merge that lands an edit to this file, which is how
the previous version managed to be wrong about itself ninety seconds after it
landed. A link is still true tomorrow; a number is a claim with a shelf life.
If you are tempted to paste today's values in, don't: the prose below is where
dated facts belong.

| | |
|---|---|
| `main` | [latest commit and its checks](https://github.com/VDM-Design-Team/VCP-design-system/commits/main) |
| Open PRs | [all open](https://github.com/VDM-Design-Team/VCP-design-system/pulls) · [waiting on your review](https://github.com/VDM-Design-Team/VCP-design-system/pulls?q=is%3Apr+is%3Aopen+review-requested%3A%40me) |
| Open issues | [all open](https://github.com/VDM-Design-Team/VCP-design-system/issues) · [assigned to you](https://github.com/VDM-Design-Team/VCP-design-system/issues?q=is%3Aissue+is%3Aopen+assignee%3A%40me) |
| Plugin released | [`version` in the manifest on `main`](https://github.com/VDM-Design-Team/VCP-design-system/blob/main/plugin/.claude-plugin/plugin.json) |
| Published Storybook | [always the current `main`](https://main--685158a98c4fedbbec7ac708.chromatic.com) |

**Pieces, as of 9 September:** 20 atoms · 32 components · 3 patterns ·
0 templates. This one is a number because it is the shape of the system rather
than its churn, and it only moves when something ships —
[inventory.md](inventory.md) has the per-piece detail either way.

`npm test` on `main` runs four checks: token lint, composition lint, plugin
version consistency, typecheck.

---

## What shipped on 8 September

A long day, all of it on two threads: finishing the status model, and building
`Sidebar`.

**The status vocabulary opened up** — [#71](https://github.com/VDM-Design-Team/VCP-design-system/pull/71),
[#72](https://github.com/VDM-Design-Team/VCP-design-system/pull/72),
[#74](https://github.com/VDM-Design-Team/VCP-design-system/pull/74).
`AVStatus` is the ten-status spine; a domain's own steps arrive as data through
`custom` and share one treatment. `StatusProgression` takes the domain's
`chain` and derives its moves from position in it, so `AVWorkflow` is gone and
a new domain costs no code. `Review` gained two treatments — a label for a
user, the filled button style for someone who can act — and `Completed` /
`Final Completed` became two statuses rather than one plus a boolean.

**#73 came from the design-system owner**, naming the last of issue #60's seven
variants: `Review` gets Reject/Accept for initiator and admin, and `Deploy` is
an admin action rather than a status. Merged after resolving a one-line
conflict against #72.

**`Sidebar` shipped** — [#76](https://github.com/VDM-Design-Team/VCP-design-system/pull/76)
(`SidebarItem`), [#77](https://github.com/VDM-Design-Team/VCP-design-system/pull/77)
(eight nav glyphs), [#78](https://github.com/VDM-Design-Team/VCP-design-system/pull/78)
(the rail). Four user types including `Admin Dev`, expandable `Archive` and
`Planning`, collapsed rail at 76 with tooltips and `aria-label` on every row.

**`Footer` and `PageTitle` shipped** — [#82](https://github.com/VDM-Design-Team/VCP-design-system/pull/82),
merged at the end of the day. They are the last two pieces `AppShell` needs,
so nothing blocks the first template now. The PR carried two design questions
that outlive it; they are under "Waiting on a person" below.

**Two fixes worth knowing about.** [#81](https://github.com/VDM-Design-Team/VCP-design-system/pull/81)
tightened the logo's viewBoxes to the artwork's own bounds — both were the
padded frames Figma exported, so sizing by height rendered the logo up to 6%
small. And the TurboSnap fix from #70 was finally *proved*: a throwaway probe
made Chromatic log `TurboSnap disabled due to matching --externals` and
snapshot everything, where the same class of change on #66 was skipped unseen.

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

**1. One PR is open — [#84](https://github.com/VDM-Design-Team/VCP-design-system/pull/84).**
It stops tracking `preview/out.css`, the generated stylesheet that carried
1,701 lines of churn into #66. The file is build output from `npm run preview`
and is now ignored the way `dist/` is. No component, token or doc changes;
it wants a look and a merge.

**2. Two questions for the design-system owner, carried out of #82.** They
were recorded there because guessing has cost a rebuild twice this week, and
`AppShell` will bake in whichever answer it assumes:

- **Are `AV_Header` and `Page_Title` the same component?** `Page_Title` carries
  a *hidden* `Status_Progression` instance, which is exactly what `AVHeader`
  renders. If they are one thing, `AVHeader` becomes `PageTitle` plus the
  buttons — and one of their two paddings is wrong, because `AV_Header` insets
  16 where `Page_Title` insets 32.
- **Is the top bar 60 or 64?** Ours is 64, measured from the library. The
  pages file's `Top_NavBar` is 60.

**3. Figma is behind the repo in six places — [issue #80](https://github.com/VDM-Design-Team/VCP-design-system/issues/80).**
Consolidated from three closed issues and two docs, with specs rather than
complaints, and assigned to the design-system owner.

⚠️ **One item has a deadline.** The AV table draws `#5291f7`, `#eab308`,
`#ef4444`, `#64748b` — stock Tailwind values in no VCP ramp. **Rebind before
the AV-table pattern is built**, or the pattern inherits colours the token
layer cannot express and undoing it later means touching every table.

**4. The plugin release still needs announcing by hand.** The self-update
notice cannot announce the version that introduces it. Everyone needs this
once:

```bash
claude plugin update vcp-design-system@vcp
```

Then restart Claude and start a fresh conversation. The engineering owner's
call (8 Sep) was to hold until more changes accumulate rather than nag twice.

**5. From an earlier handoff, never actioned:** onboarding messages for the
two designers who have not had them. The lead specifically wanted the
design-system owner to hear about the owner seat directly, not via a tool.
The plugin-update nudge above is a natural moment to fold that in.

---

## Loose ends in the code

**The Claude Design export cannot be trusted, and the repo now says so in
several places.** It invented seven statuses, a `Review No Action` state, a
count badge on `SidebarItem`, a footer CTA, a domain selector in the rail, and
three roles where the design has four. Every piece it describes needs auditing
against Figma *before* it is ported — `docs/figma-audit.md` says this, and the
two times it was skipped this week both ended in a rebuild.

**`docs/inventory.md` is the worklist.** It records tier, shipped-in PR, and
dependency notes for everything still to port. Read it before picking work.

### Closed this week, recorded so nobody re-derives them

- `rejectSoft` came back in #73, which is what it was waiting for.
- Token changes skip visual review — **fixed in #70 and proved on 8 Sep**. A
  probe made Chromatic log `TurboSnap disabled due to matching --externals`
  and snapshot everything.

---

## Standing debt — Figma is behind the repo

The repo is the source of truth ([CLAUDE.md](../CLAUDE.md)); these are the
places the design file has not caught up.

**All of it now lives in [issue #80](https://github.com/VDM-Design-Team/VCP-design-system/issues/80)**,
with specs and an owner, rather than scattered across this file and the audit —
which is why none of it ever got done. Full background stays in
[figma-audit.md](figma-audit.md).

The six: status tags behind #71/#72/#74, the sidebar's Heroicons instances,
`Design review` casing and a "F**o** Review" typo, six tokens Figma lacks,
unbound radii, and — the one with a deadline — the AV table's raw colours.

---

## What to build next

**`AppShell` — the design system's first template, and the next thing to
build.** `TopBar`, `AVHeader`, `Sidebar`, `Footer` and `PageTitle` have all
shipped; nothing blocks it except the two design questions above, and the
build should state which answer it assumed. The audit is already done, in
`docs/figma-audit.md` batch 3 and in #82's description:

```
Page_Template  1920 × 1027
├── VCP_SideBar    256 wide, FULL height
└── Main Section   from x=256
    ├── Top_NavBar   60 tall
    └── Content ......................... slot
        ├── Page_Title   75 tall
        ├── padded body  32 horizontal ... slot
        └── Footer       72 tall
```

Both `Content`s are Figma **slots**, so the design already models this as a
shell with a hole — which is `children`. Leave the export's fixed 390px detail
column out until a page actually draws one; no page in the pages file does.

**Then the page's contents**, none of which exist yet: `My_AVs_Stats`,
`Filter_Bar`, `AV_Table`. ⚠️ `AV_Table` is the one that needs the raw-colour
rebind in #80 settled first.

**Also unblocked:**

- **The four table patterns** — `PlanningTable`, `BudgetTable`, `HolidayTable`,
  `AvailabilityGrid`. `DataTable` shipped; specialise it rather than copying it.
- **`CommentItem` / `CommentComposer`** — every component they need has
  shipped (`EmojiReactionPicker`, `RichTextToolbar`, `AvatarGroup`).

**Blocked, and on what:**

| Piece | Blocked on |
|---|---|
| `DomainSelector` | `DomainLabel`, which needs an indigo and a pink with **no core ramp** — a token decision, not a build task |
| `AV_Table` and anything drawing deadline cells | The raw colours in #80 |
| The rail's domain switcher | `_Domain_Selection_Dropdown` is unported; `Sidebar` renders a `Select` as a placeholder |

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
4. **Audit before you port.** If the piece exists in `_source/claude-design/`,
   read the Figma first — `download_assets` returns the real geometry *with the
   layer names attached*, which is how "Assigned" turned out to be a VCP
   original rather than an icon to search for. The export is a sketch of
   intent, not a specification, and skipping this step cost a rebuild twice
   this week.

**Keep this file current.** A handoff that describes last week is worse than
none, because it is believed.

# Handoff

Where the design system stands, what is waiting on a person, and what to pick
up next. **Written in roles, not names** — who holds each seat is the
"Current holders" table in [workflow.md](workflow.md), the one place a role
maps to a person.

Last updated **3 November 2026**. The sections from 9–11 September below are
kept as history; start with "What happened on 3 November".

---

## At a glance

**These rows link rather than state.** Every one of them changes on the
next merge — including the merge that lands an edit to this file, which is how
an earlier version managed to be wrong about itself ninety seconds after it
landed. A link is still true tomorrow; a number is a claim with a shelf life.
If you are tempted to paste today's values in, don't: the prose below is where
dated facts belong.

| | |
|---|---|
| `main` | [latest commit and its checks](https://github.com/VDM-Design-Team/VCP-design-system/commits/main) |
| Open PRs | [all open](https://github.com/VDM-Design-Team/VCP-design-system/pulls) · [waiting on your review](https://github.com/VDM-Design-Team/VCP-design-system/pulls?q=is%3Apr+is%3Aopen+review-requested%3A%40me) |
| Open issues | [all open](https://github.com/VDM-Design-Team/VCP-design-system/issues) · [assigned to you](https://github.com/VDM-Design-Team/VCP-design-system/issues?q=is%3Aissue+is%3Aopen+assignee%3A%40me) |
| Plugin released | [`version` in the manifest on `main`](https://github.com/VDM-Design-Team/VCP-design-system/blob/main/plugin/.claude-plugin/plugin.json) |
| Published Storybook | [always the current `main`](https://main--6aba746352fe3d50eea0cdab.chromatic.com) |

| Published package | [`@vdm-design-team/vcp-design-system` on GitHub Packages](https://github.com/orgs/VDM-Design-Team/packages/npm/package/vcp-design-system) |
| Shared prototype | [VCP-prototype repo](https://github.com/VDM-Design-Team/VCP-prototype) · [the site](https://vcp-prototype.pages.dev) (team login) |

**Pieces:** [inventory.md](inventory.md) has the per-piece detail. The
11 September count (20 · 33 · 10 · 1) is long out of date.

**`npm test`** runs every check CI runs; the "Automated checks" table in
[workflow.md](workflow.md) lists them, and the `npm test` row of
[CLAUDE.md](../CLAUDE.md) names them in one line.

---

## What happened on 3 November

**The design system is a package now, and 0.1.0 is published.**
[#202](https://github.com/VDM-Design-Team/VCP-design-system/pull/202) made it
publishable (tsup build, a `"use client"` bundle, a Tailwind-free
`theme.css`). [#245](https://github.com/VDM-Design-Team/VCP-design-system/pull/245)
exported the three pieces #202 missed (`InlineEdit`, `RejectionReason`,
`StatusProgression`) and stopped stories and team-process docs shipping.
[#246](https://github.com/VDM-Design-Team/VCP-design-system/pull/246) was the
release: `npm run changelog` folded 86 entries into `CHANGELOG.md` as 0.1.0.
It also fixed `scripts/changelog.mjs`, which sorted any entry first written
during a merge to the top; each entry is now dated by the oldest commit that
touches it. A fresh install, a server render, the Tailwind theme compile and a
type check all passed on the published package.

- **The package is private, on purpose.** It inherits access from this repo,
  so installing it needs repo access plus a GitHub token with
  `read:packages`. The README's "For engineering" section has the steps.
  Making it public can't be undone.
- **Publishing stays manual.** From a clean, freshly pulled `main`: a release
  PR with `npm run changelog`, then `npm run build` and `npm publish`. Publishing
  needs a token with `write:packages`; the engineering owner's `gh` login has it
  (`npm publish --//npm.pkg.github.com/:_authToken="$(gh auth token)"`).
- **The README's token names were wrong**, and an app following them got no
  styling: `text-content-*`, `border-line-*` and `p-md` produce nothing. Fixed in
  [#247](https://github.com/VDM-Design-Team/VCP-design-system/pull/247)
  (`text-text-*`, `border-stroke-*`, Tailwind's numeric spacing).

**`AppShell` has a Playground story** —
[#251](https://github.com/VDM-Design-Team/VCP-design-system/pull/251): twenty
controls that switch each piece of the shell (rail variant and state, top-bar
parts, title band, theme). Documented in [app-shell.md](app-shell.md).

**The dev-team contributor has read access** to this repo: they can comment,
review and request changes, but not push. That is deliberate.

**There is a shared clickable prototype: VCP Prototype.** Screens are designed
in their own private repo,
[VDM-Design-Team/VCP-prototype](https://github.com/VDM-Design-Team/VCP-prototype),
not in Storybook. Storybook stays the catalogue of pieces; the prototype is
where they become screens.

- **What it is:** Next.js 16 (`output: "export"`, a static site) built only
  from the published package, pinned at `0.1.0`. One route per rail row: the
  Dashboard (`/`) and Drafts (its empty state) are built; My Values, Assigned and Task Log are
  "Not designed yet" placeholders. Its `CLAUDE.md` holds the rules: build only
  from the package, a missing piece is a PR here rather than a local component,
  and real token names only.
- **Hosting:** Cloudflare Pages (project `vcp-prototype`, free). CI lints,
  builds and deploys on every push: `main` goes to
  [vcp-prototype.pages.dev](https://vcp-prototype.pages.dev), and every other
  branch gets its own preview link in the run's summary. CI reads the package
  through the package's **Manage Actions access**, where VCP-prototype has
  Read. It deploys with two repo secrets, `CLOUDFLARE_API_TOKEN` (the
  "VCP Prototype" token, Pages Edit) and `CLOUDFLARE_ACCOUNT_ID`. Without the
  token, CI just builds.
- **Who can open it:** Cloudflare Access (Zero Trust, free up to 50 users)
  guards both the production address and every preview. The policy
  **"Team email domains"** allows any `@vdm.technology` or
  `@creativextechlabsinc.com` email, which signs in with a one-time code.
  To add one person: Zero Trust → Access controls → Applications →
  *vcp-prototype – Cloudflare Pages* → Edit → Policies → that policy → add an
  **Emails** rule → save the policy, then the app.
- **Why not GitHub Pages:** on the org's free plan, Pages only serves public
  repos, and only Enterprise Cloud can put a Pages site behind a login.

---

## The biggest change this week: stories are tests

Since [#90](https://github.com/VDM-Design-Team/VCP-design-system/pull/90), the
Storybook Vitest addon runs **every story in a real Chromium** on every PR and
on `npm test`. Three consequences worth knowing before you touch anything:

1. **You need a browser once.** `npx playwright install chromium`, or
   `npm test` fails on the browser step with nothing else wrong.
2. **A story that renders nothing tests nothing.** `Modal`'s seven stories all
   started closed, so Chromatic had been diffing a *button* since the component
   shipped and axe had never seen a dialog — every focus-contract claim in its
   doc was unverified. Fixed in
   [#96](https://github.com/VDM-Design-Team/VCP-design-system/pull/96). The
   same blindness probably affects `EmojiReactionPicker`, whose palette never
   renders, and `DatePicker`'s popover story.
3. **The accessibility check fails the build.** It had been declared but
   unenforced; switching it on found 22 stories in breach, ten of them real.
   Fixed in [#92](https://github.com/VDM-Design-Team/VCP-design-system/pull/92).

The backlog of pieces that still need behaviour tests is
[issue #94](https://github.com/VDM-Design-Team/VCP-design-system/issues/94) —
35 boxes left, ordered.

---

## What shipped on 11 September

A long day on the AV modals and the four things they needed first.

**All seven AV modals are built.** `ConfirmDeleteAVModal`,
`ReportProblemModal` and `AcceptPendingAVModal`
([#99](https://github.com/VDM-Design-Team/VCP-design-system/pull/99),
[#104](https://github.com/VDM-Design-Team/VCP-design-system/pull/104)), then
`HandoffAVModal` ([#106](https://github.com/VDM-Design-Team/VCP-design-system/pull/106)),
`RejectPendingAVModal` ([#107](https://github.com/VDM-Design-Team/VCP-design-system/pull/107)),
`ReviewAVModal` ([#109](https://github.com/VDM-Design-Team/VCP-design-system/pull/109))
and `ChangeLogModal` ([#110](https://github.com/VDM-Design-Team/VCP-design-system/pull/110)).

The survey of all seven is `docs/figma-audit.md` **batch 4**. **None of them
was in the inventory**, and none is in the Claude Design export — nothing in
this repo knew they existed until the audit.

**Four prerequisites, each found by the audit and each fixed before the modal
that needed it:**

- [#100](https://github.com/VDM-Design-Team/VCP-design-system/pull/100) —
  `Modal` accepts `aria-labelledby`, so a dialog that renders its own heading
  can point at it instead of repeating the string.
- [#101](https://github.com/VDM-Design-Team/VCP-design-system/pull/101) — a
  `neutral` button, grey-outlined, for the Cancel beside a destructive answer.
  It needed the `neutral.outline.*` tokens, which are imported name-for-name.
- [#102](https://github.com/VDM-Design-Team/VCP-design-system/pull/102) —
  `RejectionReason`, built **once** for the two modals that both need it with
  different reason sets.
- [#108](https://github.com/VDM-Design-Team/VCP-design-system/pull/108) — **a
  dialog can open a dialog.** `ReviewAVModal` draws a rejection dialog over
  itself, and two `Modal`s open at once did not work: Escape closed the *outer*
  one and left the inner orphaned, and Tab died. Measured before fixing, and
  the `NestedDialog` story is the regression test.

**`Carousel` is new** — a component, not an atom, because the composition lint
fails any atom that imports another piece except `Icon`. It does not render its
own dots: `ChangeLogModal` puts them below its footer buttons, which a
self-contained carousel could not have drawn, so it is controlled and the
caller places `PaginationDots`. It wraps at both ends and **never
auto-advances**. It is in the VCP Figma too, on the Pagination page.

**`Card` is gone** — [#98](https://github.com/VDM-Design-Team/VCP-design-system/pull/98),
the lead's call, on the grounds that it was doing the same job as `Modal`.
There is no drop-in replacement and the changelog says so, carrying the markup
it used to render so a call site can paste it.

**`Modal` got three fixes**: its stories render the dialog
([#96](https://github.com/VDM-Design-Team/VCP-design-system/pull/96)), its
footer lost its tint and divider and gained symmetric padding (same PR), and
its close button is neutral rather than brand blue
([#97](https://github.com/VDM-Design-Team/VCP-design-system/pull/97)).

**`Toggle` got the saving states** —
[#95](https://github.com/VDM-Design-Team/VCP-design-system/pull/95) — and with
them the contract is written down once, in
[saving-states.md](saving-states.md), with a shared `SavingStatus` type and a
`useFakeSave` story helper.

---

## What shipped on 10 September

**Stories became tests** — see the section above.
[#90](https://github.com/VDM-Design-Team/VCP-design-system/pull/90) added the
runner, [#92](https://github.com/VDM-Design-Team/VCP-design-system/pull/92)
fixed the 22 findings it surfaced and made the check fail the build.

Two of those findings were visible to users: `SidebarItem`'s selected row named
a `text.brand` token **that does not exist**, so the label inherited black —
2.32:1 on the dark tint. And `Dropzone`'s "Choose files" kept link blue on the
error tint at 4.11:1. A scan of all 480 colour utilities found no other class
naming a missing token.

**`SegmentedControl` got the saving states** —
[#93](https://github.com/VDM-Design-Team/VCP-design-system/pull/93) — the
repo's first interaction tests.

**The visual-review comment lands on the pieces a PR touches** —
[#91](https://github.com/VDM-Design-Team/VCP-design-system/pull/91). It used to
open Storybook at the front page, which reads as a broken link.

---

## What shipped on 9 September

**`AppShell`, the first template** —
[#85](https://github.com/VDM-Design-Team/VCP-design-system/pull/85). The rail
full-height down the left, the bar across the top of what remains, the title
band and body beneath, the copyright line at the end. The rail, bar and title
band are **slots**, so each piece keeps its own API and the shell owns only the
geometry. It takes no side on either open design question.

**`Final Completed` is gone** —
[#86](https://github.com/VDM-Design-Team/VCP-design-system/pull/86). Design
ruled there is one `Completed` tag and it is green, so the 8 September split is
reverted: `AVStatus` is ten values, `pendingDeploy` is back.

Also: `preview/out.css` is untracked
([#84](https://github.com/VDM-Design-Team/VCP-design-system/pull/84)), the
Figma write tool is allowed for the team
([#87](https://github.com/VDM-Design-Team/VCP-design-system/pull/87)), and the
sidebar icon swap is recorded
([#88](https://github.com/VDM-Design-Team/VCP-design-system/pull/88)).

---

## Waiting on a person

**1. Five Accept-modal field molecules are assembled into nothing.** The
Figma page for the accept dialog carries `_Accept_Modal_Fields` with five
types — Due Date, Worked out thoroughly, Pre-consultation of domains
involved, Impact of the Added Value, Development Points. **A search of every
page in the file finds zero instances of any of them.** Drawn, wired to
nothing, exactly like the `Status` sidebar preset was.

They are deliberately not ported. Either the dialog is meant to collect them
and was never finished, or they belong to a form elsewhere on the AV page.
**This is the difference between a dialog with one decision and one with
six**, so it is not a guess worth making.

**2. `Review_Already_Reviewed_Popup` is drawn and used nowhere.** A small
"Already Reviewed" dialog with one Close button, with **zero instances
anywhere in the file** — the third such molecule in batch 4. Not ported,
because guessing what triggers it is guessing at a flow.

**3. Two questions still carried from [#82](https://github.com/VDM-Design-Team/VCP-design-system/pull/82).**
`AppShell` shipped without answering them, deliberately — it takes no side — so
they are no longer blocking, but they are still unanswered:

- **Are `AV_Header` and `Page_Title` the same component?** `Page_Title` carries
  a *hidden* `Status_Progression` instance, which is what `AVHeader` renders.
  If they are one thing, `AVHeader` becomes `PageTitle` plus the buttons — and
  one of their two paddings is wrong, because `AV_Header` insets 16 where
  `Page_Title` insets 32.
- **Is the top bar 60 or 64?** Ours is 64, measured from the library. The pages
  file's `Top_NavBar` is 60. The shell adds no height of its own, so whichever
  way this goes, it changes `TopBar` alone.

**4. The AV table's raw colours — the last live item in [issue #80](https://github.com/VDM-Design-Team/VCP-design-system/issues/80).**
The table draws `#5291f7`, `#eab308`, `#ef4444`, `#64748b`: stock Tailwind
values in no VCP ramp at all. **Rebind before the AV-table pattern is
built**, or the pattern inherits colours the token layer cannot express, and
undoing it later means touching every table. The design-system owner kept this one.

Most of #80 is now done — see Standing debt below.

**5. The plugin release still needs announcing by hand.** The self-update
notice cannot announce the version that introduces it. Everyone needs this
once:

```bash
claude plugin update vcp-design-system@vcp
```

Then restart Claude and start a fresh conversation. The engineering owner's
call on 8 September was to hold until more changes accumulate. **A great deal
has now accumulated** — story tests, a removed component, a new template — so
this is overdue rather than pending.

**6. From an earlier handoff, never actioned:** onboarding messages for the two
designers who have not had them. The lead specifically wanted the design-system
owner to hear about the owner seat directly, not via a tool. The plugin-update
nudge above is still the natural moment to fold that in.

**7. The Notion copy of workflow.md is one PR behind (added 3 November).**
[#244](https://github.com/VDM-Design-Team/VCP-design-system/pull/244) rewrote
the "Automated checks" table in `docs/workflow.md`; the
[How We Work page](https://wholesale-piccolo-010.notion.site/VCP-Design-System-How-We-Work-e58fbfcc3ae082759885011915b9848a)
still shows the old five rows and says axe *reports* rather than fails. It
wasn't synced because nobody could edit it: the page lives in **"BESAdigital
OÜ's Workspace"**, and the engineering owner's Notion login is not a member
there, so neither the Notion connector nor the browser could reach it.
Notion says that login may join the workspace itself, which could take a paid
seat. The other ways in: share the page with that login as **Can edit**, or
paste the change by hand. A connector would also need reconnecting to that
workspace. What the sync needs, all copied from `workflow.md`:

- Reword the 🎨 Token lint and 🧪 Story tests rows.
- Add six rows between Token lint and Typecheck: 🧩 Composition lint,
  🔢 Plugin version, 📚 Story lint, 📜 GDL contract, 🔲 Field contrast,
  📝 Changelog entry.
- In the 🧪 callout, swap the "currently reports… flips to failing" sentence
  for the `npm test` sentence under the table.
- Footer: last synced on the day it's done, PR #244.

While you're in there, check two things. The page's 📖 Live Storybook link
still points at the old Chromatic project (`main--685158a98c4fedbbec7ac708`),
and nobody has decided yet whether to change it. And an older, retired copy
is still published at `ivory-slope-836.notion.site`; unpublish it so nobody
reads it by mistake.

**8. Seventeen open design PRs, and two of them would bring back released
entries (added 3 November).** The 0.1.0 release deleted every file in
`changes/` once it was in `CHANGELOG.md`. Any PR branched before that still
carries those files. Merging `main` in won't remove them, because the branch
never changed them, and they would silently come back as unreleased entries.
Check each PR's `changes/` list before merging:
[#204](https://github.com/VDM-Design-Team/VCP-design-system/pull/204) carries
nine released entries besides its own `feat-gantt-chart.md` (among them
`feat-chart-legend-gauge.md`), and
[#180](https://github.com/VDM-Design-Team/VCP-design-system/pull/180) carries
`feat-notification-item-followup.md` besides its own. Both are also in conflict
with `main`. The rest are queued for review:
[waiting on your review](https://github.com/VDM-Design-Team/VCP-design-system/pulls?q=is%3Apr+is%3Aopen+review-requested%3A%40me).

**9. The prototype's access list is the engineering owner's to settle.**
On GitHub, VCP-prototype has the owner as admin and one reader; the designers
who will build screens there need **Write**, and the dev-team contributor
probably **Read**. Login access to the site is set by email domain (above).

**10. The next release.** The prototype is pinned at `0.1.0`, so nothing
merged here reaches it until a release is published and the prototype bumps
to it in its own PR (`npm i @vdm-design-team/vcp-design-system@latest`, then
click through every screen on that PR's preview link). Two small fixes are
worth folding into that release: add `CHANGELOG.md` to the package's `files`,
and run `npm pkg fix`, which normalises `repository.url` (npm warns about it on
publish).

---

## Loose ends in the code

**The Claude Design export cannot be trusted.** It invented seven statuses, a
`Review No Action` state, a count badge on `SidebarItem`, a footer CTA, a
domain selector in the rail, and three roles where the design has four. Audit
against Figma *before* porting — `docs/figma-audit.md` says this, and skipping
it has cost a rebuild more than once.

**Two components probably still have the closed-story blindness.**
`EmojiReactionPicker` never renders its palette and `DatePicker`'s popover
story shows only its trigger. Neither has been checked properly; `Modal` was,
and it had been invisible to Chromatic and axe since it shipped.

**`Card`'s removal left no gap in the code, but it did in the docs.** Five
docs that used it as their comparison anchor now say what they mean directly.
If you find a stale reference, it is a miss.

**`color.neutral.*` is dead weight.** The repo carries the General Design
Library's neutral ramp byte-identical, and **zero** semantic tokens alias it —
all 75 grey aliases point at `color.slate.*`. Reaching for `color.neutral.*`
will not match the greys around it. `docs/color-tokens.md` warns about it;
[issue #103](https://github.com/VDM-Design-Team/VCP-design-system/issues/103)
is the real fix.

**`docs/inventory.md` is the worklist.** Tier, shipped-in PR, and dependency
notes for everything still to port. Read it before picking work.

---

## Standing debt — Figma is behind the repo

The repo is the source of truth ([CLAUDE.md](../CLAUDE.md)); these are the
places the design file has not caught up. All of it lives in
[issue #80](https://github.com/VDM-Design-Team/VCP-design-system/issues/80),
with full background in [figma-audit.md](figma-audit.md).

**Most of #80 was cleared on 9–11 September.** Status tags reversed rather
than added (design ruled there is one `Completed`); the sidebar's Heroicons
swapped to Phosphor across all twelve rows and both rail widths, with a
VCP-drawn `RectangleStack` for Manage; `Design Review` casing fixed; radii
confirmed as inherited from the General Design Library and the raw ones
bound. Two more fixes landed on 11 September: the delete confirmation's button said
**"Complete"** and now says "Delete", and the dark `neutral/outline/content`
hover and press **lost** contrast on a dark surface and now gain it.

**What is left:** the AV table's raw colours (above), and one item that never
had a source — a "F**o** Review" typo reported off a flow board no doc links.
Dropped rather than hunted.

**New, and bigger:** [issue #103](https://github.com/VDM-Design-Team/VCP-design-system/issues/103)
— the repo flattens two Figma libraries into one token tree and cannot tell
them apart. The General Design Library owns the primitives, radii, stroke,
spacing and type; VCP owns the semantics on top. Nothing records that split, so
nothing stops it drifting. Not urgent, nothing blocked on it.

---

## What to build next

**The AV modals are done** — all seven, and the worklist row for them is gone
from [inventory.md](inventory.md). What is left is everything around them.

**The page contents `AppShell` frames**, none of which exist: `My_AVs_Stats`,
`Filter_Bar`, `AV_Table`. ⚠️ `AV_Table` needs the raw-colour rebind settled
first.

**Also unblocked:**

- **The four table patterns** — `PlanningTable`, `BudgetTable`, `HolidayTable`,
  `AvailabilityGrid`. `DataTable` shipped; specialise it rather than copying it.
- **Flow tests**, [issue #94](https://github.com/VDM-Design-Team/VCP-design-system/issues/94).
  The next group is `Menu` and `Popover` together, since they share the focus
  and Escape contract that `Modal`'s four tests now cover.

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
2. **`npx playwright install chromium`** if you have not, or `npm test` fails
   on the browser step.
3. Read [inventory.md](inventory.md) for the worklist and dependency notes, and
   [figma-audit.md](figma-audit.md) before touching anything the audit flagged.
4. One branch per task, draft PR early, and the changed-file list confirmed
   against the task's scope before committing — [workflow.md](workflow.md) has
   the full version.
5. **Audit before you port.** If the piece exists in `_source/claude-design/`,
   read the Figma first — `download_assets` returns the real geometry *with the
   layer names attached*, which is how "Assigned" turned out to be a VCP
   original rather than an icon to search for. The export is a sketch of
   intent, not a specification.
6. **Ship the stories that prove it.** A fixed story for each state so
   Chromatic and axe can see it, and a `play` story for anything with
   behaviour. [saving-states.md](saving-states.md) is the worked example.

**Keep this file current.** A handoff that describes last week is worse than
none, because it is believed.

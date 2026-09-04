# VCP Design System — locations and queries

## The repo

https://github.com/VDM-Design-Team/VCP-design-system — public, org `VDM-Design-Team`.
(It moved from `creativedesignlead/` in Aug 2026; old links redirect.)

`main` is protected: everything lands via PR, no exceptions, no bypass — so the
PR list IS the complete history of change. Nothing lands any other way.

## The published Storybook

https://main--685158a98c4fedbbec7ac708.chromatic.com

Always the current `main`, rebuilt on every merge. This is the design system as
it exists right now.

The sidebar's top level is the **tier**: `Foundations/` for tokens, then
`Atoms/`, `Components/`, `Patterns/`, and `Templates/` once the first one
ships. Only components keep a function group one level down —
`Components/Actions/`, `Components/Forms/`, `Components/Navigation/`,
`Components/Feedback/`, `Components/Display/`, `Components/Overlays/`.
Everything else sits directly under its tier: `Atoms/Button`,
`Patterns/TopBar`.

**Search by name, do not guess the path.** A piece moves tier when it outgrows
or shrinks out of one — `PaginationDots` was under `Navigation/` and is now
`Atoms/PaginationDots`. Storybook's sidebar search finds it either way; a
guessed path sends the reader somewhere that no longer exists.

## Efficient GitHub URLs

Substitute nothing — these work as-is once the user is logged in:

- Questions waiting on me (issues): https://github.com/VDM-Design-Team/VCP-design-system/issues?q=is%3Aissue+is%3Aopen+assignee%3A%40me
- Issues that mention me: https://github.com/VDM-Design-Team/VCP-design-system/issues?q=is%3Aissue+is%3Aopen+mentions%3A%40me
- All open issues: https://github.com/VDM-Design-Team/VCP-design-system/issues
- Open PRs: https://github.com/VDM-Design-Team/VCP-design-system/pulls
- Awaiting my review: https://github.com/VDM-Design-Team/VCP-design-system/pulls?q=is%3Apr+is%3Aopen+review-requested%3A%40me
- My PRs: https://github.com/VDM-Design-Team/VCP-design-system/pulls?q=is%3Apr+is%3Aopen+author%3A%40me
- Recently merged: https://github.com/VDM-Design-Team/VCP-design-system/pulls?q=is%3Apr+is%3Amerged+sort%3Aupdated-desc
- A PR's page shows checks, reviews, conversation and conflicts in one place:
  https://github.com/VDM-Design-Team/VCP-design-system/pull/NUMBER
- An issue's page: https://github.com/VDM-Design-Team/VCP-design-system/issues/NUMBER
- The released plugin version (step 5 reads the `version` field):
  https://github.com/VDM-Design-Team/VCP-design-system/blob/main/plugin/.claude-plugin/plugin.json

Engineering asks design questions as **issues** in this repo — a status that
needs a name, a colour with no token, a variant with no design. They are
assigned to the person who can answer. Nothing auto-chases them, so they are
the easiest thing in the repo to leave sitting.

`CHANGELOG.md` and `docs/<component>.md` can be read on GitHub directly:
https://github.com/VDM-Design-Team/VCP-design-system/blob/main/CHANGELOG.md

## Chromatic on PRs

PRs get a Chromatic check ("UI Tests" / "UI Review"). Pending visual diffs show
as an incomplete or failed check with a link into chromatic.com. Describe what
the diffs are; the human approves them, never you. Baselines on `main`
auto-accept, so only PR diffs ever need a decision.

## Vocabulary

Four tiers, and the test is **composition, not vocabulary** — a piece may carry
VCP words at any tier. (The older "could another product use it?" test was
retired in September 2026; a brief that still applies it will put pieces in the
wrong place.)

- **Atom** — one self-contained element, the thing a designer would name as
  *one thing* on a canvas (Button, Input, Badge, Avatar, PaginationDots). It
  composes nothing else in the system.
- **Component** — one unit assembled from atoms and other components. However
  rich inside, it presents as a single control or display unit (Field, Menu,
  DataTable, StatusPill).
- **Pattern** — two or more components composed into a distinct page section
  (TopBar, AVHeader).
- **Template** — a page-level layout arranging patterns into a whole screen
  (AppShell).
- **Token** — a named design decision (color, type, space). Every tier uses
  semantic tokens only; a PR "adding a token" is usually groundwork for the
  piece that will spend it.

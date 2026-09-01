# VCP Design System — locations and queries

## The repo

https://github.com/VDM-Design-Team/VCP-design-system — public, org `VDM-Design-Team`.
(It moved from `creativedesignlead/` in Aug 2026; old links redirect.)

`main` is protected: everything lands via PR, no exceptions, no bypass — so the
PR list IS the complete history of change. Nothing lands any other way.

## The published Storybook

https://main--685158a98c4fedbbec7ac708.chromatic.com

Always the current `main`, rebuilt on every merge. This is the design system as
it exists right now. Storybook sidebar groups: components under `Actions/`,
`Forms/`, `Navigation/`, `Feedback/`, `Display/`, `Overlays/`; VCP-specific
assemblies under `Patterns/`; tokens under `Foundations/`.

## Efficient GitHub URLs

Substitute nothing — these work as-is once the user is logged in:

- Open PRs: https://github.com/VDM-Design-Team/VCP-design-system/pulls
- Awaiting my review: https://github.com/VDM-Design-Team/VCP-design-system/pulls?q=is%3Apr+is%3Aopen+review-requested%3A%40me
- My PRs: https://github.com/VDM-Design-Team/VCP-design-system/pulls?q=is%3Apr+is%3Aopen+author%3A%40me
- Recently merged: https://github.com/VDM-Design-Team/VCP-design-system/pulls?q=is%3Apr+is%3Amerged+sort%3Aupdated-desc
- A PR's page shows checks, reviews, conversation and conflicts in one place:
  https://github.com/VDM-Design-Team/VCP-design-system/pull/NUMBER

`CHANGELOG.md` and `docs/<component>.md` can be read on GitHub directly:
https://github.com/VDM-Design-Team/VCP-design-system/blob/main/CHANGELOG.md

## Chromatic on PRs

PRs get a Chromatic check ("UI Tests" / "UI Review"). Pending visual diffs show
as an incomplete or failed check with a link into chromatic.com. Describe what
the diffs are; the human approves them, never you. Baselines on `main`
auto-accept, so only PR diffs ever need a decision.

## Vocabulary

- **Component** — reusable, knows nothing about VCP (Button, Input, Tabs).
- **Pattern** — carries VCP's domain vocabulary or page structure (TopBar,
  StatusPill). Same quality bar, different tier.
- **Token** — a named design decision (color, type, space). Components only use
  semantic tokens; a PR "adding a token" is usually groundwork for a component.

---
bump: minor
---
### Package — three more components importable, no stories in the tarball (November 2026)

- **`InlineEdit` / `InlineDateEdit`, `RejectionReason` and `StatusProgression` are now exported** from `@vdm-design-team/vcp-design-system`, with their props types and the constants that go with them (`PENDING_REJECTION_REASONS`, `HANDOFF_REJECTION_REASONS`, `avTransitions`). They were already inside `PlanningTable`, the two rejection modals and `AVHeader`, and each has its own docs page, but an app couldn't import them on their own.
- **The package no longer ships stories, the story-test helpers or the team's process docs** (`handoff`, `workflow`, `inventory` and the two Figma audit notes). The component docs an app's AI agent reads from `node_modules/…/docs/` are all still there.

---
bump: major
---
### Breaking: `StatusPill` → `StatusTag`, `DueDatePill` → `DueDateTag` (October 2026)

Both have been built on `Tag` (the rounded rectangle) since #134 — design called them tags, not pills — but kept their old names
so that change stayed visual-only. The names now match what they are. **No behaviour, prop or token changes.**

- **Migration:** rename the imports and types. `StatusPill` → `StatusTag`, `StatusPillProps` → `StatusTagProps`, `DueDatePill` →
  `DueDateTag`, `DueDatePillProps` → `DueDateTagProps`; the import paths `components/status-pill` and `components/due-date-pill` become
  `components/status-tag` and `components/due-date-tag`. Everything else exported (`AVStatus`, `DueDateProximity`, `dueDateTone`, …) keeps its name.
- Also renamed: the Storybook titles (`Components/Display/StatusTag`, `…/DueDateTag`), `docs/status-tag.md`, `docs/due-date-tag.md`, and every
  mention in the docs, `CLAUDE.md` and the plugin's project notes. Earlier changelog entries and `docs/figma-audit.md` keep the old names — they
  describe how things were. No caller in the repo outside `AVTable`, `AVHeader`, `StatusProgression` and the stories used them.

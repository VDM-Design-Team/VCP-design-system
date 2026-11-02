---
bump: major
---
### `Stepper`, `Chip`, `CopyText`, `Tooltip`, `Pagination` move to atoms (October 2026)

Each is one self-contained element a designer would name as one thing on a canvas, and each imports nothing from the system but `Icon`, so by the composition rule they are atoms. They move from `src/components/<name>` to `src/atoms/<name>`, and their Storybook titles become `Atoms/<Name>`. Nothing about how they look or behave changes. `CopyText` is now exported from the package root (it was not before).

Migration: import them from the package root as before (`import { Chip } from '@vcp/design-system'`). Inside this repo, change `components/<name>` to `atoms/<name>` in relative imports (`../../components/tooltip` → `../../atoms/tooltip`, `../tooltip` → `../../atoms/tooltip`). Branches that import these from `components/` need the same one-line change.

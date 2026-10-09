---
bump: patch
---
### Changelog entries are one file per PR (October 2026)

Each PR now adds its changelog entry as its own file in `changes/`, instead of
editing this file, so a merge no longer makes every other open PR conflict
here. `npm run changelog` folds the files into this file at release and sets
the version from their `bump` (`patch`, `minor` or `major`). `npm test` and CI
fail a PR that changes `src/` or `tokens/` without an entry, or that edits
`CHANGELOG.md` directly. The format is in `changes/README.md`. No change to
the components or tokens.

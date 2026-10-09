# Unreleased changes

Every PR that touches `src/` or `tokens/` adds **one file here** with its
changelog entry, instead of editing `CHANGELOG.md`. Two PRs never write the
same file, so changelog entries can't conflict. At release time
`npm run changelog` combines the files into `CHANGELOG.md`, newest first, and
deletes them.

## Writing one

Name it after your branch, with the slash as a dash:
`fix/sidebar-logo-mark` → `changes/fix-sidebar-logo-mark.md`.

```markdown
---
bump: minor
---
### `Sidebar` / `Logo` — the rail's logo keeps its size (October 2026)

Design review of the collapsed rail: the diamond is now 20 wide in both
states …
```

- **`bump`** is `patch`, `minor` or `major` (rule 6 in `CLAUDE.md`):
  - `patch`: a fix or a visual adjustment, with no new API.
  - `minor`: a new token, variant, prop or piece.
  - `major`: a rename or removal. It must include a `Migration:` note, on
    its own line or inside a bullet, that says what callers change.
- **The body** is the entry exactly as it will read in `CHANGELOG.md`: a
  `### ` heading naming the piece and the month, then the prose.
- **A small fix still gets a file.** A heading and one sentence is fine.

`npm test` (and CI) fails a PR that changes `src/` or `tokens/` without
adding a file here, a PR that edits `CHANGELOG.md` directly, and a file with
no valid `bump`, no `### ` heading, or a `major` with no `Migration:` note.

## Releasing

```bash
npm run changelog -- --dry-run   # print what would be written
npm run changelog                # write it
```

The script writes the entries into `CHANGELOG.md` and empties this folder.
If the top section of `CHANGELOG.md` is still `## <version> — unreleased`, the
entries go into that section and it gets today's date. Otherwise the script
starts a new section with the next version, chosen by the highest `bump`, and
sets it in `package.json`. Commit the result as the release PR.

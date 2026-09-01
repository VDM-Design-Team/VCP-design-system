---
description: Start the day — what changed on GitHub, what's waiting on you, and Storybook running on the latest main
---

The morning catch-up for someone on the design team. Two halves: **what happened on
GitHub overnight**, and **the current design system running locally**. Do both, then
say what to pick up first.

Read `CLAUDE.md` first if you have not this session — it is the rules for this repo.

## 1 — Where they left off

Before touching anything, note the commit `main` is on right now:

```
git rev-parse --short main
```

Keep it. Everything "new" is measured from there, so they get the diff since *their*
last pull, not since some arbitrary date.

Check the working copy too — `git status --short` and the current branch. If they have
uncommitted work or are sitting on a feature branch, say so now and do not move them off
it without asking.

## 2 — GitHub

Use `gh`. If it is not authenticated, stop and tell them to run `gh auth login`.

Report, in this order — skip a heading entirely if it is empty rather than writing "none":

- **Waiting on them.** `gh pr list --search "review-requested:@me"` — PRs where they are
  asked to review.
- **Their own PRs.** `gh pr list --author @me`. For each: is CI green, has anyone
  reviewed, are there unanswered review comments (`gh pr view <n> --comments`), does it
  have a merge conflict. An unanswered comment from three days ago is the thing they most
  need to see.
- **Merged since their last pull.** `git log --oneline <saved-sha>..origin/main` after
  fetching, plus the matching `CHANGELOG.md` entries. Describe these in product terms —
  "Button labels are now 14px, that was a bug fix" — not in CSS or commit-message terms.
- **Everything else open.** `gh pr list` — one line each, so they know what is in flight
  around them.

Flag Chromatic explicitly: if a PR of theirs has visual diffs waiting for approval, say
so, and say whether the diffs look expected from the description. Never approve baselines
for them.

## 3 — Storybook on the latest main

Get `main` current first: with a clean tree, run the pull/install/token steps the way
`npm run latest` does (or run `git pull --ff-only && npm install && npm run tokens`).
Then start Storybook through the app's browser preview — use the `storybook` entry in
`.claude/launch.json` — so it opens in a panel right next to the conversation instead
of asking the person to switch to another browser. Never leave them with just a URL.

- Do not start a second Storybook if 6006 is already serving.
- It refuses rather than guesses. If it stops: **uncommitted changes** — offer to stash or
  commit, and name the files; **authentication** — `gh auth login`; **diverged history** —
  do not force anything, an engineer looks at it.
- If they are mid-work on a branch and do not want to move, skip the pull, say you
  skipped it, and open the published Storybook in the app's browser preview instead:
  https://main--685158a98c4fedbbec7ac708.chromatic.com

Once it is up, name the components that are new or changed since their saved sha and give
the Storybook path to each, so they can click straight to it. Point at `docs/<name>.md`
for anything they ask about.

## 4 — What to do first

Close with a short ordered list — at most three things, most blocking first. Something
waiting on their reply outranks something new to build. If nothing is waiting, say the
morning is clear and name the next open piece of work.

Keep the whole thing to something readable in under a minute. No tables of raw commit
hashes.

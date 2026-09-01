---
description: Pull the latest design system from main and open Storybook
---

Get this checkout up to date with `main` and show the design system.

Run `npm run latest`. It pulls `main`, installs dependencies, rebuilds the design
tokens, and starts Storybook on http://localhost:6006.

If it stops with an error, read what it says and help the person fix it — it is
written to refuse rather than guess, so the message will name the problem. The
usual ones:

- **Uncommitted changes** — it will not pull over someone's work. Offer to stash
  or commit, and say which files are affected.
- **Authentication** — `gh auth login`.
- **Diverged history** — do not force anything. Say an engineer should look.

Once Storybook is running, tell them what changed since they last pulled: read
`CHANGELOG.md` and summarise the new components in product terms, not CSS terms.
Point them at `docs/` for the component they ask about.

Do not start a second Storybook if one is already running on 6006.

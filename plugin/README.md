# VCP Design System plugin

The morning catch-up for designers on the VCP Design System. Nothing to install
beyond this plugin — no clone, no terminal, no Node.

## What you get

**`/vcp-morning`** — say "catch me up" or run the command each morning. Claude
reads GitHub and the published Storybook and briefs you, in this order:

1. **What's waiting on you** — questions asked of you (issues assigned to or
   mentioning you), review requests, and unanswered comments on your own PRs.
2. **Your open PRs** — checks, reviews, conflicts, pending visual diffs.
3. **What merged** since yesterday, in product terms.
4. **Which components changed**, with Storybook links.
5. **What to do first** — at most three things.

…and, only when there is one to take, a single line telling you a newer
version of this plugin is out and the one command that takes it.

PR activity is scoped to the last day (three on Mondays); **open questions are
reported however old they are**, because an unanswered question doesn't age
out. The full behaviour lives in one place — `skills/vcp-morning/SKILL.md`;
the step-by-step for new team members is `Onboarding/README.md` at the repo
root.

It is strictly read-only: it never merges, approves, or comments for you, and
never answers a question on your behalf.

## Requirements

- A collaborator on `VDM-Design-Team/VCP-design-system`. The first run may show
  a GitHub sign-in in the browser window Claude uses — sign in there once and
  it sticks.

## Changing this plugin

Edit it like anything else here — PR to `main`. **Bump the version in the same
PR, in both places:**

- `.claude-plugin/plugin.json` — installed copies are cached by version and
  silently keep the old one otherwise.
- The "This brief is version X" line near the top of
  `skills/vcp-morning/SKILL.md` — that is how the brief knows whether it is
  the current one.

`npm run lint:plugin-version` (part of `npm test`) fails if the two disagree,
so a half-done bump cannot merge.

Nothing updates installed plugins on their own. Users pick up a release with
`claude plugin update vcp-design-system@vcp`, then restart. They should not
have to *know* a release happened: the brief compares its own version against
`main`'s on every run and tells them, in one line, when there is one to take.

## When you want to *change* the design system

That happens in Claude Code opened in a local clone of the repo, which has its
own `/morning` and `/latest` commands and the repo rules in `CLAUDE.md`. The
repo README section "For designers — seeing the latest" has the setup — or just
ask Claude to walk you through it when the day comes.

# VCP Design System plugin

The morning catch-up for designers on the VCP Design System. Nothing to install
beyond this plugin — no clone, no terminal, no Node.

## What you get

**`/vcp-morning`** — say "catch me up" or run the command each morning. Claude
reads GitHub and the published Storybook and briefs you: what's waiting on you
first, then your own PRs, what merged, what changed, and what to do next. The
full behaviour lives in one place — `skills/vcp-morning/SKILL.md`; the
step-by-step for new team members is `Onboarding/README.md` at the repo root.

It is strictly read-only: it never merges, approves, or comments for you.

## Requirements

- A collaborator on `VDM-Design-Team/VCP-design-system`. The first run may show
  a GitHub sign-in in the browser window Claude uses — sign in there once and
  it sticks.

## Changing this plugin

Edit it like anything else here — PR to `main`. **Bump `version` in
`.claude-plugin/plugin.json` in the same PR**: installed copies are cached by
version and silently keep the old one otherwise. Users pick up a release with
`claude plugin update vcp-design-system@vcp`.

## When you want to *change* the design system

That happens in Claude Code opened in a local clone of the repo, which has its
own `/morning` and `/latest` commands and the repo rules in `CLAUDE.md`. The
repo README section "For designers — seeing the latest" has the setup — or just
ask Claude to walk you through it when the day comes.

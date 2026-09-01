# VCP Design System plugin

The morning catch-up for designers on the VCP Design System. Nothing to install
beyond this plugin — no clone, no terminal, no Node.

## What you get

**`/vcp-morning`** — say "catch me up" or run the command each morning. Claude
reads GitHub through your browser and the published Storybook, and tells you:

- What's waiting on **you** — review requests and unanswered comments on your PRs
- The state of your own PRs — checks, reviews, conflicts, pending Chromatic diffs
- What merged since yesterday, in product terms
- Which components changed, with a click-through to each in Storybook
- The one to three things to do first

It is strictly read-only: it never merges, approves, or comments for you.

## Requirements

- Logged in to GitHub in your browser as a collaborator on
  `VDM-Design-Team/VCP-design-system`
- That's it

## When you want to *change* the design system

That happens in Claude Code opened in a local clone of the repo, which has its
own `/morning` and `/latest` commands and the repo rules in `CLAUDE.md`. The
repo README section "For designers — seeing the latest" has the setup — or just
ask Claude to walk you through it when the day comes.

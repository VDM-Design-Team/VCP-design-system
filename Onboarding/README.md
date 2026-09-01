# Welcome to the VCP Design System team

This is your setup, start to finish. It takes about fifteen minutes, and you do
not need a terminal, code knowledge, or anything installed beyond Claude. Do the
steps in order — each one depends on the one before it.

When something here doesn't work, don't fight it: paste the error to Claude, or
ask Ali. The tooling in this repo is written to refuse with a clear message
rather than guess, so error text is worth reading.

---

## Step 1 — Accept the GitHub invitation

You've been invited as a collaborator on this repository.

1. Check the email inbox tied to your GitHub account for an invitation to
   `VDM-Design-Team/VCP-design-system`, or go directly to
   https://github.com/VDM-Design-Team/VCP-design-system/invitations
2. Accept it.
3. Confirm it worked: open
   https://github.com/VDM-Design-Team/VCP-design-system — you should see the
   repository without a 404.

Keep your GitHub password handy — you'll sign in once more inside Claude's own
browser window in step 5.

## Step 2 — Bookmark the two places you'll live

- **The repository** — where every change is proposed, discussed, and lands:
  https://github.com/VDM-Design-Team/VCP-design-system
- **The published Storybook** — the design system as it exists right now, every
  component, every variant, interactive. Rebuilt automatically on every merge:
  https://main--685158a98c4fedbbec7ac708.chromatic.com

The Storybook link is the answer to "what does X look like today". You never
need to install anything to see the current system.

## Step 3 — Get Claude

Install the Claude desktop app (Claude Code) if you don't have it:
https://claude.com/claude-code — sign in with your work account.

## Step 4 — Install the VCP plugin

The plugin gives your Claude a `/vcp-morning` command — your daily catch-up.
In any Claude conversation, paste this and let Claude run it:

> Install the VCP design system plugin: run
> `claude plugin marketplace add VDM-Design-Team/VCP-design-system`
> and then `claude plugin install vcp-design-system@vcp`

If your Mac asks to install "command line developer tools" during this step,
click **Install** — it's a one-time Apple prompt, expected, and takes a few
minutes.

**Then start a new conversation.** This matters: plugins load when a
conversation starts, so the one where you installed it can't see it yet. (If
`/vcp-morning` ever seems missing, "new conversation" is the fix.)

## Step 5 — Your morning routine

Each morning, in a fresh Claude conversation:

```
/vcp-morning
```

**The first time**, Claude's browser window may show a GitHub sign-in page —
Claude's browser is separate from your everyday one, so it doesn't know you
yet. Sign in there yourself (Claude will never ask you to tell it your
password — type it into GitHub's page directly), and it stays signed in from
then on.

You'll get, in about a minute of reading:

- **What's waiting on you** — review requests, and comments on your own PRs
  that you haven't answered. This comes first because someone is blocked on it.
- **Your open PRs** — checks passing or not, reviewed or not, visual diffs
  pending or not.
- **What merged since yesterday**, in product terms.
- **Which components changed**, with a link into Storybook for each.
- **What to do first** — at most three things.

It's read-only. It will never merge, approve, or comment as you — decisions
stay yours, made by you, on GitHub.

## Step 6 — Understand how change happens here

Read these two, in the repository on GitHub — together they're ten minutes:

1. **`README.md`** — what the system is and how the pieces fit.
2. **`CLAUDE.md`** — the working rules. The short version you should carry
   around in your head:
   - `main` is protected. **Nobody** pushes to it directly — not you, not Ali.
     Every change, however small, is a pull request that someone reviews.
   - Describe changes in **product terms** ("secondary buttons need a subtle
     variant for the settings page"), not CSS terms.
   - Components only use design tokens — never a raw color or size. If the
     token you need doesn't exist, **ask before inventing it**.
   - Every component ships with its stories and its docs page. No exceptions,
     including for patterns.

You don't need to memorise the rest — Claude enforces the details when you
work in the repo. You need to *recognise* when a rule is why something is
being refused.

## Step 7 — When you want to change the design system

This is a milestone, not a day-one task. It can wait days or weeks — reading,
reviewing, and commenting need nothing beyond steps 1–5.

The day you first want to *change* something — a new variant, a color that's
wrong, a component that's missing — you'll need the repository on your own
machine, because that's where Claude has the credentials to branch, test, and
open a pull request for you. When that day comes, tell Claude:

> I'm on the VCP design team and I need to set up a local clone of
> VDM-Design-Team/VCP-design-system so I can propose changes. Walk me through
> it — I haven't used a terminal much.

Claude will take you through it (it needs Node 22+, a git clone, and one
authentication step). Two things worth knowing in advance:

- **Open Claude Code on the repository folder itself** — the folder called
  `VCP-design-system` — not on a folder that merely contains it. The repo's own
  commands (`/latest`, `/morning`) only exist when you're inside it.
- From inside the repo, `/latest` gets you the newest `main` with Storybook
  running locally, and `/morning` is the local sibling of `/vcp-morning`.

Then propose changes by asking for what you want in product terms:

> "Add a subtle variant to Button — brand text on a light brand background —
> and update the docs and stories."

Claude edits, tests, and opens the PR. Ali reviews and merges. That's the loop.

## Who to ask

- **Anything about how the system works or why** — ask Claude first; it has
  the repo's docs and rules. Genuinely — it answers "what's the difference
  between a component and a pattern" better than interrupting a human.
- **Decisions** — new tokens, whether something belongs in the system, merge
  approvals — Ali.
- **Something broken in this onboarding** — Ali, and say which step. This
  document is version one; your confusion is how it improves.

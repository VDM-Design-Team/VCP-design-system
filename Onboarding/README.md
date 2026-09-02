# Welcome to the VCP Design System team

This is your setup, start to finish. It takes about fifteen minutes, and you do
not need a terminal, code knowledge, or anything installed beyond Claude. Do the
steps in order — each one depends on the one before it.

When something here doesn't work, don't fight it: paste the error to Claude, or
ask Ali. The tooling in this repo is written to refuse with a clear message
rather than guess, so error text is worth reading.

---

## What you'll need — the complete list

**For reading, reviewing, and your morning routine** (steps 1–6, day one):

| Tool | Where | Notes |
|---|---|---|
| A GitHub account | github.com | With the collaborator invite accepted (step 1) |
| Claude desktop app | https://claude.com/claude-code | Sign in with your work account |
| Apple's command line developer tools | macOS prompts you | One click during step 4 — expected, takes a few minutes |

That's genuinely all. No Node, no editor, no design software.

**Only when you start proposing changes** (step 8 — days or weeks away):

| Tool | Where | Notes |
|---|---|---|
| Node.js 22 or newer | https://nodejs.org | Claude walks you through it |
| GitHub CLI (`gh`), signed in | Claude installs and runs `gh auth login` with you | A one-time browser sign-in; this is what lets Claude push branches and open PRs **as you** |

**What you do NOT need** — skip these even if something suggests them:

- **The GitHub connector in Claude's settings (claude.ai → Connectors).**
  This workflow never uses it. `/vcp-morning` reads GitHub through Claude's
  own browser window, and the contributor setup uses the GitHub CLI instead.
  If Claude ever suggests "connecting GitHub" in its settings, decline — it
  adds a second, differently-configured path to GitHub and the two get
  confused about who you are.
- **Figma.** The Figma file mirrors this repo, not the other way round; you
  can go a long way without ever opening it.
- A code editor, Docker, or any terminal knowledge on day one.

**The one sign-in trap, worth reading twice:** Claude's browser window is a
separate browser — it does not share sign-ins with your everyday Chrome or
Safari. The first time `/vcp-morning` opens GitHub there, it may show you
logged out even though you're logged in "in your browser". That's normal:
sign in to GitHub *inside Claude's window*, directly on GitHub's page (Claude
will never ask you to tell it your password), and it stays signed in from
then on. Nearly every "GitHub won't connect" report is this.

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

## Step 6 — Reviewing a change (your first real contribution)

Reviewing is **every designer's job** here, and it needs nothing beyond a
browser. When `/vcp-morning` (or Ali) points you at a waiting pull request:

1. Open the PR on GitHub and find the **🔍 Visual review** comment — it's
   posted automatically on every PR.
2. Click **Before → after diffs**: every story the change touches, side by
   side against the current system. This is the heart of the review — does
   the *after* look right?
3. Click **the live Storybook for the branch** and click through the real
   components: try hover and focus, dark theme, narrow widths.
4. Say what you see, as a comment on the PR — questions count as review.
   "Why did the padding change on small buttons?" is exactly the job.

You review and comment; you don't approve or merge — that's the
design-system owner (normal changes) or the lead (new components, tokens,
breaking changes). Consistently good reviews are the path to the owner seat.

## Step 7 — Understand how change happens here

Read these three, in the repository on GitHub — together they're ten minutes:

1. **`README.md`** — what the system is and how the pieces fit.
2. **`docs/workflow.md`** — how the team works day to day: branches, PRs,
   reviews, roles, and the daily rhythm.
3. **`CLAUDE.md`** — the working rules. The short version you should carry
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

## Step 8 — When you want to change the design system

This is a milestone, not a day-one task. It can wait days or weeks — reading,
reviewing, and commenting need nothing beyond steps 1–6.

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

Claude edits, tests, and opens the PR. The design-system owner approves and
merges it — or the lead, when it's a new component, a token change, or
anything breaking. That's the loop.

## Who to ask

- **Anything about how the system works or why** — ask Claude first; it has
  the repo's docs and rules. Genuinely — it answers "what's the difference
  between a component and a pattern" better than interrupting a human.
- **Decisions** — approvals for everyday changes go to the **design-system
  owner**; new tokens, new components, whether something belongs in the
  system, and anything breaking go to the **lead**. The "Current holders"
  table in `docs/workflow.md` says who holds each seat today.
- **Something broken in this onboarding** — Ali, and say which step. This
  document is young; your confusion is how it improves.

---

## For the lead — onboarding someone new

The sender's half, so it's written down too:

1. **Invite them on GitHub** — repository → Settings → Collaborators →
   invite with **write** access.
2. **Add them to the team table** — a small PR putting them in the
   "Designers" row of the Current holders table in `docs/workflow.md`
   (and update the Notion mirror, per the sync rule).
3. **Send them the link to this page** with one line: "start at step 1."
4. When their first review or PR lands, walk them through the result — the
   post-merge walkthrough is how the system stays one conversation.

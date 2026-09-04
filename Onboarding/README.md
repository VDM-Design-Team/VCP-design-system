# Welcome to the VCP Design System team

This is your setup, start to finish. It takes about fifteen minutes, and you do
not need a terminal, code knowledge, or anything installed beyond Claude. Do the
steps in order — each one depends on the one before it.

When something here doesn't work, don't fight it: paste the error to Claude, or
ask **the lead**. The tooling in this repo is written to refuse with a clear
message rather than guess, so error text is worth reading.

This document talks about **roles**, not people — the lead, the design-system
owner, the accessibility owner. Duties belong to the seat, so the process
survives people joining and leaving. **Who holds each seat today** is the one
"Current holders" table in `docs/workflow.md`; that table is the only place
names appear.

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
| Claude Code on the web | https://claude.ai/code | Nothing to install. A one-time **"authorize GitHub"** click there lets cloud sessions open branches and PRs **as you** |

That's it — changes happen in the cloud. No local copy of the repository, no
Node, no command line. (A local setup exists for power users; see the end of
step 8.)

**What you do NOT need** — skip these even if something suggests them:

- **Two similar-looking "connect GitHub" screens exist — only one is yours.**
  ✅ **Authorize GitHub at claude.ai/code** — that's step 8, and it's the
  only GitHub connection this workflow uses.
  ❌ **The GitHub connector under claude.ai → Settings → Connectors** —
  never used here; if anything suggests it, decline. It creates a second,
  differently-configured path to GitHub, and the two get confused about who
  you are.
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
The same applies to **Chromatic**: if Claude opens a diff page in its window
and Chromatic asks for sign-in, click **Connect with GitHub** there — since
you're already signed into GitHub in that window, it's one click, no
password. There is no Chromatic connector or setting to configure in Claude.

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

## Step 2 — Bookmark the three places you'll live

- **The repository** — where every change is proposed, discussed, and lands:
  https://github.com/VDM-Design-Team/VCP-design-system
- **The published Storybook** — the design system as it exists right now, every
  component, every variant, interactive. Rebuilt automatically on every merge:
  https://main--685158a98c4fedbbec7ac708.chromatic.com
- **How We Work** — the team's workflow, visually, on one page. No Notion
  account needed:
  https://wholesale-piccolo-010.notion.site/VCP-Design-System-How-We-Work-e58fbfcc3ae082759885011915b9848a

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

- **What's waiting on you** — this comes first, because someone is blocked on
  it. Three kinds of thing land here:
  - **Questions asked of you**, as GitHub issues assigned to you or
    @-mentioning you. This is how engineering asks design a decision it
    can't make alone — "which status is this variant?", "these two colours
    have no token, which do you want?". **These outrank everything else**:
    work on the other side is stopped until you answer, and unlike a pull
    request, nothing chases them. The brief tells you what's being asked and
    how old it is.
  - **Review requests** on other people's PRs.
  - **Comments on your own PRs** you haven't answered.
- **Your open PRs** — checks passing or not, reviewed or not, visual diffs
  pending or not.
- **What merged since yesterday**, in product terms.
- **Which components changed**, with a link into Storybook for each.
- **What to do first** — at most three things.

One difference worth knowing: the brief covers the **last day** of PR
activity, but **every open question, however old**. A PR from last month has
moved on; a question from last month is still unanswered.

Occasionally it ends with one extra line: **a newer version of the plugin is
out**, and the single command that takes it —
`claude plugin update vcp-design-system@vcp`, then restart Claude. Nothing
updates plugins on their own, so the brief watches for you; you'll see this a
few times a year, not daily.

It's read-only. It will never merge, approve, or comment as you — and it will
never answer a question on your behalf. It surfaces; you decide.

## Step 6 — Reviewing a change (your first real contribution)

Reviewing is **every designer's job** here, and it needs nothing beyond a
browser. When `/vcp-morning` (or the design-system owner) points you at a
waiting pull request:

1. Open the PR on GitHub and find the **🔍 Visual review** comment — it's
   posted automatically on every PR.
2. Click **Before → after diffs**: every story the change touches, side by
   side against the current system. This is the heart of the review — does
   the *after* look right?
   **The first time**, Chromatic shows a sign-in page — click **Connect
   with GitHub** and you're in; your access to the repository carries over,
   and it stays signed in from then on. If the page says **0 changes**,
   that's a real answer: nothing visual moved, nothing to inspect.
   If it says **"You need access — check that you're a collaborator"**,
   you're not signed in, or signed in with the wrong account. The diff
   pages are collaborator-only (even though the Storybook itself is
   public), so sign in with the GitHub account that accepted the step 1
   invitation and the page unlocks.
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
2. **How the team works day to day** — branches, PRs, reviews, roles, and the
   daily rhythm. Read the visual version in Notion (bookmarked in step 2), or
   `docs/workflow.md` in the repo — same rules; the repo file is the canonical
   one if they ever disagree.
3. **`CLAUDE.md`** — the working rules. The short version you should carry
   around in your head:
   - `main` is protected. **Nobody** pushes to it directly — not you, not the
     lead.
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
wrong, a component that's missing — you work **in the cloud**, at
https://claude.ai/code. Nothing gets installed on your machine, and nothing
you make can exist only on your machine — every change is born on GitHub.

**One-time setup (two minutes):**

1. Open https://claude.ai/code, signed in with your work Claude account.
2. When it asks, click **authorize GitHub** and approve with your own GitHub
   account. (The team's repository access is already set up org-wide — you're
   only telling GitHub that cloud sessions may act as *you*.)
3. Pick `VDM-Design-Team/VCP-design-system` from the repository list.

**From then on**, start a session on the repository and ask for what you want
in product terms:

> "Add a subtle variant to Button — brand text on a light brand background —
> and update the docs and stories. Open a PR when it's done."

Claude edits, runs the checks, and opens the PR in the cloud; a few minutes
later it's on GitHub with its 🔍 Visual review comment, and the branch
Storybook link shows your change rendered. The design-system owner approves
and merges it — or the lead, when it's a new component, a token change, or
anything breaking. That's the loop.

Cloud branches are named `claude/<change>-<suffix>` automatically — that's
normal; the PR title in product terms is what the team reads.

<details>
<summary>Optional: the local setup, for power users</summary>

Working locally gives you a live Storybook while you design (instant feedback
instead of per-push previews). It needs Node 22+, a git clone, and a one-time
`gh auth login`. Tell Claude:

> I'm on the VCP design team and I want a local clone of
> VDM-Design-Team/VCP-design-system so I can propose changes. Walk me
> through it — I haven't used a terminal much.

Two things worth knowing: open Claude Code **on the repository folder
itself** (not a folder that merely contains it — the repo's own `/latest`
and `/morning` commands only exist inside it), and push at least before
lunch and end of day — local work is not backed up until it's pushed.
</details>

## You're set — the checklist

Run through these — if nothing surprises you, you're ready to work.

**Day one (steps 1–6)**

- [ ] Can see the repo on GitHub (invitation accepted)
- [ ] Claude desktop app installed, VCP plugin working (`/vcp-morning` in a fresh conversation)
- [ ] Ran `/vcp-morning` once — signed in to GitHub inside Claude's browser window
- [ ] Know that questions for you arrive as **GitHub issues**, and that the brief puts them first
- [ ] Opened a PR's 🔍 Visual review and clicked through the Chromatic diffs

**First week (step 7)**

- [ ] Read `README.md`, `docs/workflow.md`, and `CLAUDE.md` in the repo
- [ ] Know where to find the four rules in `CLAUDE.md`: every change is a PR; product terms not CSS; tokens only; stories and docs ship with every component

**When you propose changes (step 8)**

- [ ] Authorized GitHub at `claude.ai/code` — not Settings → Connectors
- [ ] Know who approves what (design-system owner vs lead)

## Who to ask

- **Anything about how the system works or why** — ask Claude first; it has
  the repo's docs and rules. Genuinely — it answers "what's the difference
  between a component and a pattern" better than interrupting a human.
- **Decisions** — approvals for everyday changes go to the **design-system
  owner**; new tokens, new components, whether something belongs in the
  system, and anything breaking go to the **lead**. The "Current holders"
  table in `docs/workflow.md` says who holds each seat today.
- **Something broken in this onboarding** — the lead, and say which step. This
  document is young; your confusion is how it improves.

---

## For the lead — onboarding someone new

The sender's half, so it's written down too:

1. **Invite them on GitHub** — repository → Settings → Collaborators →
   invite with **write** access. (The Claude Code GitHub App is already
   installed org-wide for cloud sessions — a once-ever setup; if it's ever
   reinstalled, install it on the **organization**, not a personal account.)
2. **Add them to the team table** — a small PR putting them in the
   "Designers" row of the Current holders table in `docs/workflow.md`
   (and update the Notion mirror, per the sync rule).
3. **Send them the link to this page** with one line: "start at step 1."
4. When their first review or PR lands, walk them through the result — the
   post-merge walkthrough is how the system stays one conversation.

You do not need to announce plugin releases: the brief compares its own
version against `main` on every run and tells its reader when there is a
newer one, with the command to take it.

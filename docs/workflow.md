# How we work — the VCP Design System workflow

The rules of the road for everyone who changes this repo. Written to scale:
responsibilities are **roles**, and the [Current holders](#current-holders)
table maps roles to people — growing the team means editing that table, not
this document.

## Principles

1. **`main` is always the latest approved, working design system.** The
   published Storybook builds from it on every merge.
2. **Every change travels the same road**: short-lived branch → pull request →
   automated checks → Storybook preview → review → merge. No exceptions, no
   direct pushes, for anyone in any role.
3. **Small beats big.** A PR should be reviewable in 15–30 minutes. If a
   component takes longer than that to review, split it into independently
   mergeable PRs.

## Branches

Branches are named for the **change**, never the person:

```
feat/avatar-status          a new component, variant, or capability
fix/select-disabled-state   correcting behaviour or appearance
tokens/spacing-scale        token-only changes
docs/tooltip-usage          documentation only
```

- Branch from a **fresh** `main` — run `/latest` (or tell Claude to update
  main first) before creating one.
- Keep branches alive **no more than 2–3 working days**. Long-lived branches
  rot: this repo once had a branch sit 28 commits ahead of `main` with no PR,
  and untangling it cost more than the work it contained.
- No personal branches (`ali-work`), no shared permanent branches
  (`design-development`). If two people must collaborate on one change, share
  one branch deliberately and name **one** branch owner.

## The daily rhythm

**Morning**
- Run `/vcp-morning` (anywhere) or `/morning` (inside the repo): what merged,
  what's waiting on you, the state of your PRs.
- Answer review comments **before** starting new work — someone is blocked on
  them.
- Starting a task? Fresh `main`, new branch. You don't run git yourself —
  you tell Claude what you're starting, in product terms:

  > "I'm starting a new task: secondary buttons need a subtle variant for
  > the settings page. Update main and create a branch for it, then let's
  > build it — stories and docs included. Only touch the files this needs."

  Claude pulls the latest `main`, creates `feat/button-subtle-variant`,
  and keeps the change scoped. Naming the task in product terms up front
  also becomes your PR description later.

**During the day**
- Push your branch at least before lunch and at end of day. Pushed work is
  backed up and visible; unpushed work is neither. Pushing is one sentence
  to Claude:

  > "Save my progress — commit what we have with a sensible message and
  > push the branch."

- Open a **draft PR as soon as the structure exists.** Draft PRs are how
  overlapping work gets discovered while it's still cheap. High-impact token
  or foundation work is announced by its draft PR — open it first, build
  second.

  *What's a pull request?* Your work, packaged for a decision: the changes,
  the Storybook preview, and your description in one place on GitHub, where
  the team looks before anything joins `main`. A **draft** PR is the same
  thing marked "not finished — but look" ; nobody reviews it yet, everyone
  can see it coming.

  > "Open a draft PR for this branch — fill in the template from what
  > we've built so far and note what's still missing."

- **When the work is finished**, have Claude run the checks and turn the
  draft into a real review request:

  > "The subtle Button variant is done. Run the tests, make sure stories
  > and docs are complete, then finish the PR — fill in the template in
  > product terms, attach the Chromatic preview, and mark it ready for
  > review."

- Before starting anything large, review someone else's waiting PR.
  **Review is everyone's job**, whatever your role: reading the change,
  clicking through its Storybook preview, asking questions. Who must
  *approve* which kind of change is the role matrix below — and nobody
  approves their own PR.
- **After your change lands, walk the team through it.** A few minutes with
  the lead and the other designers — what changed, why, and where to see it
  in Storybook — so everyone hears about the change from you rather than
  stumbling into it later.

**Before merge**
- Bring `main` into your branch (`merge`, not `rebase` — no force-pushes),
  resolve conflicts, let the checks run green.
- Approved PRs merge the **same day**. A merged branch is deleted.

## Pull requests

Every PR answers five questions — the template asks them:

1. What changed?
2. Why?
3. Which components and tokens are affected?
4. Is it breaking?
5. How does the reviewer test it?

Every PR gets a **🔍 Visual review** comment automatically (see Reviews,
below). Attach anything else that makes review fast: before/after screenshots,
the Figma link if one exists. Describe the change in **product terms** —
"secondary buttons need a subtle variant for settings" — not CSS terms.

## Reviews

**Review starts from the pictures, not the code.** Every PR carries a
**🔍 Visual review** comment, posted automatically and updated on every push,
with the two links a review starts from:

- **Before → after diffs** — Chromatic shows every story the PR changes side
  by side against `main`, with an Accept/Deny button per change.
- **The live Storybook for the branch** — the real components, clickable, for
  trying hover, focus, dark theme, and mobile widths yourself.

Open the diffs first, then click through the branch's Storybook; read the code
diff last. When a PR touches nothing visual, the comment says so — nothing to
look at, review the text.

The checklist:

- Matches the intended design?
- Existing variants still correct?
- Tokens used — no hardcoded values?
- All states present (hover, focus, disabled, loading, error)?
- Is the component API guessable (`variant`, `size`, `fullWidth`, `loading`)?
- Works at mobile widths and in dark theme?
- Keyboard, focus ring, contrast handled?
- Stories and `docs/<name>.md` updated?

**Reviewing** (reading, commenting, asking questions) is everyone's job.
**Approving and merging** belongs to three seats:

- **Lead** — approves and merges any change.
- **Design-system owner** — approves and merges everything **except big
  changes**, which need the lead. The owner's own PRs are approved by the
  lead.
- **Designers** — review and comment on any PR, but do not approve or merge.
  Consistently good reviews are the path to the owner seat.

A **big change** is any of: a new component or pattern, a change to core or
semantic tokens, or a breaking change (rename/removal). Everything else —
fixes, docs, adjustments and new variants of existing components — is a
normal change.

| Change | Who approves the merge |
|---|---|
| Normal change | Design-system owner or lead |
| New component or pattern | Lead |
| Core or semantic tokens | Lead |
| Breaking change (rename/removal) | Lead, plus the engineering owner |
| Accessibility-sensitive change | As above, plus the accessibility owner |

Nobody approves their own PR. The two edge cases that creates:

- The **owner's** own PRs are approved by the lead.
- The **lead's** own big changes get the owner's review on the PR before the
  lead merges — a documented second pair of eyes, since nobody outranks the
  lead to formally approve.

Chromatic visual diffs on a PR are approved by
the PR's **reviewer**, never its author.

### Current holders

| Role | Held by |
|---|---|
| Lead | Ali |
| Design-system owner | Eve |
| Engineering owner | Ali |
| Accessibility owner | Ali |
| Designers | Ali · Eve · Marvin |

One person may hold several roles; the rule stays the same when they stop
being the same person. Update this table as the team grows.

## Automated checks

What runs on every PR **today**:

| Check | What it catches |
|---|---|
| Token rebuild + stale-`dist/` | Generated files that don't match `tokens/` |
| `lint:tokens` | Hardcoded colors, px values, arbitrary Tailwind classes |
| Typecheck | Type errors across components and stories |
| Chromatic | Storybook builds, visual diffs vs `main`, posts the 🔍 Visual review comment |

Planned next: **automated accessibility tests** (Storybook test runner + axe),
so CLAUDE.md rule 5 is enforced by CI instead of by memory.

Deliberately deferred, with the trigger that un-defers them:

- **Unit/interaction tests** — when components carry real logic.
- **Required PR approvals** in the ruleset — when at least two people can
  independently review most changes.
- **Merge queue** — when several approved PRs regularly wait simultaneously.

## Protecting `main`

The `Protect main` ruleset (bypass list **empty** — applies to everyone):
restrict deletions, require a PR, require checks to pass, block force pushes.
Merged branches are deleted. As the team grows, required approvals and a merge
queue switch on per the triggers above.

## Avoiding collisions

The collision hotspots in this repo are **`CHANGELOG.md` and `src/index.ts`** —
every component PR touches both. Small conflicts there are normal; resolve by
keeping both sides.

- One person owns a component's structural change at a time.
- One PR = one concern. Don't combine unrelated components.
- If task B depends on task A, merge A first — don't build B on A's branch.
- Tell Claude exactly which files a task may touch; no drive-by renames,
  reformatting, or reorganizing (see CLAUDE.md).

## The Figma leg

This repo is the source of truth; Figma mirrors it. **When a token PR merges,
the matching Figma variables are updated the same week** — the PR template has
a checkbox so it can't be silently forgotten. A Figma file that drifts from
`main` is a bug.

## Where the rules for Claude live

`CLAUDE.md`, in this repo, versioned like everything else. It encodes this
workflow so every Claude session follows it without being told.

A visual copy of this document lives in Notion for the team:
[VCP Design System — How We Work](https://app.notion.com/p/3ce29ad06b0b816d9a86d34e6d09b5b7).
**Any PR that changes this file also updates that Notion page** — same change,
same day. The repo stays canonical: if the two ever disagree, this file wins
and the Notion page gets corrected to match.

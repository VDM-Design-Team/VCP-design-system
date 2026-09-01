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
- Starting a task? Fresh `main`, new branch.

**During the day**
- Push your branch at least before lunch and at end of day. Pushed work is
  backed up and visible; unpushed work is neither.
- Open a **draft PR as soon as the structure exists.** Draft PRs are how
  overlapping work gets discovered while it's still cheap. High-impact token
  or foundation work is announced by its draft PR — open it first, build
  second.
- Before starting anything large, review someone else's waiting PR.

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

Attach what makes review fast: the Chromatic Storybook preview (posted
automatically on every PR), before/after screenshots, the Figma link if one
exists. Describe the change in **product terms** — "secondary buttons need a
subtle variant for settings" — not CSS terms.

## Reviews

Review the **running Storybook preview**, not only the diff. The checklist:

- Matches the intended design?
- Existing variants still correct?
- Tokens used — no hardcoded values?
- All states present (hover, focus, disabled, loading, error)?
- Is the component API guessable (`variant`, `size`, `fullWidth`, `loading`)?
- Works at mobile widths and in dark theme?
- Keyboard, focus ring, contrast handled?
- Stories and `docs/<name>.md` updated?

Who must review what — by **role**:

| Change | Required review |
|---|---|
| Documentation only | Any designer |
| Adjusting an existing component | A designer familiar with it |
| New component or pattern | Design-system owner |
| Core or semantic tokens | Design-system owner + affected designers |
| Breaking change (rename/removal) | Design-system owner + engineering owner |
| Accessibility-sensitive change | Accessibility owner |

Nobody approves their own PR. Chromatic visual diffs on a PR are approved by
the PR's **reviewer**, never its author.

### Current holders

| Role | Held by |
|---|---|
| Design-system owner | Ali |
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
| Chromatic | Storybook builds, per-PR preview URL, visual diffs vs `main` |

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

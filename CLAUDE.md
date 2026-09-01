# Working on this design system

This repo is the **single source of truth** for the VCP Design System. Design and
engineering both change it here. Figma is not authoritative; neither is any
Claude Design project — those mirror this repo, not the other way round.

## Rules — apply to every change

1. **Tokens before components.** If a component needs a value that no token
   provides, add the token in `tokens/` first, run `npm run tokens`, then use it.
   Never write a hex, a raw `px`, or an arbitrary Tailwind class (`bg-[#336afa]`).
   `npm run lint:tokens` fails the build on these.
2. **Two token layers.** `tokens/core/` holds raw values (`color.brand.500`).
   `tokens/semantic/` holds intent (`surface.brand`, `content.muted`, `line.default`)
   and must only ever reference core tokens. **Components use semantic tokens only.**
3. **`dist/` is generated.** Never hand-edit it. It is rebuilt from `tokens/`.
4. **Every component ships with**: the `.tsx`, a `.stories.tsx` covering all
   variants/sizes/states, and a `docs/<name>.md` with a when-to-use table,
   props table, accessibility notes, and a "Don't" list.
5. **Accessibility is not optional.** 4.5:1 contrast on text, 3:1 on UI borders,
   visible focus ring, 40px minimum target for touch, `aria-label` on icon-only
   controls.
6. **Changes are versioned.** Adding a token or variant is a minor bump. Renaming
   or removing one is a major bump and needs a note in `CHANGELOG.md` with the
   migration path.
7. **Components or patterns — decide before you write.** See the next section.
   Getting this wrong is expensive to undo once other things import it.

## Components and patterns

The system has two tiers, and everything new belongs to exactly one of them.

**`src/components/` — components.** Reusable building blocks that know nothing
about VCP. A Button, an Input, a Modal, a Badge. They take props and render; they
carry no domain vocabulary and no page structure. A component may compose other
components — `AvatarGroup` uses `Avatar`, `Menu` uses `Popover` — and that is
still a component.

**`src/patterns/` — patterns.** Assemblies that carry VCP's domain or its page
structure. `TopBar` is a pattern: it arranges `Logo`, `Menu`, `Avatar` and the
notification bell into the thing that sits at the top of every VCP page.
`StatusPill` is a pattern too, despite being small — it encodes VCP's status
vocabulary, so it is not reusable anywhere else.

**The test — could another product use this unchanged?**
If yes, it is a component. If it only makes sense inside VCP, it is a pattern.
Size is not the test, and neither is whether it composes something else:
`StatusPill` is tiny and composes nothing, and it is still a pattern.

Rules that follow from the split:

- **Patterns may import components. Components must never import patterns.**
  If a component finds itself needing one, the dependency is pointing the wrong
  way — lift the domain knowledge out into a prop.
- **Patterns are where VCP vocabulary lives** — statuses, urgencies, roles,
  domains, the Added Value lifecycle. Keep it out of `src/components/` entirely.
- **Both tiers ship the same artefacts**: the `.tsx`, a `.stories.tsx`, and a
  `docs/<name>.md`. Rule 4 applies to patterns exactly as it does to components.
- **Storybook titles.** Components are grouped by what they do — `Actions/`,
  `Forms/`, `Navigation/`, `Feedback/`, `Display/`, `Overlays/`. Patterns all sit
  under `Patterns/`, so the sidebar shows the two tiers apart at a glance.
- **A pattern that turns out to be reusable should move down**, not be copied.
  Strip the VCP specifics into props and relocate it to `src/components/`; that is
  a major bump because the import path changes.

## Naming

- Semantic colors follow the VCP Figma variables exactly:
  `surface.*` (backgrounds), `text.*` (text/icons), `stroke.*` (borders),
  `action.{primary|secondary|tertiary}.{surface|content|border}.{state}` (controls),
  `accent.{critical|success|warning|info|…}.{filled|outline|tonal}.{surface|content|border}.{state}` (status).
  Tailwind utilities: `bg-surface-canvas`, `text-text-primary`, `border-stroke-default`,
  `bg-action-primary-surface-default`, `bg-accent-critical-tonal-surface-default`.
- Spacing: do NOT override Tailwind's numeric scale — VCP's px values map onto it
  exactly (4px = `p-1`, 8px = `p-2`, 16px = `p-4`, 64px = `p-16`).
- Type ramp: `text-display-xl` … `text-caption-sm` — size, line-height, weight and
  tracking come as a unit from `type.*`. Poppins for UI (`font-sans`), Inter for
  dense numerics (`font-numeric`).
- Dark theme exists: `tokens/semantic/color.dark.json` builds to `dist/tokens.dark.css`
  (`.dark` overrides). Components must only use semantic tokens so dark works for free.
- Component props: `variant`, `size`, `fullWidth`, `loading`. Keep these names
  consistent across every component — devs should be able to guess the API.

## Commands

| | |
|---|---|
| `npm run tokens` | Rebuild `dist/` from `tokens/` |
| `npm run dev` | Storybook at :6006 |
| `npm test` | Token lint + typecheck (what CI runs) |

## How design proposes a change

Work on a branch, open a PR, tag the engineering owner. Describe the change in
product terms in the PR body ("secondary buttons need a subtle variant for the
settings page"), not in CSS terms. Never push to `main`.

## Workflow (see docs/workflow.md for the human version)

- One branch per task, named `feat/…`, `fix/…`, `tokens/…`, or `docs/…` —
  never per person. Branch only from a freshly pulled `origin/main`.
- Touch only files the task requires. Never rename, move, reformat, or
  reorganize unrelated files without explicit approval.
- Before committing, show the changed-file list and confirm it matches the
  task's scope.
- Push the branch and open a draft PR early; keep the PR reviewable in
  15–30 minutes or propose a split.
- Bring `main` into the branch with merge, not rebase. Never force-push.
  When resolving a conflict, explain both versions before choosing.
- Finish every change by reporting: files changed and why, checks run and
  their results, possible breaking changes, and a draft PR description
  answering the template's five questions.
- When a change touches `docs/workflow.md`, also update the team's Notion
  copy (https://app.notion.com/p/3ce29ad06b0b816d9a86d34e6d09b5b7) to match — the
  repo is canonical, the Notion page mirrors it.

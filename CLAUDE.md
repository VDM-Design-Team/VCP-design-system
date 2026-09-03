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
   props table, accessibility notes, and a "Don't" list. Components, patterns
   and templates additionally carry a **"Composed of"** section naming every
   piece their `.tsx` imports — `npm run lint:composition` (part of `npm test`)
   checks it against the real import graph, verifies imports flow downward,
   and fails a pattern that composes fewer than two pieces.
5. **Accessibility is not optional.** 4.5:1 contrast on text, 3:1 on UI borders,
   visible focus ring, 40px minimum target for touch, `aria-label` on icon-only
   controls.
6. **Changes are versioned.** Adding a token or variant is a minor bump. Renaming
   or removing one is a major bump and needs a note in `CHANGELOG.md` with the
   migration path.
7. **Pick the tier before you write.** See the next section. Getting this
   wrong is expensive to undo once other things import it.

## Atoms, components, patterns, templates

The system is atomic-design shaped: four tiers, and everything new belongs to
exactly one of them. The test is **composition, not vocabulary** — a piece may
carry VCP domain language at any tier (decided 3 Sep 2026, replacing the older
could-another-product-use-it test).

**`src/atoms/` — atoms.** A single self-contained element: something a
designer would name as *one thing* on a canvas. A Button, an Input, a Badge,
an Avatar, a Toggle, the Logo. Interactive or not. An atom may use `Icon`
internally as decoration (icons are sub-atomic); it never composes another
piece of the system.

**`src/components/` — components.** One unit assembled *from* atoms (and
other components): `IconButton`'s wrapping cousins like `Field`, `Chip`,
`Menu`, `DataTable`, `StatusPill` (a `Badge` plus the status mapping). However
rich inside, if it presents as one control or one display unit, it is a
component — `DataTable` and `DatePicker` are components, not patterns.

**`src/patterns/` — patterns.** Organisms: **two or more components composed
into a distinct page section.** `TopBar` (Logo + Menu + Avatar + bell),
`FilterBar`, `CommentItem`, the planning tables built on `DataTable`.

**`src/templates/` — templates.** Page-level layouts that arrange patterns
into whole screens: `AppShell`, `EmailLayout`.

Rules that follow from the split:

- **Imports flow downward only**: atoms ← components ← patterns ← templates.
  A lower tier never imports a higher one; if it needs to, the dependency is
  pointing the wrong way — lift the knowledge out into a prop. (Stories are
  exempt: an atom's story may demo it inside a component.)
- **Domain mappings live in one place each.** VCP vocabulary (statuses,
  urgencies, roles, domains) may appear at any tier, but each mapping —
  status → tone, urgency → colour — is owned by exactly one piece
  (`StatusPill` owns statuses); call sites never re-derive it.
- **All four tiers ship the same artefacts**: the `.tsx`, a `.stories.tsx`,
  and a `docs/<name>.md`. Rule 4 applies everywhere.
- **Storybook titles mirror the tiers.** Top level is the tier; components
  keep their function group one level down: `Atoms/Button`,
  `Components/Forms/Field`, `Components/Overlays/Menu`, `Patterns/TopBar`,
  `Templates/AppShell`.
- **A piece that outgrows or shrinks out of its tier moves**, not gets
  copied. Moving is a major bump because the import path changes.

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
| `npm test` | Token lint + composition lint + typecheck (what CI runs) |

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
  copy (https://wholesale-piccolo-010.notion.site/VCP-Design-System-How-We-Work-e58fbfcc3ae082759885011915b9848a) to match — the
  repo is canonical, the Notion page mirrors it.

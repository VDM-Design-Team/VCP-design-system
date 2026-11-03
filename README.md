# @vdm-design-team/vcp-design-system

The single source of truth for the VCP Design System: **design tokens**, **React
components**, and **usage docs**. Design edits it through Claude, engineering
consumes it as a versioned npm package. Nothing is hand-copied between the two.

```
tokens/core/       raw values      — VCP's own: color.vcp-blue.*, color.brand.navy
                                    (shared scales and the type ramp come from GDL,
                                    @vdm-design-team/gdl — the parent design system)
tokens/semantic/   intent          — surface.brand, content.muted, line.default
dist/              GENERATED       — theme.css, tokens.css, tokens.ts, tokens.flat.json;
                                    npm run build adds index.js and types/
src/components/    React + Tailwind components
docs/              per-component usage, a11y, and "don't" rules
CLAUDE.md          the rules any AI agent must follow when editing this repo
```

---

## For engineering

The package is on GitHub Packages, like GDL. Tell npm where the scope lives, in
the app's `.npmrc`:

```ini
@vdm-design-team:registry=https://npm.pkg.github.com
```

Log in once per machine (the `npm login` under "For designers" below), then:

```bash
npm i @vdm-design-team/vcp-design-system
```

React 18+ and Tailwind v4 are peer dependencies: the app's own copies are used.

**1. Load the theme.** In your app's root CSS, after Tailwind:

```css
@import "tailwindcss";
@import "@vdm-design-team/vcp-design-system/theme.css";
```

`theme.css` doesn't load Tailwind a second time. It adds the tokens to the app's
Tailwind theme and points that Tailwind at the component bundle, so the
components' classes are generated with no `@source` line in the app. Dark theme:
`.dark` on `<html>` (what `next-themes` sets). The theme names the faces, Poppins
for UI and Inter for numerics, but doesn't load them, so the app loads both.

Every token is now a Tailwind utility:

```jsx
<div className="bg-surface-subtle text-content-muted p-md rounded-lg border border-line-default shadow-sm" />
```

**2. Use the components.**

```jsx
import { Button } from '@vdm-design-team/vcp-design-system';

<Button variant="primary" size="md" loading={saving}>Save changes</Button>
```

Every component is a client component (the bundle starts with `"use client"`),
so a Next.js Server Component can import and render one directly. Helpers
exported with them, like `cn`, can only be *called* in client code. Token values
for server code come from `@vdm-design-team/vcp-design-system/tokens`, which
isn't a client module.

**3. Point your AI agent at it.** Add to your app's `CLAUDE.md` / `AGENTS.md`:

> UI must be built from `@vdm-design-team/vcp-design-system`. Check `node_modules/@vdm-design-team/vcp-design-system/docs/`
> for component usage before writing any new UI. Never hardcode colors or spacing —
> use the token utilities (`bg-surface-*`, `text-content-*`, `border-line-*`, `p-*`, `gap-*`).

Because the package is in `node_modules`, Claude Code reads the tokens, types, and
docs directly — no MCP required. For *querying* the system ("what variants does
Button have?") run Storybook and add its MCP server:

```bash
npx storybook add @storybook/addon-mcp   # exposes localhost:6006/mcp to your agent
```

## For design

You never open a terminal. In Claude, ask for what you want:

> "Add a `subtle` variant to Button — brand text on a light brand background —
> and update the docs and stories."

Claude edits `tokens/` and `src/`, runs `npm test`, and opens a PR. An engineer
reviews and merges. Ten minutes later it's on npm and in the apps.

## The visual library — where both teams look

Three surfaces, all generated from this repo. None of them is maintained by hand.

| | What it shows | Who uses it | Command |
|---|---|---|---|
| **Token gallery** | Every colour, type size, space, radius and shadow, with its Tailwind class — plus a WCAG contrast check on every semantic pair | Design and eng, for foundations | `npm run gallery` → `gallery/index.html` |
| **Storybook** | Every component, every variant and state, interactive. Same tokens under `Foundations/Tokens` | Both, day to day | `npm run dev` → :6006 |
| **Claude Design project** | The same system on a canvas, synced from this repo | Design, for exploration | `/design-sync` |

Publishing Storybook through Chromatic gives you a shared URL and a **preview
build on every PR** — so design and engineering review the actual rendered
component before it merges, not a screenshot of it.

## Governance

- `main` is protected. Everything lands via PR.
- CI fails on hardcoded values, stale `dist/`, and type errors.
- Semver: new token or variant = minor. Rename or removal = major + a migration
  note. Each PR's changelog entry is its own file in `changes/` (see
  `changes/README.md`); `npm run changelog` folds them into `CHANGELOG.md` at
  release.
- One named engineering owner reviews design's PRs. **This is the part that
  actually makes the system work** — without it the repo drifts.

---

## Verifying the token pipeline

```bash
npm run tokens     # tokens/ -> dist/
npm run preview    # compiles preview/index.html against the theme
open preview/index.html
```

If a utility like `bg-surface-brand` renders unstyled, the token didn't reach the
Tailwind theme — check `dist/theme.css` before touching the component.

> **Gotcha:** Tailwind v4 only generates utilities for class names it finds in
> scanned source files, and it skips anything in `.gitignore`, `node_modules`
> included. `theme.css` covers that for apps: its `@source "./index.js"` adds the
> component bundle. An app that uses the components without importing
> `theme.css` gets them without their styles.

## For designers — seeing the latest

**Just want to look at it? Open the published Storybook:**

### https://main--6aba746352fe3d50eea0cdab.chromatic.com

Always the current `main`, updated on every merge. Nothing to install, no account
needed. This is the right link for most people.

---

Run it locally only if you need to try changes before they land:

```bash
npm run latest
```

Pulls `main`, installs what's new, rebuilds the tokens, and opens Storybook at
http://localhost:6006. It refuses to run over uncommitted work rather than
overwriting it.

First time on a new machine you need [Node 22+](https://nodejs.org) and:

```bash
git clone https://github.com/VDM-Design-Team/VCP-design-system.git
cd VCP-design-system
npm login --scope=@vdm-design-team --auth-type=legacy --registry=https://npm.pkg.github.com
npm run latest
```

The `npm login` is once per machine: GDL, the parent design system VCP builds
on, comes from GitHub Packages. Username: your GitHub username. Password: a
[classic token with `read:packages`](https://github.com/settings/tokens/new?scopes=read:packages&description=npm%20GitHub%20Packages).

If you use Claude Code in this repo, `/latest` does the same thing and will also
summarise what changed since you last pulled.

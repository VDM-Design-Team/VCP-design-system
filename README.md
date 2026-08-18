# @vcp/design-system

The single source of truth for the VCP Design System: **design tokens**, **React
components**, and **usage docs**. Design edits it through Claude, engineering
consumes it as a versioned npm package. Nothing is hand-copied between the two.

```
tokens/core/       raw values      — color.brand.500, size.5
tokens/semantic/   intent          — surface.brand, content.muted, line.default
dist/              GENERATED       — theme.css, tokens.css, tokens.ts, tokens.flat.json
src/components/    React + Tailwind components
docs/              per-component usage, a11y, and "don't" rules
CLAUDE.md          the rules any AI agent must follow when editing this repo
```

---

## For engineering

```bash
npm i @vcp/design-system
```

**1. Load the theme.** In your app's root CSS — this replaces `@import "tailwindcss"`:

```css
@import "@vcp/design-system/theme.css";
@source "../node_modules/@vcp/design-system/dist";
```

Every token is now a Tailwind utility:

```jsx
<div className="bg-surface-subtle text-content-muted p-md rounded-lg border border-line-default shadow-sm" />
```

**2. Use the components.**

```jsx
import { Button } from '@vcp/design-system';

<Button variant="primary" size="md" loading={saving}>Save changes</Button>
```

**3. Point your AI agent at it.** Add to your app's `CLAUDE.md` / `AGENTS.md`:

> UI must be built from `@vcp/design-system`. Check `node_modules/@vcp/design-system/docs/`
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
  note in `CHANGELOG.md`.
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
> scanned source files, and it skips anything in `.gitignore`. Consuming apps
> must add `@source "../node_modules/@vcp/design-system/dist";` or the
> components will ship without their styles.

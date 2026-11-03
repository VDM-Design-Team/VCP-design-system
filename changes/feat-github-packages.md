---
bump: major
---
### Package — `@vdm-design-team/vcp-design-system`, installable by a Next.js app (October 2026)

A Next.js (App Router) app that runs its own Tailwind v4, shadcn/ui included, can now install the system from GitHub Packages and import its components and theme.

- **The package is renamed `@vdm-design-team/vcp-design-system`** (was `@vcp/design-system`). GitHub Packages only publishes a package under its owner's scope, so the old name could never have been published. The new one sits beside GDL's `@vdm-design-team/gdl`.
- **`npm run build` produces the package**: ESM for the `.` and `./tokens` entries, with type declarations. The `./theme.css`, `./tokens.css` and `./tokens.json` paths are unchanged.
- **Every component is a client component.** `dist/index.js` starts with `"use client"`, so Server Components can import and render them. Helpers exported alongside, such as `cn`, can only be called in client code. `./tokens` has no directive, so server code can read token values.
- **`theme.css` no longer imports Tailwind.** The app's own `@import "tailwindcss"` comes first and `theme.css` follows it. `theme.css` now registers the component bundle as a Tailwind source itself, so the app needs no `@source` line.
- `playwright` moves to `devDependencies`. Only the story tests use it, so apps no longer install it.

Migration: install `@vdm-design-team/vcp-design-system` in place of `@vcp/design-system`, with `@vdm-design-team:registry=https://npm.pkg.github.com` in the app's `.npmrc`. Change every `'@vcp/design-system'` import, and its `/theme.css`, `/tokens.css`, `/tokens` and `/tokens.json` subpaths, to `'@vdm-design-team/vcp-design-system'`. In the app's root CSS, put `@import "tailwindcss";` above the theme import and delete the `@source "../node_modules/@vcp/design-system/dist";` line.

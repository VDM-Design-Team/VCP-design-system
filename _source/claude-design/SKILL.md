---
name: vcp-design
description: Use this skill to generate well-branded interfaces and assets for Valuechainplus (VCP) — a B2B delivery-management app built around the Added Value object. Covers three user roles (User, Admin, Super Admin), design tokens, and 31 React components. Use for production UI or throwaway prototypes and mocks.
user-invocable: true
---

Read `README.md` in this skill first — it carries the role model, tokens, content rules and the honest coverage gaps. Then explore `components/` (one folder per component: `.jsx`, `.d.ts`, and an `@dsCard` preview) and `templates/`.

**Always start from `AppShell`.** It composes `Sidebar` + `TopBar` + content + an optional 390px detail column, and takes `role="user" | "admin" | "superAdmin"` — which is what makes a VCP page structurally correct. Read the `.d.ts` before using any component; prop names are precise.

**Roles are the core concept.** One component set; roles differ in which nav items exist, which pages are reachable, and whether controls are editable. Never invent role-specific components — gate and restyle the shared ones.

**Tokens over literals.** Link `styles.css` and consume `--colors-vcp-blue-*` and the semantic `--colors-text-*` / `--colors-surface-*` / `--colors-stroke-*` aliases. Do **not** use `--colors-primary-*` — it is a leftover pink ramp, not the brand.

**Key values:** primary `rgb(26,86,219)` · canvas `rgb(248,250,252)` · Poppins (Inter for dense numerics) · 14px Medium as the workhorse · 8px radius · 4px spacing base · 256px sidebar · 84px top bar.

**Icons:** `Icon` with a Heroicons v2 outline name. Never hand-draw SVGs.

**Copy:** Title Case for chrome, sentence case for body. IDs as `VCP - 2057`. No emoji.

For visual artifacts (slides, mocks, static pages), copy assets out and write standalone HTML that links `styles.css` and loads `_ds_bundle.js`. For production code, match the components and tokens exactly.

If invoked with no other guidance, ask what to build, which role the screen is for, and where it sits in the Added Value lifecycle — then act as an expert designer on this system.

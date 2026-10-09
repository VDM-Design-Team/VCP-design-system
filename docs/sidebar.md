# Sidebar

The app's primary navigation rail: logo, the nav set for whoever is looking,
and "Report a problem" pinned to the bottom. The last piece `AppShell` was
waiting on.

Read off the Figma `SideBar` section (`2349:935`, audit batch 3, 8 Sep 2026).

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `SidebarItem` | component | Every row, including the pinned footer row |
| `Tooltip` | component | The label of a collapsed row, which has no visible one |
| `Menu` | component | The domain switcher's dropdown, when shown |
| `Logo` | atom | The wordmark, or the diamond alone when collapsed |
| `Icon` | atom | The collapse toggle's double chevron |

The import rows are checked against the real imports — `npm test` fails if
this list drifts, and fails a pattern composing fewer than two pieces.

## When to use

| Use | For |
|---|---|
| `Sidebar` | The app's primary navigation |
| `TopBar` | App chrome above the page — they stack, they don't replace |
| `Tabs` | Sections of one page |
| `Menu` | A temporary list of choices over a trigger |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `userType` | `SidebarUserType` | `'user'` | Which rail the design draws. Ignored when `items` is given |
| `items` | `SidebarNavItem[]` | — | Override the nav set, for a rail the design hasn't drawn |
| `active` | `string` | — | The `key` of the current row |
| `defaultOpen` | `string[]` | — | Keys of rows with sub-items that start open — `'archive'`, `'planning'` |
| `onNavigate` | `(key: string) => void` | — | A row press, for rows without an `href` |
| `collapsed` | `boolean` | `false` | The 76-wide rail |
| `onToggleCollapse` | `() => void` | — | Omit to hide the floating toggle entirely |
| `showDomainSelector` | `boolean` | `false` | **Off by default** — see below |
| `domain` / `domains` / `onDomainChange` | — | — | The switcher's value and options |
| `label` | `string` | `'Main'` | The `<nav>`'s accessible name |

## It owns the nav vocabulary, and that is deliberate

`NAV_BY_USER_TYPE` maps each of the four user types to its rows. That looks
like the thing issue #68 spent a day pulling *out* of `StatusPill` and
`StatusProgression`, and the difference is worth stating.

**A domain names its own workflow steps.** They are configured, renameable,
and unknowable at build time, so the components had to take them as data.

**The design names the nav rows.** `_VCP_SideBar_Item_Preset` is twelve named
presets, and which of them each user type sees is *drawn* — four rails, eight
variants with their minimised twins. That is design vocabulary, not product
configuration, so it lives in one place here the way status → tone lives in
one place in `StatusPill`.

`items` is the escape hatch for a rail the design has not drawn yet. If it
starts being used routinely, the vocabulary has moved and this should follow.

| User type | Rows |
|---|---|
| `user` | Dashboard, My Values, Assigned, Drafts, Task Log Trail, Archive▾ |
| `admin` | + Manage |
| `admin-dev` | + Planning▾ |
| `super-admin` | Dashboard, Accounts, Domains, Contact List |

▾ = has sub-items. `Archive` opens Completed / Rejected / Backlogs;
`Planning` opens Planning List / Gantt Chart / Holiday Registry.

**`admin-dev` is not in the Claude Design export.** The export had three
roles; the design has four, and `Admin Dev` is the only rail with `Planning`.

**`Status` is not a nav item.** It exists in the preset set, with its own
dropdown, and appears in no rail — confirmed 8 Sep 2026. It is deliberately
absent here, so nobody re-derives it from the presets.

## Collapsed

**The logo doesn't move or resize.** Collapsed, the diamond is 20 wide — the size it
is inside the expanded 200 lockup — and in both states the logo starts 22 in, which
centres the diamond on the nav glyphs' axis (x = 32). Toggling the rail only shows or
hides the wordmark beside it (design review, 7 Oct 2026).

At 76 the labels go and the glyphs stay on one axis. Every row hugs its glyph with
8 either side; a row with sub-items adds a 12 chevron (52 wide), and
opening it shows a flyout beside the row (`SidebarItem` documents it) — the rail does
not reflow. Two things keep the rail usable:

- **`aria-label` on every row**, which `SidebarItem` does — an icon-only link
  would otherwise announce as nothing.
- **A `Tooltip` on every row**, which *this* does. `SidebarItem` deliberately
  does not wrap itself: a tooltip on every row of an expanded rail would be
  noise, and the expanded rail already shows its labels. The promise its docs
  make is kept here.

The collapse toggle straddles the rail's right edge and uses the design's
**double** chevron (« »), not a single one. Omit `onToggleCollapse` and it
does not render — a rail nobody can collapse should not draw the control.

## The domain selector is off by default

`_Domain_Selection_Dropdown` sits inside the rail in the design as a
`hidden="true"` layer — present, not part of the default variant. So
`showDomainSelector` defaults to `false` and the rail matches what the design
draws.

The switcher is Figma's `_Domain_Selection_Dropdown`: a filled
trigger (`surface.neutral.subtle` with a 1px `neutral.outline.border` stroke, radius 8,
12 / 8 padding, 14 medium in `text.secondary`) with a 20 up-down caret in `stroke.strong`, opening the
system's `Menu` flush to the trigger's width. The stroke is an addition to the design (design review): it takes the neutral outline family's states, so the border steps darker on hover and holds the pressed step while the menu is open; it is disabled when there are no domains. It is not the native `Select`,
whose popup the platform draws and a design cannot style. The trigger is named
"Domain: Design. Change domain" so the current value is announced. `Menu` has
no selected state, so the current domain is only marked by the trigger.

## Accessibility

- One `<nav>` with an accessible name (`label`), so a screen reader can jump
  to it and say which navigation it is.
- Every row is a real link or button with `aria-current="page"` on the current
  one — see `docs/sidebar-item.md`.
- The collapse toggle is a real button with `aria-expanded` and a name that
  says what it will do ("Expand navigation" / "Collapse navigation"), not what
  it looks like.
- Sub-item groups are `aria-expanded` + `aria-controls` disclosures.
- 40-tall rows, meeting the touch minimum.

## Don't

- **Don't re-derive the nav set at a call site.** `NAV_BY_USER_TYPE` is the
  one place. Use `items` only for a rail the design has not drawn.
- **Don't add `Status`** — it is a preset with no rail, confirmed not a nav
  item.
- **Don't wrap the whole rail in a `<nav>` yourself** — it already is one, and
  nesting landmarks makes both harder to navigate.
- **Don't render it without `AppShell`** — the rail assumes a
  full-height flex parent and a `TopBar` beside it.

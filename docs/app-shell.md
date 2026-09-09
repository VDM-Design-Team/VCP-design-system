# AppShell

The design system's first template: the whole-screen frame every signed-in
page sits in. The rail at full height down the left, the app bar across the top
of what remains, the page's title band and body beneath it, and the copyright
line at the end.

Read off the Figma `Page_Template` (1920 × 1027, 8 Sep 2026; audit in
[figma-audit.md](figma-audit.md) and PR #82's description).

```
Page_Template
├── VCP_SideBar    256 wide, full height
└── Main Section   from x=256
    ├── Top_NavBar
    └── Content ......................... slot
        ├── Page_Title
        ├── padded body  32 each side ... slot
        └── Footer
```

Both `Content`s are Figma **slots**, so the design already draws this as a
shell with a hole in it. That hole is `children`.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Footer` | atom | The copyright line, placed by the shell unless `footer` says otherwise |

The import rows are checked against the real imports — `npm test` fails if
this list drifts.

## Slots

The rail, the bar and the title band arrive as elements, not as props the
shell forwards:

| Slot | Expects | Why a slot |
|---|---|---|
| `sidebar` | `Sidebar` | Four user types and a collapsed twin — its API is its own |
| `topBar` | `TopBar` | Two variants (primary action or logo) — likewise |
| `header` | `PageTitle` or `AVHeader` | Either fits; the shell does not decide which — see below |
| `children` | The page | Inset 32 from each side, as the design's body slot is |
| `footer` | `Footer` | Defaults to the system one. Pass your own, or `null` for none |

**Why slots.** The Claude Design export mirrored twenty of `Sidebar`'s and
`TopBar`'s props onto the shell so it could render both itself. That is one
more surface to keep in step every time either pattern changes, and it is how
the export ended up with a role badge the bar does not draw and a footer CTA
the rail does not have. Here each piece keeps its own API and the shell owns
only the geometry.

## When to use

| Use | For |
|---|---|
| `AppShell` | Every signed-in page. Give it the rail, the bar and the title band; put the page in `children` |
| `Sidebar` / `TopBar` alone | Nothing, once the shell exists — both assume the parent it provides |
| `EmailLayout` | Mail, when it is built. Different chrome entirely |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `sidebar` | `ReactNode` | required | A `Sidebar`. Full height, down the left |
| `topBar` | `ReactNode` | required | A `TopBar`. Across the top of everything right of the rail |
| `header` | `ReactNode` | — | The title band, inside `<main>` so its `h1` is the page's |
| `children` | `ReactNode` | required | The page |
| `footer` | `ReactNode` | `<Footer />` | Your own, or `null` for none |

Everything else spreads onto the root `<div>`. `className` merges, so
`className="h-auto overflow-visible"` hands scrolling back to the document.

## What it assumes, and what it does not

The handoff asked this build to say which answer it took on each open design
question. It takes neither, on purpose:

- **Are `AV_Header` and `Page_Title` one component?** Both fit the `header`
  slot. If design merges them, `AVHeader` changes and this file does not.
- **Is the top bar 60 or 64?** The shell adds no height of its own — the bar
  is whatever `TopBar` renders. That answer lands in one place.

One behaviour is added beyond the geometry, because a Figma frame is static
and cannot say it: **the rail and the bar stay put; the page scrolls.** The
title band, body and footer move together in a scroll region under a bar that
does not move. On a page shorter than the viewport the footer sits at the
bottom of the screen rather than under the last card.

The export's fixed 390-wide detail column is left out. No page in the pages
file draws one. It can be added when one does, as a second slot.

## Measurements

| | Design | Ours |
|---|---|---|
| Rail | 256, full height | `Sidebar`'s own: 256, or 76 collapsed |
| Body inset | 32 each side | 32 (`px-8`) |
| Body, vertical inset | none drawn | none — the title band's 16 below and the footer's band supply it |
| Top bar | 60 in the pages file, 64 in the library | `TopBar`'s own, 64 — flagged in PR #82 |
| Footer | 72 | `Footer`'s own, 72 |

## Accessibility

- **One of each landmark, in the right order.** `TopBar`'s `<header>` is the
  page's banner, `Sidebar` is `<aside>` around a named `<nav>`, the title band
  and body are inside `<main>`, and `Footer` is `<footer>`. A screen reader
  can jump between the four and skip the rail.
- **The `h1` is inside `<main>`.** `PageTitle` and `AVHeader` both render it;
  `TopBar` deliberately has none.
- **The title band's `<header>` is not a second banner.** Inside `<main>` it
  is plain sectioning content, which is why the slot lives there.
- **Scrolling is keyboard-reachable.** The scroll region is a plain block, so
  Tab into anything in it and the browser scrolls it into view; there is no
  custom scroll behaviour to get wrong.
- **Desktop only, as the design is.** There is no mobile frame in
  `Page_Template`. The narrow-width answer today is the collapsed rail; a
  drawer is a design call, not a default to invent.

## Don't

- **Don't forward `Sidebar` or `TopBar` props through the shell.** Configure
  the piece and pass the element. The export did the forwarding and drifted.
- **Don't add a second `Footer` in `children`.** The shell already ends with
  one; pass `footer` to change it.
- **Don't put the title band in `children`** to skip the slot. The body is
  already inset 32, and the band carries its own 32, so it lands 64 in.
- **Don't add the 390-wide detail column** until a page in the pages file
  draws one.
- **Don't fix the top bar's height here.** If design settles on 60, that
  change belongs in `TopBar`.

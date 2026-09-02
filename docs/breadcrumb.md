# Breadcrumb

Where the current page sits in the hierarchy, each ancestor a way back. The
last crumb is the page itself — text, not a control.

## When to use

| Use | For |
|---|---|
| `Breadcrumb` | Hierarchical location: Added Values → Development → AV-2041 |
| `Tabs` | Peer views of the same thing |
| Browser back | The path the user actually took — a breadcrumb is *structure*, not history |

Two levels is the floor: a single crumb is a page title. If every page in the
product is one level deep, the pattern has nothing to say — leave it out.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `Array<string \| { key?, label, href? }>` | required | Root first, current page last. Strings are shorthand for `{ label }` |
| `onNavigate` | `(key: string) => void` | — | Fires for crumbs without an `href`. `key` defaults to the label |
| `className` | `string` | — | Merged via `cn()`; the root is the `<nav>` |
| `ref` | `Ref<HTMLElement>` | — | The `<nav>` |

**Prefer `href`.** A crumb with an `href` renders a real `<a>` — middle-click,
copy address, open in new tab all work. `onNavigate` buttons are for genuinely
programmatic navigation (a client-side router with no URL story). Both look
identical.

## Tokens

Links `text.link.default` (hover: `text.link.hover` + underline), the current
page `text.secondary`, separators `text.subtle` carets. `body-sm` throughout —
the export's 500-weight last crumb had no 12px partner in the ramp, so the
current page is distinguished by colour and by not being interactive, which is
truer anyway. No new tokens.

| Pair | Light | Dark |
|---|---|---|
| Link on `surface.canvas` | **4.79:1** | **8.22:1** |
| Link on `surface.base` | **5.01:1** | **6.73:1** |
| Current page on `surface.canvas` | **9.90:1** | **14.48:1** |
| Separator caret *(decorative)* | 4.55:1 | 6.96:1 |

Light-on-canvas at 4.79:1 is the floor — above AA's 4.5:1, with the underline
arriving on hover as the non-colour cue.

## Accessibility

- `<nav aria-label="Breadcrumb">` wrapping an `<ol>` — the landmark plus the
  list is the whole pattern: a screen reader hears "navigation, Breadcrumb,
  list, 3 items", which *is* the depth.
- The current page carries `aria-current="page"` and is not focusable — a link
  to where you already are is a tab stop that does nothing.
- Separators are `aria-hidden` icons; the list order already says "then".
- The crumbs are text-height targets — the pointer-dense exemption. On a
  touch-first screen give the same routes a real back affordance too.

## Don't

- **Don't put the current page in as a link.** The component already renders
  the last item inert; don't route around that with a self-`href`.
- **Don't truncate the middle of a deep trail** — it wraps instead; depth is
  information. If trails are regularly six levels deep, the IA is the problem.
- **Don't use it for the user's history.** That is the back button's job.
- **Don't mix VCP vocabulary into the component** — labels arrive as data;
  status or domain colouring on a crumb belongs to a pattern.

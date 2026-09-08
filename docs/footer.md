# Footer

The page's copyright line: a year and a wordmark, and nothing else.

Read off the Figma `Page_Template` → `Footer` (8 Sep 2026).

## Composed of

Nothing. It is two spans of text.

## Why it is an atom

`docs/inventory.md` filed `PageFooter` under "Page structure" **patterns**. A
pattern is two or more components composed into a page section (CLAUDE.md), and
this composes none — the Figma component's entire subtree is a `Year` text and a
`Text` beside it. Corrected when it was built.

If it ever grows links, a language switcher or a status indicator, it earns the
promotion. It has not.

## When to use

| Use | For |
|---|---|
| `Footer` | The copyright line at the bottom of a page |
| `AppShell` | You probably want this instead — it places `Footer` for you |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `year` | `number` | current year | Pass one to pin it in a test or a story |
| `owner` | `string` | `'© Valuechainplus'` | The design's own wording |

**The year is computed, not hardcoded.** A copyright line that silently goes
stale is worse than one that is obviously generated — and the export shipped
`2026 © Valuechainplus` as a literal default string.

## Measurements

72 tall, content inset 24 from the left, `body-md` on `text.tertiary`. The band
is left-aligned; the export centred it.

## Accessibility

- Renders a real `<footer>` landmark, so it can be jumped to and skipped.
- No links, so no focus order to think about. If links are added, they get the
  same focus ring as everything else and this note stops being true.

## Don't

- **Don't hardcode the year.** That is the one thing this component exists to
  prevent.
- **Don't put navigation in it** — that is a different component, and it would
  make this a pattern.
- **Don't place it yourself inside `AppShell`** — the shell already ends with it.

# Spinner

An indeterminate loading indicator: a ring that turns for as long as the wait
lasts, optionally with a visible label.

## When to use — Spinner vs Skeleton vs progress bar

| Situation | Reach for | Why |
|---|---|---|
| A short, local wait inside a control — a button saving, an inline action | **`Spinner`** (`sm`, `decorative`) | The control is already the subject. A placeholder would replace something the user is looking at |
| A wait whose length you cannot predict, in a region whose layout you don't know yet | **`Spinner`** (`md`/`lg`, centred) | Nothing sensible to draw a placeholder of |
| A region whose **shape you already know** — a list of rows, a card, a paragraph | **`Skeleton`** | It reserves the layout, so nothing jumps when the data lands. Perceived as faster than a spinner |
| Work with a **real, known percentage** — an upload, a multi-step import, a file conversion | A determinate progress bar (`ProgressBar` — not yet in the system) | If you can say "60%", say it. A spinner throws that information away |
| A wait under roughly 300ms | **Nothing** | An indicator that flashes and vanishes is noise. Delay showing the spinner instead |
| A whole page's first load | **`Skeleton`**, or the page shell | A single spinner on an empty page tells the user nothing about what is coming |

`role="progressbar"` is for *determinate* progress and is **wrong here** — the
role promises `aria-valuenow`, and this component has no value to give. The
component renders `role="status"`. See Accessibility.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `sm \| md \| lg` | `md` | 16 / 20 / 24. `sm` inside a control, `md` inline, `lg` in a panel |
| `label` | `string` | `'Loading'` | The accessible name, always. Also the visible text when `showLabel`. Override it when the wait has a better name ("Saving your changes") |
| `showLabel` | `boolean` | `false` | Paints `label` beside the ring |
| `decorative` | `boolean` | `false` | Renders silently: no `role`, `aria-hidden` on the whole element. For use inside a control that already announces its own state |
| `className` | `string` | — | Merged via `cn()` onto the root. **This is where colour goes** — `className="text-text-tertiary"` |
| `ref` | `Ref<HTMLSpanElement>` | — | Points at the root `<span>`, not the `<svg>` |

Everything else (`id`, `data-*`, `aria-describedby`, …) is forwarded to the root.
There is no `style` prop — use token utilities through `className`.

`decorative` and `showLabel` together paint the text but hide the whole element
from assistive tech. That is only correct when the surrounding control already
says what is happening.

## Tokens

| Part | Token | Utility |
|---|---|---|
| Ring colour | — (`currentColor`) | Set by the caller: `text-text-tertiary`, `text-text-link-default`, … |
| Track (the dimmed full ring) | — (`currentColor` at 25%) | `opacity-25` |
| Size `sm` / `md` / `lg` | Tailwind numeric scale | `size-4` / `size-5` / `size-6` |
| Ring thickness | — (viewBox units) | Derived as `48 / renderedSize` → `3` / `2.4` / `2`, so the ring keeps the same optical weight at every size |
| Gap to the label | Tailwind numeric scale | `gap-2` (8) |
| Label type | `type.label.md` | `text-label-md` |
| Label colour | — (`currentColor`) | Inherited, so the ring and its caption always match |
| Spin | Tailwind default keyframes | `animate-spin`, `motion-reduce:animate-pulse` |

**Colour is never set here.** The ring and the caption are both drawn in
`currentColor`, exactly as `Icon` does it, so the caller picks the colour with a
text token on the parent and the dark theme follows for free. That is also why
`Button`'s existing inline spinner can be replaced by this one without changing
how it looks: it already inherits the button's own content colour.

## Accessibility

- **`role="status"`, never `role="progressbar"`.** `status` is a polite live
  region: it is reported when it appears, without moving focus and without
  interrupting. `progressbar` is the role for *determinate* progress — it commits
  to `aria-valuenow`/`aria-valuemin`/`aria-valuemax`, and a spinner has no value.
  A `progressbar` with no value is announced as an empty, meaningless control.
- **The name lives in the DOM, not in an attribute.** A live region is announced
  from its *contents*; an empty region carrying only `aria-label` is silent in
  several screen readers. So the label text is always rendered — as `sr-only`
  text when `showLabel` is `false`. This is the reason a hand-rolled
  `<div role="status" aria-label="Loading" />` so often announces nothing.
- **There is always a name.** `label` defaults to `'Loading'`. A spinner with no
  accessible name at all is invisible to a screen reader — the user is told
  nothing, and then content appears out of nowhere.
- **Inside a control that already announces, render it silently.** `Button` sets
  `aria-busy` on itself when `loading`, so the button's own state is already
  reported. A `role="status"` spinner in its label would announce the same fact a
  second time. Pass `decorative` for that case:
  `<Spinner size="sm" decorative />`. The same applies inside any element you have
  given `aria-busy`, and inside a region you are already announcing yourself.
- **`prefers-reduced-motion` slows nothing to a stop.** The rotation is swapped
  for a pulse, not removed. The setting asks for no large or vestibular motion,
  and continuous rotation is exactly that; a small opacity fade is not. Stopping
  the indicator dead is the wrong fix — a frozen spinner reads as a hang, which is
  worse than showing nothing. (`Skeleton` *does* drop its pulse under the same
  setting, and that is consistent: a skeleton fading across a whole block is a
  large luminance change, and a static skeleton still reads as a placeholder.
  A static spinner does not read as anything.)
- **Contrast.** The ring inherits `currentColor`, so its contrast is the caller's
  choice. It is a non-text graphic that carries meaning, so 1.4.11 asks 3:1
  against the surface behind it: `text.tertiary` and darker all clear that in both
  themes; `text.subtle` is 4.76:1 on `surface.elevated`. Note that the *track* is
  drawn at 25% opacity and deliberately does not — it is a groove, not the
  indicator, and the moving arc is what carries the meaning.
- **The spinner never takes focus.** It is a `<span>` with no tabindex. If the
  content it is standing in for will replace focused content, manage focus in the
  caller.

## Don't

- Don't hardcode colors or sizes. `className="text-[#1a56db]"` or `size={20}` is a
  bug — set the colour with a text token and pick a `size` variant.
- Don't use `role="progressbar"`, and don't wrap this in one. If you know the
  percentage, you want a progress bar, not a spinner.
- Don't ship a spinner with no accessible name, and don't set `label=""` to "keep
  it quiet" — use `decorative` for that, so the intent is on the page.
- Don't put a non-decorative spinner inside a `Button` or any `aria-busy` control.
  Two announcements of one wait is worse than one.
- Don't stop the animation under `prefers-reduced-motion`. A frozen spinner is
  indistinguishable from a crash.
- Don't use a spinner where the layout is already known — that is `Skeleton`'s job,
  and it prevents the jump when content lands.
- Don't flash one for a sub-300ms wait. Delay it, or don't show it.
- Don't scatter several spinners across one screen for one wait. One indicator per
  region that is actually loading.

# Skeleton

A content placeholder shown while data loads. It holds the *shape* of the content
that is about to arrive — a block, a circle where an avatar will be, `n` lines
where a paragraph will be — so nothing jumps when the data lands.

## When to use which

| Use | When | Why |
|---|---|---|
| `Skeleton` | The layout is known in advance and the wait is > ~300ms — a page, a list, a card, a table body | Reserves the space, so the content lands without a reflow |
| Spinner (`Button loading`, an inline spinner) | The wait is short, local, or the result has no predictable shape — saving a form, a background action | A skeleton for a 200ms wait is a flash of noise |
| Neither | The wait is under ~150ms | Anything shown and hidden that fast reads as a glitch |

A skeleton is a promise about the layout. If the real content will not have that
shape, do not draw it — a wrong skeleton is worse than a spinner, because the
page visibly rearranges itself the moment it resolves.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `lines` | `number` | — | Render N stacked rows, last one short. Omit for a single block |
| `textStyle` | `title-sm \| body-lg \| body-md \| body-sm \| label-lg \| label-md \| label-sm \| caption-md \| caption-sm` | `body-md` | Which ramp step the lines stand in for. Drives the row and bar heights |
| `circle` | `boolean` | `false` | Squares the block with `width` and rounds it to `shape.radius.pill` — avatars. Defaults to `size-10` (40) when no `width` is given |
| `radius` | `sm \| md \| pill` | `sm` | Maps onto `shape.radius.*`. Ignored when `circle` is set |
| `width` | `number \| string` | full width of the parent | Free value — see "Numbers vs tokens" below. Numbers are pixels |
| `height` | `number \| string` | from `textStyle` | Free value. Leave it off for text placeholders so the ramp drives the height |
| `className` | `string` | — | Merged onto the root via `cn()` |
| `ref` | `Ref<HTMLSpanElement>` | — | Points at the root `<span>` |

Everything else (`id`, `style`, `data-*`, …) is forwarded to the root. `children`
is removed from the type — a skeleton has no content by definition.

### Numbers vs tokens

`width` and `height` stay a free `number | string`, and that is deliberate. A
placeholder's job is to match content whose size the token scale does not and
should not know: a chart that is 340 wide, a thumbnail at the aspect ratio the
CMS returned, a column at `calc(100% - 3rem)`. Constraining those to a token
scale would just push callers into `className="h-[160px]"`, which is the thing
the lint rule exists to stop.

`radius` does **not** get that freedom. Corner radius is a system decision, not a
content one — every corner in VCP is `shape.radius.sm`, `md`, or `pill`. So
`radius` is a three-value union that maps straight onto those tokens, and the
source component's raw `radius={6}` becomes `radius="sm"` (which *is* 6).

### How `lines` derives from the type ramp

A line of real text occupies its full `line-height`; the glyphs inside occupy
only the `font-size`, with the leading split above and below. A skeleton line
copies that exactly:

| Part | Value | Comes from |
|---|---|---|
| Row height | the ramp step's `line-height` | `h-(--text-<step>--line-height)` |
| Bar height inside the row | the ramp step's `font-size` | `h-(--text-<step>)` |
| Space between bars | the leading, i.e. `line-height − font-size` | falls out of the two above — there is no `gap` utility |

Both variables are emitted into `dist/theme.css` from `tokens/semantic/type.json`,
so three `body-md` lines occupy precisely the height of three lines of body-md
copy and the swap to real text moves nothing. No number appears anywhere in the
component.

Only the ramp steps with an **absolute** `line-height` are offered. `display-*`
and `heading-*` carry unitless line-heights (`1.1`, `1.25`, …), which cannot be
used as a CSS length, so they cannot drive a row height — and a heading
placeholder is a single block with an explicit `height` anyway, not a paragraph.

## Tokens

| Part | Token | Utility |
|---|---|---|
| Fill | `surface.neutral.medium` | `bg-surface-neutral-medium` |
| Radius, default | `shape.radius.sm` | `rounded-sm` |
| Radius, blocks and cards | `shape.radius.md` | `rounded-md` |
| Radius, `circle` | `shape.radius.pill` | `rounded-pill` |
| Row height | `type.<step>.lineHeight` | `h-(--text-<step>--line-height)` |
| Bar height | `type.<step>.fontSize` | `h-(--text-<step>)` |

### Why `surface.neutral.medium` and not `subtle`

The fill has to read as a placeholder on **both** `surface.base` (white) and
`surface.canvas` (slate-50), because skeletons appear directly on the page as
often as inside a card:

| Step | vs `surface.base` | vs `surface.canvas` | |
|---|---|---|---|
| `neutral.faint` | 1.05:1 | 1.00:1 | Invisible on canvas |
| `neutral.subtle` | 1.10:1 | 1.05:1 | Effectively invisible on canvas |
| **`neutral.medium`** | **1.48:1** | **1.42:1** | Reads on both. Chosen |
| `neutral.strong` | 4.76:1 | 4.55:1 | Reads as *content*, not as a gap |

`neutral.subtle` is the instinctive pick and it is wrong here: on any page using
the canvas it is a 1.05:1 difference, which is not visible. The dark theme
overrides the same token to slate-500 (3.07:1 on base, 3.75:1 on canvas) — a
little louder than in light, which is right, because dark surfaces need more
separation to read as an absence.

**Token gap:** the light `surface.neutral` ramp jumps slate-100 → slate-300 with
no step between. A dedicated `surface.placeholder` (slate-200, ≈1.20:1 on base)
would sit better in light, but no such token exists and inventing one for a
single component is not worth a minor bump. `neutral.medium` is the closest
existing step and is used unchanged.

## Accessibility

- **The skeleton is decorative and always `aria-hidden="true"`.** It has no role
  and no name. A screen reader must never hear "image image image" while a list
  loads — the shape carries no information a non-sighted user needs.

- **Therefore the loading state must be announced by the container.** This is the
  part that is almost always missed, and getting it wrong means a screen-reader
  user hears *nothing at all* during the wait. The correct pattern:

  ```tsx
  <div aria-live="polite" aria-busy={loading}>
    {loading ? (
      <>
        <span className="sr-only">Loading activity…</span>
        <Skeleton lines={3} />
      </>
    ) : (
      <ActivityList items={items} />
    )}
  </div>
  ```

  Three things make it work, and all three are required:
  1. `aria-live="polite"` on the **container that persists across both states**,
     so the region is already registered when the content swaps in. A live region
     mounted at the same moment as its content announces nothing.
  2. `aria-busy={loading}`, so assistive tech knows the region is mid-update and
     does not read a half-built subtree.
  3. A visually hidden message *inside* the region while loading. Without it the
     region is empty of readable text and the busy state is silent.

  On resolve, the real content replaces both and the live region announces it.
  `polite`, never `assertive` — a load is not an interruption.

  See the "Announcing the load (live region)" story, which does exactly this.

- **`prefers-reduced-motion` is respected.** The pulse is dropped entirely under
  `motion-reduce` and the block falls back to a flat `surface.neutral.medium`
  fill. A large, slowly pulsing rectangle is a genuine vestibular trigger, and at
  skeleton sizes it covers a lot of the viewport. The static fill still reads as
  a placeholder, so nothing is lost.

- **Contrast rules do not apply to it.** It is not text and not a UI boundary, so
  neither 4.5:1 nor 3:1 is the target. The number that matters is that it is
  *distinguishable from the surface* without reading as content — which is the
  1.4:1-ish band `neutral.medium` sits in.

- **It takes no focus.** There is nothing interactive inside it, and the real
  content's focus order is unaffected when it swaps in. If the user was focused
  on something inside the region before it swapped, move focus deliberately —
  the component cannot do that for you.

## Don't

- Don't hardcode colors or spacing. `className="bg-[#e2e8f0]"` is a bug — add a
  token instead.
- **Don't render a skeleton without a live region around it.** On its own it is
  silent. This is the single most common mistake with this component.
- Don't put `role="status"`, `aria-label`, or `aria-live` on the Skeleton itself.
  The live region belongs on the container that survives the swap; the skeleton
  is unmounted at exactly the moment the announcement needs to happen.
- Don't draw a skeleton that doesn't match what will actually load. If you can't
  predict the shape, use a spinner.
- Don't use it for waits under ~150ms — the flash is worse than the wait.
- Don't set an explicit `height` on `lines` mode to "tidy up" the spacing. The
  ramp-derived heights are what stop the layout shifting; overriding them
  reintroduces the jump.
- Don't nest interactive content inside it, or wrap real content in it. Anything
  inside an `aria-hidden` subtree is invisible to assistive tech and unreachable
  by keyboard.
- Don't animate it faster to feel "snappier". The pulse is Tailwind's `animate-pulse`
  timing, shared with every other pulsing surface in the system.

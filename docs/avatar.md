# Avatar

A person, as a photo or as their initials, on a tone hashed from their name.

## When to use which size

| Size | Diameter | Use for | Notes |
|---|---|---|---|
| `sm` | 24 | Dense table rows, inline beside body text, a `sm` `AvatarGroup` | Never a control at this size |
| `md` | 32 | The default — comment threads, list rows, card headers | The export's own default size |
| `lg` | 40 | Profile headers, account menus, anything the user can press | The only size that meets the 40 minimum target |

Reach for something else when:

| Instead of | Use | Because |
|---|---|---|
| An avatar to show a status | `Badge` | An avatar identifies a person; it never carries state |
| An avatar per person in a long list | `AvatarGroup` | A stack of five beats a wrapped row of twenty |
| An avatar as a button | `Button` wrapping an `Avatar` at `lg` | Avatar takes no focus and fires no events of its own |
| An avatar for a company or a file | An `Icon`, or a `Badge` | The initials logic assumes a person's name |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `name` | `string` | `''` | Drives both the initials and the tone. Not rendered as text |
| `initials` | `string` | — | Overrides the derived initials — mononyms, team codes |
| `src` | `string` | — | Photo URL. On a load failure the initials are drawn instead |
| `size` | `sm \| md \| lg` | `md` | 24 / 32 / 40. **Not a number** — see "Deviations" |
| `tone` | `blue \| green \| red \| yellow` | hashed from `name` | Pin the tone. Rarely needed |
| `ring` | `boolean` | `false` | `surface.elevated` ring, for overlapping stacks. `AvatarGroup` sets it |
| `standalone` | `boolean` | `false` | The avatar is the only identification of this person — give it a real accessible name |
| `label` | `string` | — | Overrides what is announced, and implies `standalone` |
| `className` | `string` | — | Merged onto the circle via `cn()` |
| `ref` | `Ref<HTMLSpanElement>` | — | Points at the circle |

Everything else (`id`, `onClick`, `data-*`, …) is forwarded to the root `<span>`.

Two helpers ship alongside, for callers that need the same answer the component
reached: `toneForName(name)` and `initialsForName(name)`.

## Tokens

Each tone is one hue-named `accent.*` family: a `faint` surface with `stronger`
content. Both halves flip under `.dark`, so the pairing — and its ratio — survives
the theme change.

| Tone | Surface token | Content token | Contrast, light | Contrast, dark |
|---|---|---|---|---|
| `blue` | `accent.blue.faint` | `accent.blue.stronger` | **8.50:1** | **7.23:1** |
| `green` | `accent.green.faint` | `accent.green.stronger` | **8.24:1** | **4.50:1** ⚠ |
| `red` | `accent.red.faint` | `accent.red.stronger` | **8.22:1** | **6.85:1** |
| `yellow` | `accent.yellow.faint` | `accent.yellow.stronger` | **8.07:1** | **6.37:1** |

Initials are text and owe 4.5:1, so every figure above is measured, not assumed.

⚠ **`green` in dark is 4.5030:1 — it passes AA with no headroom.** The cause is a
token bug, not a design choice: `color.green.800` and `color.green.700` are both
`#008236` in `tokens/core/color.json`, so `accent.green.faint` cannot get any
darker in dark mode. Give `green.800` its own darker value and this tone moves
back in line with the other three. Until then, do not lighten
`accent.green.stronger`.

The rest:

| Part | Token | Utility |
|---|---|---|
| Ring, in a stack | `surface.elevated` | `ring-2 ring-surface-elevated` |
| Radius | `shape.radius.pill` | `rounded-pill` |
| Initials, `sm` | `type.label-sm` | `text-label-sm` |
| Initials, `md` | `type.label-md` | `text-label-md` |
| Initials, `lg` | `type.label-lg` | `text-label-lg` |
| Placeholder glyph | inherits the tone's content token | `Icon name="user"` on `currentColor` |

**Token gaps.** The export hashed onto six pastels; this system has four accent
hue families, so the palette is four tones wide. Adding `accent.purple.*` and
`accent.teal.*` (the two hues the export had that VCP does not) would restore the
export's spread — `color.teal-legacy.*` exists but is a legacy ramp with no
semantic layer, so it is not a substitute. Nothing was invented here.

## Accessibility

- **Decorative by default.** Most avatars sit beside a visible name, and reading
  the name twice is noise, so the default is `aria-hidden`. This matches `Icon`,
  which is decorative unless it is given a `label`.
- **`standalone` when it stands alone.** If the avatar is the only thing that
  identifies the person — an assignee cell with no text, a comment gutter — set
  `standalone` and it gets a real accessible name from `name`. With a photo the
  name goes on the `<img alt>`; with initials the circle becomes `role="img"` with
  an `aria-label`. `standalone` with no `name` announces nothing: there is nothing
  to say, so it stays decorative.
- **`alt` is the person, or empty.** Never "avatar", "profile photo" or "user
  image" — those describe the picture, not who it is, and a screen reader user
  already knows it is an image.
- **A failed image falls back to initials**, never to a broken-image glyph. The
  failure is tracked per URL, so changing `src` retries rather than sticking.
- **No `title` tooltip.** The export set `title={name}`. A `title` is hover-only,
  unreachable by keyboard, invisible on touch, and inconsistently announced. If
  the name matters, render it or use `standalone`.
- **Contrast.** See the table above: 8.07:1 – 8.50:1 in light, 4.50:1 – 7.23:1 in
  dark. The `ring` is decoration between two avatars, not a boundary that carries
  meaning, so 1.4.11's 3:1 does not apply to it.
- **Target size.** Avatar is not a control and takes no focus, so the 40 minimum
  does not apply. If you wrap one in a `Button` or an `<a>`, use `lg` — it is 40.

## Don't

- Don't hardcode the circle. `className="size-[36px] bg-[#8bb7f7]"` is a bug — use
  a `size` step and a `tone`.
- Don't use the tone to mean something. It is a hash of the name; `red` is not
  "blocked" and `green` is not "approved". That is `Badge`, or the `StatusPill`
  pattern.
- Don't set `standalone` on an avatar that already sits beside the person's name —
  a screen reader then reads the name twice.
- Don't write `alt`-style text into `label` ("photo of Ali"). `label` is the
  person, optionally qualified: `"Ali Rahman, owner"`.
- Don't rely on the tone to tell two people apart — four tones over any real team
  means collisions. The initials and the name do that work.
- Don't put an `onClick` on the avatar itself and call it a button. Wrap it in a
  real control, at `lg`.
- Don't pass a number to `size`.

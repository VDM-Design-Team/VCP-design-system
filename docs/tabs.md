# Tabs

Moves between sibling panels of content that sit under one heading.

## When to use

| Situation | Use | Why |
|---|---|---|
| Sibling sections of one record (Overview / Activity / Files) | **Tabs** | Each option owns its own panel |
| Same content, different shape (List / Board / Calendar) | `SegmentedControl` | Nothing is being replaced, only re-drawn |
| Moving to a different page or route | `Sidebar` / `Breadcrumb` | Tabs imply you stay in place |
| More than about seven sections | A sidebar or a Select | The bar starts to scroll and stops being scannable |
| Steps that must be done in order | `Stepper` | Tabs are freely re-orderable by the user |

## Rendering the panels

`Tabs` renders the bar only. A bar on its own is not an accessible tab set —
a screen reader will announce a tab that controls nothing. Pair every tab with a
panel using the two id helpers:

```tsx
const prefix = 'deliverable';
const [value, setValue] = useState('overview');

<Tabs idPrefix={prefix} value={value} onChange={setValue} aria-label="Deliverable sections"
      tabs={[{ key: 'overview', label: 'Overview' }, { key: 'files', label: 'Files', count: 12 }]} />

{sections.map(({ key, content }) => (
  <div key={key} role="tabpanel" tabIndex={0}
       id={tabPanelId(prefix, key)}
       aria-labelledby={tabId(prefix, key)}
       hidden={key !== value}>
    {content}
  </div>
))}
```

The `WithPanels` story is this pattern, ready to copy.

`aria-controls` is only emitted when you pass `idPrefix`. Without it the tabs
carry no `aria-controls` at all, which is deliberate: a tab pointing at a panel
id that isn't on the page is a broken reference, and axe reports it as critical.
Opting in this way means a bar rendered on its own is merely incomplete, not wrong.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `tabs` | `Array<string \| TabItem>` | — | A bare string is shorthand for `{ key, label }` |
| `value` | `string` | — | Controlled selection |
| `defaultValue` | `string` | first enabled tab | Uncontrolled starting selection |
| `onChange` | `(key: string) => void` | — | Fires on click and on arrow-key movement |
| `size` | `sm \| md` | `md` | `sm` only where a pointer is guaranteed — see Accessibility |
| `fullWidth` | `boolean` | `false` | Tabs share the container width evenly |
| `idPrefix` | `string` | — | Pass it when you render panels; turns on `aria-controls` |
| `aria-label` | `string` | — | Required unless you pass `aria-labelledby` |

`TabItem` is `{ key, label, count?, countLabel?, disabled? }`.
`count` renders a pill after the label — `0` renders, `undefined` doesn't.
`countLabel` is what a screen reader hears instead of the bare number
("12 deliverables" rather than "Files 12").

## Tokens

| Part | Token |
|---|---|
| Bar rule | `stroke.subtle` at 1px |
| Selected label and underline | `action.secondary.content.default` |
| Unselected label | `text.tertiary` → `text.primary` on hover |
| Disabled label | `text.disabled` |
| Count pill, unselected | `surface.neutral.subtle` + `text.tertiary` |
| Count pill, selected | `surface.brand.faint` + `action.secondary.content.default` |
| Count type | `type.caption-sm` (Inter — dense numerics) |
| Focus ring | `stroke.focused` at 2px, 2px offset |

No new tokens were added for this component.

## Accessibility

- **Roving tab stop.** The bar is one stop in the tab order. `←` and `→` move
  between tabs, `Home` and `End` jump to the ends, and disabled tabs are skipped.
  `Tab` from the bar lands on the open panel, which is why the panel takes
  `tabIndex={0}`.
- **Activation follows focus** — arrowing to a tab opens it. This is the right
  default for panels that are already rendered. If a panel becomes expensive to
  load, switch that instance to manual activation, or the user will trigger every
  panel on the way past.
- **Target size.** A `md` tab is 40px tall, meeting the 40px minimum. `sm` is
  32px — pointer contexts only.
- **The selected state is not colour alone.** A 2px underline anchors the selected
  tab to its panel, and it survives a greyscale check. (The label weight does *not*
  change between states — `type.label-lg` carries weight 500 as part of the token,
  and the ramp has no 500/400 pair at 13px or 11px, so a weight shift can't be done
  consistently across sizes without a new token.)
- **Contrast, light / dark:** selected label and underline 6.2:1 / 6.3:1,
  unselected label 7.6:1 / 9.9:1, selected count pill 5.3:1 / 5.7:1, unselected
  count pill 6.9:1 / 7.0:1. All clear their thresholds.
- The bar's bottom rule (`stroke.subtle`, 1.2:1) is decorative — it separates,
  it does not indicate state, so 1.4.11 does not apply to it. The underline is
  the indicator and it passes.
- **Dark-theme focus ring is currently below 3:1** (`stroke.focused` was not
  inverted for dark). This affects every component including Button and is
  tracked separately — it is not specific to this control.

## Don't

- Don't ship the bar without panels, or without `aria-label`.
- Don't pass `idPrefix` unless you are actually rendering panels with those ids.
- Don't use tabs for navigation between routes — the browser back button will lie.
- Don't nest a second row of tabs inside a panel. Restructure the page instead.
- Don't put a count on a tab whose number isn't worth acting on; it's an alarm, not decoration.
- Don't hardcode colours or spacing. `className="border-b-[#1a56db]"` is a bug — add a token instead.

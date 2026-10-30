# NotificationBell *(component)*

The bell that opens notifications, with the red dot that says something is
unread. It was inline in `TopBar`; it is its own piece because the notification
popover and the inbox page open from it too.

Read off Figma's `Notification_Bell_Button` (`2792:4436`): a bell and a critical
dot on its top-right shoulder, the dot pulsing (`_Notification_Bell_Dot`,
Start → End).

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `IconButton` | atom | The bell itself: the button, its focus ring, its 40 target and its required name |

## When to use

| Use | For |
|---|---|
| `NotificationBell` | The one control that opens notifications: in the `TopBar`, or anywhere a popover opens from a bell |
| `IconButton` | Any other icon-only action. The bell is `IconButton` plus the unread dot |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `count` | `number` | `0` | How many are unread. `0` draws no dot |
| `label` | `string` | `Notifications` / `Notifications, N unread` | The accessible name. Used as given when you pass it, so say the count yourself when you localise |
| `className` | `string` | — | On the wrapper, which positions the dot |
| `ref`, rest | | | On the `<button>`. `Menu` and `Popover` clone their trigger and wire `aria-expanded` and the click onto it, so every prop is passed through |

## Tokens

The glyph is `neutral.outline.content` (default, hover, pressed), with
`surface.neutral.subtle` on hover and `surface.neutral.medium` pressed. A
brand-blue bell read as a call to action, so it is neutral, as the design draws
it. The dot is `accent.critical.filled.surface.default` (a filled shape, so a surface
token, not the outline border), 10 wide on this 20 glyph (Figma's 12 is for its
24), 2 above and level with the glyph's right edge. It is 4.8:1 on the bar in
light and 3.7:1 in dark. Its pulse is three 1.5s cycles (4.5s, under WCAG 2.2.2's
5s), then the dot stays still; it is keyed on the count, so a new notification
pulses again. No new tokens.

Figma draws the bell's glyph in `neutral.filled.surface` (default, hover, pressed),
one step lighter than the `neutral.outline.content` steps used here, and with no
hover fill. The difference is deliberate and recorded in review of the TopBar.

## Accessibility

- A real `<button>`, named "Notifications", or "Notifications, 3 unread" when
  there are some. The count lives in the **name**; the dot and its pulse are
  `aria-hidden`, so neither colour nor motion carries it alone.
- 40 target, the system focus ring.
- The pulse stops by itself after three cycles (WCAG 2.2.2: motion that starts on
  its own must not run past 5s without a way to stop it).
- `prefers-reduced-motion`: the pulse is removed and the dot stays.

## Don't

- **Don't show a number on the dot.** The design draws a dot; the count belongs
  in the name, where a screen reader reads it.
- **Don't rebuild the bell inline** with an `IconButton` and your own dot. Two
  bells with two dots drift apart.
- **Don't recolour it brand blue.** It is a status control, not a call to action.

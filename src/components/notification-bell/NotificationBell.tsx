import * as React from 'react';
import { cn } from '../../lib/cn';
import { IconButton, type IconButtonProps } from '../../atoms/icon-button';

/**
 * NotificationBell — the bell that opens notifications, with the red dot that
 * says something is unread.
 *
 * Read off Figma's `Notification_Bell_Button` (`2792:4436`): a bell and a 12
 * critical dot on its top-right shoulder, with a pulse on the dot
 * (`_Notification_Bell_Dot`, Start → End). It was inline in `TopBar`; it is a
 * piece of its own because the popover and the inbox page open from it too.
 *
 * It is a real button, an `IconButton` underneath, so the focus ring, the 40
 * target and the required name are the system's. The count is in the button's
 * **name** ("Notifications, 3 unread"); the dot and its pulse are decoration,
 * so colour and motion never carry it alone. `Menu` and `Popover` clone their
 * trigger and wire `aria-expanded` and the click onto it, so everything is
 * passed through to the button.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface NotificationBellProps
  extends Omit<IconButtonProps, 'icon' | 'label' | 'variant' | 'size' | 'shape' | 'className'> {
  /** How many are unread. `0` (the default) draws no dot. */
  count?: number;
  /**
   * The accessible name. Defaults to "Notifications", or "Notifications, N
   * unread" when there are some. Pass your own to localise it — it is used as
   * given, so say the count yourself.
   */
  label?: string;
  /** Merged onto the wrapper, which is what positions the dot. */
  className?: string;
}

export const NotificationBell = React.forwardRef<HTMLButtonElement, NotificationBellProps>(
  function NotificationBell({ count = 0, label, className, ...props }, ref) {
    const unread = count > 0;
    const name = label ?? (unread ? `Notifications, ${count} unread` : 'Notifications');

    return (
      <span className={cn('relative inline-flex', className)}>
        <IconButton
          ref={ref}
          variant="tertiary"
          icon="bell"
          label={name}
          className={cn(
            /* Neutral, as the design draws the bell: a brand-blue bell read as a
               call to action. The `neutral.outline` content steps, the same
               family the toolbar buttons use. */
            'text-neutral-outline-content-default',
            'hover:bg-surface-neutral-subtle hover:text-neutral-outline-content-hover',
            'active:bg-surface-neutral-medium active:text-neutral-outline-content-pressed',
          )}
          {...props}
        />
        {unread && (
          /* The design's red dot, 10 on this 20 glyph (Figma's 12 is for its 24),
             critical, level with the glyph's right edge and 2 above its top, with
             a slow pulse behind it — a 2.5s cycle, so the flashes are spaced well
             apart. Reduced motion keeps the dot and drops the pulse. */
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-1.25 top-0.75 size-2.5"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-accent-critical-outline-border-default opacity-60 [animation-duration:2.5s] motion-reduce:hidden" />
            <span className="absolute inset-0 rounded-full bg-accent-critical-outline-border-default" />
          </span>
        )}
      </span>
    );
  },
);
NotificationBell.displayName = 'NotificationBell';

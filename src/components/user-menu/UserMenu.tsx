import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { Icon } from '../../atoms/icon';
import { Menu, type MenuProps } from '../menu';

/**
 * UserMenu — the signed-in person and the menu behind them: their avatar and
 * name with a caret, opening a `Menu` of account links (My Added Values,
 * Settings, Cycle Settings, Logout).
 *
 * Built to Figma's `User_Menu` (`2303:1715`; its trigger is `_User menu`,
 * `2303:739`). The trigger is the look `TopBar`'s user chip already had after
 * design review — a 32 avatar, the name in `label-sm-medium`, a `caret-down` —
 * moved here so the bar and anything else that needs it share one piece. The
 * menu is the system's `Menu` (its surface, rows and keyboard model), not
 * Figma's raw 192-wide white box with regular black text.
 *
 * **The default menu is just Settings and Logout.** Pass `items` (as `Menu` takes
 * them) for anything else — My Added Values, Cycle Settings, a divider — since
 * what "Logout" does, and which links an admin sees that a regular user does
 * not, are the page's. This renders the trigger and the menu and reports
 * `onSelect(key)`.
 *
 * The caret turns up while the menu is open, as `SearchSelect`'s does. It reads
 * `aria-expanded`, which `Menu` sets on the trigger, so there is no state of its
 * own to keep in step; the turn is skipped under `prefers-reduced-motion`.
 *
 * It hugs its content: the trigger is as tall as its avatar and name, however
 * tall a flex parent is (a bare `Popover` wrapper is `inline-flex`, so its child
 * would stretch).
 *
 * The trigger is a real `<button>` named "<name>, account menu"; `Menu` adds
 * `aria-haspopup="menu"` and `aria-expanded` and moves focus into the list on
 * open and back on close.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface UserMenuUser {
  /** What the trigger says: "Francis M." */
  name: string;
  /** A photo. Without one the avatar shows initials. */
  src?: string;
}

/** What the menu holds unless you pass `items`. */
export const DEFAULT_USER_MENU_ITEMS: NonNullable<MenuProps['items']> = [
  { key: 'settings', label: 'Settings' },
  { key: 'logout', label: 'Logout' },
];

export interface UserMenuProps extends Omit<MenuProps, 'trigger' | 'items' | 'onSelect'> {
  user: UserMenuUser;
  /** The menu's rows, as `Menu` takes them. Defaults to Settings and Logout. */
  items?: NonNullable<MenuProps['items']>;
  /** Fires with the activated item's `key`, after that item's own `onClick`. */
  onSelect?: MenuProps['onSelect'];
}

/* The one place the chip is drawn: a 32 avatar and the name, 8 apart, 8 of padding at the sides and 4
   above and below (as `TopBar`'s chip has after design review). `UserMenuTrigger` and `UserChip` both
   come from here, so a change to the look is made once. */
const CHIP = 'flex items-center gap-2 rounded-md px-2 py-1 text-left font-sans';

function Face({ user }: { user: UserMenuUser }) {
  return (
    <>
      <Avatar name={user.name} src={user.src} size="md" />
      <span className="max-w-40 truncate text-label-sm-medium text-text-primary">{user.name}</span>
    </>
  );
}

export interface UserMenuTriggerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  user: UserMenuUser;
}

/**
 * The chip as a button: avatar, name and a caret. It is `UserMenu`'s trigger, and what `TopBar`
 * draws when the app opens its own menu (`onUserMenu`). It forwards its ref and every prop to the
 * `<button>`, so `Menu` can wire `aria-expanded` and the open keys onto it; the caret turns up
 * with `aria-expanded`.
 */
export const UserMenuTrigger = React.forwardRef<HTMLButtonElement, UserMenuTriggerProps>(
  function UserMenuTrigger({ user, className, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={`${user.name}, account menu`}
        className={cn(
          'group self-start transition-colors',
          CHIP,
          'hover:bg-surface-neutral-faint',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
          className,
        )}
        {...props}
      >
        <Face user={user} />
        <Icon
          name="caret-down"
          size="sm"
          aria-hidden="true"
          /* -mr-0.75: the glyph draws about 3 inside its 16 box, so pulling the box 3 into the
             padding makes the caret's gap to the edge match the avatar's. */
          className="-mr-0.75 text-text-tertiary transition-transform group-aria-expanded:rotate-180 motion-reduce:transition-none"
        />
      </button>
    );
  },
);

/** The same chip when it opens nothing: no button, no caret, nothing to press. */
export function UserChip({ user, className }: { user: UserMenuUser; className?: string }) {
  return (
    <span className={cn(CHIP, className)}>
      <Face user={user} />
    </span>
  );
}

export const UserMenu = React.forwardRef<HTMLDivElement, UserMenuProps>(function UserMenu(
  { user, items = DEFAULT_USER_MENU_ITEMS, onSelect, align = 'right', className, ...props },
  ref,
) {
  return (
    <Menu
      ref={ref}
      items={items}
      onSelect={onSelect}
      align={align}
      className={cn('self-start', className)}
      trigger={<UserMenuTrigger user={user} />}
      {...props}
    />
  );
});
UserMenu.displayName = 'UserMenu';

import * as React from 'react';
import { cn } from '../../lib/cn';
import { Logo } from '../../atoms/logo';
import { Toggle } from '../../atoms/toggle';
import { Divider } from '../../atoms/divider';
import type { MenuItem } from '../../components/menu';
import { NotificationBell } from '../../components/notification-bell';
import { UserChip, UserMenu, UserMenuTrigger } from '../../components/user-menu';

/**
 * TopBar — the app bar, matching the Figma `Top_NavBar` component set and its
 * two versions:
 *
 * - **with a primary action** — pass the "Create Added Value" `Button` in
 *   `primaryAction`; the left side is the action.
 * - **without one** — omit `primaryAction`; the left side is the `Logo`,
 *   linked home via `homeHref`.
 *
 * The right side is always: notification bell (unread = the design's red
 * dot; the count lives in the bell's accessible name), a divider, the
 * light/dark mode `Toggle` (sun and moon in its knob), and the signed-in user (avatar + name + caret, inline).
 *
 * An organism composed entirely from existing pieces — `Logo`, `Toggle`,
 * `NotificationBell`, `Divider`, and `UserMenu` (which also draws the user chip when the
 * app opens its own menu or there is none), with the caller's `Button` slotting into
 * `primaryAction`. The page-level header (back, title, status actions) is a
 * different Figma component (`AV_Header`) and is its own pattern, `AVHeader`.
 *
 * The export drew a role badge under the user's name; design review (3 Sep
 * 2026) confirmed no design for it — roles are `RoleBadge`'s business.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface TopBarUser {
  name: string;
  /** Avatar photo. */
  src?: string;
}

export interface TopBarProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The bar's one page-level action — the "Create Added Value" `Button`.
   * When present, it replaces the logo on the left (the Figma variant pair).
   */
  primaryAction?: React.ReactNode;
  /**
   * Whether the left side shows at all. Default `true`. `false` leaves it empty,
   * with no action and no logo, for screens like the AV editor.
   */
  showLeftSide?: boolean;
  /** Where the logo links when there is no `primaryAction`. */
  homeHref?: string;
  /** Unread count. The bell renders whenever this is a number; `> 0` shows the dot. */
  notifications?: number;
  onNotifications?: () => void;
  /** The mode switch from the design. Controlled by the app's theme state. */
  theme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
  user?: TopBarUser;
  /**
   * The account menu's rows, as `Menu` takes them (the default is Settings and Logout). Given with
   * a `user`, the chip becomes a `UserMenu` that opens them; what each does, and which an admin
   * sees that a regular user does not, is the app's.
   */
  userMenuItems?: MenuItem[];
  /** Fires with the activated account-menu item's `key`. Given alone, the chip is a `UserMenu` with the default rows. */
  onUserMenuSelect?: (key?: string) => void;
  /** Makes the user chip a real button, for an app that opens its own menu. Ignored when `userMenuItems` is given. */
  onUserMenu?: () => void;
}

export const TopBar = React.forwardRef<HTMLElement, TopBarProps>(
  (
    {
      className,
      primaryAction,
      showLeftSide = true,
      homeHref,
      notifications,
      onNotifications,
      theme,
      onThemeChange,
      user,
      userMenuItems,
      onUserMenuSelect,
      onUserMenu,
      ...props
    },
    ref,
  ) => {
    return (
      /* h-16 — the Figma bar rows are 64 tall. */
      <header
        ref={ref}
        className={cn(
          'flex h-16 shrink-0 items-center justify-between gap-4 border-b border-stroke-subtle bg-surface-elevated px-8 font-sans',
          className,
        )}
        {...props}
      >
        {/* The variant pair: the primary action, or the logo — linked when
            there is somewhere for it to go. An `<a>` without `href` is not a
            link and may not carry a name, so without `homeHref` the logo
            stands alone and names itself. */}
        {showLeftSide &&
          (primaryAction ??
          (homeHref ? (
            <a
              href={homeHref}
              aria-label="Value Chain Plus — home"
              className="inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stroke-focused"
            >
              <Logo decorative size="md" />
            </a>
          ) : (
            <Logo size="md" />
          )))}
        <div className="ml-auto flex shrink-0 items-center gap-4">
          {notifications != null && (
            <NotificationBell count={notifications} onClick={onNotifications} />
          )}
          {/* The design's divider between the bell and the mode and user group.
              Only when there is something on both sides of it. */}
          {notifications != null && (theme || user) && (
            <Divider orientation="vertical" className="h-10 min-h-0 self-center" />
          )}
          {/* The mode switch and the user chip are one group with their own 8
              gap, closer than the bell and the divider are to each other. */}
          {(theme || user) && (
            <div className="flex items-center gap-2">
              {theme && (
                /* The design's mode switch, as the system Toggle with the sun and
                   the moon in its knob. It reports the wish; the app owns the theme
                   (and the `.dark` class). */
                <Toggle
                  aria-label="Dark mode"
                  knobIcons={{ on: 'moon-fill', off: 'sun-fill' }}
                  checked={theme === 'dark'}
                  onChange={(on) => onThemeChange?.(on ? 'dark' : 'light')}
                />
              )}
              {user &&
                (userMenuItems || onUserMenuSelect ? (
                  <UserMenu user={user} items={userMenuItems} onSelect={onUserMenuSelect} />
                ) : onUserMenu ? (
                  <UserMenuTrigger user={user} onClick={onUserMenu} />
                ) : (
                  <UserChip user={user} />
                ))}
            </div>
          )}
        </div>
      </header>
    );
  },
);
TopBar.displayName = 'TopBar';

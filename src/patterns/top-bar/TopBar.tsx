import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';
import { Avatar } from '../../atoms/avatar';
import { Logo } from '../../atoms/logo';
import { Toggle } from '../../atoms/toggle';

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
 * dot; the count lives in the bell's accessible name), the light/dark mode
 * `Toggle`, and the signed-in user (avatar + name + caret, inline).
 *
 * An organism composed entirely from existing pieces — `Logo`, `Toggle`,
 * `IconButton`, `Avatar`, `Icon`, with the caller's `Button` slotting into
 * `primaryAction`. The page-level header (back, title, status actions) is a
 * different Figma component (`AV_Header`) and will be its own pattern.
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
  /** Where the logo links when there is no `primaryAction`. */
  homeHref?: string;
  /** Unread count. The bell renders whenever this is a number; `> 0` shows the dot. */
  notifications?: number;
  onNotifications?: () => void;
  /** The mode switch from the design. Controlled by the app's theme state. */
  theme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
  user?: TopBarUser;
  /** Makes the user chip a real button — the future UserMenu's trigger. */
  onUserMenu?: () => void;
}

export const TopBar = React.forwardRef<HTMLElement, TopBarProps>(
  (
    {
      className,
      primaryAction,
      homeHref,
      notifications,
      onNotifications,
      theme,
      onThemeChange,
      user,
      onUserMenu,
      ...props
    },
    ref,
  ) => {
    const userChip = user && (
      <>
        <Avatar name={user.name} src={user.src} size="md" />
        <span className="max-w-40 truncate text-label-lg text-text-primary">{user.name}</span>
        {onUserMenu && (
          <Icon name="caret-down" size="sm" aria-hidden="true" className="text-text-tertiary" />
        )}
      </>
    );

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
        {/* The variant pair: the primary action, or the linked logo. */}
        {primaryAction ?? (
          <a
            href={homeHref}
            aria-label="Value Chain Plus — home"
            className="inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stroke-focused"
          >
            <Logo decorative size="md" />
          </a>
        )}
        <div className="flex shrink-0 items-center gap-4">
          {notifications != null && (
            <span className="relative">
              <IconButton
                variant="tertiary"
                icon="bell"
                label={
                  notifications > 0
                    ? `Notifications, ${notifications} unread`
                    : 'Notifications'
                }
                onClick={onNotifications}
              />
              {notifications > 0 && (
                /* The design's red dot — the number is in the bell's name. */
                <span
                  aria-hidden="true"
                  className="absolute right-1 top-1 size-2 rounded-full bg-accent-critical-filled-surface-default"
                />
              )}
            </span>
          )}
          {theme && (
            /* The design's mode switch, as the system Toggle. It reports the
               wish; the app owns the theme (and the `.dark` class). */
            <Toggle
              aria-label="Dark mode"
              checked={theme === 'dark'}
              onChange={(on) => onThemeChange?.(on ? 'dark' : 'light')}
            />
          )}
          {user &&
            (onUserMenu ? (
              <button
                type="button"
                aria-label={`${user.name}, account menu`}
                onClick={onUserMenu}
                className={cn(
                  'flex items-center gap-2 rounded-md p-1 text-left transition-colors',
                  'hover:bg-surface-neutral-faint',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
                )}
              >
                {userChip}
              </button>
            ) : (
              <span className="flex items-center gap-2 p-1">{userChip}</span>
            ))}
        </div>
      </header>
    );
  },
);
TopBar.displayName = 'TopBar';

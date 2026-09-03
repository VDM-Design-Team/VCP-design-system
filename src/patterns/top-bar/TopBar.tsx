import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';
import { Avatar } from '../../atoms/avatar';

/**
 * TopBar — the page header that sits at the top of every VCP screen: back
 * affordance, kicker line, page title, page actions, the notification bell,
 * and the signed-in user. **The first pattern**: an organism composed
 * entirely from existing pieces — `IconButton`, `Icon`, `Avatar` —
 * plus layout. Nothing here is bespoke except the arrangement.
 *
 * Rebuilt semantics over the export:
 * - It is a `<header>` with the page's `<h1>` — one per page, which is why
 *   `title` is required and the heading level is not configurable.
 * - Back and the bell are the system's `IconButton`s, not hand-rolled
 *   buttons. The bell's unread count is folded into its accessible name
 *   ("Notifications, 3 unread") and the visual dot is hidden — announced
 *   once, not twice.
 * - The user chip (avatar + name + caret, inline as the Figma `Top_NavBar`
 *   draws it) was a `cursor:pointer` div; it is a real `<button>` when
 *   `onUserMenu` is given (named "<name>, account menu"), and a plain group
 *   otherwise. The full `UserMenu` pattern will own the menu itself.
 *
 * The export drew a role badge under the user's name; the Figma `Top_NavBar`
 * has no such thing, so neither does this. Roles are `RoleBadge`'s business
 * (to port), on the surfaces the design actually puts them.
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

export interface TopBarProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** The page's h1. Required — a page without a title is a lost user. */
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Kicker line above the title — an AV id, or a `<Breadcrumb />`. */
  breadcrumb?: React.ReactNode;
  /** Shows the back IconButton. */
  onBack?: () => void;
  /** Page-level actions, left of the bell — Buttons, an IconButton row. */
  actions?: React.ReactNode;
  /** Unread count on the bell. The bell renders whenever this is a number. */
  notifications?: number;
  onNotifications?: () => void;
  user?: TopBarUser;
  /** Makes the user chip a real button — the future UserMenu's trigger. */
  onUserMenu?: () => void;
}

export const TopBar = React.forwardRef<HTMLElement, TopBarProps>(
  (
    {
      className,
      title,
      subtitle,
      breadcrumb,
      onBack,
      actions,
      notifications,
      onNotifications,
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
      /* h-21 = the Figma bar's 84. */
      <header
        ref={ref}
        className={cn(
          'flex h-21 shrink-0 items-center justify-between gap-4 border-b border-stroke-subtle bg-surface-elevated px-8 font-sans',
          className,
        )}
        {...props}
      >
        <div className="flex min-w-0 items-center gap-3.5">
          {onBack && <IconButton variant="tertiary" icon="arrow-left" label="Back" onClick={onBack} />}
          <div className="flex min-w-0 flex-col gap-0.5">
            {breadcrumb && <span className="text-label-sm text-text-tertiary">{breadcrumb}</span>}
            <h1 className="m-0 truncate text-heading-md text-text-primary">{title}</h1>
            {subtitle && (
              <span className="truncate text-body-sm text-text-tertiary">{subtitle}</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          {actions}
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
                /* The Figma Top_NavBar marks unread with a dot, not a count —
                   the number lives in the bell's accessible name instead. */
                <span
                  aria-hidden="true"
                  className="absolute right-1 top-1 size-2 rounded-full bg-accent-critical-filled-surface-default"
                />
              )}
            </span>
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

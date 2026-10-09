import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';
import { Avatar } from '../../atoms/avatar';
import { Logo } from '../../atoms/logo';
import { Toggle } from '../../atoms/toggle';
import { Divider } from '../../atoms/divider';

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
 * `IconButton`, `Avatar`, `Icon`, with the caller's `Button` slotting into
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
   * Whether the primary action is shown. Default `true`. Some screens have no
   * "Create Added Value"; set `false` and the bar takes the logo variant, so the
   * caller can keep passing `primaryAction` and flip one flag.
   */
  showPrimaryAction?: boolean;
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
      showPrimaryAction = true,
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
        <span className="max-w-40 truncate text-label-sm-medium text-text-primary">{user.name}</span>
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
        {/* The variant pair: the primary action, or the logo — linked when
            there is somewhere for it to go. An `<a>` without `href` is not a
            link and may not carry a name, so without `homeHref` the logo
            stands alone and names itself. */}
        {(showPrimaryAction ? primaryAction : undefined) ??
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
          ))}
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
                className={cn(
                  /* Neutral, as the design draws the bell: a brand-blue bell
                     read as a call to action. The `neutral.outline` content
                     steps, the same family the toolbar buttons use. */
                  'text-neutral-outline-content-default',
                  'hover:bg-surface-neutral-subtle hover:text-neutral-outline-content-hover',
                  'active:bg-surface-neutral-medium active:text-neutral-outline-content-pressed',
                )}
              />
              {notifications > 0 && (
                /* The design's red dot: 12, critical, sitting on the bell's
                   top-right shoulder, with a slow pulse behind it. The number
                   is in the bell's name; the pulse is dropped under reduced
                   motion and the dot stays. */
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-1.5 top-1 size-3"
                >
                  <span className="absolute inset-0 animate-ping rounded-full bg-accent-critical-outline-border-default opacity-60 motion-reduce:hidden" />
                  <span className="absolute inset-0 rounded-full bg-accent-critical-outline-border-default" />
                </span>
              )}
            </span>
          )}
          {/* The design's divider between the bell and the mode and user group.
              Only when there is something on both sides of it. */}
          {notifications != null && (theme || user) && (
            <Divider orientation="vertical" className="h-10 min-h-0 self-center" />
          )}
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

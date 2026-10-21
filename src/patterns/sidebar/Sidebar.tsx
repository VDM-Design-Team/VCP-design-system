import * as React from 'react';
import { cn } from '../../lib/cn';
import { Logo } from '../../atoms/logo';
import { Icon } from '../../atoms/icon';
import { Menu } from '../../components/menu';
import { Tooltip } from '../../components/tooltip';
import { SidebarItem, type SidebarSubItem } from '../../components/sidebar-item';
import type { IconName } from '../../atoms/icon';

/**
 * Sidebar — the app's primary navigation rail: logo, the nav set for whoever
 * is looking, and "Report a problem" pinned to the bottom. The last piece
 * `AppShell` is waiting on.
 *
 * Read off the Figma `SideBar` section (`2349:935`, audit batch 3, 8 Sep
 * 2026). `VCP_SideBar` has eight variants — **four user types, each with a
 * minimised twin** at 76 against 256 expanded.
 *
 * **This owns the nav vocabulary, and that is deliberate.** The design does:
 * `_VCP_SideBar_Item_Preset` is twelve named rows, and which of them each user
 * type sees is drawn, not configured. That makes it unlike the status chains,
 * where a domain names its own steps and the component had to take them as
 * data (issue #68). Here the list is the design's, so it lives in
 * `NAV_BY_USER_TYPE` — one place, the way `StatusPill` owns status → tone.
 * `items` overrides it for the cases the design has not drawn.
 *
 * `Status` is in the preset set but in no rail. **Confirmed 8 Sep 2026: not a
 * nav item**, so it is not here.
 *
 * **Collapsed rows get a `Tooltip`.** `SidebarItem` deliberately does not wrap
 * itself — a tooltip on every row of an expanded rail would be noise — so the
 * promise its docs make is kept here.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

/** Who is looking. The design draws a rail per type; `Admin Dev` is one of them. */
export type SidebarUserType = 'user' | 'admin' | 'admin-dev' | 'super-admin';

export interface SidebarNavItem {
  /** Stable identity, never shown. What `active` matches and `onNavigate` reports. */
  key: string;
  label: string;
  icon: IconName;
  href?: string;
  /** Sub-rows. `Archive` and `Planning` are the two the design gives them to. */
  items?: readonly SidebarSubItem[];
}

/* The twelve presets, less `Status`. Labels are the design's own; the glyphs
   are Phosphor's, chosen by rendering them beside the Figma frame. Dashboard is
   the one the design draws with a Heroicons glyph Phosphor has no equivalent
   for, so `rectangle-group` is an in-house redraw — see docs/icon.md. */
const DASHBOARD: SidebarNavItem = { key: 'dashboard', label: 'Dashboard', icon: 'rectangle-group' };
const MY_VALUES: SidebarNavItem = { key: 'my-values', label: 'My Values', icon: 'lightbulb' };
const ASSIGNED: SidebarNavItem = { key: 'assigned', label: 'Assigned', icon: 'assigned-value' };
const DRAFTS: SidebarNavItem = { key: 'drafts', label: 'Drafts', icon: 'file' };
const TASK_LOG: SidebarNavItem = { key: 'task-log', label: 'Task Log Trail', icon: 'list-dashes' };
const MANAGE: SidebarNavItem = { key: 'manage', label: 'Manage', icon: 'rectangle-stack' };
const ARCHIVE: SidebarNavItem = {
  key: 'archive',
  label: 'Archive',
  icon: 'archive',
  items: [{ label: 'Completed' }, { label: 'Rejected' }, { label: 'Backlogs' }],
};
const PLANNING: SidebarNavItem = {
  key: 'planning',
  label: 'Planning',
  icon: 'rows',
  items: [{ label: 'Planning List' }, { label: 'Gantt Chart' }, { label: 'Holiday Registry' }],
};

/** Which rows each user type sees. Straight from the eight `VCP_SideBar` variants. */
export const NAV_BY_USER_TYPE: Record<SidebarUserType, readonly SidebarNavItem[]> = {
  user: [DASHBOARD, MY_VALUES, ASSIGNED, DRAFTS, TASK_LOG, ARCHIVE],
  admin: [DASHBOARD, MY_VALUES, MANAGE, ASSIGNED, DRAFTS, TASK_LOG, ARCHIVE],
  'admin-dev': [DASHBOARD, MY_VALUES, PLANNING, MANAGE, ASSIGNED, DRAFTS, TASK_LOG, ARCHIVE],
  'super-admin': [
    DASHBOARD,
    { key: 'accounts', label: 'Accounts', icon: 'users-three' },
    { key: 'domains', label: 'Domains', icon: 'globe' },
    { key: 'contact-list', label: 'Contact List', icon: 'list-dashes' },
  ],
};

export interface SidebarProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Which rail the design draws. Ignored when `items` is given. */
  userType?: SidebarUserType;
  /** Override the nav set — for a rail the design has not drawn yet. */
  items?: readonly SidebarNavItem[];
  /** The `key` of the current row. */
  active?: string;
  /**
   * Keys of the rows with sub-items that start open — `'archive'`,
   * `'planning'`. Each still opens and closes on its own after that.
   */
  defaultOpen?: readonly string[];
  onNavigate?: (key: string) => void;
  /** The 76-wide rail: glyphs only, labels in tooltips. */
  collapsed?: boolean;
  /** Omit to hide the floating toggle entirely. */
  onToggleCollapse?: () => void;
  /**
   * The domain switcher above the nav. **Off by default**, matching the
   * design, where it sits in the rail as a hidden layer.
   */
  showDomainSelector?: boolean;
  domain?: string;
  domains?: readonly string[];
  onDomainChange?: (domain: string) => void;
  /** The accessible name of the `<nav>`. Say what it navigates. */
  label?: string;
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  (
    {
      className,
      userType = 'user',
      items,
      active,
      defaultOpen,
      onNavigate,
      collapsed,
      onToggleCollapse,
      showDomainSelector,
      domain,
      domains,
      onDomainChange,
      label = 'Main',
      ...props
    },
    ref,
  ) => {
    const nav = items ?? NAV_BY_USER_TYPE[userType];

    const renderItem = (item: SidebarNavItem) => {
      const row = (
        <SidebarItem
          label={item.label}
          icon={item.icon}
          href={item.href}
          onNavigate={item.href ? undefined : () => onNavigate?.(item.key)}
          selected={active === item.key}
          collapsed={collapsed}
          items={item.items}
          defaultOpen={defaultOpen?.includes(item.key)}
        />
      );
      /* The label is hidden in the rail, so the tooltip is the only way a
         sighted user learns what the glyph means. Expanded rows show their
         label already, and a tooltip on each would be noise. */
      return collapsed ? (
        <Tooltip key={item.key} content={item.label} placement="right">
          {row}
        </Tooltip>
      ) : (
        <React.Fragment key={item.key}>{row}</React.Fragment>
      );
    };

    return (
      <aside
        ref={ref}
        className={cn(
          'relative flex shrink-0 flex-col border-r border-stroke-default bg-surface-elevated',
          'py-5 transition-[width] duration-200',
          collapsed ? 'w-19' : 'w-64',
          className,
        )}
        {...props}
      >
        {/* The design gives the wordmark 200 of the rail's 256. At the atom's
            default `h-7` it wants 212 and flex squeezes it to fit — a distorted
            logo — so the width is set and the height follows. Collapsed, the
            diamond is 20 wide: the size it is inside that 200 lockup, so it
            does not grow when the rail collapses (design review, 7 Oct 2026).
            Both start 22 in, which centres the diamond on the nav glyphs' axis
            (12 rail padding + 8 row padding + half a 24 glyph box = 32), so
            the mark stays put and the wordmark simply appears beside it. */}
        <div className={cn('flex items-center pl-5.5', !collapsed && 'pr-8')}>
          <Logo
            collapsed={collapsed}
            decorative
            className={cn('h-auto shrink-0', collapsed ? 'w-5' : 'w-50')}
          />
        </div>

        <div className="mt-10 flex flex-1 flex-col gap-8 px-3">
          {showDomainSelector && !collapsed && (
            /* Figma's `_Domain_Selection_Dropdown`: a filled, borderless trigger
               with an up-down caret, opening the system's `Menu`. Not the native
               `Select`, whose popup cannot be drawn. */
            <Menu
              className="w-full"
              panelClassName="w-full"
              align="left"
              items={(domains ?? []).map((name) => ({ key: name, label: name }))}
              onSelect={(key) => key && onDomainChange?.(key)}
              trigger={
                <button
                  type="button"
                  disabled={!domains?.length}
                  aria-label={`Domain: ${domain ?? 'none selected'}. Change domain`}
                  className={cn(
                    'group flex w-full items-center justify-between gap-2.5 rounded-md px-3 py-2',
                    'bg-surface-neutral-subtle text-left font-sans text-body-sm-medium text-text-secondary',
                    /* The neutral outline family's states, as the outline Button
                       uses: the border steps darker on hover, and stays at the
                       pressed step while the menu is open. */
                    'cursor-pointer border border-neutral-outline-border-default transition-colors',
                    'hover:bg-neutral-outline-surface-hover hover:border-neutral-outline-border-hover',
                    'active:bg-neutral-outline-surface-pressed active:border-neutral-outline-border-pressed',
                    'aria-expanded:bg-neutral-outline-surface-pressed aria-expanded:border-neutral-outline-border-pressed',
                    'disabled:cursor-not-allowed disabled:border-neutral-outline-border-disabled disabled:bg-surface-neutral-subtle disabled:text-neutral-outline-content-disabled',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
                  )}
                >
                  <span className="min-w-0 truncate">{domain}</span>
                  <Icon
                    name="caret-up-down"
                    size="md"
                    /* Follows the border through every state, so the two always
                       read as one control. */
                    className={cn(
                      'shrink-0 text-neutral-outline-border-default transition-colors',
                      'group-hover:text-neutral-outline-border-hover',
                      'group-active:text-neutral-outline-border-pressed',
                      'group-aria-expanded:text-neutral-outline-border-pressed',
                      'group-disabled:text-neutral-outline-border-disabled',
                    )}
                  />
                </button>
              }
            />
          )}
          <nav aria-label={label} className="flex flex-col gap-2">
            {nav.map(renderItem)}
          </nav>
        </div>

        {/* The design pins one row to the bottom of every rail. At least 32
            above it (`mt-8`), so even a rail with no room to spare shows a gap
            and the row reads as pinned to the bottom, not as the last nav item. */}
        <div className="mt-8 flex flex-col px-3">
          {renderItem({ key: 'report', label: 'Report a problem', icon: 'warning' })}
        </div>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            aria-expanded={!collapsed}
            /* Straddles the rail's right edge, as the design draws it. */
            className={cn(
              'absolute -right-4 top-4 grid size-8 place-items-center rounded-pill',
              'border border-stroke-default bg-surface-elevated text-text-secondary shadow-card',
              'hover:bg-surface-brand-faint active:bg-surface-brand-subtle',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
            )}
          >
            <Icon name={collapsed ? 'caret-double-right' : 'caret-double-left'} size="sm" />
          </button>
        )}
      </aside>
    );
  },
);
Sidebar.displayName = 'Sidebar';

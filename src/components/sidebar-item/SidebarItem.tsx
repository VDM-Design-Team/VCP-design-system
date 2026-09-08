import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon, type IconName } from '../../atoms/icon';

/**
 * SidebarItem — one row of the navigation rail: a glyph, a label, and either a
 * destination or a set of sub-items. The piece `Sidebar` is built from.
 *
 * Read off the Figma `SideBar` page (audit batch 3, 8 Sep 2026). The item set
 * `_VCP_SideBar_Item` has three axes — `Status` (Default/Focused),
 * `Right Icon` (On/Off) and `Dropdown Item` (Yes/No) — and this carries all
 * three. **The Claude Design export had none of them**, and invented a count
 * badge the design does not draw; see docs/sidebar-item.md.
 *
 * **It is a real control, not a clickable div.** The export shipped a `div`
 * with `onClick`, which no keyboard can reach. A leaf row renders an `<a>`
 * when given `href` — preferred, because middle-click and copy-link work —
 * and a `<button>` only for genuinely programmatic navigation, the same split
 * `Breadcrumb` makes.
 *
 * **A row with `items` is a disclosure, not a link.** It renders a
 * `<button aria-expanded aria-controls>` over a labelled list, the same
 * contract `Accordion` uses, because a control that reveals something is not
 * a control that goes somewhere.
 *
 * **The current page carries `aria-current="page"`.** The tinted fill is the
 * sighted half of a fact the markup states anyway, never the only signal.
 *
 * **Collapsed is a rail, not a secret.** The label is hidden, so its
 * accessible name would vanish with it. The name moves to `aria-label`;
 * sighted users get it back from the `Tooltip` that `Sidebar` wraps around
 * collapsed rows — not this component, because a tooltip on every row of an
 * expanded rail would be noise.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */

/** A row under an expandable item. No glyph — the design indents instead. */
export interface SidebarSubItem {
  label: string;
  href?: string;
  onNavigate?: () => void;
  /** The current page, when it is one of the children. */
  selected?: boolean;
}

export interface SidebarItemProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange' | 'children'> {
  /** What the row says, and its accessible name when collapsed. */
  label: string;
  /** The glyph. An `IconName` — the system's own set, so a typo is a compile error. */
  icon?: IconName;
  /** The current page. Renders `aria-current="page"` as well as the fill. */
  selected?: boolean;
  /** Icon-only rail. The label survives as the accessible name. */
  collapsed?: boolean;
  /** A real destination. Preferred: middle-click and copy-link work. */
  href?: string;
  /** Programmatic navigation only. Renders a `<button>` instead of a link. */
  onNavigate?: () => void;
  /**
   * Sub-items. Their presence is what makes the row a disclosure: it gains
   * the chevron, stops being a link, and opens a list beneath itself.
   * `Archive` and `Planning` are the two the design draws this way.
   */
  items?: readonly SidebarSubItem[];
  /** Controlled disclosure. Omit for uncontrolled. */
  open?: boolean;
  /** Uncontrolled starting state. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/* 40 tall — the design's own height, and it meets the touch-target minimum
   exactly, which is why there is no `size` prop. */
const row = (selected: boolean, collapsed: boolean) =>
  cn(
    'flex h-10 w-full items-center rounded-md font-sans text-label-lg transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
    collapsed ? 'justify-center px-2' : 'gap-2 px-2',
    selected
      ? 'bg-surface-brand-subtle font-medium text-text-brand'
      : 'text-text-secondary hover:bg-surface-brand-faint',
  );

/* Sub-rows are 32 against the design's 33, and carry no glyph — the indent is
   what says they belong to the row above. */
const subRow = (selected: boolean) =>
  cn(
    'flex h-8 w-full items-center rounded-md pl-10 pr-2 text-left font-sans text-label-md transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
    selected ? 'font-medium text-text-brand' : 'text-text-secondary hover:bg-surface-brand-faint',
  );

export const SidebarItem = React.forwardRef<HTMLElement, SidebarItemProps>(
  (
    {
      className,
      label,
      icon,
      selected,
      collapsed,
      href,
      onNavigate,
      items,
      open,
      defaultOpen,
      onOpenChange,
      ...props
    },
    ref,
  ) => {
    const [uncontrolled, setUncontrolled] = React.useState(!!defaultOpen);
    const isOpen = open ?? uncontrolled;
    const listId = React.useId();
    const expandable = !!items?.length;

    const glyph = icon && (
      <span className="grid size-8 shrink-0 place-items-center">
        <Icon name={icon} size="md" />
      </span>
    );

    /* The label goes, not the glyph — so the rail does not reflow as it
       collapses and the icons stay on one axis. */
    const text = !collapsed && <span className="min-w-0 flex-1 truncate text-left">{label}</span>;

    const shared = {
      'aria-current': selected ? ('page' as const) : undefined,
      'aria-label': collapsed ? label : undefined,
    };

    if (expandable) {
      const toggle = () => {
        const next = !isOpen;
        if (open === undefined) setUncontrolled(next);
        onOpenChange?.(next);
      };
      return (
        /* Open, the design lifts the whole group onto an elevated card so the
           children read as belonging to the row above rather than to the rail. */
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          className={cn(isOpen && 'rounded-md bg-surface-elevated', className)}
        >
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls={listId}
            onClick={toggle}
            className={row(!!selected, !!collapsed)}
            {...shared}
            {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
          >
            {glyph}
            {text}
            {/* The `Right Icon` axis. Collapsed, it shrinks to a marker beside
                the glyph — the design draws the caret but no open state for
                the rail, so this does not expand inline at 76 wide. */}
            <Icon
              name={isOpen ? 'caret-up' : 'caret-down'}
              size={collapsed ? 'sm' : 'md'}
              className="shrink-0"
            />
          </button>
          <ul id={listId} hidden={!isOpen} className="flex flex-col pb-2">
            {items.map((sub) => (
              <li key={sub.label}>
                {sub.href ? (
                  <a
                    href={sub.href}
                    aria-current={sub.selected ? 'page' : undefined}
                    className={subRow(!!sub.selected)}
                  >
                    {sub.label}
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={sub.onNavigate}
                    aria-current={sub.selected ? 'page' : undefined}
                    className={subRow(!!sub.selected)}
                  >
                    {sub.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    const leaf = cn(row(!!selected, !!collapsed), className);

    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={leaf}
          {...shared}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {glyph}
          {text}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        onClick={onNavigate}
        className={leaf}
        {...shared}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {glyph}
        {text}
      </button>
    );
  },
);
SidebarItem.displayName = 'SidebarItem';

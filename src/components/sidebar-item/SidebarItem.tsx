import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon, type IconName } from '../../atoms/icon';
import { Badge } from '../../atoms/badge';

/**
 * SidebarItem — one row of the navigation rail: a glyph, a label, and an
 * optional count. The piece `Sidebar` is built from.
 *
 * **It is a real control, not a clickable div.** The export shipped a `div`
 * with `onClick`, which cannot be reached by keyboard, takes no focus, and
 * announces as nothing. This renders an `<a>` when given `href` — the
 * preferred form, because middle-click and copy-link work — and a `<button>`
 * only for genuinely programmatic navigation, the same split `Breadcrumb`
 * makes.
 *
 * **The current page carries `aria-current="page"`.** That is what tells a
 * screen reader which item is the one you are on; the tinted fill is the
 * sighted half of the same fact, never the only signal.
 *
 * **Collapsed is a rail, not a secret.** In the 76-wide rail the label is
 * hidden, so the
 * accessible name would vanish with it. The name moves to `aria-label`, and
 * the label is still what a screen reader reads. Sighted users get it back
 * from the `Tooltip` that `Sidebar` wraps around collapsed items — this
 * component does not wrap itself, because a tooltip inside every row of an
 * expanded sidebar would be noise.
 *
 * 40 tall, which meets the touch-target minimum exactly, with nothing to
 * spare — the design's own height, and the reason `size` is not a prop here.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface SidebarItemProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> {
  /** What the row says, and its accessible name when collapsed. */
  label: string;
  /** The glyph. An `IconName` — the system's own set, so a typo is a compile error. */
  icon?: IconName;
  /** The current page. Renders `aria-current="page"` as well as the fill. */
  selected?: boolean;
  /** Icon-only rail. The label survives as the accessible name. */
  collapsed?: boolean;
  /** A count beside the label — unread, pending, whatever the row is for. */
  badge?: string | number;
  /** A real destination. Preferred: middle-click and copy-link work. */
  href?: string;
  /** Programmatic navigation only. Renders a `<button>` instead of a link. */
  onNavigate?: () => void;
}

/* Brand-tinted at rest, one step up on hover, and the selected row keeps the
   step-up fill permanently with brand text over it. */
const row = (selected: boolean, collapsed: boolean) =>
  cn(
    'flex h-10 w-full items-center rounded-md font-sans text-label-lg transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
    collapsed ? 'justify-center px-2' : 'gap-2 px-2',
    selected
      ? 'bg-surface-brand-subtle font-medium text-text-brand'
      : 'text-text-secondary hover:bg-surface-brand-faint',
  );

export const SidebarItem = React.forwardRef<HTMLAnchorElement | HTMLButtonElement, SidebarItemProps>(
  ({ className, label, icon, selected, collapsed, badge, href, onNavigate, ...props }, ref) => {
    const content = (
      <>
        {icon && (
          <span className="grid size-6 shrink-0 place-items-center">
            <Icon name={icon} size="md" />
          </span>
        )}
        {/* The label goes, not the whole row — so the glyph keeps its place
            and the rail does not reflow when it collapses. */}
        {!collapsed && <span className="min-w-0 flex-1 truncate text-left">{label}</span>}
        {/* Filled, not tonal: the selected row's own fill is
            surface.brand.subtle, and a tonal brand badge sits paler than the
            row it is on. The solid pair reads on both. */}
        {!collapsed && badge != null && (
          <Badge size="sm" tone="brand" variant="filled" className="shrink-0">
            {badge}
          </Badge>
        )}
      </>
    );

    const shared = {
      className: cn(row(!!selected, !!collapsed), className),
      'aria-current': selected ? ('page' as const) : undefined,
      /* Collapsed hides the label, so the name has to come from somewhere. */
      'aria-label': collapsed ? label : undefined,
    };

    if (href) {
      return (
        <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} {...shared} {...props}>
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        onClick={onNavigate}
        {...shared}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  },
);
SidebarItem.displayName = 'SidebarItem';

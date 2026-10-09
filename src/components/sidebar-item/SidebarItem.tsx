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
 * **Collapsed, the caret shrinks and sits beside the glyph.** Figma's
 * `_Sidebar_Item` (`Collapsed`, `5322:55417`) draws a 12 caret directly after
 * the 24 glyph, inside the same 8 padding — not on the glyph, and not the
 * expanded row's 20 caret. It is the chevron (`caret-down`), like the expanded
 * row's, not a filled triangle (design review, 7 Oct 2026). Every collapsed
 * row hugs its content with 8 either side (40, or 52 with the caret) and keeps
 * its glyph at the same 8 inset, so the rail's glyphs share one axis and each
 * row's fill and focus ring are even. Expanded, the caret stays at the row's
 * far right, as Figma draws it.
 *
 * **Collapsed, a disclosure opens a flyout, not an inline list** (design
 * review, 5 Oct 2026; Figma `Menu_Dropdown`, `27:10048`). The row does not
 * grow. A dropdown opens to its right — 211 wide, top aligned with the row —
 * whose left edge sits 8 inside the rail's right edge (the rail pads 12 and
 * draws a 1 border, so the flyout starts 5 past the column). Escape, a click outside, or choosing
 * an item closes it. Expanded, the sub-items still open inline beneath the row.
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
    'flex h-10 items-center rounded-md font-sans text-label-sm-medium transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
    /* Collapsed rows hug their content with 8 either side — 40 for a glyph,
       52 with a disclosure's caret — so the fill and focus ring are even on
       both sides. They start at the rail's same inset rather than centring,
       so every glyph stays on one axis and a caret only adds width to the
       right. Expanded rows fill the rail. */
    collapsed ? 'w-fit px-2' : 'w-full gap-2 px-2',
    selected
      ? 'bg-surface-brand-subtle font-medium text-text-brand-strong'
      : 'text-text-secondary hover:bg-surface-brand-faint',
  );

/* Sub-rows are 32 against the design's 33, and carry no glyph — the indent is
   what says they belong to the row above. Regular weight, selected or not
   (design review, 5 Oct 2026): the current one is told apart by its brand
   colour and `aria-current`, not by weight. */
const subRow = (selected: boolean) =>
  cn(
    'flex h-8 w-full items-center rounded-md pl-10 pr-2 text-left font-sans text-body-sm-regular transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
    selected ? 'text-text-brand-strong' : 'text-text-secondary hover:bg-surface-brand-faint',
  );

/* The collapsed flyout — drawn exactly like `Menu` (Figma's `Menu_Dropdown`):
   211 wide, `p-1` round the rows, `surface.elevated` with a `stroke.default`
   edge, `radius.md` and `shadow.menu`, over everything (`z-60` clears
   the rail's tooltip, which would otherwise sit in the same spot). It starts 5
   past the row's right edge, so it overlaps the rail's right edge by 8: the
   rail pads 12 either side of its column and draws a 1 right border (12 + 1 - 8). */
const flyout =
  'absolute left-full top-0 z-60 ml-1.25 flex w-52.75 flex-col rounded-md border border-stroke-default bg-surface-elevated p-1 shadow-menu';

/* A flyout row — `Menu`'s item: at least 40 tall, 12 either side, `radius.sm`,
   `label-sm-medium` in `text.secondary`, `surface.brand.faint` and `text.primary`
   on hover. `Menu` has no "current" row; here it is semibold `text.brand.medium`
   on the same faint fill. */
const flyoutRow = (selected: boolean) =>
  cn(
    'flex min-h-10 w-full items-center gap-2 rounded-sm px-3 py-2 text-left font-sans transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
    selected
      ? 'bg-surface-brand-faint text-label-sm-semibold text-text-brand-medium'
      : 'text-label-sm-medium text-text-secondary hover:bg-surface-brand-faint hover:text-text-primary',
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
    /* A collapsed disclosure opens a flyout beside the rail, not a list under
       the row — see the note above. */
    const asFlyout = !!collapsed && expandable;

    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const triggerRef = React.useRef<HTMLButtonElement | null>(null);
    const setRoot = (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
    };

    const setOpen = React.useCallback(
      (next: boolean) => {
        if (open === undefined) setUncontrolled(next);
        onOpenChange?.(next);
      },
      [open, onOpenChange],
    );

    /* The flyout floats over the page, so it closes the way a Popover does:
       Escape (focus returns to the row), a press outside, focus moving out. */
    React.useEffect(() => {
      if (!asFlyout || !isOpen) return undefined;
      const inside = (target: EventTarget | null) =>
        !!rootRef.current && target instanceof Node && rootRef.current.contains(target);
      const onPointerDown = (event: PointerEvent) => {
        if (!inside(event.target)) setOpen(false);
      };
      const onFocusIn = (event: FocusEvent) => {
        if (!inside(event.target)) setOpen(false);
      };
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') return;
        setOpen(false);
        triggerRef.current?.focus();
      };
      document.addEventListener('pointerdown', onPointerDown);
      document.addEventListener('focusin', onFocusIn);
      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.removeEventListener('pointerdown', onPointerDown);
        document.removeEventListener('focusin', onFocusIn);
        document.removeEventListener('keydown', onKeyDown);
      };
    }, [asFlyout, isOpen, setOpen]);

    const glyph = icon && (
      <span className="grid size-6 shrink-0 place-items-center">
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
      const toggle = () => setOpen(!isOpen);
      /* Choosing a flyout row closes the flyout, whatever the row does. */
      const picked = (go?: () => void) => () => {
        go?.();
        if (asFlyout) setOpen(false);
      };
      return (
        /* Open and inline, the design lifts the whole group onto an elevated
           card so the children read as belonging to the row above rather than
           to the rail. As a flyout nothing lifts: the row stays put and the
           dropdown is positioned against it. */
        <div
          ref={setRoot}
          className={cn(
            'w-full',
            asFlyout ? 'relative' : isOpen && 'rounded-md bg-surface-elevated',
            className,
          )}
        >
          <button
            ref={triggerRef}
            type="button"
            aria-expanded={isOpen}
            aria-controls={listId}
            onClick={toggle}
            className={row(!!selected, !!collapsed)}
            {...shared}
            {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
          >
            {/* The `Right Icon` axis. Collapsed, Figma shrinks the caret to 12
                and sets it straight after the glyph, with no gap. It does not
                flip when open: the row does not change, a flyout appears
                beside it. */}
            {collapsed ? (
              <>
                {glyph}
                <Icon name="caret-down" className="size-3 shrink-0" aria-hidden="true" />
              </>
            ) : (
              <>
                {glyph}
                {text}
                <Icon name={isOpen ? 'caret-up' : 'caret-down'} size="md" className="shrink-0" />
              </>
            )}
          </button>
          <ul
            id={listId}
            hidden={!isOpen}
            className={asFlyout ? flyout : 'flex flex-col pb-2'}
          >
            {items.map((sub) => (
              <li key={sub.label}>
                {sub.href ? (
                  <a
                    href={sub.href}
                    onClick={picked()}
                    aria-current={sub.selected ? 'page' : undefined}
                    className={asFlyout ? flyoutRow(!!sub.selected) : subRow(!!sub.selected)}
                  >
                    {sub.label}
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={picked(sub.onNavigate)}
                    aria-current={sub.selected ? 'page' : undefined}
                    className={asFlyout ? flyoutRow(!!sub.selected) : subRow(!!sub.selected)}
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

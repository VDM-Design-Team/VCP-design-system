import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { Icon, type IconName } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';
import { Input } from '../../atoms/input';
import { Divider } from '../../atoms/divider';
import { Popover, type PopoverAlign, type PopoverProps } from '../popover';

/**
 * Menu — a dropdown list of actions hanging off a trigger.
 *
 * It is `Popover` with a keyboard contract on top: the panel is the `role="menu"`
 * itself, the items are real `<button role="menuitem">` elements, and focus moves
 * into the list the moment it opens. That last part is the difference between a
 * Menu and a Popover, and it is not optional — a menu the keyboard cannot reach
 * is a mouse feature.
 *
 * Navigation is a roving tabindex, exactly as `Tabs` does it: the list is one tab
 * stop, arrows move within it, and disabled items are stepped over rather than
 * landed on.
 *
 * Positioning is `Popover`'s: the list floats above the page, so a `DataTable`
 * (which scrolls sideways) cannot cut off the menu in its last row, and it opens
 * above the trigger or flush to the other edge when the screen has no room below
 * or to the side. See docs/menu.md.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, raw pixel value, or arbitrary Tailwind class. ds-lint-ignore
 */
const menuItem = cva(
  [
    'flex w-full min-h-10 items-center gap-2 rounded-sm px-3 py-2',
    'text-left font-sans text-label-sm-medium',
    /* A transparent resting fill, same token the ghost Button rests on. */
    'bg-action-tertiary-surface-default transition-colors cursor-pointer',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
    /* The highlight rides `:hover` and `:focus-visible` — not plain `:focus`.
       Opening the menu moves focus to the first item (so the arrows work), and
       plain `:focus` made that item look hovered the moment a pointer opened it.
       `:focus-visible` is false after a pointer open and true after a keyboard
       one, so a mouse opens a clean menu and a keyboard still sees where it is. */
    'disabled:pointer-events-none disabled:text-text-disabled',
  ],
  {
    variants: {
      tone: {
        default: [
          'text-text-secondary',
          'hover:bg-surface-brand-faint hover:text-text-primary',
          'focus-visible:bg-surface-brand-faint focus-visible:text-text-primary',
        ],
        /* accent.critical.outline — critical content on a tinted hover fill.
           Colour is never the only signal here; see the icon and the
           screen-reader qualifier below. */
        danger: [
          'text-accent-critical-outline-content-default',
          'hover:bg-accent-critical-outline-surface-hover hover:text-accent-critical-outline-content-hover',
          'focus-visible:bg-accent-critical-outline-surface-hover focus-visible:text-accent-critical-outline-content-hover',
        ],
      },
    },
    defaultVariants: { tone: 'default' },
  },
);

/** How long a type-ahead buffer survives between keystrokes, in milliseconds. */
const TYPEAHEAD_WINDOW = 700;

/** An action in the list. */
export interface MenuActionItem {
  /** Passed to `onSelect`. */
  key?: string;
  label: React.ReactNode;
  /**
   * A glyph name from the Icon library — typed, so a name the system does not
   * ship is a compile error rather than an empty square at runtime. Rendered
   * decorative; the label carries the meaning. A `danger` item gets a warning glyph when
   * it has none; `false` opts out of it (the tone and the screen-reader qualifier stay).
   */
  icon?: IconName | false;
  /** Shown right-aligned. Display only — Menu binds no shortcuts itself. */
  shortcut?: string;
  tone?: 'default' | 'danger';
  /**
   * Marks the item as the current choice in a list of options (a domain, a
   * sort order). Any item that sets it — `true` or `false` — renders as
   * `role="menuitemradio"` with `aria-checked`, and the chosen one gets a
   * check, so the state is never colour alone. Give every option the flag so
   * the group is consistent.
   */
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  divider?: false;
  /**
   * **A submenu**: the choices that open beside this item (Pending Review › Accept, Reject). The item then shows a right caret, opens its submenu on hover, click or
   * ArrowRight, and is not itself a choice — only the submenu's items are. `onClick` and `onSelect` fire for those, with their own keys.
   */
  items?: MenuActionItem[];
  /** The submenu's heading. Defaults to this item's label (when it is a string). */
  heading?: string;
}

/** A rule between groups. Not focusable, not an item. */
export interface MenuDividerItem {
  divider: true;
  key?: string;
}

export type MenuItem = MenuActionItem | MenuDividerItem;

export interface MenuProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'style' | 'role'> {
  items?: MenuItem[];
  /** Fires with the activated item's `key`, after that item's own `onClick`. */
  onSelect?: (key?: string) => void;
  /**
   * The control that opens the menu. A single element — it is cloned so the menu
   * can wire `aria-haspopup="menu"`, `aria-expanded` and the open keys onto the
   * real control. Defaults to a ghost ellipsis `IconButton` labelled
   * "More actions".
   */
  trigger?: React.ReactElement<any>;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * A heading over the items — "Move to Status", "Urgency". It names the menu (`aria-label`) and is drawn as a quiet line above a rule; it is
   * not an item, so arrows and type-ahead step over it.
   */
  heading?: string;
  /**
   * **A search box at the top** (Figma's `_Menu_Item_Search`): typing narrows the items to the ones whose label contains the text. The box has focus when the menu opens; ArrowDown goes
   * into the list, ArrowUp from the first item comes back, and Enter chooses the first match. Items with a non-text label always stay.
   */
  searchable?: boolean;
  /** The search box's placeholder and name. */
  searchPlaceholder?: string;
  /** What the list says when nothing matches. */
  emptyText?: string;
  /** Which side of the trigger the menu prefers: `bottom` (the default) or `top`. It still flips when there is no room. */
  placement?: 'top' | 'bottom';
  /** Which edge of the menu lines up with the trigger's. */
  align?: PopoverAlign;
  /** `Popover`'s `strategy`: `fixed` (default) floats over any `overflow` ancestor; `absolute` only inside a CSS `transform`. */
  strategy?: PopoverProps['strategy'];
  /** Merged onto the wrapper via `cn()`. `panelClassName` styles the list. */
  className?: string;
  /** Merged onto the `role="menu"` panel via `cn()`. */
  panelClassName?: string;
}

const isAction = (item: MenuItem): item is MenuActionItem => item.divider !== true;

/* The category row, as the library's `Menu_Category_Item` draws it without its caret: 40 high, small bold type in the quiet grey, a rule beneath. It names a menu or a submenu. */
const CATEGORY = 'mb-1 flex h-10 items-center border-b border-stroke-subtle px-3 text-caption-md-bold text-text-tertiary';

/**
 * The panel of a submenu. Fixed to the screen, placed from its parent item **as it is now** (so it follows a scrolling table and a resized window), beside it on the right, **flipped to the left
 * when there is no room**, and kept on screen. Its first choice lines up with the parent item: how far above the item the panel starts is **measured** (the category row and the padding), not a constant.
 */
function SubMenu({
  heading,
  items,
  anchor,
  autoFocus,
  onChoose,
  onBack,
}: {
  heading: string;
  items: MenuActionItem[];
  anchor: HTMLElement | null;
  autoFocus: boolean;
  onChoose: (item: MenuActionItem) => void;
  onBack: () => void;
}) {
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const panel = React.useRef<HTMLDivElement>(null);
  /* Transparent (not `visibility: hidden`, which cannot take focus) until it has been measured and placed, so it never flashes at the corner. */
  const [position, setPosition] = React.useState<{ left: number; top: number } | null>(null);
  const place = React.useCallback(() => {
    const box = panel.current;
    if (!box || !anchor?.isConnected) return;
    const parent = anchor.getBoundingClientRect();
    const own = box.getBoundingClientRect();
    const first = refs.current[0]?.getBoundingClientRect();
    /* The first choice sits level with the parent item: the panel starts as far above it as its own first item is below its top. */
    const lead = first ? first.top - own.top : 0;
    let left = parent.right;
    if (left + own.width > window.innerWidth && parent.left - own.width >= 0) left = parent.left - own.width;
    const top = Math.max(0, Math.min(parent.top - lead, window.innerHeight - own.height));
    setPosition((now) => (now && now.left === left && now.top === top ? now : { left, top }));
  }, [anchor]);
  React.useLayoutEffect(() => {
    place();
    /* Capture: a scrolling table, not only the window, moves the parent item. */
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    /* The menu behind it re-anchors itself on scroll too, a frame later, and that moves the parent item again: so the submenu looks once a frame while it is open, and moves only when the
       parent item has. (Placing on the scroll event alone can run before the menu behind has moved, and leave the submenu where the item was.) */
    let frame = requestAnimationFrame(function tick() {
      place();
      frame = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [place]);
  const enabled = items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0);
  const [active, setActive] = React.useState(autoFocus ? (enabled[0] ?? 0) : -1);
  React.useEffect(() => {
    if (autoFocus) refs.current[active]?.focus();
  }, [active, autoFocus]);

  const step = (by: 1 | -1) => {
    if (!enabled.length) return;
    const at = enabled.indexOf(active);
    setActive(enabled[(at + by + enabled.length) % enabled.length] ?? enabled[0]);
  };

  return (
    <div
      ref={panel}
      role="menu"
      aria-label={heading}
      style={position ?? { left: 0, top: 0, opacity: 0 }}
      className="fixed z-60 min-w-48 rounded-md border border-stroke-default bg-surface-elevated p-1 font-sans shadow-menu"
      onKeyDown={(event) => {
        const handled = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'Escape', 'Home', 'End'];
        if (!handled.includes(event.key)) return;
        /* These belong to the submenu: the menu behind it must not also move or close. */
        event.preventDefault();
        event.stopPropagation();
        if (event.key === 'ArrowDown') step(1);
        else if (event.key === 'ArrowUp') step(-1);
        else if (event.key === 'Home') setActive(enabled[0] ?? 0);
        else if (event.key === 'End') setActive(enabled[enabled.length - 1] ?? 0);
        else onBack();
      }}
    >
      <div aria-hidden="true" className={CATEGORY}>
        {heading}
      </div>
      {items.map((item, i) => (
        <button
          key={item.key ?? i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="menuitem"
          disabled={item.disabled}
          tabIndex={i === active ? 0 : -1}
          onClick={() => onChoose(item)}
          className={menuItem({ tone: item.tone })}
        >
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(function Menu(
  {
    items: allItems = [],
    onSelect,
    trigger,
    open,
    defaultOpen = false,
    onOpenChange,
    heading,
    searchable,
    searchPlaceholder = 'Search...',
    emptyText = 'No results',
    placement,
    align = 'right',
    strategy,
    className,
    panelClassName,
    ...props
  },
  ref,
) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
  const isOpen = open !== undefined ? open : uncontrolled;

  /* Searching narrows the list; every index below is into what is shown. */
  const [query, setQuery] = React.useState('');
  const searchRef = React.useRef<HTMLInputElement>(null);
  const needle = query.trim().toLowerCase();
  const items =
    searchable && needle
      ? allItems.filter((item) => isAction(item) && (typeof item.label !== 'string' || item.label.toLowerCase().includes(needle)))
      : allItems;
  React.useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (open === undefined) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [open, onOpenChange],
  );

  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  /* Which item's submenu is open, where it hangs, and whether focus should go into it (a key or a click does; a hover does not). */
  const [sub, setSub] = React.useState<{ index: number; focus: boolean } | null>(null);
  const openSub = (index: number, focus: boolean) => {
    const el = itemRefs.current[index];
    if (el) setSub({ index, focus });
  };
  /* Closing the menu, or moving to another item, closes its submenu. */
  React.useEffect(() => {
    if (!isOpen) setSub(null);
  }, [isOpen]);
  React.useEffect(() => {
    setSub((current) => (current && current.index !== activeIndex && current.focus ? null : current));
  }, [activeIndex]);

  const selectable = (i: number) => {
    const item = items[i];
    return !!item && isAction(item) && !item.disabled;
  };

  const firstSelectable = items.findIndex((_, i) => selectable(i));
  const lastSelectable = (() => {
    for (let i = items.length - 1; i >= 0; i--) if (selectable(i)) return i;
    return -1;
  })();

  /* Roving tabindex, wrapping, skipping dividers and disabled items — the same
     shape as `Tabs.move`. Activation does NOT follow focus in a menu: landing on
     "Delete" must not delete anything.

     The step is computed from the *previous* index inside the updater, so a held
     arrow key that fires faster than React re-renders still moves one item per
     press instead of standing still on a stale index. */
  const move = (step: number) => {
    const n = items.length;
    if (n === 0) return;
    setActiveIndex((current) => {
      const from = current < 0 ? (step > 0 ? -1 : 0) : current;
      for (let i = 1; i <= n; i++) {
        const next = (((from + step * i) % n) + n) % n;
        if (selectable(next)) return next;
      }
      return current;
    });
  };

  /* Focus follows the roving index while the menu is open. This is what puts
     focus in the list on open, and what moves it on every arrow key. */
  React.useEffect(() => {
    if (!isOpen) return;
    if (activeIndex < 0 && searchable) searchRef.current?.focus();
    else itemRefs.current[activeIndex]?.focus();
  }, [isOpen, activeIndex, searchable]);

  /* A menu always opens on its first item unless the key that opened it asked for
     the last one, so closing it forgets where the user was. Opening from anywhere
     that did not pick a starting item — a pointer click, or a controlled `open`
     flipped by the caller — then starts at the top. */
  const wasOpen = React.useRef(isOpen);
  React.useEffect(() => {
    if (isOpen && !wasOpen.current && !selectable(activeIndex)) setActiveIndex(searchable ? -1 : firstSelectable);
    if (!isOpen && wasOpen.current) setActiveIndex(-1);
    wasOpen.current = isOpen;
  });

  const openAt = (which: 'first' | 'last') => {
    setActiveIndex(which === 'first' ? firstSelectable : lastSelectable);
    setOpen(true);
  };

  const activate = (item: MenuActionItem) => {
    if (item.disabled || item.items?.length) return;
    item.onClick?.();
    onSelect?.(item.key);
    /* Focus is on the item, so Popover hands it back to the trigger. */
    setOpen(false);
  };

  /* Type-ahead: a bonus, not part of the required contract, but it is what makes
     a long menu usable without hunting. String labels only. */
  const search = React.useRef({ buffer: '', at: 0 });
  const typeahead = (char: string) => {
    const now = Date.now();
    search.current.buffer =
      now - search.current.at > TYPEAHEAD_WINDOW ? char : search.current.buffer + char;
    search.current.at = now;
    const query = search.current.buffer.toLowerCase();
    const n = items.length;
    setActiveIndex((current) => {
      for (let i = 1; i <= n; i++) {
        const next = (((current + i) % n) + n) % n;
        const item = items[next];
        if (!selectable(next) || !isAction(item) || typeof item.label !== 'string') continue;
        if (item.label.toLowerCase().startsWith(query)) return next;
      }
      return current;
    });
  };

  /* One handler on the panel, so the keys keep working even if focus has landed
     on the list container rather than an item. Enter and Space are left alone:
     the items are real buttons and the browser already turns both into a click. */
  const onPanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const inSearch = event.target === searchRef.current;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        /* From the first item, back up into the search box. */
        if (searchable && activeIndex === firstSelectable) setActiveIndex(-1);
        else if (!inSearch) move(-1);
        break;
      case 'Enter':
        if (inSearch && needle && firstSelectable >= 0) {
          event.preventDefault();
          const first = items[firstSelectable];
          if (isAction(first)) activate(first);
        }
        break;
      case 'Home':
        if (inSearch) break;
        event.preventDefault();
        setActiveIndex(firstSelectable);
        break;
      case 'End':
        if (inSearch) break;
        event.preventDefault();
        setActiveIndex(lastSelectable);
        break;
      default:
        if (!inSearch && event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
          typeahead(event.key);
        }
    }
    /* Escape is Popover's, and Tab closes by leaving — both handled there. */
  };

  const triggerElement = trigger ?? (
    <IconButton variant="tertiary" icon="dots-three-vertical" label="More actions" />
  );

  /* Down/Up open the menu at the top or the bottom. Cloned before Popover clones
     it again for the ARIA wiring — different props, both survive. */
  const wiredTrigger = React.cloneElement(triggerElement, {
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      triggerElement.props?.onKeyDown?.(event);
      if (event.defaultPrevented || isOpen) return;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        openAt('first');
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        openAt('last');
      }
    },
  });

  return (
    <Popover
      ref={ref}
      className={className}
      trigger={wiredTrigger}
      open={isOpen}
      onOpenChange={setOpen}
      align={align}
      placement={placement}
      strategy={strategy}
      width="auto"
      panelRole="menu"
      /* z-60: a menu is above a tooltip (z-50) — a tooltip that opens while a menu is open must not sit on top of it. */
      panelClassName={cn('z-60 min-w-48 p-1', panelClassName)}
      label={heading}
      panelProps={{ onKeyDown: onPanelKeyDown }}
      content={[
        heading && (
          <div key="heading" aria-hidden="true" className={CATEGORY}>
            {heading}
          </div>
        ),
        searchable && (
          <div key="search" className="px-1 pb-1">
            <Input
              ref={searchRef}
              fullWidth
              size="sm"
              role="searchbox"
              aria-label={searchPlaceholder}
              placeholder={searchPlaceholder}
              autoComplete="off"
              leadingIcon={<Icon name="magnifying-glass" size="sm" />}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(-1);
              }}
            />
          </div>
        ),
        searchable && needle && items.length === 0 && (
          <p key="empty" className="m-0 px-3 py-2 text-body-sm-regular text-text-tertiary">
            {emptyText}
          </p>
        ),
        ...items.map((item, i) => {
        if (!isAction(item)) {
          return (
            <Divider
              key={item.key ?? `divider-${i}`}
              decorative={false}
              className="my-1"
            />
          );
        }

        const danger = item.tone === 'danger';
        /* Danger is never colour alone: a critical item always carries a glyph,
           and falls back to `warning` when the caller gave none. `icon: false` opts out:
           the accessible name still says "destructive action", and the colour stays. */
        const glyph: IconName | undefined =
          item.icon === false ? undefined : (item.icon ?? (danger ? 'warning' : undefined));
        const isChoice = item.selected !== undefined;
        const submenu = item.items?.length ? item.items : null;

        return (
          <React.Fragment key={item.key ?? i}>
          <button
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            type="button"
            role={isChoice ? 'menuitemradio' : 'menuitem'}
            aria-checked={isChoice ? item.selected : undefined}
            disabled={item.disabled}
            tabIndex={i === activeIndex ? 0 : -1}
            /* A click opens it and moves into it (a hover has usually opened it already: the click must not close it again). */
            onClick={() => (submenu ? openSub(i, true) : activate(item))}
            onMouseEnter={() => (submenu ? openSub(i, false) : setSub(null))}
            onKeyDown={(event) => {
              if (submenu && event.key === 'ArrowRight') {
                event.preventDefault();
                openSub(i, true);
              }
            }}
            aria-haspopup={submenu ? 'menu' : undefined}
            aria-expanded={submenu ? sub?.index === i : undefined}
            className={cn(
              menuItem({ tone: item.tone }),
              /* The open parent keeps the highlight, in the brand blue and bold (Figma's "Pending Review ›"). `strong`, not `medium`: medium on this faint fill is 3.5:1 in dark. */
              submenu && 'aria-expanded:bg-surface-brand-faint aria-expanded:text-text-brand-strong aria-expanded:font-semibold',
            )}
          >
            {glyph && <Icon name={glyph} size="sm" />}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {/* Colour and the glyph are both invisible to a screen reader, so the
                tone is stated in the accessible name as well. */}
            {danger && <span className="sr-only">destructive action</span>}
            {item.selected && (
              <Icon name="check" size="sm" aria-hidden="true" className="shrink-0 text-text-primary" />
            )}
            {submenu && <Icon name="caret-right" size="sm" aria-hidden="true" className="shrink-0" />}
            {/* text.subtle is 4.76:1 on the panel but only 4.09:1 once the item is
                highlighted with surface.brand.faint — the shortcut has to clear AA in
                the focused state too, so it takes the next step darker. */}
            {item.shortcut && (
              <span className="shrink-0 font-sans text-caption-md-medium text-text-tertiary">
                {item.shortcut}
              </span>
            )}
          </button>
          {submenu && sub?.index === i && (
            <SubMenu
              heading={item.heading ?? (typeof item.label === 'string' ? item.label : '')}
              items={submenu}
              anchor={itemRefs.current[i] ?? null}
              autoFocus={sub.focus}
              onChoose={(choice) => {
                if (choice.disabled) return;
                choice.onClick?.();
                onSelect?.(choice.key);
                setOpen(false);
              }}
              onBack={() => {
                /* Focus goes back first: removing the focused submenu item would otherwise look like focus leaving the menu, and close it. */
                itemRefs.current[i]?.focus();
                setSub(null);
              }}
            />
          )}
          </React.Fragment>
        );
      }),
      ]}
      {...props}
    />
  );
});
Menu.displayName = 'Menu';

import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { Icon, type IconName } from '../icon';
import { IconButton } from '../icon-button';
import { Divider } from '../divider';
import { Popover, type PopoverAlign } from '../popover';

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
 * Positioning is `Popover`'s, with all of `Popover`'s limits — below the trigger,
 * flush left or right, no flipping, no collision detection. See docs/menu.md.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, raw pixel value, or arbitrary Tailwind class. ds-lint-ignore
 */
const menuItem = cva(
  [
    'flex w-full min-h-10 items-center gap-2 rounded-sm px-3 py-2',
    'text-left font-sans text-label-lg',
    /* A transparent resting fill, same token the ghost Button rests on. */
    'bg-action-tertiary-surface-default transition-colors cursor-pointer',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
    /* The highlight rides `:focus` as well as `:hover`, so a menu opened with the
       mouse still shows where the keyboard is. `:focus-visible` alone would leave
       the first item unmarked after a pointer open. */
    'disabled:pointer-events-none disabled:text-text-disabled',
  ],
  {
    variants: {
      tone: {
        default: [
          'text-text-secondary',
          'hover:bg-surface-brand-faint hover:text-text-primary',
          'focus:bg-surface-brand-faint focus:text-text-primary',
        ],
        /* accent.critical.outline — critical content on a tinted hover fill.
           Colour is never the only signal here; see the icon and the
           screen-reader qualifier below. */
        danger: [
          'text-accent-critical-outline-content-default',
          'hover:bg-accent-critical-outline-surface-hover hover:text-accent-critical-outline-content-hover',
          'focus:bg-accent-critical-outline-surface-hover focus:text-accent-critical-outline-content-hover',
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
   * decorative; the label carries the meaning.
   */
  icon?: IconName;
  /** Shown right-aligned. Display only — Menu binds no shortcuts itself. */
  shortcut?: string;
  tone?: 'default' | 'danger';
  disabled?: boolean;
  onClick?: () => void;
  divider?: false;
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
  /** Which edge of the menu lines up with the trigger's. */
  align?: PopoverAlign;
  /** Merged onto the wrapper via `cn()`. `panelClassName` styles the list. */
  className?: string;
  /** Merged onto the `role="menu"` panel via `cn()`. */
  panelClassName?: string;
}

const isAction = (item: MenuItem): item is MenuActionItem => item.divider !== true;

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(function Menu(
  {
    items = [],
    onSelect,
    trigger,
    open,
    defaultOpen = false,
    onOpenChange,
    align = 'right',
    className,
    panelClassName,
    ...props
  },
  ref,
) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
  const isOpen = open !== undefined ? open : uncontrolled;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (open === undefined) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [open, onOpenChange],
  );

  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const [activeIndex, setActiveIndex] = React.useState(-1);

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
    itemRefs.current[activeIndex]?.focus();
  }, [isOpen, activeIndex]);

  /* A menu always opens on its first item unless the key that opened it asked for
     the last one, so closing it forgets where the user was. Opening from anywhere
     that did not pick a starting item — a pointer click, or a controlled `open`
     flipped by the caller — then starts at the top. */
  const wasOpen = React.useRef(isOpen);
  React.useEffect(() => {
    if (isOpen && !wasOpen.current && !selectable(activeIndex)) setActiveIndex(firstSelectable);
    if (!isOpen && wasOpen.current) setActiveIndex(-1);
    wasOpen.current = isOpen;
  });

  const openAt = (which: 'first' | 'last') => {
    setActiveIndex(which === 'first' ? firstSelectable : lastSelectable);
    setOpen(true);
  };

  const activate = (item: MenuActionItem) => {
    if (item.disabled) return;
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
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        move(-1);
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(firstSelectable);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(lastSelectable);
        break;
      default:
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
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
      width="auto"
      panelRole="menu"
      panelClassName={cn('min-w-48 p-1', panelClassName)}
      panelProps={{ onKeyDown: onPanelKeyDown }}
      content={items.map((item, i) => {
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
           and falls back to `warning` when the caller gave none. */
        const glyph: IconName | undefined = item.icon ?? (danger ? 'warning' : undefined);

        return (
          <button
            key={item.key ?? i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            type="button"
            role="menuitem"
            disabled={item.disabled}
            tabIndex={i === activeIndex ? 0 : -1}
            onClick={() => activate(item)}
            className={menuItem({ tone: item.tone })}
          >
            {glyph && <Icon name={glyph} size="sm" />}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {/* Colour and the glyph are both invisible to a screen reader, so the
                tone is stated in the accessible name as well. */}
            {danger && <span className="sr-only">destructive action</span>}
            {/* text.subtle is 4.76:1 on the panel but only 4.09:1 once the item is
                highlighted with surface.brand.faint — the shortcut has to clear AA in
                the focused state too, so it takes the next step darker. */}
            {item.shortcut && (
              <span className="shrink-0 font-sans text-caption-md text-text-tertiary">
                {item.shortcut}
              </span>
            )}
          </button>
        );
      })}
      {...props}
    />
  );
});
Menu.displayName = 'Menu';

import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/**
 * Popover — a floating panel anchored to a trigger.
 *
 * It renders the trigger you give it (cloned, so the real control keeps its own
 * semantics) and a panel that opens beside it. The two are wired together:
 * the trigger carries `aria-expanded`, and `aria-controls` pointing at the panel
 * while it is open. Escape closes and hands focus back to the trigger; a click
 * outside closes; moving focus out of the popover closes.
 *
 * **It does not trap focus.** A Popover is a non-modal surface — the rest of the
 * page stays reachable and operable. If the content must be finished before the
 * user does anything else, that is a Modal, not this.
 *
 * **Positioning is deliberately dumb.** The panel is absolutely positioned inside
 * a relatively positioned wrapper: above or below the trigger, flush to its left
 * or right edge. There is no collision detection, no flipping, no shifting, no
 * portal — this system carries no positioning library and this component does not
 * pretend to be one. See docs/popover.md for what that costs you.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, raw pixel value, or arbitrary Tailwind class. ds-lint-ignore
 */
const popoverPanel = cva(
  [
    'absolute z-50',
    /* The floating surface: elevated fill, a defined edge, and the shadow the
       token set reserves for exactly this — `shadow.menu`. */
    'rounded-md border border-stroke-default bg-surface-elevated shadow-menu',
    'p-4 font-sans text-body-md text-text-secondary',
    /* Focusable as a container only so a click on dead space inside the panel
       does not drop focus to the body. Never in the tab order. */
    'focus:outline-none',
  ],
  {
    variants: {
      /* The whole placement contract: above, or below. Nothing smarter. */
      placement: {
        bottom: 'top-full mt-2',
        top: 'bottom-full mb-2',
      },
      /* Which edge of the panel lines up with the same edge of the trigger. */
      align: {
        left: 'left-0',
        right: 'right-0',
      },
      /* A fixed-width panel keeps line length readable; `auto` lets the content
         size it, which is what a Menu wants. */
      width: {
        auto: 'w-auto',
        sm: 'w-56',
        md: 'w-72',
        lg: 'w-96',
      },
    },
    defaultVariants: { placement: 'bottom', align: 'left', width: 'md' },
  },
);

/** Roles a panel may take, and the `aria-haspopup` value each one implies. */
const HASPOPUP = {
  dialog: 'dialog',
  menu: 'menu',
  listbox: 'listbox',
  grid: 'grid',
  tree: 'tree',
} as const;

export type PopoverPanelRole = keyof typeof HASPOPUP;
export type PopoverPlacement = 'top' | 'bottom';
export type PopoverAlign = 'left' | 'right';
export type PopoverWidth = 'auto' | 'sm' | 'md' | 'lg';

/* Everything that can hold focus inside a panel, for `autoFocus`. */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface PopoverProps
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      /* `content` is the panel's content here, not the HTML meta attribute.
         `style` is gone on purpose — style this with `className`. */
      'content' | 'style' | 'role'
    > {
  /**
   * The control that opens the panel. **A single React element**, not a string —
   * it is cloned so the popover can put `aria-expanded`, `aria-controls`, an
   * `id`, a ref and an `onClick` on the real control. Give it a `Button` or an
   * `IconButton`; the element's own `onClick` still runs first.
   */
  trigger: React.ReactElement<any>;
  /** What the panel holds. */
  content?: React.ReactNode;
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean;
  /** Uncontrolled starting state. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Above or below the trigger. No flipping — see docs/popover.md. */
  placement?: PopoverPlacement;
  /** Which edge the panel is flush with. */
  align?: PopoverAlign;
  /**
   * Panel width. A variant, not a number: the raw `width` of the source export
   * would have put an untokenised pixel value into a component.
   */
  width?: PopoverWidth;
  /**
   * Move focus into the panel when it opens (the first focusable child, or the
   * panel itself if it has none). **Off by default**, and that default is the
   * point: see the accessibility notes in docs/popover.md. Turn it on when the
   * panel's whole purpose is a control the user is expected to operate now.
   */
  autoFocus?: boolean;
  /**
   * Accessible name for the panel. Only meaningful alongside `panelRole` — a
   * panel with no role is generic and takes no name. Leave it off and the panel
   * is named by the trigger.
   */
  label?: string;
  /**
   * Role for the panel, which also decides the trigger's `aria-haspopup`.
   * Leave it unset for the plain disclosure case — a panel that claims
   * `role="dialog"` without focus management is lying to assistive tech.
   * `Menu` passes `"menu"`.
   */
  panelRole?: PopoverPanelRole;
  /** Merged onto the panel via `cn()`. `className` styles the wrapper. */
  panelClassName?: string;
  /**
   * Escape hatch for wiring a composed component's semantics onto the panel —
   * `Menu` uses it for its keyboard handler. Explicit props win over these.
   */
  panelProps?: React.HTMLAttributes<HTMLDivElement>;
}

/** Point several refs at one node. */
function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.RefObject<T | null>).current = node;
    }
  };
}

export const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  {
    trigger,
    content,
    open,
    defaultOpen = false,
    onOpenChange,
    placement = 'bottom',
    align = 'left',
    width = 'md',
    autoFocus = false,
    label,
    panelRole,
    panelClassName,
    panelProps,
    className,
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

  const generatedId = React.useId();
  const panelId = `${generatedId}-panel`;
  const triggerId: string = trigger.props?.id ?? `${generatedId}-trigger`;

  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  /* Was focus inside the popover at the moment it closed? That is the only
     thing that decides whether closing restores focus to the trigger. Closing
     because the user clicked or tabbed somewhere else must never yank focus
     back — the user is already where they wanted to be. */
  const focusWasInside = React.useRef(false);

  React.useEffect(() => {
    if (!isOpen) return;

    const inside = (node: EventTarget | null) =>
      node instanceof Node && !!wrapperRef.current?.contains(node);

    /* Pointer down outside closes, and does not take focus with it. */
    const onPointerDown = (event: PointerEvent) => {
      if (inside(event.target)) return;
      focusWasInside.current = false;
      setOpen(false);
    };

    /* Focus leaving the popover closes it. This is what makes Tab out of an
       open panel behave — no timers, no focus trap, no stolen focus. */
    const onFocusIn = (event: FocusEvent) => {
      focusWasInside.current = inside(event.target);
      if (!focusWasInside.current) setOpen(false);
    };

    /* Escape closes wherever it is pressed. Focus goes back to the trigger only
       if it was inside — see `focusWasInside`. */
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, setOpen]);

  /* Focus on the way in (opt-in) and on the way out (always, when focus was
     inside). Losing the caller's place in the page is the failure this exists
     to prevent. */
  const wasOpen = React.useRef(isOpen);
  React.useEffect(() => {
    if (isOpen && !wasOpen.current) {
      focusWasInside.current = true;
      if (autoFocus) {
        const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
        (first ?? panelRef.current)?.focus();
      }
    } else if (!isOpen && wasOpen.current && focusWasInside.current) {
      triggerRef.current?.focus();
    }
    wasOpen.current = isOpen;
  }, [isOpen, autoFocus]);

  const triggerNode = React.cloneElement(trigger, {
    id: triggerId,
    ref: mergeRefs<HTMLElement>(triggerRef, trigger.props?.ref),
    'aria-expanded': isOpen,
    'aria-haspopup': panelRole ? HASPOPUP[panelRole] : undefined,
    /* Only while the panel exists — a reference to a missing id is worse than
       no reference at all. */
    'aria-controls': isOpen ? panelId : undefined,
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      trigger.props?.onClick?.(event);
      if (!event.defaultPrevented) setOpen(!isOpen);
    },
  });

  return (
    <div
      ref={mergeRefs<HTMLDivElement>(wrapperRef, ref)}
      className={cn('relative inline-flex', className)}
      {...props}
    >
      {triggerNode}
      {isOpen && (
        <div
          {...panelProps}
          ref={panelRef}
          id={panelId}
          role={panelRole}
          /* A panel with a role needs a name. Its own if given, otherwise the
             trigger's — "More actions" names the menu it opens. */
          aria-label={panelRole && label ? label : undefined}
          aria-labelledby={panelRole && !label ? triggerId : undefined}
          tabIndex={panelProps?.tabIndex ?? -1}
          className={cn(
            popoverPanel({ placement, align, width }),
            panelClassName,
            panelProps?.className,
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
});
Popover.displayName = 'Popover';

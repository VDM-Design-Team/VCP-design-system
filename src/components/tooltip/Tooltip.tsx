import * as React from 'react';
import { createPortal } from 'react-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/**
 * Tooltip — a small floating label describing the element it is attached to.
 *
 * It is the most-misused overlay in any system, so the constraints are baked in
 * rather than left to the caller:
 *
 * - **It is a description, never the only copy of anything.** A tooltip cannot be
 *   reached on touch and it disappears. Anything a user must have belongs in the
 *   page.
 * - **It opens on keyboard focus, not only on hover** — a hover-only tooltip is
 *   invisible to keyboard users, and that is the failure this component exists
 *   to prevent.
 * - **The trigger is wired with `aria-describedby`.** `role="tooltip"` on its own
 *   announces nothing; the association is what makes a screen reader read it.
 * - **Escape dismisses it, and the pointer can move onto it** — both halves of
 *   WCAG 2.1 §1.4.13 (Content on Hover or Focus).
 * - **Nothing interactive goes inside.** `content` is a `ReactNode` for emphasis
 *   and line breaks, not for links or buttons. If it needs interaction it is a
 *   Popover, which this system does not ship yet.
 *
 * **The bubble floats above the page, outside the trigger's surroundings.** It is
 * drawn in a portal, positioned from the trigger's coordinates, so it can never
 * widen a scrolling list it sits in, be cut off by a container that clips, or add
 * space to a layout. (It was an absolutely-positioned child of the trigger until
 * October 2026, which did all three: a tooltip on a row's right-hand button made a
 * popover's list scroll sideways.) The portal goes into the nearest `.dark`
 * ancestor when there is one, so a themed wrapper still themes it.
 *
 * Placement is still static: the four placements are fixed offsets off the trigger,
 * with no collision detection and no flipping. See `docs/tooltip.md`.
 *
 * `followPointer` is for a trigger much wider than the bubble — a bar across a
 * chart. The bubble keeps its `top`/`bottom` side but takes its horizontal
 * position from where the pointer entered, clamped to the viewport, so it opens
 * under the cursor and never off the screen. It stays put once it is open, so the
 * pointer can still travel onto it.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

/**
 * The positioner. It carries the offset from the trigger as *padding*, not as a
 * margin or a `top`/`left` gap, so the space between trigger and bubble is part
 * of this element's own hit area. That is what makes the tooltip "hoverable"
 * under §1.4.13: the pointer can cross into the bubble without passing through a
 * dead zone that would fire `mouseleave` on the wrapper.
 *
 * Closed state is `opacity-0`, not `hidden` or `invisible`. `display:none` and
 * `visibility:hidden` both strip the element out of the accessibility tree,
 * which would leave `aria-describedby` pointing at nothing. Opacity keeps the
 * description available to assistive tech at all times and only hides it from
 * sight.
 */
const positioner = cva(
  [
    /* Fixed, so it is positioned by the trigger's coordinates and by nothing
       around it. The coordinates arrive as an inline style (they are measured, not
       a design value); the transform pulls the bubble to the right side of that
       point. */
    'fixed z-50 flex w-max max-w-64',
    'transition-opacity duration-150 motion-reduce:transition-none',
  ],
  {
    variants: {
      /* The point is the middle of the trigger's near edge. The `p*-2` is the gap
         between trigger and bubble, on Tailwind's numeric spacing scale — and it
         doubles as the pointer bridge described above. */
      placement: {
        top: '-translate-x-1/2 -translate-y-full pb-2',
        bottom: '-translate-x-1/2 pt-2',
        left: '-translate-x-full -translate-y-1/2 pr-2',
        right: '-translate-y-1/2 pl-2',
      },
      open: {
        true: 'opacity-100',
        false: 'pointer-events-none opacity-0',
      },
    },
    defaultVariants: { placement: 'top', open: false },
  },
);

/**
 * The visible bubble: a small light card, as Figma draws it — `surface.elevated`
 * with `text.primary`, a `stroke.default` edge and the menu shadow, the same family
 * as `Popover`, `Menu` and `Toast`. Every colour is a semantic token, so it flips
 * with the theme on its own (dark in dark mode). It was a dark inverted bubble
 * until October 2026, a leftover of the original export that Figma never drew.
 * See the token table in `docs/tooltip.md` for the measured figures.
 */
const bubble = cva([
  'rounded-sm border border-stroke-default px-3 py-2',
  'bg-surface-elevated text-text-primary',
  'font-sans text-caption-md-regular text-pretty',
  'shadow-menu',
]);

/**
 * Hover open delay, in milliseconds.
 *
 * A tooltip that fires the instant the pointer touches a control turns any sweep
 * across a toolbar into a strobe. 300ms is long enough that a pass-over does not
 * trigger it and short enough that a deliberate rest does not feel broken — it
 * sits at the point where a pause reads as intent rather than as travel.
 *
 * **Focus never waits.** A keyboard user has already committed by the time the
 * control is focused; a delay there is a delay on the only route they have to
 * the content, so `openDelay` is not applied to focus at all.
 */
const DEFAULT_OPEN_DELAY = 300;

type Placement = NonNullable<VariantProps<typeof positioner>['placement']>;

export interface TooltipProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'content' | 'children'> {
  /**
   * The description. Text, or light markup for emphasis and line breaks.
   * **Never interactive** — no links, no buttons. See the accessibility notes.
   */
  content: React.ReactNode;
  /**
   * Which side of the trigger the bubble sits on. Static: there is no collision
   * detection and no flipping, so pick the side with room.
   */
  placement?: Placement;
  /**
   * Exactly one element, and it must be focusable — a Button, an IconButton, a
   * link, an input. It is cloned to receive `aria-describedby`.
   */
  children: React.ReactElement;
  /**
   * Open under the pointer (horizontally) instead of at the middle of the trigger,
   * kept inside the viewport. For a trigger far wider than the bubble. Only for
   * `top` and `bottom`; keyboard focus still opens it at the trigger's middle.
   */
  followPointer?: boolean;
  /** Hover open delay in ms. Focus is always immediate. */
  openDelay?: number;
  /**
   * Render it already open. For Storybook, visual regression and screenshots —
   * not a way to pin a tooltip open in product.
   */
  defaultOpen?: boolean;
  /** Override the generated id of the bubble. Rarely needed. */
  tooltipId?: string;
}

export const Tooltip = React.forwardRef<HTMLSpanElement, TooltipProps>(
  (
    {
      content,
      placement = 'top',
      children,
      openDelay = DEFAULT_OPEN_DELAY,
      defaultOpen = false,
      tooltipId,
      followPointer = false,
      className,
      onMouseEnter,
      onMouseMove,
      onMouseLeave,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(defaultOpen);
    const generatedId = React.useId();
    const id = tooltipId ?? `tooltip-${generatedId}`;

    const wrapperRef = React.useRef<HTMLSpanElement | null>(null);
    const positionerRef = React.useRef<HTMLSpanElement | null>(null);
    /* With `followPointer`: where the pointer entered, in viewport coordinates. */
    const pointerX = React.useRef<number | null>(null);

    /* Where the bubble is drawn: the nearest `.dark` ancestor, else the page. Nothing
       is drawn on the server, which has no `document`. */
    const [host, setHost] = React.useState<HTMLElement | null>(null);
    React.useLayoutEffect(() => {
      setHost((wrapperRef.current?.closest('.dark') as HTMLElement | null) ?? document.body);
    }, []);

    /* The point the bubble hangs from: the middle of the trigger's near edge — or, with
       `followPointer` on a top or bottom bubble, the pointer's x, pulled back so the whole
       bubble stays inside the viewport. */
    const [anchor, setAnchor] = React.useState<{ top: number; left: number } | null>(null);
    const place = React.useCallback(() => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;
      let centreX = rect.left + rect.width / 2;
      const centreY = rect.top + rect.height / 2;
      if (followPointer && pointerX.current !== null && (placement === 'top' || placement === 'bottom')) {
        const margin = 8;
        const half = (positionerRef.current?.offsetWidth ?? 0) / 2;
        const max = Math.max(margin + half, window.innerWidth - margin - half);
        centreX = Math.min(Math.max(pointerX.current, margin + half), max);
      }
      setAnchor(
        placement === 'bottom'
          ? { top: rect.bottom, left: centreX }
          : placement === 'left'
            ? { top: centreY, left: rect.left }
            : placement === 'right'
              ? { top: centreY, left: rect.right }
              : { top: rect.top, left: centreX },
      );
    }, [placement, followPointer]);

    const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimer = React.useCallback(() => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    }, []);

    const close = React.useCallback(() => {
      clearTimer();
      setOpen(false);
    }, [clearTimer]);

    /* Measure before the bubble shows, and keep it on the trigger while it is open:
       the page can scroll or resize under a fixed element. */
    React.useLayoutEffect(() => {
      if (!open) return;
      place();
      window.addEventListener('scroll', place, true);
      window.addEventListener('resize', place);
      return () => {
        window.removeEventListener('scroll', place, true);
        window.removeEventListener('resize', place);
      };
    }, [open, place]);

    /* Clear a pending open if the component goes away mid-delay. */
    React.useEffect(() => clearTimer, [clearTimer]);

    /*
     * Escape dismisses it — WCAG §1.4.13 "Dismissible". The listener is on the
     * document, not on the wrapper, because a hover-triggered tooltip has no
     * focus anywhere near it: keydown would never reach the wrapper.
     *
     * Propagation is stopped only when the key came from inside this tooltip's
     * own trigger. That is the case the APG describes — focus is on the control,
     * so Escape belongs to the tooltip and should not also close the dialog
     * behind it. When the tooltip is merely hovered and focus is elsewhere, the
     * event is left alone: swallowing a modal's Escape because a tooltip happens
     * to be showing across the screen would be worse than the thing it fixes.
     */
    React.useEffect(() => {
      if (!open) return;
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') return;
        if (wrapperRef.current?.contains(event.target as Node)) {
          event.stopPropagation();
        }
        close();
      };
      document.addEventListener('keydown', onKeyDown, true);
      return () => document.removeEventListener('keydown', onKeyDown, true);
    }, [open, close]);

    /* Note where the pointer is while the bubble is closed; once open it holds still, so
       the pointer can reach it. (The bubble is in a portal, but React still passes its
       mouse events up to this wrapper, hence the check.) */
    const track = (event: React.MouseEvent<HTMLSpanElement>) => {
      if (!followPointer || open) return;
      if (positionerRef.current?.contains(event.target as Node)) return;
      pointerX.current = event.clientX;
    };

    const handleMouseEnter = (event: React.MouseEvent<HTMLSpanElement>) => {
      onMouseEnter?.(event);
      track(event);
      clearTimer();
      if (openDelay <= 0) {
        setOpen(true);
        return;
      }
      timer.current = setTimeout(() => setOpen(true), openDelay);
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLSpanElement>) => {
      onMouseMove?.(event);
      track(event);
    };

    const handleMouseLeave = (event: React.MouseEvent<HTMLSpanElement>) => {
      onMouseLeave?.(event);
      close();
    };

    /*
     * Focus opens it immediately. Restricted to `:focus-visible` so a mouse
     * click on the trigger does not leave a tooltip stuck open under the
     * pointer — hover already covers that user. Keyboard focus always matches
     * `:focus-visible`, so the keyboard route is unaffected. If the browser
     * cannot evaluate the selector, open anyway: failing towards showing it is
     * the safe direction.
     */
    const handleFocus = (event: React.FocusEvent<HTMLSpanElement>) => {
      onFocus?.(event);
      clearTimer();
      let keyboardish = true;
      try {
        keyboardish = (event.target as Element).matches(':focus-visible');
      } catch {
        keyboardish = true;
      }
      if (keyboardish) {
        pointerX.current = null;
        setOpen(true);
      }
    };

    const handleBlur = (event: React.FocusEvent<HTMLSpanElement>) => {
      onBlur?.(event);
      close();
    };

    const child = React.Children.only(children) as React.ReactElement<{
      'aria-describedby'?: string;
    }>;
    const describedBy = [child.props['aria-describedby'], id].filter(Boolean).join(' ');

    return (
      <span
        ref={(node) => {
          wrapperRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn('relative inline-flex', className)}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        /* React's onFocus/onBlur are focusin/focusout — they bubble from the
           trigger, so the handlers can live on the wrapper. */
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      >
        {React.cloneElement(child, { 'aria-describedby': describedBy })}
        {host &&
          createPortal(
            <span
              ref={positionerRef}
              className={positioner({ placement, open })}
              style={anchor ? { top: anchor.top, left: anchor.left } : undefined}
            >
              {/* The described element: `role="tooltip"` *and* the id that
                  `aria-describedby` resolves to. One without the other announces
                  nothing. */}
              <span id={id} role="tooltip" className={bubble()}>
                {content}
              </span>
            </span>,
            host,
          )}
      </span>
    );
  },
);
Tooltip.displayName = 'Tooltip';

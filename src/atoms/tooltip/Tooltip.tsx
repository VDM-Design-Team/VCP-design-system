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
 * **It stays on screen.** `placement` is the side you prefer. When that side has
 * no room on screen for the bubble — a toolbar along the top of the page, a
 * button at its right edge — it takes the opposite side if that has more room,
 * and it slides along the edge so no part of it is cut off. (It was always drawn
 * on the side asked for until November 2026, so at the top of the screen it was
 * drawn off it.) See `docs/tooltip.md`.
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
       around it. The coordinates of its top-left corner arrive as an inline style:
       they are measured, from the trigger and the bubble's own size, not a design
       value. */
    'fixed z-50 flex w-max',
    'transition-opacity duration-150 motion-reduce:transition-none',
  ],
  {
    variants: {
      /* The side it is drawn on. The `p*-2` is the gap between trigger and bubble,
         on Tailwind's numeric spacing scale — and it doubles as the pointer bridge
         described above. */
      placement: {
        top: 'pb-2',
        bottom: 'pt-2',
        left: 'pr-2',
        right: 'pl-2',
      },
      open: {
        true: 'opacity-100',
        false: 'pointer-events-none opacity-0',
      },
      /* 256 by default; `wide` is 384, for a tooltip that is a short list rather than a sentence. */
      wide: {
        true: 'max-w-96',
        false: 'max-w-64',
      },
    },
    defaultVariants: { placement: 'top', open: false, wide: false },
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

/* Layout maths, not styling: how near the screen's edge the bubble may come. */
const SCREEN_EDGE = 8;

const OPPOSITE = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as const;

type Placement = NonNullable<VariantProps<typeof positioner>['placement']>;

export interface TooltipProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'content' | 'children'> {
  /**
   * The description. Text, or light markup for emphasis and line breaks.
   * **Never interactive** — no links, no buttons. See the accessibility notes.
   */
  content: React.ReactNode;
  /**
   * Which side of the trigger the bubble sits on: the side you prefer. It takes the opposite side
   * when this one has no room on screen and that one has more, and slides along the edge to stay on
   * screen.
   */
  placement?: Placement;
  /**
   * Exactly one element, and it must be focusable — a Button, an IconButton, a
   * link, an input. It is cloned to receive `aria-describedby`.
   */
  children: React.ReactElement;
  /**
   * Let the bubble run to 384 instead of 256 — for a tooltip that is a short list (each line on its own
   * row) rather than a sentence. Text is still wrapped past that.
   */
  wide?: boolean;
  /** Hover open delay in ms. Focus is always immediate. */
  openDelay?: number;
  /**
   * Render it already open. For Storybook, visual regression and screenshots —
   * not a way to pin a tooltip open in product.
   */
  defaultOpen?: boolean;
  /** Override the generated id of the bubble. Rarely needed. */
  tooltipId?: string;
  /**
   * Wire the trigger to the bubble with `aria-describedby`. Default `true`. Turn it off only when
   * the trigger's own name already is the tooltip's words (an avatar named "John Doe (Assignee,
   * Busy)" whose tooltip shows that sentence), so a screen reader does not hear them twice.
   */
  describe?: boolean;
}

export const Tooltip = React.forwardRef<HTMLSpanElement, TooltipProps>(
  (
    {
      content,
      placement = 'top',
      wide = false,
      children,
      openDelay = DEFAULT_OPEN_DELAY,
      defaultOpen = false,
      tooltipId,
      describe = true,
      className,
      onMouseEnter,
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

    /* Where the bubble is drawn: the nearest `.dark` ancestor, else the page. Nothing
       is drawn on the server, which has no `document`. */
    const [host, setHost] = React.useState<HTMLElement | null>(null);
    React.useLayoutEffect(() => {
      setHost((wrapperRef.current?.closest('.dark') as HTMLElement | null) ?? document.body);
    }, []);

    const positionerRef = React.useRef<HTMLSpanElement | null>(null);

    /* Where the bubble goes: the side it took, and its top-left corner on screen. Centred on the
       trigger's near edge, unless that would cut it off. */
    const [anchor, setAnchor] = React.useState<{ top: number; left: number; side: Placement } | null>(null);
    const place = React.useCallback(() => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      const box = positionerRef.current;
      if (!rect || !box) return;
      /* The bubble's size with its gap, which is the same on whichever side it takes. */
      const w = box.offsetWidth;
      const h = box.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const room = {
        top: rect.top - SCREEN_EDGE,
        bottom: vh - rect.bottom - SCREEN_EDGE,
        left: rect.left - SCREEN_EDGE,
        right: vw - rect.right - SCREEN_EDGE,
      };
      const need = placement === 'top' || placement === 'bottom' ? h : w;
      const other = OPPOSITE[placement];
      const side: Placement = room[placement] >= need || room[placement] >= room[other] ? placement : other;
      /* Slide along the edge, but never past the far one: a bubble wider than the screen keeps its start. */
      const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));
      const centreX = rect.left + rect.width / 2;
      const centreY = rect.top + rect.height / 2;
      const next =
        side === 'top' || side === 'bottom'
          ? {
              side,
              top: side === 'top' ? rect.top - h : rect.bottom,
              left: clamp(centreX - w / 2, SCREEN_EDGE, vw - SCREEN_EDGE - w),
            }
          : {
              side,
              top: clamp(centreY - h / 2, SCREEN_EDGE, vh - SCREEN_EDGE - h),
              left: side === 'left' ? rect.left - w : rect.right,
            };
      setAnchor((prev) =>
        prev && prev.side === next.side && prev.top === next.top && prev.left === next.left ? prev : next,
      );
    }, [placement]);

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
       the page can scroll or resize under a fixed element. Again once the portal
       exists, so a tooltip that starts open is measured too. */
    React.useLayoutEffect(() => {
      if (!open || !host) return;
      place();
      window.addEventListener('scroll', place, true);
      window.addEventListener('resize', place);
      return () => {
        window.removeEventListener('scroll', place, true);
        window.removeEventListener('resize', place);
      };
    }, [open, place, host]);

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

    const handleMouseEnter = (event: React.MouseEvent<HTMLSpanElement>) => {
      onMouseEnter?.(event);
      clearTimer();
      if (openDelay <= 0) {
        setOpen(true);
        return;
      }
      timer.current = setTimeout(() => setOpen(true), openDelay);
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
      if (keyboardish) setOpen(true);
    };

    const handleBlur = (event: React.FocusEvent<HTMLSpanElement>) => {
      onBlur?.(event);
      close();
    };

    const child = React.Children.only(children) as React.ReactElement<{
      'aria-describedby'?: string;
      'data-tooltip'?: string;
    }>;
    const describedBy = [child.props['aria-describedby'], describe && id].filter(Boolean).join(' ') || undefined;
    /* A trigger that is not described still has a tooltip, and some pieces need to know: `IconButton`
       drops its native `title` under one, or the browser would draw a second bubble over ours. */
    const marker = describe ? {} : { 'data-tooltip': id };

    return (
      <span
        ref={(node) => {
          wrapperRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn('relative inline-flex', className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        /* React's onFocus/onBlur are focusin/focusout — they bubble from the
           trigger, so the handlers can live on the wrapper. */
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      >
        {React.cloneElement(child, { 'aria-describedby': describedBy, ...marker })}
        {host &&
          createPortal(
            <span
              ref={positionerRef}
              /* The side it really took, for tests and for styling a pointer one day. */
              data-side={anchor?.side ?? placement}
              className={positioner({ placement: anchor?.side ?? placement, open, wide })}
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

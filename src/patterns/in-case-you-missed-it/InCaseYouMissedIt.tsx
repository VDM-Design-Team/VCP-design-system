import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { Tooltip } from '../../atoms/tooltip';
import {
  InCaseYouMissedItCard,
  type InCaseYouMissedItCardProps,
} from '../../components/in-case-you-missed-it-card';

/**
 * InCaseYouMissedIt — the dashboard strip that brings back the Added Values that have been waiting: overdue,
 * due soon, awaiting review, pending. A titled card (with an ⓘ that says what the strip is for) over a row of
 * `InCaseYouMissedItCard`s that scrolls sideways. Built to Figma's `InCaseYouMissedIt` (`4361:23920`) and
 * its flow.
 *
 * - **No scrollbar is drawn** — the design draws none — so every other way to scroll still works: a touch swipe, a
 *   trackpad swipe, Shift + wheel, **dragging the row with the mouse**, Tab (focusing a card brings it into view), and an
 *   arrow at each edge that moves one card. The arrows are 32 tonal discs in a 40 press area (a step down from Figma's 40 in 48), shown while the strip is hovered
 *   or has focus, and not at all at an end they would run into; on a touch screen they stay out of the way. (A plain
 *   vertical wheel is left to the page: turning it into a sideways scroll would trap anyone scrolling past.)
 * - **It owns no state.** `items` in, `onOpen(item)` and `onDismiss(item)` out. A dismissed card must stay away, the
 *   design says, "even after logging out and in and after a refresh", while it keeps its current status — so the
 *   caller removes it from `items` and remembers it; this strip cannot.
 * - **No items, no strip.** Nothing missed is nothing to show, so it renders nothing rather than an empty card.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface InCaseYouMissedItItem
  extends Pick<InCaseYouMissedItCardProps, 'type' | 'title' | 'user' | 'created' | 'days'> {
  /** The Added Value's id — the key, and what `onOpen` / `onDismiss` report. */
  id: string;
}

export interface InCaseYouMissedItProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  items: readonly InCaseYouMissedItItem[];
  onOpen?: (item: InCaseYouMissedItItem) => void;
  /** Dismiss — the ✕ on each card. Omit it and the cards have none. */
  onDismiss?: (item: InCaseYouMissedItItem) => void;
  /** The strip's heading. */
  title?: string;
  /** What the ⓘ says. */
  hint?: string;
}

export const InCaseYouMissedIt = React.forwardRef<HTMLElement, InCaseYouMissedItProps>(
  (
    {
      className,
      items,
      onOpen,
      onDismiss,
      title = 'In Case You Missed it',
      hint = 'Added Values that have been waiting for a while and may need your attention.',
      ...props
    },
    ref,
  ) => {
    const headingId = React.useId();
    const scroller = React.useRef<HTMLUListElement>(null);
    const [edges, setEdges] = React.useState({ start: true, end: true });

    /* Which arrows make sense: none at an end the row cannot go past, none when it all fits. */
    const measure = React.useCallback(() => {
      const el = scroller.current;
      if (!el) return;
      setEdges({
        start: el.scrollLeft <= 1,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
      });
    }, []);
    React.useEffect(() => {
      measure();
      const el = scroller.current;
      if (!el || typeof ResizeObserver === 'undefined') return undefined;
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      return () => observer.disconnect();
    }, [measure, items.length]);

    /* One card at a time, whatever width the cards are. */
    const move = (direction: 1 | -1) => {
      const el = scroller.current;
      const card = el?.firstElementChild as HTMLElement | null;
      el?.scrollBy({ left: direction * (card?.offsetWidth ?? el.clientWidth), behavior: 'smooth' });
    };

    /* Dragging the row with a mouse, since a hidden scrollbar leaves nothing to grab. Past a few pixels it is a
       drag, and the click that ends it is swallowed, so letting go over a card does not open it. */
    const drag = React.useRef<{ x: number; left: number } | null>(null);
    const [dragging, setDragging] = React.useState(false);
    const justDragged = React.useRef(false);
    const endDrag = () => {
      if (drag.current && dragging) justDragged.current = true;
      drag.current = null;
      setDragging(false);
    };

    if (items.length === 0) return null;

    /* A 40 press area around a 32 disc: one size down from the design's `_ICYMI_Arrow_Button` (48 around 40), which read as
       too big beside the cards, with the same 40 minimum target. */
    const arrow =
      'group/arrow absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-pill pointer-coarse:hidden opacity-0 transition-opacity group-hover/strip:opacity-100 group-focus-within/strip:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused';
    const disc =
      'grid size-8 place-items-center rounded-pill bg-neutral-tonal-surface-default text-neutral-tonal-content-default transition-colors group-hover/arrow:bg-neutral-tonal-surface-hover group-active/arrow:bg-neutral-tonal-surface-pressed';

    return (
      <section
        ref={ref}
        aria-labelledby={headingId}
        className={cn('rounded-md bg-surface-elevated p-4 font-sans', className)}
        {...props}
      >
        <div className="flex items-center gap-1 p-2">
          <h2 id={headingId} className="m-0 text-title-sm-semibold text-text-primary">
            {title}
          </h2>
          <Tooltip content={hint} placement="bottom">
            <button
              type="button"
              aria-label={`About ${title}`}
              className="grid size-4 place-items-center rounded-sm text-text-tertiary hover:text-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused"
            >
              <Icon name="info" size="sm" />
            </button>
          </Tooltip>
        </div>

        <div className="group/strip relative">
          <ul
            ref={scroller}
            onScroll={measure}
            onPointerDown={(event) => {
              if (event.pointerType !== 'mouse' || event.button !== 0) return;
              drag.current = { x: event.clientX, left: scroller.current?.scrollLeft ?? 0 };
              justDragged.current = false;
            }}
            onPointerMove={(event) => {
              const start = drag.current;
              if (!start || !scroller.current) return;
              const dx = event.clientX - start.x;
              if (!dragging && Math.abs(dx) < 5) return;
              if (!dragging) setDragging(true);
              scroller.current.scrollLeft = start.left - dx;
            }}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onPointerCancel={endDrag}
            onClickCapture={(event) => {
              if (!justDragged.current) return;
              justDragged.current = false;
              event.preventDefault();
              event.stopPropagation();
            }}
            className={cn(
              'm-0 flex list-none overflow-x-auto p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
              dragging ? 'cursor-grabbing snap-none select-none' : 'snap-x',
            )}
          >
            {items.map((item) => (
              <li key={item.id} className="w-85 shrink-0 snap-start">
                <InCaseYouMissedItCard
                  type={item.type}
                  title={item.title}
                  user={item.user}
                  created={item.created}
                  days={item.days}
                  onOpen={onOpen ? () => onOpen(item) : undefined}
                  onDismiss={onDismiss ? () => onDismiss(item) : undefined}
                />
              </li>
            ))}
          </ul>

          {!edges.start && (
            <button type="button" aria-label="Previous" onClick={() => move(-1)} className={cn(arrow, 'left-0')}>
              <span className={disc}>
                <Icon name="caret-left" size="md" aria-hidden="true" />
              </span>
            </button>
          )}
          {!edges.end && (
            <button type="button" aria-label="Next" onClick={() => move(1)} className={cn(arrow, 'right-0')}>
              <span className={disc}>
                <Icon name="caret-right" size="md" aria-hidden="true" />
              </span>
            </button>
          )}
        </div>
      </section>
    );
  },
);
InCaseYouMissedIt.displayName = 'InCaseYouMissedIt';

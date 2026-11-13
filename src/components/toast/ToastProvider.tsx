import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { DEFAULT_TOAST_DURATION, Toast, type ToastTone } from './Toast';

/* A layout effect that does not warn when the viewport is rendered on a server. */
const useIsoLayoutEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

/** How long a toast takes to arrive or leave. `duration-200` below must match. */
const SLOT_MS = 200;
/** The space between stacked toasts, carried by each slot as its top padding (`pt-2`). */
const SLOT_GAP = 8;

const noop = () => {};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

/** Where the stack sits. The top right is the default, as the design draws it; centred reads as more urgent. */
export type ToastPosition = 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';

/** Everything `toast()` accepts. Mirrors `ToastProps`, minus the DOM plumbing. */
export interface ToastOptions {
  tone?: ToastTone;
  title?: React.ReactNode;
  /** Supporting detail. Named `description` here because `children` has no meaning in an options object. */
  description?: React.ReactNode;
  toneLabel?: string;
  /** Adding an action switches auto-dismiss off, unless `duration` is at least `MIN_ACTION_TOAST_DURATION` — see `Toast`. */
  actionLabel?: string;
  onAction?: () => void;
  dismissLabel?: string;
  /** `null` keeps it up until dismissed. Defaults to `DEFAULT_TOAST_DURATION`. */
  duration?: number | null;
  /**
   * `false` shows the toast without reading it out: it goes into a plain stack
   * beside the live regions instead of into one. Only for a toast that repeats
   * a message already announced somewhere else — a blocked Submit, whose field
   * errors announce themselves — so it is said once. Never for a toast that is
   * the only place its message lives. Defaults to `true`.
   */
  announce?: boolean;
}

/** A queued toast: the options plus the id the queue uses to find it again. */
export interface ToastRecord extends ToastOptions {
  id: string;
}

export interface ToastContextValue {
  /** Show a toast. Returns its id so you can dismiss it early. */
  toast: (options: ToastOptions) => string;
  /** Remove one toast by id. Safe to call on an id that has already gone. */
  dismiss: (id: string) => void;
  /** Remove everything on screen — route changes, sign-out. */
  dismissAll: () => void;
  /** What is currently queued, oldest first. Read-only. */
  toasts: readonly ToastRecord[];
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

/**
 * The only supported way to raise a toast.
 *
 * It throws outside a provider rather than falling back to something that
 * "works", because the thing that would silently stop working is the
 * announcement: a toast rendered without `ToastViewport` already in the page is
 * invisible to a screen reader and looks completely fine on screen. A loud
 * failure at development time is the cheapest place to catch that.
 */
export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error(
      'useToast() was called outside <ToastProvider>. The provider renders <ToastViewport>, ' +
        'which is the live region a toast needs in order to be announced — a toast raised ' +
        'without it is silent to assistive technology. Mount <ToastProvider> once, near the ' +
        'root of the app.',
    );
  }
  return context;
}

/**
 * ToastViewport — the host, and the live regions.
 *
 * **This is the part that has to already be in the DOM.** Assistive technology
 * subscribes to live regions when it meets them; a region that is inserted at
 * the same moment as its first message is routinely announced late, or not at
 * all. So the viewport renders both regions from first paint, empty, and
 * toasts are appended *into* them.
 *
 * There are two, not one, and they are not interchangeable:
 *
 * - `role="status"` (implicitly `aria-live="polite"`) takes `info`, `success`
 *   and `warning`. Polite waits for a gap in speech. A "Saved" confirmation that
 *   cuts the user off mid-sentence costs them their place for no benefit.
 * - `role="alert"` (implicitly `aria-live="assertive"`) takes `critical` only.
 *   Assertive interrupts. That is only ever worth it when carrying on would
 *   waste the user's work — a failed save, a lost connection. Route anything
 *   else here and users learn to tune the region out.
 *
 * Both regions carry an explicit `aria-atomic="false"`, which matters more than
 * it looks: `status` and `alert` both *imply* `aria-atomic="true"`, and with
 * three toasts on screen that makes every new arrival re-read all three.
 *
 * Rendering `<ToastViewport />` with no toasts is not a no-op — it is the whole
 * point. It puts the empty regions in the page.
 *
 * A toast raised with `announce: false` goes in neither region. It lands in a
 * third stack after them, with no role and no `aria-live`: on screen like any
 * other toast, reachable when the user reads the page, never read out on
 * arrival. That stack is only rendered while it holds something, since it has
 * no announcement to set up in advance.
 */
const viewport = cva(
  [
    /* Fixed, and click-through: the stack must never swallow a click meant for
       the page. Each Toast turns pointer events back on for itself. The 24
       from the screen's edges is Figma's (16 on a phone, to leave the toast
       room); the column is as wide as a toast and its two paddings. */
    'pointer-events-none fixed z-50 flex w-full max-w-md flex-col p-4 sm:p-6',
  ],
  {
    variants: {
      position: {
        'top-right': 'top-0 right-0',
        'top-center': 'top-0 left-1/2 -translate-x-1/2',
        'bottom-right': 'right-0 bottom-0',
        'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
      },
    },
    defaultVariants: { position: 'top-right' },
  },
);

export interface ToastViewportProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof viewport> {
  /** The queue to render. Omit it and you get two empty live regions, which is valid and useful. */
  toasts?: readonly ToastRecord[];
  /** Called with the id when a toast dismisses itself or is dismissed. */
  onDismiss?: (id: string) => void;
  /** Accessible name for the polite region. */
  politeLabel?: string;
  /** Accessible name for the assertive region. */
  assertiveLabel?: string;
}

export const ToastViewport = React.forwardRef<HTMLDivElement, ToastViewportProps>(
  function ToastViewport(
    {
      className,
      position,
      toasts = [],
      onDismiss,
      politeLabel = 'Notifications',
      assertiveLabel = 'Errors',
      ...props
    },
    ref,
  ) {
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const setRoot = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    /* Every toast keeps one place in the order, from the first time it is seen
       to the last, so a toast that is leaving does not jump when the ones after
       it move up. Oldest first, newest last. */
    const serials = React.useRef(new Map<string, number>());
    const nextSerial = React.useRef(0);
    const serialOf = (id: string) => {
      let serial = serials.current.get(id);
      if (serial === undefined) {
        serial = nextSerial.current++;
        serials.current.set(id, serial);
      }
      return serial;
    };

    /* How many of the queue fit on screen, oldest first. The rest wait, unmounted
       — so their timers have not started and a screen reader has not met them —
       until room is made. 0 until the first measurement, which happens before the
       first paint. */
    const [count, setCount] = React.useState(0);
    const [ghosts, setGhosts] = React.useState<readonly ToastRecord[]>([]);
    const [resizes, setResizes] = React.useState(0);

    const nodes = React.useRef(new Map<string, HTMLElement>());
    const track = (id: string) => (node: HTMLElement | null) => {
      if (node) nodes.current.set(id, node);
      else nodes.current.delete(id);
    };
    const shown = toasts.slice(0, count);
    const waiting = toasts.slice(count);

    const rendered = React.useRef<readonly ToastRecord[]>([]);
    const blocked = React.useRef('');

    useIsoLayoutEffect(() => {
      const root = rootRef.current;
      if (!root) return;
      const liveIds = new Set(toasts.map((t) => t.id));

      /* A toast that was on screen and is not in the queue any more leaves
         through a slot of its own, which closes. One that never got on screen
         just goes. */
      if (!prefersReducedMotion()) {
        const gone = rendered.current.filter(
          (t) => !liveIds.has(t.id) && !ghosts.some((g) => g.id === t.id),
        );
        if (gone.length > 0) setGhosts((current) => [...current, ...gone]);
      }
      rendered.current = toasts.slice(0, count);

      /* Fit: as many, oldest first, as the screen has room for, counting those
         still leaving. Always at least one, so a toast taller than the screen
         is still shown. */
      const style = window.getComputedStyle(root);
      const room =
        window.innerHeight -
        (parseFloat(style.paddingTop) || 0) -
        (parseFloat(style.paddingBottom) || 0) +
        SLOT_GAP;
      let used = ghosts.reduce((sum, g) => sum + (nodes.current.get(g.id)?.offsetHeight ?? 0), 0);
      let fit = 0;
      for (const t of toasts) {
        const height = nodes.current.get(t.id)?.offsetHeight ?? 0;
        if (fit > 0 && used + height > room) break;
        used += height;
        fit += 1;
      }

      /* If showing one more made the stack too tall, it was taken back; do not
         offer it again until something else changes. */
      const key = `${toasts.map((t) => t.id).join(',')}|${ghosts.length}|${window.innerHeight}|${resizes}`;
      if (fit > count && blocked.current === key) fit = count;
      if (fit < count) blocked.current = key;
      if (fit !== count) setCount(fit);
    }, [toasts, ghosts, count, resizes]);

    React.useEffect(() => {
      const onResize = () => setResizes((n) => n + 1);
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }, []);

    const announced = shown.filter((t) => t.announce !== false);
    const polite = announced.filter((t) => (t.tone ?? 'info') !== 'critical');
    const assertive = announced.filter((t) => t.tone === 'critical');
    const quiet = shown.filter((t) => t.announce === false);

    /* A toast hugs its content, so a short one is narrower than the column it
       stacks in. Pack the stack against the edge it is anchored to — the right
       edge, or the middle for the centred positions — or short toasts sit at the
       column's left and the stack looks ragged. */
    const align = position?.endsWith('center') ? 'items-center' : 'items-end';

    const slot = (item: ToastRecord) => (
      <ToastSlot key={item.id} order={serialOf(item.id)} innerRef={track(item.id)}>
        {renderToast(item, onDismiss)}
      </ToastSlot>
    );

    return (
      <div ref={setRoot} className={cn(viewport({ position }), align, className)} {...props}>
        {/* `-mt-2` takes back the first slot's top padding, so the 24 from the
            screen's edge is to the toast itself. */}
        <div className={cn('-mt-2 flex w-full flex-col', align)}>
          <ToastRegion role="status" label={politeLabel} toasts={polite} slot={slot} />
          <ToastRegion role="alert" label={assertiveLabel} toasts={assertive} slot={slot} />
          {quiet.length > 0 && (
            /* Shown, not announced: no role, no aria-live, and so no name either —
               a plain div may not carry an aria-label. */
            <div className="contents">{quiet.map(slot)}</div>
          )}
          {/* Leaving: a copy that fades and closes, so the toasts after it move up
              smoothly. Not part of the page any more, so not read, not focusable. */}
          {ghosts.length > 0 && (
            <div aria-hidden="true" inert className="contents">
              {ghosts.map((item) => (
                <ToastSlot
                  key={item.id}
                  leaving
                  order={serialOf(item.id)}
                  innerRef={track(item.id)}
                  onGone={() => setGhosts((current) => current.filter((g) => g.id !== item.id))}
                >
                  {renderToast(item, noop, true)}
                </ToastSlot>
              ))}
            </div>
          )}
        </div>
        {waiting.length > 0 && (
          /* The ones waiting for room, drawn where nobody can see or reach them, only to
             be measured: the same width as the real stack, so the height is the one
             they will have. Hidden from assistive technology, so nothing is announced
             early. */
          <div
            aria-hidden="true"
            inert
            className={cn(
              viewport({ position }),
              'invisible',
              align,
              className,
            )}
          >
            <div className={cn('-mt-2 flex w-full flex-col', align)}>
              {waiting.map((item) => (
                <div key={item.id} ref={track(item.id)} className="max-sm:w-full pt-2">
                  {renderToast(item, noop, true)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
);

function renderToast(item: ToastRecord, onDismiss?: (id: string) => void, still = false) {
  return (
    <Toast
      key={item.id}
      tone={item.tone}
      title={item.title}
      toneLabel={item.toneLabel}
      actionLabel={item.actionLabel}
      onAction={item.onAction}
      dismissLabel={item.dismissLabel}
      /* A copy being measured, or leaving, runs no timer. */
      duration={still ? null : item.duration === undefined ? DEFAULT_TOAST_DURATION : item.duration}
      onDismiss={() => onDismiss?.(item.id)}
    >
      {item.description}
    </Toast>
  );
}

/**
 * One toast's place in the stack. It opens when the toast arrives and closes
 * when it leaves, and the toasts around it follow, since the slot's height is
 * what changes: that is the smooth shift. With reduced motion it does not
 * animate at all.
 */
function ToastSlot({
  order,
  leaving = false,
  onGone,
  innerRef,
  children,
}: {
  order: number;
  leaving?: boolean;
  onGone?: () => void;
  innerRef?: (node: HTMLElement | null) => void;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  /* A new toast starts closed and opens; a leaving one starts open and closes. */
  const [open, setOpen] = React.useState(leaving);
  const [settled, setSettled] = React.useState(false);

  useIsoLayoutEffect(() => {
    /* Read the layout once so the starting state is drawn, and the change is
       a transition rather than the first frame. */
    ref.current?.getBoundingClientRect();
    setOpen(!leaving);
  }, [leaving]);

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      if (open) setSettled(true);
      else onGone?.();
    }, SLOT_MS + 20);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div
      ref={ref}
      style={{ order }}
      className={cn(
        'grid max-sm:w-full',
        'transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none',
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        leaving && 'pointer-events-none',
      )}
    >
      {/* Clipped only while it moves, so a settled toast's shadow and focus ring are whole. */}
      <div className={cn('min-h-0', open && settled ? 'overflow-visible' : 'overflow-hidden')}>
        <div ref={innerRef} className="pt-2">
          {children}
        </div>
      </div>
    </div>
  );
}

function ToastRegion({
  role,
  label,
  toasts,
  slot,
}: {
  role: 'status' | 'alert';
  label: string;
  toasts: readonly ToastRecord[];
  slot: (item: ToastRecord) => React.ReactNode;
}) {
  return (
    <div
      role={role}
      /* Stated rather than left implicit, so it is obvious in the DOM which
         region is which without looking the roles up. */
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
      /* The correction that stops three toasts being re-read on every arrival. */
      aria-atomic="false"
      /* Removals are not news; only announce what arrives. */
      aria-relevant="additions"
      aria-label={label}
      /* No `empty:hidden`, and no conditional render around this element. A
         region with `display: none` is not in the accessibility tree, so hiding
         it while empty would re-create the exact bug the viewport exists to
         prevent. `contents` takes the box away, not the element: the region stays
         in the tree, and its toasts are laid out in the one stack, in the order
         they came, whichever region they are in. */
      className="contents"
    >
      {toasts.map(slot)}
    </div>
  );
}

let sequence = 0;

export interface ToastProviderProps {
  children?: React.ReactNode;
  /** Where the stack sits. Defaults to `top-right`. */
  position?: ToastPosition;
  /** Merged onto the viewport, not onto the provider — the provider renders nothing of its own. */
  viewportClassName?: string;
}

/**
 * ToastProvider — mount once, near the root of the app.
 *
 * It renders `children`, then `ToastViewport` after them. Two consequences,
 * both deliberate:
 *
 * 1. The live regions exist from the first paint, before any toast can be
 *    raised. The pre-existing-container rule is satisfied by construction, and
 *    there is no way to raise a toast through `useToast()` without it — the hook
 *    throws.
 * 2. The viewport is last in the DOM, so a keyboard user reaches the dismiss
 *    button after the page content rather than being dropped into it. Focus is
 *    never moved to a toast; the user chooses to go there.
 */
export function ToastProvider({
  children,
  position = 'top-right',
  viewportClassName,
}: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<readonly ToastRecord[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const dismissAll = React.useCallback(() => setToasts([]), []);

  const toast = React.useCallback((options: ToastOptions) => {
    sequence += 1;
    const id = `vcp-toast-${sequence}`;
    setToasts((current) => [...current, { ...options, id }]);
    return id;
  }, []);

  const value = React.useMemo<ToastContextValue>(
    () => ({ toast, dismiss, dismissAll, toasts }),
    [toast, dismiss, dismissAll, toasts],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport
        toasts={toasts}
        onDismiss={dismiss}
        position={position}
        className={viewportClassName}
      />
    </ToastContext.Provider>
  );
}

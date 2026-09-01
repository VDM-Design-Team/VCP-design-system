import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { DEFAULT_TOAST_DURATION, Toast, type ToastTone } from './Toast';

/** Where the stack sits. Corner-anchored is the default; centred reads as more urgent. */
export type ToastPosition = 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';

/** Everything `toast()` accepts. Mirrors `ToastProps`, minus the DOM plumbing. */
export interface ToastOptions {
  tone?: ToastTone;
  title?: React.ReactNode;
  /** Supporting detail. Named `description` here because `children` has no meaning in an options object. */
  description?: React.ReactNode;
  toneLabel?: string;
  /** Adding an action switches auto-dismiss off — see `Toast`. */
  actionLabel?: string;
  onAction?: () => void;
  dismissLabel?: string;
  /** `null` keeps it up until dismissed. Defaults to `DEFAULT_TOAST_DURATION`. */
  duration?: number | null;
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
 * - `role="alert"` (implicitly `aria-live="assertive"`) takes `danger` only.
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
 */
const viewport = cva(
  [
    /* Fixed, and click-through: the stack must never swallow a click meant for
       the page. Each Toast turns pointer events back on for itself. */
    'pointer-events-none fixed z-50 flex w-full max-w-sm flex-col gap-2 p-4',
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
    defaultVariants: { position: 'bottom-right' },
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
    const polite = toasts.filter((t) => (t.tone ?? 'info') !== 'danger');
    const assertive = toasts.filter((t) => t.tone === 'danger');

    return (
      <div ref={ref} className={cn(viewport({ position }), className)} {...props}>
        <ToastRegion
          role="status"
          label={politeLabel}
          toasts={polite}
          onDismiss={onDismiss}
        />
        <ToastRegion
          role="alert"
          label={assertiveLabel}
          toasts={assertive}
          onDismiss={onDismiss}
        />
      </div>
    );
  },
);

function ToastRegion({
  role,
  label,
  toasts,
  onDismiss,
}: {
  role: 'status' | 'alert';
  label: string;
  toasts: readonly ToastRecord[];
  onDismiss?: (id: string) => void;
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
         prevent. An empty flex column is zero pixels tall anyway. */
      className="flex flex-col gap-2"
    >
      {toasts.map((item) => (
        <Toast
          key={item.id}
          tone={item.tone}
          title={item.title}
          toneLabel={item.toneLabel}
          actionLabel={item.actionLabel}
          onAction={item.onAction}
          dismissLabel={item.dismissLabel}
          duration={item.duration === undefined ? DEFAULT_TOAST_DURATION : item.duration}
          onDismiss={() => onDismiss?.(item.id)}
        >
          {item.description}
        </Toast>
      ))}
    </div>
  );
}

let sequence = 0;

export interface ToastProviderProps {
  children?: React.ReactNode;
  /** Where the stack sits. Defaults to `bottom-right`. */
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
  position = 'bottom-right',
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

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Icon, type IconName } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';

/** The four accent families a Toast can speak in. `danger` is `accent.critical`. */
export type ToastTone = 'info' | 'success' | 'warning' | 'danger';

/**
 * How long a Toast waits before it dismisses itself, when nobody says otherwise.
 *
 * The floor everyone quotes is five seconds; this adds a second on top because
 * VCP toasts routinely carry a sentence rather than a word. The timer only ever
 * starts when the user is not looking at the toast — see the pause rules below.
 */
export const DEFAULT_TOAST_DURATION = 6000;

/**
 * Tone → glyph. Four different *shapes*, not four colours of the same shape:
 * a screenshot in greyscale, or a user with a colour vision deficiency, still
 * tells an error from a confirmation. See docs/toast.md, "Tone is never colour
 * alone".
 */
const TONE_ICON: Record<ToastTone, IconName> = {
  info: 'info',
  success: 'check-circle',
  warning: 'warning',
  danger: 'x-circle',
};

/**
 * Tone → the word a screen reader hears before the message. The glyph is given
 * this as its accessible name, so the tone survives into the announcement:
 * "Error, Deploy failed, …". Override with `toneLabel` to localise.
 */
const TONE_LABEL: Record<ToastTone, string> = {
  info: 'Information',
  success: 'Success',
  warning: 'Warning',
  danger: 'Error',
};

/**
 * Toast — a transient message that appears, says one thing, and goes away.
 *
 * A Toast interrupts nothing. It does not take focus, it does not block the
 * page, and the user is never required to deal with it. If the user *must* deal
 * with it, it is a Modal; if it needs to stay put until a condition clears, it
 * is a `Banner`. docs/toast.md has the table.
 *
 * ## This component carries no live region, on purpose
 *
 * A toast that is inserted into the page with `role="status"` already on it is
 * the single most common bug in this component's category: assistive tech
 * watches live regions it *already knows about*, so a region that arrives at the
 * same moment as its content is usually announced late or not at all.
 *
 * So the role does not live here. It lives on `ToastViewport`, which is mounted
 * with the app and is empty until a toast arrives. There is nothing on this
 * element for a caller to get wrong, because there is nothing here to set.
 * Render toasts through `ToastProvider` / `useToast()` and it is handled.
 *
 * ## Auto-dismiss and WCAG 2.2.1
 *
 * Content that disappears on a timer fails 2.2.1 unless the user can pause,
 * extend or dismiss it. This component does all three: `onDismiss` gives a real
 * control, the timer pauses whenever the pointer is over the toast, whenever
 * focus is inside it, and whenever the tab is in the background, and it resumes
 * from where it stopped rather than restarting. A Toast that carries an action
 * never auto-dismisses at all — a control the user cannot reach in time is not
 * a control.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const toast = cva(
  [
    /* The viewport is `pointer-events-none` so it never eats a click on the
       page underneath; the toast itself puts them back so it can be hovered,
       which is what pauses the timer. */
    'pointer-events-auto',
    /* `relative` + clipping so the timer bar can sit flush on the bottom edge
       and follow the rounded corner. */
    'relative flex w-full max-w-sm items-start gap-3 overflow-hidden',
    /* shape.radius.md, borderWidth.default. ds-lint-ignore */
    'rounded-md border px-3.5 py-3',
    /* shape.shadow.menu — the toast floats over the page; the Banner does not.
       This shadow is the whole visual difference between the two. */
    'shadow-menu',
    'font-sans',
  ],
  {
    variants: {
      /* Each tone is the `accent.<name>.tonal` surface/content pair Badge
         already proved in both themes, edged with `outline.content.default` so
         the boundary clears 3:1 against the page. docs/toast.md has the figures. */
      tone: {
        info: [
          'bg-accent-info-tonal-surface-default',
          'text-accent-info-tonal-content-default',
          'border-accent-info-outline-content-default',
        ],
        success: [
          'bg-accent-success-tonal-surface-default',
          'text-accent-success-tonal-content-default',
          'border-accent-success-outline-content-default',
        ],
        warning: [
          'bg-accent-warning-tonal-surface-default',
          'text-accent-warning-tonal-content-default',
          'border-accent-warning-outline-content-default',
        ],
        danger: [
          'bg-accent-critical-tonal-surface-default',
          'text-accent-critical-tonal-content-default',
          'border-accent-critical-outline-content-default',
        ],
      },
    },
    defaultVariants: { tone: 'info' },
  },
);

/**
 * The dismiss control sits *on* a tonal fill, so it cannot keep IconButton's
 * `action.tertiary.*` colours — those are tuned for the page surface and drop
 * to 3.75:1 on the pale fills in dark. These put it back on the tone's own
 * tonal triad, which measures 4.10:1 at worst across every state and theme.
 */
const TONE_CONTROL: Record<ToastTone, string> = {
  info: [
    'text-accent-info-tonal-content-default',
    'hover:bg-accent-info-tonal-surface-hover hover:text-accent-info-tonal-content-hover',
    'active:bg-accent-info-tonal-surface-pressed active:text-accent-info-tonal-content-pressed',
  ].join(' '),
  success: [
    'text-accent-success-tonal-content-default',
    'hover:bg-accent-success-tonal-surface-hover hover:text-accent-success-tonal-content-hover',
    'active:bg-accent-success-tonal-surface-pressed active:text-accent-success-tonal-content-pressed',
  ].join(' '),
  warning: [
    'text-accent-warning-tonal-content-default',
    'hover:bg-accent-warning-tonal-surface-hover hover:text-accent-warning-tonal-content-hover',
    'active:bg-accent-warning-tonal-surface-pressed active:text-accent-warning-tonal-content-pressed',
  ].join(' '),
  danger: [
    'text-accent-critical-tonal-content-default',
    'hover:bg-accent-critical-tonal-surface-hover hover:text-accent-critical-tonal-content-hover',
    'active:bg-accent-critical-tonal-surface-pressed active:text-accent-critical-tonal-content-pressed',
  ].join(' '),
};

/**
 * The action button, same problem and same answer. The outline takes the tone's
 * *content* colour rather than `outline.border.default`, which would sit at
 * 1.78:1 on the pale fills — a control border has to clear 3:1.
 */
const TONE_ACTION: Record<ToastTone, string> = {
  info: [
    'bg-transparent text-accent-info-tonal-content-default',
    'border-accent-info-tonal-content-default',
    'hover:bg-accent-info-tonal-surface-hover hover:text-accent-info-tonal-content-hover hover:border-accent-info-tonal-content-hover',
    'active:bg-accent-info-tonal-surface-pressed active:text-accent-info-tonal-content-pressed active:border-accent-info-tonal-content-pressed',
  ].join(' '),
  success: [
    'bg-transparent text-accent-success-tonal-content-default',
    'border-accent-success-tonal-content-default',
    'hover:bg-accent-success-tonal-surface-hover hover:text-accent-success-tonal-content-hover hover:border-accent-success-tonal-content-hover',
    'active:bg-accent-success-tonal-surface-pressed active:text-accent-success-tonal-content-pressed active:border-accent-success-tonal-content-pressed',
  ].join(' '),
  warning: [
    'bg-transparent text-accent-warning-tonal-content-default',
    'border-accent-warning-tonal-content-default',
    'hover:bg-accent-warning-tonal-surface-hover hover:text-accent-warning-tonal-content-hover hover:border-accent-warning-tonal-content-hover',
    'active:bg-accent-warning-tonal-surface-pressed active:text-accent-warning-tonal-content-pressed active:border-accent-warning-tonal-content-pressed',
  ].join(' '),
  danger: [
    'bg-transparent text-accent-critical-tonal-content-default',
    'border-accent-critical-tonal-content-default',
    'hover:bg-accent-critical-tonal-surface-hover hover:text-accent-critical-tonal-content-hover hover:border-accent-critical-tonal-content-hover',
    'active:bg-accent-critical-tonal-surface-pressed active:text-accent-critical-tonal-content-pressed active:border-accent-critical-tonal-content-pressed',
  ].join(' '),
};

export interface ToastProps
  /* Native `title` is a tooltip string; ours is the rendered headline. */
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    /* `tone` is redeclared below: cva types a variant as `… | null`, and null is
       not an index into the tone maps. ds-lint-ignore */
    Omit<VariantProps<typeof toast>, 'tone'> {
  /** Which accent family the toast speaks in. */
  tone?: ToastTone;
  /** The headline. One short clause — "Deploy failed", not a paragraph. */
  title?: React.ReactNode;
  /** Supporting detail under the title. Optional, and usually unnecessary. */
  children?: React.ReactNode;
  /**
   * Overrides the word the tone glyph is announced as ("Error", "Success", …).
   * Set it to localise; do not set it to an empty string — the tone would then
   * be carried by colour alone.
   */
  toneLabel?: string;
  /**
   * Label for a single inline action. **A Toast with an action never
   * auto-dismisses**, whatever `duration` says: an action the user has to catch
   * before it vanishes is not usable, and racing a timer fails WCAG 2.2.1.
   */
  actionLabel?: string;
  /** Fired when the action is pressed. Ignored without `actionLabel`. */
  onAction?: () => void;
  /**
   * Renders the dismiss control and fires when it is pressed — and when the
   * auto-dismiss timer runs out. Without it there is no way to close the toast,
   * so `duration` does nothing either.
   */
  onDismiss?: () => void;
  /**
   * Accessible name for the dismiss control. Defaults to `Dismiss: <title>`
   * when `title` is a plain string, and to `Dismiss notification` otherwise.
   */
  dismissLabel?: string;
  /**
   * Milliseconds before the toast dismisses itself, or `null` for never.
   * **Defaults to `null` here** — a bare `<Toast>` never starts a timer you did
   * not ask for. `useToast()` supplies `DEFAULT_TOAST_DURATION` instead.
   *
   * The timer pauses on hover, on focus within, and while the tab is hidden,
   * and resumes with the time that was left rather than starting over.
   */
  duration?: number | null;
  /**
   * Called whenever the timer pauses or resumes. Instrumentation only — the
   * pause happens with or without it. Handy for tests and for the story that
   * demonstrates 2.2.1.
   */
  onPauseChange?: (paused: boolean) => void;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(function Toast(
  {
    className,
    tone = 'info',
    title,
    children,
    toneLabel,
    actionLabel,
    onAction,
    onDismiss,
    dismissLabel,
    duration = null,
    onPauseChange,
    onPointerEnter,
    onPointerLeave,
    onFocus,
    onBlur,
    ...props
  },
  ref,
) {
  const hasAction = Boolean(actionLabel);

  /* A toast the user is asked to act on must wait for them. This is not a
     suggestion the caller can override — passing both is a mistake, and the
     safe reading of the mistake is "keep it on screen". */
  const timed = !hasAction && typeof duration === 'number' && duration > 0 && Boolean(onDismiss);

  const [hovered, setHovered] = React.useState(false);
  const [focusWithin, setFocusWithin] = React.useState(false);
  const [backgrounded, setBackgrounded] = React.useState(false);
  const paused = hovered || focusWithin || backgrounded;

  /* A timer that keeps counting in a tab the user cannot see is a toast that
     was never really shown. Pause with the page. */
  React.useEffect(() => {
    if (!timed) return;
    const sync = () => setBackgrounded(document.visibilityState !== 'visible');
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, [timed]);

  /* Read through a ref so a caller's inline arrow function does not restart the
     countdown on every render. */
  const dismissRef = React.useRef(onDismiss);
  React.useEffect(() => {
    dismissRef.current = onDismiss;
  });

  const pauseChangeRef = React.useRef(onPauseChange);
  React.useEffect(() => {
    pauseChangeRef.current = onPauseChange;
  });
  React.useEffect(() => {
    pauseChangeRef.current?.(paused);
  }, [paused]);

  /* What is left of the countdown. Pausing banks it; resuming spends the rest,
     so hovering extends the toast instead of restarting it. */
  const remainingRef = React.useRef(0);
  React.useEffect(() => {
    remainingRef.current = typeof duration === 'number' ? duration : 0;
  }, [duration]);

  React.useEffect(() => {
    if (!timed || paused) return;
    const startedAt = Date.now();
    const id = window.setTimeout(() => dismissRef.current?.(), remainingRef.current);
    return () => {
      window.clearTimeout(id);
      remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAt));
    };
  }, [timed, paused]);

  /* The timer bar the Figma toast draws (design audit, 3 Sep 2026): the same
     countdown, made visible. Driven by a CSS transition rather than React
     state so it stays smooth without a render per frame — pausing freezes it
     at its current width, resuming spends whatever the timer banked.

     Deliberately NOT `ProgressBar`: that atom is a semantic meter with
     `role="progressbar"` and a value to announce. This is decoration for a
     countdown the toast already communicates, so it is `aria-hidden` and has
     no value at all. */
  const barRef = React.useRef<HTMLSpanElement>(null);
  React.useEffect(() => {
    const bar = barRef.current;
    if (!bar || !timed) return;
    if (paused) {
      const own = bar.getBoundingClientRect().width;
      const track = bar.parentElement?.getBoundingClientRect().width || 1;
      bar.style.transition = 'none';
      bar.style.transform = `scaleX(${track > 0 ? own / track : 0})`;
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      bar.style.transition = `transform ${remainingRef.current}ms linear`;
      bar.style.transform = 'scaleX(0)';
    });
    return () => window.cancelAnimationFrame(frame);
  }, [timed, paused]);

  const resolvedDismissLabel =
    dismissLabel ?? (typeof title === 'string' ? `Dismiss: ${title}` : 'Dismiss notification');

  return (
    <div
      ref={ref}
      className={cn(toast({ tone }), className)}
      /* Deliberately no `role`, no `aria-live`, no `tabIndex`. The live region
         is `ToastViewport`, which was already in the DOM when this arrived, and
         focus stays exactly where the user put it. */
      data-tone={tone}
      /* Observable pause state — the stories and the browser check read this. */
      data-paused={timed ? String(paused) : undefined}
      data-duration={timed ? String(duration) : undefined}
      {...props}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        setHovered(true);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        setHovered(false);
      }}
      /* React's onFocus/onBlur are focusin/focusout — they fire for descendants,
         which is what we want: a keyboard user tabbing into the dismiss button
         holds the timer for as long as they are in here. */
      onFocus={(event) => {
        onFocus?.(event);
        setFocusWithin(true);
      }}
      onBlur={(event) => {
        onBlur?.(event);
        setFocusWithin(false);
      }}
    >
      {/* Named, not decorative: this glyph is the only thing carrying the tone,
          so the tone has to survive into the announcement as a word. */}
      <Icon name={TONE_ICON[tone]} size="md" label={toneLabel ?? TONE_LABEL[tone]} />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title != null && <p className="text-label-lg">{title}</p>}
        {children != null && children !== false && (
          <div className="text-body-md">{children}</div>
        )}
        {hasAction && (
          <div className="mt-1 flex">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className={TONE_ACTION[tone]}
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </div>

      {onDismiss && (
        <IconButton
          icon="x"
          label={resolvedDismissLabel}
          size="md"
          className={cn('-my-1 -mr-1', TONE_CONTROL[tone])}
          onClick={onDismiss}
        />
      )}

      {timed && (
        /* 4 tall, flush to the bottom edge, in the tone's own content colour
           at low opacity so it reads as a track rather than a second border. */
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 overflow-hidden">
          <span
            ref={barRef}
            className="block h-full origin-left bg-current opacity-40"
          />
        </span>
      )}
    </div>
  );
});

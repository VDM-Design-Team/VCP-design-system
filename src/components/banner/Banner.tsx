import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Icon, type IconName } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';

/** The four accent families a Banner can speak in. `danger` is `accent.critical`. */
export type BannerTone = 'info' | 'success' | 'warning' | 'danger';

/** How loudly, if at all, the banner announces itself when it appears. */
export type BannerLive = 'off' | 'polite' | 'assertive';

/** Tone → glyph. Four distinct shapes, so the tone survives greyscale. */
const TONE_ICON: Record<BannerTone, IconName> = {
  info: 'info',
  success: 'check-circle',
  warning: 'warning',
  danger: 'x-circle',
};

/** Tone → the word a screen reader hears. The glyph carries it as its name. */
const TONE_LABEL: Record<BannerTone, string> = {
  info: 'Information',
  success: 'Success',
  warning: 'Warning',
  danger: 'Error',
};

/**
 * Banner — a persistent inline message that sits in the layout.
 *
 * A Banner is the opposite of a `Toast` in every way that matters. It occupies
 * real space in the page instead of floating over it, it reflows the content
 * around it, and it stays until the user dismisses it or the condition that
 * raised it clears. Nothing about it is timed, and it has no auto-dismiss to
 * offer — a message that goes away on its own is a Toast.
 *
 * Because it is part of the page, a Banner that is *rendered with* the page
 * needs no live region at all: it is read in document order like any other
 * content, and wrapping it in one would announce it a second time. `live` is
 * for the other case — a banner that appears in response to something the user
 * did, where nothing else on screen changed to tell them. Read the note on the
 * `live` prop before reaching for it; it is easy to use and easy to misuse.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const banner = cva(
  [
    'flex w-full items-start gap-3',
    /* shape.radius.md, borderWidth.default. ds-lint-ignore */
    'rounded-md border px-3.5 py-3',
    /* No shadow. A Banner is *in* the page, not above it — that, and the width,
       is the whole visual difference from a Toast. */
    'font-sans',
  ],
  {
    variants: {
      /* The same `accent.<name>.tonal` pairs Badge proved, edged with
         `outline.content.default` so the boundary clears 3:1 on the page in
         both themes. docs/banner.md has every figure. */
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
 * The dismiss control sits on a tonal fill, where IconButton's own
 * `action.tertiary.*` colours drop to 3.75:1 in dark. These put it back on the
 * tone's tonal triad — 4.10:1 at worst across every state and both themes.
 */
const TONE_CONTROL: Record<BannerTone, string> = {
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

/** The action button. Outlined in the tone's *content* colour — see docs/banner.md. */
const TONE_ACTION: Record<BannerTone, string> = {
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

interface BannerBaseProps
  /* Native `title` is a tooltip string; ours is the rendered headline. */
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    /* `tone` is redeclared below: cva types a variant as `… | null`, and null is
       not an index into the tone maps. ds-lint-ignore */
    Omit<VariantProps<typeof banner>, 'tone'> {
  /** Which accent family the banner speaks in. */
  tone?: BannerTone;
  /** The headline. One clause — "Two deliverables are missing evidence". */
  title?: React.ReactNode;
  /** The body. Say what happened and what to do about it. */
  children?: React.ReactNode;
  /** Overrides the word the tone glyph is announced as. Set it to localise; never to `''`. */
  toneLabel?: string;
  /** Label for a single inline action. Rendered only with `onAction`. */
  actionLabel?: string;
  /** Fired when the action is pressed. */
  onAction?: () => void;
  /**
   * Whether this banner announces itself when it appears, and how loudly.
   *
   * - `off` (default) — correct for a banner that renders **with** the page. It
   *   is read in document order; a live region would only announce it twice.
   * - `polite` — for a banner that appears **in response to an action**, where
   *   nothing else told the user. Waits for a gap in speech.
   * - `assertive` — interrupts. Reserve it for an error that costs the user
   *   work if they carry on: a failed save, a lost session.
   *
   * **This only works if the Banner element itself is already in the page and
   * its *content* is what changes.** A region that is inserted at the same
   * moment as its first message is announced unreliably — `polite` especially.
   * When the whole Banner is being mounted on demand, put the region on the
   * slot that was always there instead:
   *
   * ```tsx
   * // The wrapper is mounted with the form and never unmounts.
   * <div role="status" aria-live="polite" aria-atomic="false">
   *   {error && <Banner tone="danger" title={error} />}
   * </div>
   * ```
   */
  live?: BannerLive;
}

/**
 * "Close" names the control; it does not name what closing does. On a page with
 * two banners, two buttons called "Close" are indistinguishable in a screen
 * reader's list of controls. So the label is required in the type system,
 * exactly as `IconButton` requires its own — you cannot ship a dismissible
 * Banner without saying what is being dismissed.
 */
type BannerDismissProps =
  | {
      /** Renders the dismiss control and fires when it is pressed. */
      onDismiss: () => void;
      /**
       * Accessible name for the dismiss control. **Required with `onDismiss`.**
       * Name the message, not the gesture: "Dismiss the evidence warning", not
       * "Close".
       */
      dismissLabel: string;
    }
  | { onDismiss?: never; dismissLabel?: never };

export type BannerProps = BannerBaseProps & BannerDismissProps;

export const Banner = React.forwardRef<HTMLDivElement, BannerProps>(function Banner(
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
    live = 'off',
    ...props
  },
  ref,
) {
  const hasAction = Boolean(actionLabel && onAction);

  return (
    <div
      ref={ref}
      className={cn(banner({ tone }), className)}
      /* `off` leaves the element with no role at all, which is the right default
         for content that is simply part of the page. */
      role={live === 'assertive' ? 'alert' : live === 'polite' ? 'status' : undefined}
      aria-live={live === 'off' ? undefined : live}
      /* `status` and `alert` imply atomic; state the opposite so a body change
         does not re-read the whole banner. */
      aria-atomic={live === 'off' ? undefined : 'false'}
      data-tone={tone}
      {...props}
    >
      {/* Named, not decorative. Colour is never the only signal: the shape
          differs per tone, and this gives the tone a word in the announcement. */}
      <Icon name={TONE_ICON[tone]} size="md" label={toneLabel ?? TONE_LABEL[tone]} />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title != null && <p className="text-label-lg">{title}</p>}
        {children != null && children !== false && (
          <div className="text-body-md">{children}</div>
        )}
      </div>

      {hasAction && (
        <div className="flex shrink-0">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className={cn('-my-0.5', TONE_ACTION[tone])}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </div>
      )}

      {onDismiss && (
        <IconButton
          icon="x"
          label={dismissLabel}
          size="md"
          className={cn('-my-1 -mr-1', TONE_CONTROL[tone])}
          onClick={onDismiss}
        />
      )}
    </div>
  );
});

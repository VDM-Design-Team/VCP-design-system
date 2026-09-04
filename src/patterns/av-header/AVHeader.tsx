import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';
import {
  StatusProgression,
  type AVProgressionRole,
  type AVProgressionStatus,
  type AVTransition,
  type AVWorkflow,
} from '../../components/status-progression';

/**
 * AVHeader — the page-level header the Figma `AV_Header` set draws: a back
 * arrow and the page's title on the left, the status-move buttons on the
 * right. This is the header `TopBar` deliberately does not carry; the two
 * stack, app chrome above, page identity below.
 *
 * The Figma set has two `Type` variants, and they differ only in the title:
 *
 * - **`default`** — an existing AV, titled by its id ("VCP-1234"), at body
 *   size and regular weight.
 * - **`new`** — a page being created, titled in words ("Added Value
 *   Creation"), set larger and semibold.
 *
 * The design's boolean `Show Move Status Buttons` is `showStatusActions`
 * here, and the buttons themselves are the `StatusProgression` component —
 * this pattern owns none of the lifecycle knowledge, it only places it.
 *
 * ⚠️ The design's `new` title sits between our ramp's `heading-sm` and
 * `heading-md`; we take the larger step rather than add a ramp size for one
 * header. Flagged in docs/figma-audit.md.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface AVHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** The page's name: an AV id on `default`, words on `new`. */
  title: React.ReactNode;
  /** The Figma `Type` variant — it sets the title's size and weight. */
  type?: 'default' | 'new';
  /** Where back goes. Renders the arrow as a link. */
  backHref?: string;
  /** Back as a history action. Renders the arrow as a button. */
  onBack?: () => void;
  /** The back control's accessible name — say where it goes. */
  backLabel?: string;
  /** The design's `Show Move Status Buttons`. */
  showStatusActions?: boolean;
  workflow?: AVWorkflow;
  role?: AVProgressionRole;
  status?: AVProgressionStatus;
  /** A status button press, straight from `StatusProgression`. */
  onTransition?: (transition: AVTransition) => void;
  /** Anything else the page needs on the right, before the status buttons. */
  actions?: React.ReactNode;
}

export const AVHeader = React.forwardRef<HTMLElement, AVHeaderProps>(
  (
    {
      className,
      title,
      type = 'default',
      backHref,
      onBack,
      backLabel = 'Back',
      showStatusActions = true,
      workflow,
      role,
      status,
      onTransition,
      actions,
      ...props
    },
    ref,
  ) => (
    /* The Figma frame is 32 above, 16 below and to the sides, which puts the
       36-tall buttons in an 84-tall header. */
    <header
      ref={ref}
      className={cn(
        'flex flex-wrap items-center justify-between gap-4 px-4 pb-4 pt-8 font-sans',
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-1">
        {backHref ? (
          /* A real link — middle-click and "open in new tab" work, which they
             cannot on a button. Named here, so the glyph stays decorative. */
          <a
            href={backHref}
            aria-label={backLabel}
            className={cn(
              'inline-flex size-10 shrink-0 items-center justify-center rounded-sm',
              'text-action-tertiary-content-default transition-colors',
              'hover:text-action-tertiary-content-hover',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
            )}
          >
            <Icon name="arrow-left" size="md" aria-hidden="true" />
          </a>
        ) : (
          onBack && (
            <IconButton icon="arrow-left" label={backLabel} variant="tertiary" onClick={onBack} />
          )
        )}
        {/* The page's one h1 — TopBar has none precisely so this can. */}
        <h1
          className={cn(
            'min-w-0 truncate',
            type === 'new' ? 'text-heading-md text-text-primary' : 'text-body-md text-text-primary',
          )}
        >
          {title}
        </h1>
      </div>
      {(actions || (showStatusActions && role && status)) && (
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {showStatusActions && role && status && (
            <StatusProgression
              workflow={workflow}
              role={role}
              status={status}
              onTransition={onTransition}
            />
          )}
        </div>
      )}
    </header>
  ),
);
AVHeader.displayName = 'AVHeader';

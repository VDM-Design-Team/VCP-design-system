import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';

/**
 * PageTitle — the band under the top bar that says which page you are on: an
 * optional back control, the page's `h1`, an optional subtitle, and a slot on
 * the right for whatever the page can do.
 *
 * Read off the Figma `Page_Template` → `Page_Title` (8 Sep 2026): 75 tall,
 * content inset 32 from each side, 32 above the title and 16 below. The
 * subtitle is a real layer, hidden in the pages that do not use one.
 *
 * **This and `AVHeader` draw the same band, and that is not an accident.**
 * `Page_Title` carries a hidden `Status_Progression` instance, which is what
 * `AVHeader` renders. The two differ in one measurement — `AV_Header` insets
 * 16 from the sides where `Page_Title` insets 32 — so they are kept separate
 * rather than merged on a guess. See docs/page-title.md; if design confirms
 * they are one component, `AVHeader` should become this plus the progression
 * buttons.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface PageTitleProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** The page's name. Rendered as the page's one `h1`. */
  title: React.ReactNode;
  /** A line under the title. The design draws it and hides it by default. */
  subtitle?: React.ReactNode;
  /** Where back goes. Renders the arrow as a real link. */
  backHref?: string;
  /** Back as a history action. Renders the arrow as a button. */
  onBack?: () => void;
  /** The back control's accessible name — say where it goes, not "Back". */
  backLabel?: string;
  /** The page's actions, on the right. */
  actions?: React.ReactNode;
}

export const PageTitle = React.forwardRef<HTMLElement, PageTitleProps>(
  ({ className, title, subtitle, backHref, onBack, backLabel = 'Back', actions, ...props }, ref) => (
    /* 32 above, 16 below, 32 each side — the design's own frame. */
    <header
      ref={ref}
      className={cn(
        'flex flex-wrap items-start justify-between gap-4 px-8 pb-4 pt-8 font-sans',
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 items-start gap-1">
        {backHref ? (
          /* A real link — middle-click and open-in-new-tab work, which they
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
        <div className="min-w-0">
          {/* The page's one h1 — TopBar deliberately has none so this can. */}
          <h1 className="min-w-0 truncate text-heading-md text-text-primary">{title}</h1>
          {subtitle && <p className="mt-1 truncate text-body-md text-text-secondary">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  ),
);
PageTitle.displayName = 'PageTitle';

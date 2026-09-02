import * as React from 'react';
import { cn } from '../../lib/cn';

/**
 * EmptyState — what a panel says when it has nothing to show: no results, no
 * items yet, nothing assigned. Centred title, optional icon tile, optional
 * explanation, optional way forward.
 *
 * The copy is the component. The slots enforce nothing, so the guidance lives
 * in docs/empty-state.md: say what is empty, why, and what to do about it —
 * "No suppliers match these filters" beats "Nothing here". An empty state with
 * an `action` is an invitation; without one it is a dead end, so only omit the
 * action when there genuinely is nothing the viewer can do.
 *
 * The heading is an `<h3>`. That is one level below a panel's own heading,
 * which is where this component sits in practice; if your outline differs,
 * `headingLevel` moves it without changing the look.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface EmptyStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Glyph for the brand-tinted tile — pass an `<Icon name="…" size="lg" />`.
   * Decorative: the tile is `aria-hidden`, the title carries the meaning.
   */
  icon?: React.ReactNode;
  /** One line: what is empty. */
  title: React.ReactNode;
  /** One or two lines: why, and what would fill it. Wraps at a readable measure. */
  description?: React.ReactNode;
  /** The way forward — usually a `Button`. */
  action?: React.ReactNode;
  /** Heading level of the title. Default `3` — one below a panel heading. */
  headingLevel?: 2 | 3 | 4;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, headingLevel = 3, ...props }, ref) => {
    const Heading = `h${headingLevel}` as const;
    return (
      <div
        ref={ref}
        className={cn(
          /* 56 vertical, 24 horizontal — enough air that "nothing" reads as
             deliberate, not broken. */
          'flex flex-col items-center justify-center gap-2.5 px-6 py-14 text-center',
          className,
        )}
        {...props}
      >
        {icon && (
          <div
            aria-hidden="true"
            /* surface.brand.base tile, text.brand.medium glyph — the icon
               inherits via currentColor, exactly as everywhere else. */
            className="mb-1 grid size-12 shrink-0 place-items-center rounded-md bg-surface-brand-base text-text-brand-medium"
          >
            {icon}
          </div>
        )}
        <Heading className="m-0 font-sans text-heading-sm text-text-primary">{title}</Heading>
        {description && (
          /* max-w-96 (384) — the export's 380 measure, on the spacing scale. */
          <p className="m-0 max-w-96 font-sans text-body-md text-text-tertiary">{description}</p>
        )}
        {action && <div className="mt-1.5">{action}</div>}
      </div>
    );
  },
);
EmptyState.displayName = 'EmptyState';

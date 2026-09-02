import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../icon';

/**
 * Chip — an interactive pill: a selected filter, a removable tag, a toggleable
 * option. If it only classifies and is never clicked, it is a `Badge`; if it
 * carries a VCP status, it is `StatusPill` (a pattern). The comparison table
 * lives in docs/badge.md.
 *
 * The export rendered a clickable `<span>` with a `<button>` nested inside it —
 * a control the keyboard cannot reach wrapped around one it can. Rebuilt here as
 * real buttons, and because a button must never contain another button, the
 * shape changes with the props:
 *
 * - `onClick` alone → the whole pill is one `<button>`, with `aria-pressed`
 *   when `selected` is supplied.
 * - `onRemove` present → the pill is a `<span>` holding the main region (a
 *   `<button>` when clickable, otherwise a plain span) and the remove button as
 *   siblings — two tab stops, both focusable, neither nested.
 * - neither → a plain `<span>`; use `Badge` instead unless the avatar/count
 *   anatomy is the point.
 *
 * At 28 tall the pill sits below the 40 minimum touch target, same exemption as
 * `IconButton size="sm"`: pointer-dense surfaces only — filter bars, tag
 * editors, table cells. Do not make a chip the only way to reach an action on a
 * touch-first screen.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

export interface ChipProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  /** The visible label. Keep it short — the pill never wraps. */
  label: React.ReactNode;
  /** Leading node — an `<Avatar size="sm" />` fits the 28 pill exactly. */
  avatar?: React.ReactNode;
  /** Numeric suffix after a hairline rule — a result count, a member count. */
  count?: number;
  /**
   * Renders the ✕ button. Removal is its own control, so it works with or
   * without `onClick` and is always its own tab stop.
   */
  onRemove?: () => void;
  /** Makes the main region a real `<button>`. */
  onClick?: () => void;
  /**
   * Paints the selected fill and sets `aria-pressed` on the main button.
   * Only meaningful together with `onClick` — a chip nobody can toggle
   * should not claim to be toggled.
   */
  selected?: boolean;
  /**
   * Accessible name for the remove button. Defaults to `Remove ${label}` when
   * the label is a plain string; **required in practice** when it is not,
   * because "Remove" alone does not say what goes away.
   */
  removeLabel?: string;
}

/* The pill's fill: brand-tinted at rest, one step up when hovered or selected.
   text.primary stays the label colour on both — measured in docs/chip.md. */
const pill = (interactive: boolean, selected: boolean) =>
  cn(
    'inline-flex h-7 max-w-full items-center rounded-full font-sans text-label-md text-text-primary transition-colors',
    selected ? 'bg-surface-brand-subtle' : 'bg-surface-brand-faint',
    interactive && !selected && 'hover:bg-surface-brand-subtle',
  );

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused';

export const Chip = React.forwardRef<HTMLElement, ChipProps>(
  (
    { className, label, avatar, count, onRemove, onClick, selected, removeLabel, ...props },
    ref,
  ) => {
    const content = (
      <>
        {avatar && <span className="inline-flex shrink-0 items-center">{avatar}</span>}
        <span className="min-w-0 truncate">{label}</span>
        {count != null && (
          <>
            {/* Hairline between label and count — decorative, the count reads
                on its own. stroke.brand.medium survives both fills. */}
            <span aria-hidden="true" className="my-1 w-px self-stretch bg-stroke-brand-medium" />
            {/* font.family.numeric via caption-md — counts are dense numerics. */}
            <span className="shrink-0 font-numeric text-caption-md">{count}</span>
          </>
        )}
      </>
    );

    /* Spacing: 10 side padding, 6 between parts; an avatar sits 2 off the
       curve so its circle follows the pill's. */
    const padding = cn('gap-1.5', avatar ? 'pl-0.5' : 'pl-2.5', onRemove ? 'pr-1' : 'pr-2.5');

    /* No remove button — the pill itself can be the control. */
    if (!onRemove) {
      if (onClick) {
        return (
          <button
            ref={ref as React.Ref<HTMLButtonElement>}
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            className={cn(pill(true, !!selected), padding, focusRing, className)}
            {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
          >
            {content}
          </button>
        );
      }
      return (
        <span
          ref={ref as React.Ref<HTMLSpanElement>}
          className={cn(pill(false, !!selected), padding, className)}
          {...props}
        >
          {content}
        </span>
      );
    }

    /* Remove present: the pill is a passive wrapper, the controls sit inside
       it as siblings. A button may never contain a button. */
    const removeName =
      removeLabel ?? (typeof label === 'string' ? `Remove ${label}` : 'Remove');

    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        className={cn(pill(!!onClick, !!selected), 'pr-1', className)}
        {...props}
      >
        {onClick ? (
          <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            className={cn(
              'inline-flex h-full min-w-0 items-center rounded-full',
              padding,
              'pr-1.5',
              focusRing,
              /* The ring hugs the region, not the pill — offset inward so it
                 does not collide with the remove button beside it. */
              'focus-visible:outline-offset-0',
            )}
          >
            {content}
          </button>
        ) : (
          <span className={cn('inline-flex h-full min-w-0 items-center', padding, 'pr-1.5')}>
            {content}
          </span>
        )}
        <button
          type="button"
          aria-label={removeName}
          onClick={onRemove}
          className={cn(
            'grid size-5 shrink-0 place-items-center rounded-full text-text-secondary transition-colors',
            'hover:bg-surface-brand-medium hover:text-text-primary',
            focusRing,
            'focus-visible:outline-offset-0',
          )}
        >
          {/* Decorative — the name lives on the button. `size-3` keeps the ✕
              lighter than a nav glyph, as the export's small ✕ was. */}
          <Icon name="x" className="size-3" />
        </button>
      </span>
    );
  },
);
Chip.displayName = 'Chip';

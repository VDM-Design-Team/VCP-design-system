import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';

/**
 * Chip — an interactive pill: a selected filter, a removable tag, a toggleable
 * option. If it only classifies and is never clicked, it is a `Badge`; if it
 * carries a VCP status, it is `StatusTag`. The comparison table
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
 * **People chips.** Figma's Initiator and Assignee chips (`_User_Chip_Initiator`,
 * `_User_Chip_Assignee`) are this same pill with a few more options, not a second
 * component: `size="md"` (32), `tone="brand"` (brand-coloured text), `variant="outline"`
 * (the editing look: a brand border and no fill), `description` (the "Assignee"
 * line under the name), `onEdit` beside `onRemove`, `actions="hover"` (the edit and
 * remove buttons appear on hover or focus, as the design's "Edit Hover"), and
 * `disabled`. Every default leaves the chip exactly as it was. The two recipes are
 * stories (`Initiator`, `Assignee`) and in docs/chip.md.
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

export type ChipVariant = 'tonal' | 'outline';
export type ChipSize = 'sm' | 'md';
export type ChipTone = 'default' | 'brand';

export interface ChipProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  /** The visible label. Keep it short — the pill never wraps. */
  label: React.ReactNode;
  /** A second, smaller line under the label — the "Assignee" under a name. */
  description?: React.ReactNode;
  /** Leading node — an `<Avatar size="sm" />` fits the 28 pill exactly, and the 32 (`md`) one with 4 around it. */
  avatar?: React.ReactNode;
  /** Numeric suffix after a hairline rule — a result count, a member count. */
  count?: number;
  /** `tonal` (default) is the brand-tinted pill; `outline` is the editing look: a brand border, no fill. */
  variant?: ChipVariant;
  /** 28 (`sm`, default) or 32 (`md`) tall. */
  size?: ChipSize;
  /** `brand` sets the text in `text.brand.strong`, as the people chips draw it; `default` is `text.primary`. */
  tone?: ChipTone;
  /**
   * Renders the ✕ button. Removal is its own control, so it works with or
   * without `onClick` and is always its own tab stop.
   */
  onRemove?: () => void;
  /** Renders an edit (pencil) button before the ✕. Its own control and tab stop, like the ✕. */
  onEdit?: () => void;
  /**
   * When the edit and remove buttons show: `always` (default), or `hover` — they appear while the
   * pointer is over the chip or focus is inside it, and always on a touch screen, which has no hover.
   */
  actions?: 'always' | 'hover';
  /** Makes the main region a real `<button>`. */
  onClick?: () => void;
  /**
   * Paints the selected fill and sets `aria-pressed` on the main button.
   * Only meaningful together with `onClick` — a chip nobody can toggle
   * should not claim to be toggled.
   */
  selected?: boolean;
  /** Greyed out and inert: the edit and remove buttons are not drawn. */
  disabled?: boolean;
  /**
   * Accessible name for the remove button. Defaults to `Remove ${label}` when
   * the label is a plain string; **required in practice** when it is not,
   * because "Remove" alone does not say what goes away.
   */
  removeLabel?: string;
  /** Accessible name for the edit button. Defaults to `Edit ${label}` when the label is a plain string. */
  editLabel?: string;
}

/* The pill: brand-tinted at rest, one step up when hovered or selected. The text colour is
   `text.primary` (measured in docs/chip.md) unless `tone="brand"`. `outline` swaps the fill for a
   brand border. `disabled` is a grey border and disabled text. */
const pill = (
  interactive: boolean,
  selected: boolean,
  variant: ChipVariant,
  size: ChipSize,
  tone: ChipTone,
  disabled: boolean,
) =>
  cn(
    'group inline-flex max-w-full items-center rounded-full font-sans text-label-sm-medium transition-colors',
    size === 'md' ? 'h-8' : 'h-7',
    disabled
      ? 'border border-stroke-strong bg-transparent text-text-disabled'
      : variant === 'outline'
        ? 'border border-stroke-brand-strong bg-transparent'
        : selected
          ? 'bg-surface-brand-subtle'
          : 'bg-surface-brand-faint',
    !disabled && (tone === 'brand' ? 'text-text-brand-strong' : 'text-text-primary'),
    !disabled && variant === 'tonal' && interactive && !selected && 'hover:bg-surface-brand-subtle',
  );

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused';

export const Chip = React.forwardRef<HTMLElement, ChipProps>(
  (
    {
      className,
      label,
      description,
      avatar,
      count,
      variant = 'tonal',
      size = 'sm',
      tone = 'default',
      onRemove,
      onEdit,
      actions = 'always',
      onClick,
      selected,
      disabled,
      removeLabel,
      editLabel,
      ...props
    },
    ref,
  ) => {
    /* A disabled chip is inert: no controls, no click. */
    const remove = disabled ? undefined : onRemove;
    const edit = disabled ? undefined : onEdit;
    const click = disabled ? undefined : onClick;
    const hasActions = !!(remove || edit);

    const content = (
      <>
        {avatar && <span className="inline-flex shrink-0 items-center">{avatar}</span>}
        {description ? (
          <span className="flex min-w-0 flex-col gap-px text-left leading-none">
            <span className="truncate">{label}</span>
            <span className="truncate text-caption-sm-medium">{description}</span>
          </span>
        ) : (
          <span className="min-w-0 truncate">{label}</span>
        )}
        {count != null && (
          <>
            {/* Hairline between label and count — decorative, the count reads
                on its own. stroke.brand.medium survives both fills. */}
            <span aria-hidden="true" className="my-1 w-px self-stretch bg-stroke-brand-medium" />
            {/* font.family.numeric via caption-md — counts are dense numerics. The count is
                `text.tertiary` on the tonal fill and takes the chip's own ink on an outline. */}
            <span
              className={cn(
                'shrink-0 font-numeric text-caption-md-medium',
                tone === 'brand' && variant === 'tonal' && !disabled && 'text-text-tertiary',
              )}
            >
              {count}
            </span>
          </>
        )}
      </>
    );

    /* Spacing: 10 side padding, 6 between parts; an avatar sits 2 off the
       curve so its circle follows the pill's (4 off a 32 pill's). */
    const padding = cn(
      'gap-1.5',
      avatar ? (size === 'md' ? 'pl-1' : 'pl-0.5') : 'pl-2.5',
      hasActions ? 'pr-1' : 'pr-2.5',
    );

    /* No controls — the pill itself can be the control. */
    if (!hasActions) {
      if (click) {
        return (
          <button
            ref={ref as React.Ref<HTMLButtonElement>}
            type="button"
            onClick={click}
            aria-pressed={selected}
            className={cn(pill(true, !!selected, variant, size, tone, false), padding, focusRing, className)}
            {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
          >
            {content}
          </button>
        );
      }
      return (
        <span
          ref={ref as React.Ref<HTMLSpanElement>}
          aria-disabled={disabled || undefined}
          className={cn(
            pill(false, !!selected, variant, size, tone, !!disabled),
            padding,
            disabled && 'cursor-not-allowed',
            className,
          )}
          {...props}
        >
          {content}
        </span>
      );
    }

    /* Controls present: the pill is a passive wrapper, the controls sit inside
       it as siblings. A button may never contain a button. */
    const plain = typeof label === 'string';
    const removeName = removeLabel ?? (plain ? `Remove ${label}` : 'Remove');
    const editName = editLabel ?? (plain ? `Edit ${label}` : 'Edit');
    const critical = variant === 'outline';

    const control = cn(
      'grid size-5 shrink-0 place-items-center rounded-full transition-colors',
      focusRing,
      'focus-visible:outline-offset-0',
      size === 'md' && 'size-6',
    );

    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        className={cn(pill(!!click, !!selected, variant, size, tone, false), 'pr-1', className)}
        {...props}
      >
        {click ? (
          <button
            type="button"
            onClick={click}
            aria-pressed={selected}
            className={cn(
              'inline-flex h-full min-w-0 items-center rounded-full',
              padding,
              'pr-1.5',
              focusRing,
              /* The ring hugs the region, not the pill — offset inward so it
                 does not collide with the buttons beside it. */
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
        {/* The buttons. With `actions="hover"` they are zero-wide and clear until the pointer is
            over the chip or focus is inside it (the buttons stay in the tab order, and focus
            reveals them), and always shown on a touch screen. */}
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-0.5',
            actions === 'hover' &&
              [
                'max-w-0 overflow-hidden opacity-0 transition-[max-width,opacity] motion-reduce:transition-none',
                'group-hover:max-w-24 group-hover:opacity-100 group-focus-within:max-w-24 group-focus-within:opacity-100',
                'pointer-coarse:max-w-24 pointer-coarse:opacity-100',
              ].join(' '),
          )}
        >
          {edit && (
            <button
              type="button"
              aria-label={editName}
              onClick={edit}
              className={cn(control, 'text-text-brand-strong hover:bg-surface-brand-subtle')}
            >
              <Icon name="pencil-simple" className="size-3.5" />
            </button>
          )}
          {remove && (
            <button
              type="button"
              aria-label={removeName}
              onClick={remove}
              className={cn(
                control,
                critical
                  ? 'text-accent-critical-outline-content-default hover:bg-accent-critical-outline-surface-hover'
                  : 'text-text-secondary hover:bg-surface-brand-medium hover:text-text-primary',
              )}
            >
              {/* Decorative — the name lives on the button. `size-3` keeps the ✕
                  lighter than a nav glyph, as the export's small ✕ was. */}
              <Icon name="x" className="size-3" />
            </button>
          )}
        </span>
      </span>
    );
  },
);
Chip.displayName = 'Chip';

import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { Divider } from '../../atoms/divider';
import { Tooltip } from '../tooltip';

/**
 * StatCard — one number that matters, on a card: open claims, points
 * consumed, suppliers active. A title row (optional icon, the label, optional
 * info tooltip), then the value with an optional measurement beside it.
 * Dashboards tile these. Two forms, from Figma's
 * `_SuperAdmin_Metric_Card_Coloured_Base` and `_Grouped_Base`:
 *
 * - **`StatCard`** — one value. A thick coloured stripe on the left edge, in
 *   the card's `accent` tone; the icon takes the same tone.
 * - **`StatCardGroup`** — two or more values under one title, side by side,
 *   split by vertical dividers. No stripe; each item carries its own tone on
 *   its icon.
 *
 * Both fill their container's width. Content is left-aligned by default;
 * `align="center"` centres it.
 *
 * **Two looks for the single card**, set by `variant`. `default` is Figma's
 * `Value_Card` — what normal and admin users see on their dashboards: a bold
 * value and a height that hugs its content. `superadmin` is
 * `_SuperAdmin_Metric_Card_Coloured_Base`: a semibold value and a fixed height.
 * Both have the same 8 stripe. Every prop works in both; only the measurements and the
 * value's weight differ. `StatCardGroup` has the superadmin look only.
 *
 * The label is a `<span>`, not a heading — a wall of stat tiles with eight
 * `<h3>`s turns the outline into noise; the surrounding dashboard section
 * owns the heading. Not built on `Card` for the same reason: Card renders a
 * real heading, which is exactly what this must not do.
 *
 * **Two type exceptions.** The value is 36 semibold and the measurement is 24
 * medium, both on a 36 line — neither exists in the ramp (no 36 step, and no
 * `heading-lg-medium`), so both are written out here and marked
 * `ds-lint-ignore` rather than invented as tokens. Everything else is ramp.
 *
 * The stripe is a decorative `span`, not a `border-l`, so its colour can never
 * fight the card's own `border` over which one wins the left side. It rounds its
 * own left corners instead of the card clipping it with `overflow-hidden`: the
 * `hint` tooltip opens above the title row and must be free to leave the card.
 *
 * Every other class below resolves to a design token from the VCP Figma
 * variables. If you need a value that isn't here, add the token in `tokens/`
 * first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type StatCardAccent = 'neutral' | 'brand' | 'info' | 'success' | 'critical' | 'warning';
export type StatCardVariant = 'default' | 'superadmin';
export type StatCardAlign = 'start' | 'center';

interface StatCardContent {
  /** What the number is — "Open claims". */
  label: React.ReactNode;
  value: React.ReactNode;
  /** The measurement beside the value — "%", "days", "of 40 pts". */
  unit?: React.ReactNode;
  /**
   * Glyph before the label — an `<Icon size="lg" />`. Decorative, and takes the
   * card's `accent` colour.
   */
  icon?: React.ReactNode;
  /**
   * A short explanation behind an info glyph after the label — what the
   * number means, not a restatement of the label. Omit it and there is no
   * glyph: a label that already explains itself has nothing to add.
   */
  hint?: string;
  /**
   * The tone: the left stripe's colour on a single card, the icon's colour in
   * both forms. `neutral` (the default) reads as "no category".
   */
  accent?: StatCardAccent;
}

export interface StatCardProps
  extends StatCardContent,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * `default` is the Value_Card that normal and admin dashboards use;
   * `superadmin` is the larger, fixed-height card of the superadmin dashboard.
   */
  variant?: StatCardVariant;
  /** Left-aligned (the default) or centred. */
  align?: StatCardAlign;
}

/** One value in a `StatCardGroup`. Same contents as a single card, less the stripe. */
export type StatCardGroupItem = StatCardContent;

export interface StatCardGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  /** The group's overall title — always centred, whatever `align` is. */
  title: React.ReactNode;
  /** Two or more values. For one value, use `StatCard`. */
  items: readonly [StatCardGroupItem, StatCardGroupItem, ...StatCardGroupItem[]];
  /** Left-aligned (the default) or centred. */
  align?: StatCardAlign;
}

/* The six tones Figma draws — the accent categories, the brand blue
   (`surface.brand.strong`, used for In Review / In Progress) and the
   uncategorised default. The stripe and the icon are the same colour, so both read the same
   `outline.border.default` token: as a background fill for the stripe, as a
   text colour for the icon. */
const STRIPE: Record<StatCardAccent, string> = {
  neutral: 'bg-neutral-outline-border-default',
  brand: 'bg-surface-brand-strong',
  info: 'bg-accent-info-outline-border-default',
  success: 'bg-accent-success-outline-border-default',
  critical: 'bg-accent-critical-outline-border-default',
  warning: 'bg-accent-warning-outline-border-default',
};
const ICON_TONE: Record<StatCardAccent, string> = {
  neutral: 'text-neutral-outline-border-default',
  brand: 'text-surface-brand-strong',
  info: 'text-accent-info-outline-border-default',
  success: 'text-accent-success-outline-border-default',
  critical: 'text-accent-critical-outline-border-default',
  warning: 'text-accent-warning-outline-border-default',
};

const ALIGN: Record<StatCardAlign, { items: string; justify: string; text: string }> = {
  start: { items: 'items-start', justify: 'justify-start', text: 'text-left' },
  center: { items: 'items-center', justify: 'justify-center', text: 'text-center' },
};

/* What differs between the two looks — all on Tailwind's numeric scale.
   Both have an 8 stripe. Left-aligned, it is its own column: the content area
   starts after it and its padding is measured from there, so it never overlaps the
   content. Centred, it is laid over the card's edge instead, so it does not push
   the content off-centre.
   `default` (Value_Card): 16 either side and 20 above and below, no gap between the
   title and the value, and the card is at least 100 high. `superadmin`: 24 either
   side, 12 between title and value, exactly 150 high. */
const VARIANT: Record<
  StatCardVariant,
  { card: string; content: string; gap: string; valueWeight: string }
> = {
  default: {
    card: 'min-h-25',
    content: 'px-4 py-5',
    gap: 'gap-0',
    valueWeight: 'font-bold leading-11',
  },
  superadmin: {
    card: 'h-37.5',
    content: 'px-6',
    gap: 'gap-3',
    valueWeight: 'font-semibold leading-9',
  },
};

/* The exceptions to the type ramp — see the component docs. The value is 36 in
   both looks (bold on a 44 line, or semibold on a 36 line), the unit 24 medium. */
const VALUE_SIZE = 'text-[36px]'; // ds-lint-ignore — no 36 step in the ramp
const UNIT_TYPE = 'text-[24px] font-medium leading-9'; // ds-lint-ignore — no heading-lg-medium in the ramp

interface MetricProps extends StatCardContent {
  align: StatCardAlign;
  variant: StatCardVariant;
}

/** The title row and the value row — identical in both forms. */
function Metric({
  label,
  value,
  unit,
  icon,
  hint,
  accent = 'neutral',
  align,
  variant,
}: MetricProps) {
  const a = ALIGN[align];
  return (
    <div className={cn('flex min-w-0 flex-col', VARIANT[variant].gap, a.items, a.text)}>
      <div className={cn('flex w-full items-center gap-1.5', a.justify)}>
        {icon && (
          <span
            aria-hidden="true"
            className={cn('inline-flex size-6 shrink-0 items-center justify-center', ICON_TONE[accent])}
          >
            {icon}
          </span>
        )}
        <span className="text-label-sm-medium text-text-secondary">{label}</span>
        {hint && (
          <Tooltip content={hint}>
            <button
              type="button"
              aria-label={`About ${typeof label === 'string' ? label : 'this metric'}`}
              className={cn(
                'grid size-5 shrink-0 place-items-center rounded-sm text-text-tertiary',
                'hover:text-text-secondary',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
              )}
            >
              <Icon name="info" size="md" />
            </button>
          </Tooltip>
        )}
      </div>
      <div className={cn('flex w-full flex-wrap items-baseline gap-2', a.justify)}>
        <span className={cn(VALUE_SIZE, VARIANT[variant].valueWeight, 'text-text-primary')}>{value}</span>
        {unit && <span className={cn(UNIT_TYPE, 'text-text-primary')}>{unit}</span>}
      </div>
    </div>
  );
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      label,
      value,
      unit,
      icon,
      accent = 'neutral',
      hint,
      variant = 'default',
      align = 'start',
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        'relative flex w-full rounded-md border border-stroke-default bg-surface-elevated font-sans',
        VARIANT[variant].card,
        className,
      )}
      {...props}
    >
      {/* Left-aligned: its own column, so the content starts after it and never under
          it. Centred: laid over the card's edge instead, so it does not push the
          content off-centre. */}
      <span
        aria-hidden="true"
        className={cn(
          'w-2 rounded-l-md',
          align === 'center' ? 'absolute inset-y-0 left-0' : 'shrink-0',
          STRIPE[accent],
        )}
      />
      <div className={cn('flex min-w-0 flex-1 items-center', VARIANT[variant].content)}>
        <div className="w-full min-w-0">
          <Metric
            label={label}
            value={value}
            unit={unit}
            icon={icon}
            hint={hint}
            accent={accent}
            align={align}
            variant={variant}
          />
        </div>
      </div>
    </div>
  ),
);
StatCard.displayName = 'StatCard';

export const StatCardGroup = React.forwardRef<HTMLDivElement, StatCardGroupProps>(
  ({ className, title, items, align = 'start', ...props }, ref) => {
    const titleId = React.useId();
    return (
      <div
        ref={ref}
        role="group"
        aria-labelledby={titleId}
        className={cn(
          'flex h-37.5 w-full flex-col justify-center gap-3 rounded-md border border-stroke-default bg-surface-base px-6 pb-6 pt-4 font-sans',
          className,
        )}
        {...props}
      >
        <span
          id={titleId}
          className="self-center py-0.5 text-center text-label-sm-semibold text-text-secondary"
        >
          {title}
        </span>
        <div className="flex items-stretch gap-9">
          {items.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Divider orientation="vertical" />}
              <div className="min-w-0 flex-1 basis-0">
                <Metric {...item} align={align} variant="superadmin" />
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  },
);
StatCardGroup.displayName = 'StatCardGroup';

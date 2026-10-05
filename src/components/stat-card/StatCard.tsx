import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { Divider } from '../../atoms/divider';
import { Tooltip } from '../tooltip';

/**
 * StatCard — one number that matters, on a card: open claims, points
 * consumed, suppliers active. A title row (optional icon, the label, optional
 * info tooltip), then the value with an optional measurement beside it.
 * Dashboards tile these.
 *
 * **Two cards, one per dashboard**, set by `variant` — read off Figma's
 * `VCP Pages & Flows` file (5 Oct 2026):
 *
 * - **`default`** — the `Value_Card` on the admin and user dashboards (node
 *   `947:306362`, "Value Cards"). An 8 stripe, **left-aligned**, label over a
 *   32 bold value, exactly 100 high and at least 175 wide. Figma draws it with
 *   no icon and no hint; the slots still work if a dashboard needs them.
 * - **`superadmin`** — `_SuperAdmin_Metric_Card_Coloured` on the super admin
 *   dashboard (node `3:4848`). A 12 stripe, **centred**, a title row (accent
 *   icon, label, info hint) over a 32 semibold value and a 24 unit, exactly
 *   150 high.
 *
 * **`StatCardGroup`** is the super admin dashboard's
 * `_SuperAdmin_Metric_Card_Grouped`: two or more values under one title, side
 * by side, split by vertical dividers. No stripe; each item carries its own
 * tone on its icon. Centred, like the single super admin card.
 *
 * Alignment belongs to the look rather than being a prop: Figma never draws a
 * centred Value_Card or a left-aligned super admin card. All forms fill their
 * container's width.
 *
 * The label is a `<span>`, not a heading — a wall of stat tiles with eight
 * `<h3>`s turns the outline into noise; the surrounding dashboard section
 * owns the heading. Not built on `Card` for the same reason: Card renders a
 * real heading, which is exactly what this must not do.
 *
 * **The value is on the type ramp**: `heading-xl` (32), bold on the default
 * card and semibold on the superadmin card. Figma draws 36, which has no step;
 * 32 is deliberate (design decision, 5 Oct 2026): it matches the typography we
 * have, it is more consistent, and it helps once there are a lot of value cards
 * (docs/stat-card.md has the reasoning). **One type exception** remains: the measurement is
 * 24 medium on a 36 line, and there is no `heading-lg-medium`, so it is written
 * out here and marked `ds-lint-ignore` rather than invented as a token.
 * Everything else is ramp.
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
   * `default` is the Value_Card on the admin and user dashboards: left-aligned,
   * 100 high. `superadmin` is the super admin dashboard's metric card: centred,
   * 150 high.
   */
  variant?: StatCardVariant;
}

/** One value in a `StatCardGroup`. Same contents as a single card, less the stripe. */
export type StatCardGroupItem = StatCardContent;

export interface StatCardGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  /** The group's overall title, centred above the items. */
  title: React.ReactNode;
  /** Two or more values. For one value, use `StatCard`. */
  items: readonly [StatCardGroupItem, StatCardGroupItem, ...StatCardGroupItem[]];
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

/* What differs between the two looks — all on Tailwind's numeric scale. The
   stripe is always its own column, as Figma draws it: the content area starts
   after it, so centred content centres in the space beside the stripe.
   `default` (Value_Card): 8 stripe, left-aligned, 16 either side, no gap
   between label and value, exactly 100 high and at least 175 wide — the
   content is centred vertically in that height. `superadmin`: 12 stripe,
   centred, 24 either side, 12 between title row and value, exactly 150 high. */
type Align = 'start' | 'center';
const ALIGN: Record<Align, { items: string; justify: string; text: string }> = {
  start: { items: 'items-start', justify: 'justify-start', text: 'text-left' },
  center: { items: 'items-center', justify: 'justify-center', text: 'text-center' },
};
const VARIANT: Record<
  StatCardVariant,
  { card: string; stripe: string; content: string; gap: string; valueType: string; align: Align }
> = {
  default: {
    card: 'h-25 min-w-43.75',
    stripe: 'w-2',
    content: 'px-4',
    gap: 'gap-0',
    valueType: 'text-heading-xl-bold',
    align: 'start',
  },
  superadmin: {
    card: 'h-37.5',
    stripe: 'w-3',
    content: 'px-6',
    gap: 'gap-3',
    valueType: 'text-heading-xl-semibold',
    align: 'center',
  },
};

/* The one exception to the type ramp — see the component docs. The value is
   `heading-xl` (see `VARIANT`); the unit is 24 medium. */
const UNIT_TYPE = 'text-[24px] font-medium leading-9'; // ds-lint-ignore — no heading-lg-medium in the ramp

interface MetricProps extends StatCardContent {
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
  variant,
}: MetricProps) {
  const a = ALIGN[VARIANT[variant].align];
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
        <span className={cn(VARIANT[variant].valueType, 'text-text-primary')}>{value}</span>
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
      {/* Its own column — the content starts after it and never under it. */}
      <span
        aria-hidden="true"
        className={cn('shrink-0 rounded-l-md', VARIANT[variant].stripe, STRIPE[accent])}
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
            variant={variant}
          />
        </div>
      </div>
    </div>
  ),
);
StatCard.displayName = 'StatCard';

export const StatCardGroup = React.forwardRef<HTMLDivElement, StatCardGroupProps>(
  ({ className, title, items, ...props }, ref) => {
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
                <Metric {...item} variant="superadmin" />
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  },
);
StatCardGroup.displayName = 'StatCardGroup';

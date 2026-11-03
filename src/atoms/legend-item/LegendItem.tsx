import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/**
 * LegendItem — one entry in a chart legend: a colour key and the word for it.
 * "Completed", "Overdue", "Available".
 *
 * The swatch is decoration and the label is the meaning, so the swatch is
 * `aria-hidden` and the item is just its text to assistive tech. Colour alone
 * can never tie a legend to a chart — the chart has to name its series too.
 *
 * `tone` is `ProgressBar`'s and `DonutChart`'s set (plus `info`), on the same
 * tokens, so a legend cannot drift from the chart it explains: pass the tone the
 * chart draws. Which tone means which status (Planned, Overdue, …) is domain
 * knowledge and belongs to the chart that owns it, not here.
 *
 * Two sizes, from the two legends in Figma: `md` is the dashboard charts'
 * 12 swatch with the 12 caption; `sm` is the Gantt chart's 8 dot with the
 * 10 caption. The gap scales with the swatch (half its size). A legend is a row of these —
 * wrap them in a list.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const swatch = cva('shrink-0', {
  variants: {
    /* ProgressBar's fills, class for class. */
    tone: {
      brand: 'bg-surface-brand-strong',
      success: 'bg-accent-success-filled-surface-default',
      warning: 'bg-accent-warning-filled-surface-default',
      critical: 'bg-accent-critical-filled-surface-default',
      info: 'bg-accent-info-filled-surface-default',
    },
    size: {
      /* 8 — a dot, for dense legends under a chart. ds-lint-ignore */
      sm: 'size-2 rounded-pill',
      /* 12 — a rounded square, the dashboard default. ds-lint-ignore */
      md: 'size-3 rounded-xs',
    },
  },
  defaultVariants: { tone: 'brand', size: 'md' },
});

const label = cva('font-sans text-text-primary', {
  variants: {
    size: { sm: 'text-caption-sm-medium', md: 'text-caption-md-medium' },
  },
  defaultVariants: { size: 'md' },
});

export interface LegendItemProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof swatch> {
  /** The word for the colour. It is the accessible content. */
  label: string;
  /** Token `bg-*` class for the swatch; wins over `tone`. For a series no tone covers. */
  swatchClassName?: string;
}

export const LegendItem = React.forwardRef<HTMLSpanElement, LegendItemProps>(
  ({ className, tone, size, label: text, swatchClassName, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('inline-flex items-center', size === 'sm' ? 'gap-1' : 'gap-1.5', className)}
      {...props}
    >
      <span aria-hidden="true" className={cn(swatch({ tone, size }), swatchClassName)} />
      <span className={label({ size })}>{text}</span>
    </span>
  ),
);
LegendItem.displayName = 'LegendItem';

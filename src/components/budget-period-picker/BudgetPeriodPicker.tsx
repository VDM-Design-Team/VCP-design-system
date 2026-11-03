import * as React from 'react';
import { cn } from '../../lib/cn';
import { SegmentedControl } from '../../atoms/segmented-control';
import { Select } from '../../atoms/select';
import type { Quarter } from '../domain-budget-summary';

/**
 * BudgetPeriodPicker — which quarter's budget is being edited: Q1–Q4 as a segmented control, and the year beside it as a
 * dropdown. Built to Figma's `_Domain_Budgeting_Quarterly_Selection` and `_Domain_Budgeting_Year_Selector`.
 *
 * **Both are 40 high** — the segmented control at its `lg` size and the `Select` at `md` — so they sit as one row. (The
 * Domain Budget *view* card's own pickers are the dense 32.)
 *
 * It is controlled and does no date arithmetic: which quarter is current, and what to do when another is chosen, are
 * the page's. Every class below resolves to a design token. ds-lint-ignore
 */

export interface BudgetPeriodPickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  quarter: Quarter;
  year: number;
  /** The years the year picker offers. */
  years: readonly number[];
  onQuarterChange?: (quarter: Quarter) => void;
  onYearChange?: (year: number) => void;
  /** Locks both — while a save is in flight. */
  disabled?: boolean;
}

const QUARTERS: readonly Quarter[] = [1, 2, 3, 4];
const QUARTER_OPTIONS = QUARTERS.map((q) => ({ value: String(q), label: `Q${q}` }));

export const BudgetPeriodPicker = React.forwardRef<HTMLDivElement, BudgetPeriodPickerProps>(
  ({ className, quarter, year, years, onQuarterChange, onYearChange, disabled, ...props }, ref) => (
    <div ref={ref} className={cn('inline-flex items-center gap-3', className)} {...props}>
      <SegmentedControl
        size="lg"
        aria-label="Quarter"
        options={disabled ? QUARTER_OPTIONS.map((o) => ({ ...o, disabled: true })) : QUARTER_OPTIONS}
        value={String(quarter)}
        onChange={(v) => {
          const picked = QUARTERS.find((q) => String(q) === v);
          if (picked) onQuarterChange?.(picked);
        }}
      />
      <Select
        size="md"
        aria-label="Year"
        value={String(year)}
        options={years.map(String)}
        disabled={disabled}
        onChange={(v) => {
          const picked = years.find((y) => String(y) === v);
          if (picked !== undefined) onYearChange?.(picked);
        }}
      />
    </div>
  ),
);
BudgetPeriodPicker.displayName = 'BudgetPeriodPicker';

import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { SegmentedControl } from '../../atoms/segmented-control';
import { Select } from '../../atoms/select';
import { PageTitle } from '../../components/page-title';
import { BudgetTable, type BudgetTableProps } from '../budget-table';

/** The four quarters, as Figma's edit page draws them. */
export const BUDGET_QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

/**
 * DomainBudgetEditPage — the main content of the page where an admin sets each domain's development-point budget for a quarter: the title, the quarter and year
 * controls, the table, and **Save Changes**. It goes inside `AppShell`. Built to Figma's `Domain Budget Edit` page (`Domain Budgeting`, and its saving and saved frames).
 *
 * **It guarantees the parts a page is easy to get wrong:**
 *
 * - **The quarter and year controls are both 40 high** (the Q1–Q4 `SegmentedControl` at `lg`, the year `Select` at `md`), top right above the table, so they sit as one row.
 * - **While saving** (`saving`) the Save button spins and everything is locked: the table, the quarter and the year.
 * - **Unsaved changes** (`dirty`) make the browser ask before the page is left (`beforeunload`). There is no custom dialog.
 * - **Save is not offered while the budgets load** (`table.loading`): there is nothing to save.
 *
 * **What it leaves to the page:** the data and the save, **and the toasts**. On success show "Changes Saved"; on failure a `critical` toast ("Changes not saved …
 * your changes are still here — try again"), unlock, and **keep what was typed** (`dirty` stays true) so Save can be tried again. What happens to unsaved edits when the quarter or year
 * changes is also the page's: it may ask first, or carry them.
 *
 * **It is controlled and holds no data.** The page owns the rows, the period, `saving` and `dirty`; this puts them in order, 16 apart and 32 in from the sides.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface DomainBudgetEditPageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** The page's `h1`. Figma's frames say the placeholder "Page Title"; the sidebar calls the page "Domain Budget". */
  title?: string;
  /** The chosen quarter: one of `quarters`. */
  quarter: string;
  onQuarterChange: (quarter: string) => void;
  /** The quarters offered. Defaults to Q1 to Q4. */
  quarters?: readonly string[];
  /** The chosen year: one of `years`. */
  year: string;
  years: readonly string[];
  onYearChange: (year: string) => void;
  /** The table: `BudgetTable`'s own props, without `disabled` (that follows `saving`). */
  table: Omit<BudgetTableProps, 'disabled'>;
  /** A save is in flight: Save spins, and the table, quarter and year are locked. */
  saving?: boolean;
  /** There are edits that are not saved: the browser asks before the page is left. */
  dirty?: boolean;
  /** Save Changes was pressed. The page saves, then toasts the result. */
  onSave: () => void;
  /** The Save button's words. */
  saveLabel?: string;
}

export function DomainBudgetEditPage({
  className,
  title = 'Domain Budget',
  quarter,
  onQuarterChange,
  quarters = BUDGET_QUARTERS,
  year,
  years,
  onYearChange,
  table,
  saving = false,
  dirty = false,
  onSave,
  saveLabel = 'Save Changes',
  ...props
}: DomainBudgetEditPageProps) {
  /* Unsaved changes: ask the browser to confirm leaving. The browser's own prompt, so there is no dialog to build or to keep in step. */
  React.useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  return (
    <div className={cn('flex min-w-0 flex-col font-sans', className)} {...props}>
      <PageTitle title={title} />
      <div className="flex min-w-0 flex-col gap-4 px-8 pb-8">
        <div className="flex items-center justify-end gap-3">
          {/* Both 40 high — the segmented control at `lg` (its default is 48), the select at `md` — so they sit as one row. */}
          <SegmentedControl
            size="lg"
            aria-label="Quarter"
            options={quarters.map((q) => ({ value: q, label: q, disabled: saving }))}
            value={quarter}
            onChange={onQuarterChange}
          />
          <Select size="md" aria-label="Year" value={year} options={[...years]} onChange={onYearChange} disabled={saving} />
        </div>
        <BudgetTable {...table} disabled={saving} />
        <div className="flex justify-end">
          <Button loading={saving} disabled={table.loading} onClick={onSave}>
            {saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
DomainBudgetEditPage.displayName = 'DomainBudgetEditPage';

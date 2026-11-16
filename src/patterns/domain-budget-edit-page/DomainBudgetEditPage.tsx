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
 * - **The quarter and year controls are both 36 high** (the Q1–Q4 `SegmentedControl` at `md`, the year `Select` at `compact`), the dashboard header's size, on the title's row, on the right (as the dashboard's filters are), so they sit as one row. The year takes the lighter `edge="neutral"`, as every filter outside a form does.
 * - **While saving** (`saving`) the Save button spins and everything is locked: the table, the quarter and the year.
 * - **Unsaved changes** (`dirty`) make the browser ask before the tab is closed or reloaded (`beforeunload`): the browser's own prompt.
 * - **Save is not offered while the budgets load** (`table.loading`): there is nothing to save.
 *
 * **What it leaves to the page:** the data and the save, **and the toasts**. On success show "Changes Saved"; on failure a `critical` toast ("Changes not saved …
 * your changes are still here — try again"), unlock, and **keep what was typed** (`dirty` stays true) so Save can be tried again. With unsaved edits, a change of quarter or year,
 * or a move to another page in the app, is also the page's: it asks first ("Leave without saving?", Keep editing / Leave) and never carries the edits over (decided 10 Nov 2026).
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
  /** There are edits that are not saved: the browser asks before the tab is closed or reloaded. */
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
  /* Unsaved changes: ask the browser to confirm closing or reloading the tab. The browser's own prompt; a change of quarter, year or page inside the app is the page's to ask about. */
  React.useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  return (
    <div className={cn('flex min-w-0 flex-col font-sans', className)} {...props}>
      <PageTitle
        title={title}
        /* The period controls sit on the title's row, on the right, as the dashboard's filters do (`DashboardHeader`). Both are 36 high, as the dashboard's are — the segmented control at `md` (its default is 48),
           the select at `compact` — so they sit as one row. The year is a filter, so it takes the lighter edge. */
        actions={
          <>
            <SegmentedControl
              size="md"
              aria-label="Quarter"
              options={quarters.map((q) => ({ value: q, label: q, disabled: saving }))}
              value={quarter}
              onChange={onQuarterChange}
            />
            <Select size="compact" edge="neutral" aria-label="Year" value={year} options={[...years]} onChange={onYearChange} disabled={saving} />
          </>
        }
      />
      <div className="flex min-w-0 flex-col gap-4 px-8 pb-8">
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

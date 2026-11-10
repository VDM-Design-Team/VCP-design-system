import * as React from 'react';
import { cn } from '../../lib/cn';
import { ProgressBar } from '../../atoms/progress-bar';
import { Skeleton } from '../../atoms/skeleton';
import { Stepper } from '../../atoms/stepper';
import { Textarea } from '../../atoms/textarea';
import { ColumnHint, DataTable, type DataTableColumn } from '../../components/data-table';
import { budgetStatus, budgetUsage, type BudgetStatus } from '../../components/domain-budget-summary';
import type { ProgressBarProps } from '../../atoms/progress-bar';

/**
 * BudgetTable — where an admin sets each domain's development-point budget for a quarter. One row per domain: the
 * points allocated (a number field with an up/down stepper), what is consumed against it as a bar, what remains, and
 * an optional note. Built to Figma's `Domain Budget Edit` page (`Domain_Budget_Table` and its row, item and header
 * pieces).
 *
 * It is `DataTable` specialised, as `PlanningTable` is: the generic table keeps the `<table>` semantics and the
 * column sizing; this adds the five columns and the editing.
 *
 * - **Allocated** is the `Stepper` atom's `up-down` variant, with its empty state: a domain with no budget yet shows
 *   "Set Budget", and clearing the field takes it back to unset. A nudge commits at once; typing commits after a brief
 *   pause (`commitDelay`, 600 ms) or on blur or Enter, clamped. Only a number can be typed.
 * - **Consumed** is the points used and a bar of how much of the allocation they are. **The bar's status is the
 *   Domain Budget card's** (`budgetStatus`: 100% and over is over budget), drawn as Figma's table draws it: brand blue, or bright red when over — one
 *   owner, so the table and the summary above it never disagree.
 * - **Remaining** is `allocated − consumed`, derived here so the three never disagree, and red when it goes negative.
 *   A domain with no allocation counts as 0.
 * - **Remaining and the bar follow the allocation** — they are derived from the row, not stored, so they update the
 *   moment the allocation does: at once for a nudge, after the pause for typing.
 * - **Optional Notes** is one line until it is focused, then grows to show everything written. Cleared, it says
 *   "Optional Note".
 * - **Loading** (`loading`) keeps the headers and shows placeholder rows, announced once as "Loading domain budget".
 *
 * It is controlled and saves nothing: rows come in, `onAllocatedChange` and `onNotesChange` report an edit. The
 * "Save Changes" button, its loading state, the "Changes Saved" toast and the error toast for a save that fails belong
 * to the page — compose them with `Button`'s `loading` and `Toast`, and lock the table with `disabled` while it saves
 * (the page stories show both outcomes). Leaving with unsaved changes is the browser's own prompt (`beforeunload`).
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add
 * the token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

export interface BudgetRow {
  id: string | number;
  domain: string;
  /** Points allocated for the quarter, or `null` while no budget is set. */
  allocated: number | null;
  /** Points used by planned Added Values. */
  consumed: number;
  notes?: string;
}

export interface BudgetTableHints {
  allocated?: React.ReactNode;
  consumed?: React.ReactNode;
  remaining?: React.ReactNode;
}

/** What each numeric column's ⓘ says, from Figma. Override any with `hints`. */
export const BUDGET_COLUMN_HINTS = {
  allocated: 'Total development points assigned for the selected cycle. Unused points do not roll over.',
  consumed: 'Development points used by planned AVs, calculated automatically from their points and active dates.',
  remaining: 'Remaining = Allocated - Consumed points for the cycle. Negative values indicate overspend.',
} as const satisfies Required<Record<keyof BudgetTableHints, string>>;

export interface BudgetTableProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  rows: readonly BudgetRow[];
  /** An allocation was typed, nudged or cleared (`null`). */
  onAllocatedChange?: (id: BudgetRow['id'], allocated: number | null) => void;
  onNotesChange?: (id: BudgetRow['id'], notes: string) => void;
  /** The largest allocation a domain can be given. */
  maxAllocated?: number;
  /** Locks every field — while a save is in flight. */
  disabled?: boolean;
  /** Placeholder rows instead of `rows` — while the budgets load. The headers stay. */
  loading?: boolean;
  /** How many placeholder rows `loading` shows. */
  loadingRows?: number;
  /** ms of quiet after typing in an allocation before it commits (the table follows it). */
  commitDelay?: number;
  hints?: BudgetTableHints;
  /** The table's accessible name. */
  caption?: string;
}

/* The notes field: a single line (clipped) until it has focus, then as tall as what is written in it. */
function NoteField({
  value,
  onChange,
  label,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
}) {
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = React.useState(false);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    if (focused) el.style.height = `${el.scrollHeight}px`;
  }, [value, focused]);

  return (
    <Textarea
      ref={ref}
      rows={1}
      aria-label={label}
      placeholder="Optional Note"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={cn(
        'resize-none px-2 py-2 text-body-sm-medium placeholder:italic placeholder:text-text-tertiary',
        focused ? 'overflow-hidden' : 'overflow-hidden whitespace-nowrap',
      )}
    />
  );
}

const pts = (n: number) => `${n} pts`;

/* Figma's table draws two fills only (decided 9 Nov 2026: follow Figma): brand blue, and its bright red when over budget.
   No amber here, unlike the Domain Budget card. */
const TONE = { fine: 'brand', warning: 'brand', over: 'alert' } as const satisfies Record<
  BudgetStatus,
  NonNullable<ProgressBarProps['tone']>
>;

export function BudgetTable({
  rows,
  onAllocatedChange,
  onNotesChange,
  maxAllocated = 9999,
  disabled,
  loading,
  loadingRows = 6,
  commitDelay = 600,
  hints,
  caption = 'Domain budget',
  ...props
}: BudgetTableProps) {
  const text = { ...BUDGET_COLUMN_HINTS, ...hints };

  const columns: DataTableColumn<BudgetRow>[] = [
    {
      key: 'domain',
      label: 'Domain',
      fit: true,
      width: '14%',
      render: (row) => <span className="text-body-sm-medium text-text-primary">{row.domain}</span>,
    },
    {
      key: 'allocated',
      label: 'Allocated Points',
      width: '14%',
      hint: <ColumnHint column="allocated points" text={text.allocated} />,
      render: (row) => (
        <Stepper
          variant="up-down"
          size="sm"
          /* Fills its cell, but never so narrow that "Set Budget" is cut off. */
          className="w-full min-w-32"
          label={`${row.domain} allocated points`}
          placeholder="Set Budget"
          value={row.allocated}
          max={maxAllocated}
          commitDelay={commitDelay}
          disabled={disabled}
          onChange={(n) => onAllocatedChange?.(row.id, n)}
          onClear={() => onAllocatedChange?.(row.id, null)}
        />
      ),
    },
    {
      key: 'consumed',
      label: 'Consumed',
      width: '32%',
      hint: <ColumnHint column="consumed" text={text.consumed} />,
      render: (row) => {
        const allocated = row.allocated ?? 0;
        return (
          <div className="flex items-center gap-4">
            <span className="min-w-12 whitespace-nowrap text-body-sm-medium text-text-primary">{pts(row.consumed)}</span>
            <ProgressBar
              className="min-w-24 flex-1"
              aria-label={`${row.domain} budget usage`}
              tone={TONE[budgetStatus(row.consumed, allocated)]}
              value={budgetUsage(row.consumed, allocated)}
            />
          </div>
        );
      },
    },
    {
      key: 'remaining',
      label: 'Remaining',
      fit: true,
      width: '10%',
      hint: <ColumnHint column="remaining" text={text.remaining} />,
      render: (row) => {
        const remaining = (row.allocated ?? 0) - row.consumed;
        return (
          <span
            className={cn(
              'whitespace-nowrap text-body-sm-medium',
              remaining < 0 ? 'text-accent-critical-outline-content-default' : 'text-text-primary',
            )}
          >
            {pts(remaining)}
          </span>
        );
      },
    },
    {
      key: 'notes',
      label: 'Optional Notes',
      grow: true,
      width: '30%',
      render: (row) => (
        <NoteField
          label={`${row.domain} note`}
          value={row.notes ?? ''}
          disabled={disabled}
          onChange={(notes) => onNotesChange?.(row.id, notes)}
        />
      ),
    },
  ];

  if (!loading) return <DataTable caption={caption} columns={columns} rows={rows} {...props} />;

  /* Loading: the same columns and headers, a placeholder in each cell. The skeletons are hidden from assistive tech,
     so one status says what is happening. */
  const placeholders: BudgetRow[] = Array.from({ length: loadingRows }, (_, i) => ({
    id: `loading-${i}`,
    domain: '',
    allocated: null,
    consumed: 0,
  }));
  const LOADING_CELL: Record<string, React.ReactNode> = {
    domain: <Skeleton width={96} textStyle="body-sm" />,
    allocated: <Skeleton width={112} height={32} />,
    consumed: <Skeleton textStyle="body-sm" />,
    remaining: <Skeleton width={48} textStyle="body-sm" />,
    notes: <Skeleton height={36} />,
  };
  return (
    <>
      <span role="status" className="sr-only">
        Loading domain budget
      </span>
      <DataTable
        caption={caption}
        aria-busy="true"
        columns={columns.map((column) => ({ ...column, render: () => LOADING_CELL[column.key] }))}
        rows={placeholders}
        {...props}
      />
    </>
  );
}

import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { Icon } from '../../atoms/icon';
import { CopyText } from '../../atoms/copy-text';
import { Input } from '../../atoms/input';
import { Pagination } from '../../atoms/pagination';
import { Tag } from '../../atoms/tag';
import { Tooltip } from '../../atoms/tooltip';
import type { AssigneeAvailability } from '../../atoms/assignee-status';
import { AssigneeWithStatus } from '../../components/assignee-with-status';
import {
  ColumnHint,
  DataTable,
  type DataTableColumn,
  type DataTableSort,
} from '../../components/data-table';
import { InlineDateEdit, InlineEdit } from '../../components/inline-edit';
import { StatusTag, type StatusTagProps } from '../../components/status-tag';
import { TypeTag, type AVType } from '../../components/type-tag';
import { UrgencyTag, type AVUrgency } from '../../components/urgency-tag';

/**
 * PlanningTable — the Planning list: Added Values grouped into collapsible
 * sections, one per Cycle plus the Backlog. Read off the Figma Planning Page
 * (`4632:65090`): `_Planning_Table` (four states: Expanded / Collapsed × Cycle
 * / Backlog), `_Planning_Table_Header` (and its caret), `_Planning_Table_Row`,
 * `_Planning_Table_Item` (nine cell types) and the editable Date and Points
 * cells.
 *
 * It is `DataTable` specialised, as `AVTable` is — the generic table keeps the
 * `<table>` semantics and the sorting contract, and this adds the ten columns
 * and the section card around each table. **It owns no mapping:** `StatusTag`,
 * `UrgencyTag` and `TypeTag` own their vocabularies, `AssigneeWithStatus` owns
 * availability, and the editable cells are `InlineEdit` / `InlineDateEdit`.
 *
 * - **A section** is a card: a caret button that folds it (`aria-expanded`), the
 *   title (`Cycle 27`) with its dates, and — for a cycle — *Total Capacity* and
 *   *Capacity Remaining* in points, the numbers in brand blue. The Backlog has
 *   no dates or capacity. Folded, only the header shows.
 * - **Start Date, Points and Due Date edit in place**, each with its own change
 *   callback; give none and the cell just reads. An *estimated* date reads with
 *   "(estimate)" after it, as the detail card writes it.
 * - **It does not sort, fetch or paginate.** `sections` render in the order
 *   given; `sort` and `page` are the caller's, as in `DataTable`.
 *
 * Not here, by design: the filter row above the table and the animated
 * (changed-value) cells — both are tracked separately.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface PlanningDate {
  /** ISO `yyyy-mm-dd`. */
  value: string;
  /** A computed date, not one a person set — reads "(estimate)". */
  estimated?: boolean;
}

export interface PlanningRow {
  id: string;
  /** The human reference, "VCP-1234". */
  ref: string;
  title: string;
  /** The domain badge under the title — "VCP". */
  domain?: string;
  urgency?: AVUrgency;
  type?: AVType;
  initiator?: { name: string; src?: string };
  assignee?: { name: string; src?: string; availability: AssigneeAvailability };
  start?: PlanningDate;
  points?: number;
  due?: PlanningDate;
  /** `{ status }` for a spine status, `{ custom }` for a domain step. */
  status?: StatusTagProps;
}

export interface PlanningSection {
  id: string;
  /** "Cycle 27" or "Backlog". */
  title: string;
  /** "(Mar 02, 2026 - Mar 16, 2026)" — already formatted. Cycles only. */
  dates?: string;
  /** Points. Cycles only; with `remainingCapacity`, draws the two capacity lines. */
  totalCapacity?: number;
  remainingCapacity?: number;
  rows: readonly PlanningRow[];
}

/**
 * The six columns the design puts a glyph on. **Start Date, Points and Due Date have the design's
 * own copy** (the formula tooltips, default below); Urgency, Type and Status have none in Figma, so
 * those stay silent until the product says something.
 */
export interface PlanningTableHints {
  urgency?: string;
  type?: string;
  start?: string;
  points?: string;
  due?: string;
  status?: string;
}

export interface PlanningTableProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  sections: readonly PlanningSection[];
  /** Folded section ids. Controlled when given; otherwise the table holds them. */
  collapsed?: readonly string[];
  defaultCollapsed?: readonly string[];
  onCollapsedChange?: (collapsed: string[]) => void;
  /** The sortable key is `title` — the one Figma mark. */
  sort?: DataTableSort;
  onSortChange?: (sort: DataTableSort) => void;
  /** Opens an AV. Given, the reference is a button; omitted, it is text. */
  onOpen?: (row: PlanningRow) => void;
  /** Each editable cell is editable only if its callback is given. */
  onStartChange?: (row: PlanningRow, iso: string) => void;
  onDueChange?: (row: PlanningRow, iso: string) => void;
  onPointsChange?: (row: PlanningRow, points: number) => void;
  /** Pagination renders only when all three are given. 1-based. */
  page?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
  /** With the pagination: the "Items 50 ▾" selector and "1-50 of 1,250" range (`Pagination`'s own props). */
  itemCount?: number;
  pageSize?: number;
  pageSizeOptions?: readonly number[];
  onPageSizeChange?: (pageSize: number) => void;
  /** Overrides for the info tooltips. The three formula columns default to the design's copy. */
  hints?: PlanningTableHints;
  /** What a section with no rows says. */
  empty?: React.ReactNode;
}

/** Figma's tooltip copy for the three editable, formula-linked columns. */
const FORMULA_HINTS = {
  start: 'This column is editable, changing Start Date affects Due Date.',
  points: 'This column is editable, changing Points affects Due Date.',
  due: 'This column is editable, changing Due Date affects Start Date.\nDue Date = Approx. Start Date + Approx. Working Days + Buffer',
};
const ESTIMATE_HINT = 'This date is an estimate and may not be fully accurate.';

const dateText = (d: PlanningDate) => (d.estimated ? `${d.value} (estimate)` : d.value);

/** An estimated date carries the design's caution on hover and focus; a set one has nothing to say. */
function EstimateHint({ estimated, children }: { estimated?: boolean; children: React.ReactElement }) {
  return estimated ? <Tooltip content={ESTIMATE_HINT}>{children}</Tooltip> : children;
}

/** Points, edited in place: a number field that keeps its own draft until confirmed. */
function PointsCell({
  row,
  onChange,
}: {
  row: PlanningRow;
  onChange?: (row: PlanningRow, points: number) => void;
}) {
  const [draft, setDraft] = React.useState(String(row.points ?? ''));
  return (
    <InlineEdit
      label="points"
      disabled={!onChange}
      onEditingChange={(editing) => editing && setDraft(String(row.points ?? ''))}
      onConfirm={() => {
        const next = Number(draft);
        if (draft.trim() !== '' && Number.isFinite(next)) onChange?.(row, next);
      }}
      editor={
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          aria-label={`Points for ${row.ref}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="w-16"
        />
      }
    >
      <span className="text-label-sm-medium text-text-primary">{row.points ?? '—'}</span>
    </InlineEdit>
  );
}

export function PlanningTable({
  className,
  sections,
  collapsed,
  defaultCollapsed = [],
  onCollapsedChange,
  sort,
  onSortChange,
  onOpen,
  onStartChange,
  onDueChange,
  onPointsChange,
  page,
  pageCount,
  onPageChange,
  itemCount,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  hints: hintOverrides,
  empty,
  ...props
}: PlanningTableProps) {
  const baseId = React.useId();
  const hints = { ...FORMULA_HINTS, ...hintOverrides };
  const [inner, setInner] = React.useState<readonly string[]>(defaultCollapsed);
  const folded = collapsed ?? inner;
  const toggle = (id: string) => {
    const next = folded.includes(id) ? folded.filter((x) => x !== id) : [...folded, id];
    if (collapsed === undefined) setInner(next);
    onCollapsedChange?.(next);
  };

  /* Every column has a width, so the Cycle's table and the Backlog's line up: they are
     separate tables, and left to size themselves each would fit its own content. */
  const columns: Array<DataTableColumn<PlanningRow>> = [
    {
      key: 'ref',
      width: '9%',
      label: 'ID',
      /* Click to copy the reference ("Copied" says so). Opening the Added Value is the title's job. */
      render: (row) => (
        <CopyText text={row.ref} className="text-body-sm-regular whitespace-nowrap text-text-tertiary" />
      ),
    },
    {
      key: 'title',
      width: '24%',
      label: 'Added Value Title',
      sortable: true,
      render: (row) => (
        /* 16 above and below, Figma's own cell padding: with the domain tag that is the 81 row. */
        <div className="flex flex-col items-start gap-1 py-4">
          {onOpen ? (
            <button
              type="button"
              onClick={() => onOpen(row)}
              title={row.title}
              className="block max-w-96 truncate rounded-sm text-left text-label-sm-medium text-text-primary hover:text-text-brand-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused"
            >
              {row.title}
            </button>
          ) : (
            <span className="block max-w-96 truncate text-label-sm-medium text-text-primary" title={row.title}>
              {row.title}
            </span>
          )}
          {row.domain && (
            <Tag tone="brand" size="sm">
              {row.domain}
            </Tag>
          )}
        </div>
      ),
    },
    {
      key: 'urgency',
      width: '11%',
      label: 'Urgency',
      hint: <ColumnHint text={hints?.urgency} column="urgency" />,
      render: (row) => (row.urgency ? <UrgencyTag urgency={row.urgency} className="-mx-2" /> : null),
    },
    {
      key: 'type',
      width: '10%',
      label: 'Type',
      hint: <ColumnHint text={hints?.type} column="type" />,
      render: (row) => (row.type ? <TypeTag type={row.type} className="-mx-2" /> : null),
    },
    {
      key: 'initiator',
      width: '6%',
      label: 'Initiator',
      render: (row) =>
        row.initiator ? (
          <Avatar name={row.initiator.name} src={row.initiator.src} size="md" aria-label={`Initiator: ${row.initiator.name}`} />
        ) : null,
    },
    {
      key: 'assignee',
      width: '8%',
      label: 'Assignee',
      render: (row) =>
        row.assignee ? (
          <AssigneeWithStatus
            name={row.assignee.name}
            src={row.assignee.src}
            status={row.assignee.availability}
          />
        ) : null,
    },
    {
      key: 'start',
      width: '9%',
      label: 'Start Date',
      hint: <ColumnHint text={hints.start} column="start date" icon="function" />,
      render: (row) =>
        row.start ? (
          <EstimateHint estimated={row.start.estimated}>
            <InlineDateEdit
              label={`start date for ${row.ref}`}
              value={row.start.value}
              format={() => dateText(row.start!)}
              disabled={!onStartChange}
              onChange={(iso) => onStartChange?.(row, iso)}
            />
          </EstimateHint>
        ) : null,
    },
    {
      key: 'points',
      width: '5%',
      label: 'Points',
      hint: <ColumnHint text={hints.points} column="points" icon="function" />,
      render: (row) => <PointsCell row={row} onChange={onPointsChange} />,
    },
    {
      key: 'due',
      width: '10%',
      label: 'Due Date',
      hint: <ColumnHint text={hints.due} column="due date" icon="function" />,
      render: (row) =>
        row.due ? (
          <EstimateHint estimated={row.due.estimated}>
            <InlineDateEdit
              label={`due date for ${row.ref}`}
              value={row.due.value}
              format={() => dateText(row.due!)}
              align="right"
              disabled={!onDueChange}
              onChange={(iso) => onDueChange?.(row, iso)}
            />
          </EstimateHint>
        ) : null,
    },
    {
      key: 'status',
      label: 'Status',
      hint: <ColumnHint text={hints?.status} column="status" />,
      render: (row) => (row.status ? <StatusTag size="sm" {...row.status} /> : null),
    },
  ];

  const paginated = page !== undefined && pageCount !== undefined && onPageChange !== undefined;

  return (
    <div className={cn('flex flex-col gap-5', className)} {...props}>
      {sections.map((section) => {
        const isFolded = folded.includes(section.id);
        const headingId = `${baseId}-${section.id}-title`;
        const bodyId = `${baseId}-${section.id}-body`;
        const hasCapacity = section.totalCapacity !== undefined && section.remainingCapacity !== undefined;
        return (
          <section
            key={section.id}
            aria-labelledby={headingId}
            className="overflow-hidden rounded-md bg-surface-elevated font-sans"
          >
            <header className="flex items-center justify-between gap-6 p-6">
              <h2 id={headingId} className="m-0 text-title-md-semibold text-text-primary">
                <button
                  type="button"
                  aria-expanded={!isFolded}
                  aria-controls={bodyId}
                  onClick={() => toggle(section.id)}
                  className="flex items-baseline gap-3 rounded-sm text-left whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused"
                >
                  {/* One glyph that turns in place, as `Accordion`'s caret does — not two swapped.
                      20 in `text.secondary`: the title is the heading, the caret only a hinge. */}
                  <Icon
                    name="caret-down"
                    size={20}
                    aria-hidden="true"
                    className={cn(
                      'shrink-0 self-center text-text-secondary transition-transform duration-200 motion-reduce:transition-none',
                      !isFolded && 'rotate-180',
                    )}
                  />
                  <span>{section.title}</span>
                  {section.dates && (
                    <span className="text-body-md-regular text-text-primary">{section.dates}</span>
                  )}
                </button>
              </h2>
              {hasCapacity && (
                <dl className="m-0 flex shrink-0 flex-col text-body-md-regular whitespace-nowrap text-text-primary">
                  <div className="flex gap-1">
                    <dt>Total Capacity:</dt>
                    <dd className="m-0 text-action-tertiary-content-default">{section.totalCapacity} Pts</dd>
                  </div>
                  <div className="flex gap-1">
                    <dt>Capacity Remaining:</dt>
                    <dd className="m-0 text-action-tertiary-content-default">{section.remainingCapacity} Pts</dd>
                  </div>
                </dl>
              )}
            </header>
            <div id={bodyId} hidden={isFolded} className="border-t border-stroke-default">
              <DataTable
                columns={columns}
                rows={section.rows}
                sort={sort}
                onSortChange={onSortChange}
                className="rounded-none border-0"
                caption={`${section.title} Added Values`}
                empty={empty}
              />
            </div>
          </section>
        );
      })}

      {paginated && (
        <div className="flex justify-end">
          <Pagination
            page={page}
            pageCount={pageCount}
            onChange={onPageChange}
            itemCount={itemCount}
            pageSize={pageSize}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}
    </div>
  );
}
PlanningTable.displayName = 'PlanningTable';

import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { Icon } from '../../atoms/icon';
import { CopyText } from '../../atoms/copy-text';
import { Select } from '../../atoms/select';
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
import { StatusTag, STATUS_COLUMN_HINT, type StatusTagProps } from '../../components/status-tag';
import { TypeTag, TYPE_COLUMN_HINT, type AVType } from '../../components/type-tag';
import { UrgencyTag, URGENCY_COLUMN_HINT, type AVUrgency } from '../../components/urgency-tag';

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
 *   "(est.)" after it. The tooltip says what that means.
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
  /** A computed date, not one a person set — reads "(est.)". */
  estimated?: boolean;
  /**
   * Draw attention to a date that was just filled in (a Backlog row dropped on a Cycle gets estimated
   * dates): a blue sweep crosses the cell and the text flashes through blue to white, 3 times over 7.5
   * seconds — and stops the moment the pointer enters the cell. Not played with reduced motion.
   */
  animated?: boolean;
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
  /** Rows can be dragged out of a `backlog` and dropped on a `cycle`. Left out, a section is neither. */
  kind?: 'cycle' | 'backlog';
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
 * The six columns the design puts a glyph on, each with a default (see `FORMULA_HINTS`): Start Date,
 * Points and Due Date get the ƒ-in-a-ring mark, the other three the quiet ⓘ. Pass a string to
 * change the copy, or `''` to drop a column's glyph.
 */
export interface PlanningTableHints {
  urgency?: React.ReactNode;
  type?: React.ReactNode;
  start?: React.ReactNode;
  points?: React.ReactNode;
  due?: React.ReactNode;
  status?: React.ReactNode;
}

export interface PlanningTableProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  sections: readonly PlanningSection[];
  /** Folded section ids. Controlled when given; otherwise the table holds them. */
  collapsed?: readonly string[];
  defaultCollapsed?: readonly string[];
  onCollapsedChange?: (collapsed: string[]) => void;
  /**
   * A Backlog row was dropped on a Cycle. The table moves nothing: it tells you which row went from
   * where to where — in the design that opens the *Add Required Details* dialog, and the move happens
   * when it is confirmed. Backlog rows are draggable either way (a drop with no handler does nothing).
   */
  onMoveRow?: (row: PlanningRow, from: PlanningSection, to: PlanningSection) => void;
  /** The sortable key is `title` — the one Figma mark. */
  sort?: DataTableSort;
  onSortChange?: (sort: DataTableSort) => void;
  /** Opens an AV. Given, the reference is a button; omitted, it is text. */
  onOpen?: (row: PlanningRow) => void;
  /** Each editable cell is editable only if its callback is given. */
  onStartChange?: (row: PlanningRow, iso: string) => void;
  onDueChange?: (row: PlanningRow, iso: string) => void;
  onPointsChange?: (row: PlanningRow, points: number) => void;
  /** The points a row can take — the Points dropdown's choices. Defaults to the capacity scale. */
  pointOptions?: readonly number[];
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

/**
 * The header tooltips. Start Date, Points and Due Date are the formula columns, with Figma's copy; Urgency,
 * Type and Status use the copy their own pieces own, so every table says the same thing.
 */
const FORMULA_HINTS = {
  urgency: URGENCY_COLUMN_HINT,
  type: TYPE_COLUMN_HINT,
  status: STATUS_COLUMN_HINT,
  start: 'This column is editable, changing Start Date affects Due Date.',
  points: 'This column is editable, changing Points affects Due Date.',
  due: 'This column is editable, changing Due Date affects Start Date.\nDue Date = Approx. Start Date + Approx. Working Days + Buffer',
};
const ESTIMATE_HINT = 'This date is an estimate and may not be fully accurate.';

const dateText = (d: PlanningDate) => (d.estimated ? `${d.value} (est.)` : d.value);

/** An estimated date carries the design's caution on hover and focus; a set one has nothing to say. */
function EstimateHint({ estimated, children }: { estimated?: boolean; children: React.ReactElement }) {
  return estimated ? <Tooltip content={ESTIMATE_HINT}>{children}</Tooltip> : children;
}

/** The capacity scale: the same choices the detail card's Capacity Points dropdown offers. */
const DEFAULT_POINT_OPTIONS: readonly number[] = [0, 1, 2, 3, 5, 8, 13];

/** What an empty Start Date, Due Date or Points cell reads — the design's hyphen. */
const Empty = () => (
  <span className="text-label-sm-medium text-text-tertiary" aria-label="Not set">
    -
  </span>
);

/** Points, edited in place: a dropdown of the point scale that keeps its own draft until confirmed. */
function PointsCell({
  row,
  options,
  onChange,
}: {
  row: PlanningRow;
  options: readonly number[];
  onChange?: (row: PlanningRow, points: number) => void;
}) {
  const [draft, setDraft] = React.useState(String(row.points ?? ''));
  /* A row can carry a value the scale lacks (a legacy 4): it stays choosable rather than vanishing. */
  const choices = row.points !== undefined && !options.includes(row.points) ? [...options, row.points].sort((a, b) => a - b) : options;
  return (
    <InlineEdit
      label="points"
      disabled={!onChange}
      onEditingChange={(editing) => editing && setDraft(String(row.points ?? ''))}
      onConfirm={() => {
        if (draft !== '' && Number.isFinite(Number(draft))) onChange?.(row, Number(draft));
      }}
      editor={
        <Select
          size="sm"
          aria-label={`Points for ${row.ref}`}
          value={draft}
          options={choices.map(String)}
          onChange={setDraft}
        />
      }
    >
      {row.points === undefined ? (
        <Empty />
      ) : (
        <span className="text-label-sm-medium text-text-primary">{row.points}</span>
      )}
    </InlineEdit>
  );
}

/**
 * Wraps a date cell that can be flagged `animated`: a gradient sweeps across it and the text runs
 * black → blue → white → blue → black, on one 2.5-second loop played three times (the design's
 * "animation of cells" flow), and both stop the moment the pointer enters. Web Animations, not CSS
 * keyframes, so it needs nothing outside this file; colours are the system's tokens, by variable.
 */
function AnimatedCell({ animated, children }: { animated?: boolean; children: React.ReactNode }) {
  const [seen, setSeen] = React.useState(false);
  const sweep = React.useRef<HTMLSpanElement>(null);
  const text = React.useRef<HTMLSpanElement>(null);
  const active = !!animated && !seen;

  React.useEffect(() => {
    if (!active) return undefined;
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    const timing = { duration: 2500, iterations: 3 } as const;
    const a = sweep.current?.animate(
      [{ transform: 'translateX(-100%)' }, { transform: 'translateX(100%)' }],
      { ...timing, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    );
    const b = text.current?.animate(
      [
        { color: 'var(--color-text-primary)', offset: 0 },
        { color: 'var(--color-text-brand-medium)', offset: 0.2 },
        { color: 'var(--color-text-inverted-primary)', offset: 0.35 },
        { color: 'var(--color-text-brand-medium)', offset: 0.45 },
        { color: 'var(--color-text-primary)', offset: 0.75 },
        { color: 'var(--color-text-primary)', offset: 1 },
      ],
      { ...timing, easing: 'linear' },
    );
    return () => {
      a?.cancel();
      b?.cancel();
    };
  }, [active]);

  if (!animated) return <>{children}</>;
  return (
    <span
      className="relative isolate -mx-2 inline-flex overflow-hidden rounded-sm px-2 py-1"
      onMouseEnter={() => setSeen(true)}
    >
      {active && (
        <span
          ref={sweep}
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1/3 -z-10 bg-linear-105 from-transparent from-10% via-action-tertiary-content-default/75 via-50% to-transparent to-90%"
        />
      )}
      <span ref={text} className="relative">
        {children}
      </span>
    </span>
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
  onMoveRow,
  onStartChange,
  onDueChange,
  onPointsChange,
  pointOptions = DEFAULT_POINT_OPTIONS,
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
  /* A Backlog row in the air, and the Cycle it is over. */
  const [dragging, setDragging] = React.useState<{ rowId: string; fromId: string } | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);
  const sectionById = new Map(sections.map((s) => [s.id, s]));
  const [inner, setInner] = React.useState<readonly string[]>(defaultCollapsed);
  const folded = collapsed ?? inner;
  const toggle = (id: string) => {
    const next = folded.includes(id) ? folded.filter((x) => x !== id) : [...folded, id];
    if (collapsed === undefined) setInner(next);
    onCollapsedChange?.(next);
  };

  /* No column is narrower than its content (`fit`) except the title (`grow`), which truncates; above
     those floors the spare room is shared by the `width` weights, so a wide table fills out and
     only a squeezed one scrolls sideways. */
  const columns: Array<DataTableColumn<PlanningRow>> = [
    {
      key: 'ref',
      fit: true,
      width: '8%',
      label: 'ID',
      /* Click to copy the reference ("Copied" says so). Opening the Added Value is the title's job. */
      render: (row) => (
        <CopyText text={row.ref} className="text-body-sm-regular whitespace-nowrap text-text-tertiary" />
      ),
    },
    {
      key: 'title',
      grow: true,
      width: '26%',
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
              className="block max-w-full truncate rounded-sm text-left text-label-sm-medium text-text-primary hover:text-text-brand-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused"
            >
              {row.title}
            </button>
          ) : (
            <span className="block max-w-full truncate text-label-sm-medium text-text-primary" title={row.title}>
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
      fit: true,
      width: '9%',
      label: 'Urgency',
      hint: <ColumnHint text={hints?.urgency} column="urgency" />,
      render: (row) => (row.urgency ? <UrgencyTag urgency={row.urgency} className="-mx-2 max-w-none" /> : null),
    },
    {
      key: 'type',
      fit: true,
      width: '9%',
      label: 'Type',
      hint: <ColumnHint text={hints?.type} column="type" />,
      render: (row) => (row.type ? <TypeTag type={row.type} className="-mx-2 max-w-none" /> : null),
    },
    {
      key: 'initiator',
      fit: true,
      width: '7%',
      label: 'Initiator',
      render: (row) =>
        row.initiator ? (
          /* The name on hover and focus — an avatar alone says who only to people who know the face. */
          <Tooltip content={row.initiator.name}>
            <span
              role="img"
              aria-label={`Initiator: ${row.initiator.name}`}
              tabIndex={0}
              className="inline-flex rounded-pill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused"
            >
              <Avatar name={row.initiator.name} src={row.initiator.src} size="md" aria-hidden="true" />
            </span>
          </Tooltip>
        ) : null,
    },
    {
      key: 'assignee',
      fit: true,
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
      fit: true,
      width: '10%',
      label: 'Start Date',
      hint: <ColumnHint text={hints.start} column="start date" icon="function" />,
      render: (row) =>
        row.start ? (
          <AnimatedCell animated={row.start.animated}>
            <EstimateHint estimated={row.start.estimated}>
              <InlineDateEdit
                label={`start date for ${row.ref}`}
                value={row.start.value}
                format={() => dateText(row.start!)}
                disabled={!onStartChange}
                onChange={(iso) => onStartChange?.(row, iso)}
              />
            </EstimateHint>
          </AnimatedCell>
        ) : (
          <Empty />
        ),
    },
    {
      key: 'points',
      fit: true,
      width: '6%',
      label: 'Points',
      hint: <ColumnHint text={hints.points} column="points" icon="function" />,
      render: (row) => <PointsCell row={row} options={pointOptions} onChange={onPointsChange} />,
    },
    {
      key: 'due',
      fit: true,
      width: '11%',
      label: 'Due Date',
      hint: <ColumnHint text={hints.due} column="due date" icon="function" />,
      render: (row) =>
        row.due ? (
          <AnimatedCell animated={row.due.animated}>
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
          </AnimatedCell>
        ) : (
          <Empty />
        ),
    },
    {
      key: 'status',
      fit: true,
      width: '8%',
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
        /* A Cycle is a drop target while a Backlog row is being dragged — and lights up when it is over it. */
        const isDropTarget = !!dragging && section.kind === 'cycle';
        const isOver = isDropTarget && overId === section.id;
        const hasCapacity = section.totalCapacity !== undefined && section.remainingCapacity !== undefined;
        return (
          <section
            key={section.id}
            aria-labelledby={headingId}
            /* No `overflow: hidden`: a date picker opens out of a cell and must not be clipped. */
            className={cn(
              'rounded-md bg-surface-elevated font-sans',
              isOver && 'outline-2 -outline-offset-2 outline-stroke-focused',
            )}
            onDragOver={
              isDropTarget
                ? (event) => {
                    event.preventDefault();
                    setOverId(section.id);
                  }
                : undefined
            }
            onDragLeave={
              isDropTarget
                ? (event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOverId(null);
                  }
                : undefined
            }
            onDrop={
              isDropTarget
                ? (event) => {
                    event.preventDefault();
                    const from = sectionById.get(dragging!.fromId);
                    const row = from?.rows.find((r) => r.id === dragging!.rowId);
                    setDragging(null);
                    setOverId(null);
                    if (from && row) onMoveRow?.(row, from, section);
                  }
                : undefined
            }
          >
            <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 p-6">
              <h2 id={headingId} className="m-0 min-w-0 text-title-md-semibold text-text-primary">
                <button
                  type="button"
                  aria-expanded={!isFolded}
                  aria-controls={bodyId}
                  onClick={() => toggle(section.id)}
                  className="flex max-w-full items-baseline gap-3 rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused"
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
                  <span className="whitespace-nowrap">{section.title}</span>
                  {section.dates && (
                    <span className="truncate text-body-md-regular text-text-primary">{section.dates}</span>
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
                rowProps={
                  section.kind === 'backlog'
                    ? (row) => ({
                        draggable: true,
                        onDragStart: (event) => {
                          event.dataTransfer.effectAllowed = 'move';
                          setDragging({ rowId: row.id, fromId: section.id });
                        },
                        onDragEnd: () => {
                          setDragging(null);
                          setOverId(null);
                        },
                        className: cn(
                          'cursor-grab',
                          dragging?.rowId === row.id && 'bg-surface-neutral-subtle',
                        ),
                      })
                    : undefined
                }
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

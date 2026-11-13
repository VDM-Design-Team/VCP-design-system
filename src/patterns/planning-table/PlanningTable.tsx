import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { Icon } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';
import { CopyText } from '../../atoms/copy-text';
import { Select } from '../../atoms/select';
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
import { Menu } from '../../components/menu';
import { StatusTag, STATUS_COLUMN_HINT, type StatusTagProps } from '../../components/status-tag';
import { TypeTag, TYPE_COLUMN_HINT, type AVType } from '../../components/type-tag';
import { TruncatedText, useIsTruncated } from '../../components/truncated-text';
import { useDateFormat } from '../../lib/format-date';
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
 *   given; `sort` is the caller's, as in `DataTable`, and paging is the page's.
 *
 * Not here, by design: the filter row above the table, which is tracked separately.
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
   * A one-shot signal: this date was **just auto-calculated** by something the user did in this session,
   * so draw attention to it — a blue sweep crosses the cell and the text flashes through blue to white,
   * three times, then it stops. Set it when the calculation happens and clear it when the table reports
   * the date seen (`onAnimationDismiss`). It never replays: not on a refresh, not on sorting, filtering
   * or re-opening the page, and a flag already set when the table first renders is ignored. If the
   * value changes again before it is dismissed, the three plays start over. Not played with reduced
   * motion (the date is simply reported seen).
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
  /** "(02/03/2026 - 16/03/2026)" — already formatted. Cycles only. */
  dates?: string;
  /** Points. Cycles only; with `remainingCapacity`, draws the two capacity lines. */
  totalCapacity?: number;
  remainingCapacity?: number;
  /** `false`: rows can't be moved here — not a drop target, not in a row's Move menu (a Cycle that has ended). */
  acceptsRows?: boolean;
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
   * A row was moved — dropped on another section, or sent there from its Actions menu's "Move to Cycle" submenu. The
   * table moves nothing: it tells you which row went from where to where — in the design a Backlog
   * row dropped on a Cycle opens the *Add Required Details* dialog, and the move happens when it is
   * confirmed. Given, every row that can move also gets a **Move to Cycle** submenu in its Actions menu: the
   * sections it can go to, the way to move a row **without dragging** (the keyboard, a switch, a screen
   * reader). Movable rows are draggable either way (a drop with no handler does nothing).
   */
  onMoveRow?: (row: PlanningRow, from: PlanningSection, to: PlanningSection) => void;
  /**
   * Which moves the table offers. `to-cycle` (the default): a Backlog row onto a Cycle. `anywhere`:
   * any row onto any other section — another Cycle, or back to the Backlog.
   */
  moves?: 'to-cycle' | 'anywhere';
  /** Whether this row may move at all (a Completed one may not, say). Every row the mode allows, if omitted. */
  canMove?: (row: PlanningRow, from: PlanningSection) => boolean;
  /** The sortable key is `title` — the one Figma mark. */
  sort?: DataTableSort;
  onSortChange?: (sort: DataTableSort) => void;
  /** Opens an AV. Given, the reference is a button; omitted, it is text. */
  onOpen?: (row: PlanningRow) => void;
  /** Each editable cell is editable only if its callback is given. */
  onStartChange?: (row: PlanningRow, iso: string) => void;
  onDueChange?: (row: PlanningRow, iso: string) => void;
  onPointsChange?: (row: PlanningRow, points: number) => void;
  /**
   * A date's animation is over — its three plays ended, the pointer entered it, or the table went away
   * while it was still playing. Clear that date's `animated` flag in your state: it is a one-shot signal.
   */
  onAnimationDismiss?: (row: PlanningRow, field: 'start' | 'due') => void;
  /** The points a row can take — the Points dropdown's choices. Defaults to the capacity scale. */
  pointOptions?: readonly number[];
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

/** A date as the system writes dates (dd/mm/yyyy, or the person's locale), with "(est.)" after one the system calculated. */
const dateText = (d: PlanningDate, format: (iso: string) => string) => (d.estimated ? `${format(d.value)} (est.)` : format(d.value));

/** An estimated date carries the design's caution on hover and focus; a set one has nothing to say. */
function EstimateHint({ estimated, children }: { estimated?: boolean; children: React.ReactElement }) {
  return estimated ? <Tooltip content={ESTIMATE_HINT}>{children}</Tooltip> : children;
}

/** The capacity scale: the same choices the detail card's Capacity Points dropdown offers. */
const DEFAULT_POINT_OPTIONS: readonly number[] = [0, 1, 2, 3, 5, 8, 13];

/** What an empty Start Date, Due Date or Points cell reads — the design's hyphen, and "Not set" aloud.
    (An `aria-label` on a plain span is not allowed, and most screen readers would say "dash".) */
const Empty = () => (
  <span className="text-label-sm-medium text-text-tertiary">
    <span aria-hidden="true">-</span>
    <span className="sr-only">Not set</span>
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

/** One loop of the sweep and of the text flash — the design's animation, three times over. */
const SWEEP_MS = 2500;
const SWEEP_PLAYS = 3;

/**
 * The animation inside a date cell that is `live` (flagged, new this session, not yet seen): a gradient sweeps
 * across **the whole cell** and the text runs black → blue → white → blue → black, one loop per `SWEEP_MS`,
 * `SWEEP_PLAYS` times. The cell itself is what the gradient fills — the table gives the `<td>` `relative isolate
 * overflow-hidden` through `cellProps` while it is live — so this renders the sweep layer beside the content,
 * never around it: the date stays a plain `InlineDateEdit`, and the pen, the picker and the keyboard all work
 * while it plays (and the first touch of any of them dismisses it). The third loop ending calls `onDismiss`;
 * a new `playKey` (the value changed again) starts the three plays over. Web Animations, not CSS keyframes, so
 * it needs nothing outside this file; colours are the system's tokens, by variable.
 */
function AnimatedCell({
  live,
  playKey,
  onDismiss,
  children,
}: {
  live: boolean;
  /** Changes when the value does, so a fresh calculation restarts the count. */
  playKey: string;
  onDismiss: () => void;
  children: React.ReactNode;
}) {
  const sweep = React.useRef<HTMLSpanElement>(null);
  const text = React.useRef<HTMLSpanElement>(null);
  const dismiss = React.useRef(onDismiss);
  dismiss.current = onDismiss;

  React.useEffect(() => {
    if (!live) return undefined;
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dismiss.current();
      return undefined;
    }
    /* `forwards`: when the last loop ends the layers *stay* at their end state until React removes them —
       without it they snap back to their start for a frame, which reads as one more flash. */
    const timing = { duration: SWEEP_MS, iterations: SWEEP_PLAYS, fill: 'forwards' } as const;
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
    /* The third loop ending is a dismissal; a cancel (unmount, a new playKey) is not. */
    const finished = () => dismiss.current();
    b?.addEventListener('finish', finished);
    return () => {
      b?.removeEventListener('finish', finished);
      a?.cancel();
      b?.cancel();
    };
  }, [live, playKey]);

  /* The same tree whether live or not: when the animation is dismissed by the first touch — often the pen
     being pressed — the date editor must keep its place, or an open picker would be torn down under the
     user's finger. Only the sweep layer comes and goes. */
  return (
    <>
      {live && (
        <span
          ref={sweep}
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1/3 -z-10 bg-linear-105 from-transparent from-10% via-action-tertiary-content-default/75 via-50% to-transparent to-90%"
        />
      )}
      {/* The date's own text sets its colour (`text-text-primary`), so the wrapper's animated `color` would never reach it: while live, everything inside inherits the wrapper's colour instead. */}
      <span ref={text} className={cn('relative', live && '**:text-inherit')}>
        {children}
      </span>
    </>
  );
}

/** What a live date's `<td>` needs: to hold the sweep, and to dismiss it on the first touch (pointer or focus). */
const liveCell = (dismiss: () => void) => ({
  className: 'relative isolate overflow-hidden',
  onMouseEnter: dismiss,
  onFocusCapture: dismiss,
});

/** The title as a button that opens the row; when it is cut, hovering or focusing it says the whole title. */
function TitleButton({ row, onOpen }: { row: PlanningRow; onOpen: (row: PlanningRow) => void }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const truncated = useIsTruncated(ref, [row.title]);
  return (
    <Tooltip content={row.title} describe={false} disabled={!truncated} className="min-w-0 max-w-full">
      <button
        ref={ref}
        type="button"
        onClick={() => onOpen(row)}
        className="block max-w-full truncate rounded-sm text-left text-label-sm-medium text-text-primary hover:text-text-brand-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused"
      >
        {row.title}
      </button>
    </Tooltip>
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
  moves = 'to-cycle',
  canMove,
  onStartChange,
  onDueChange,
  onPointsChange,
  onAnimationDismiss,
  pointOptions = DEFAULT_POINT_OPTIONS,
  hints: hintOverrides,
  empty,
  ...props
}: PlanningTableProps) {
  const baseId = React.useId();
  const dates = useDateFormat();
  const hints = { ...FORMULA_HINTS, ...hintOverrides };
  /* A row in the air, and the section it is over. */
  const [dragging, setDragging] = React.useState<{ rowId: string; fromId: string } | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);
  const sectionById = new Map(sections.map((s) => [s.id, s]));
  /* Where a row may go from its section: in `to-cycle`, only from the Backlog onto a Cycle; in
     `anywhere`, to every other section. One rule for the drag and the button, so they never differ. */
  const targetsFrom = (from: PlanningSection) =>
    (moves === 'anywhere'
      ? sections.filter((s) => s.id !== from.id)
      : from.kind === 'backlog'
        ? sections.filter((s) => s.kind === 'cycle')
        : []
    ).filter((s) => s.acceptsRows !== false);
  const movable = (row: PlanningRow, from: PlanningSection) =>
    targetsFrom(from).length > 0 && (canMove?.(row, from) ?? true);
  /* A row sent from its menu takes its button with it, and focus would fall to the page. So when the row
     shows up in another section — now, or after the caller's dialog is confirmed — focus goes to its
     button there. A row that stays (the dialog was cancelled) keeps focus on its own button, as usual. */
  const rootRef = React.useRef<HTMLDivElement>(null);
  const sent = React.useRef<{ rowId: string; fromId: string } | null>(null);
  React.useEffect(() => {
    const pending = sent.current;
    if (!pending) return;
    const now = sections.find((sec) => sec.rows.some((r) => r.id === pending.rowId));
    if (!now || now.id === pending.fromId) return;
    sent.current = null;
    /* After whatever closed (the menu, a dialog) has tried to hand focus back to the button that left. */
    const timer = window.setTimeout(() =>
      rootRef.current?.querySelector<HTMLElement>(`[data-row-actions="${CSS.escape(pending.rowId)}"]`)?.focus(),
    );
    return () => window.clearTimeout(timer);
  });

  /* Animated dates. A flag is only a live signal if it was raised after the table appeared (a flag already
     there on the first render is old news — a refreshed page must not replay it) and has not been
     dismissed. Both sets are keyed by row, field and value, so a changed value is a new signal, and
     they outlive a row's remounting (filtering, paging) without outliving the table. */
  const animKey = (row: PlanningRow, field: 'start' | 'due') =>
    `${row.id}:${field}:${(field === 'start' ? row.start : row.due)?.value}`;
  const initialFlags = React.useRef<Set<string> | null>(null);
  if (initialFlags.current === null) {
    initialFlags.current = new Set();
    for (const section of sections)
      for (const row of section.rows) {
        if (row.start?.animated) initialFlags.current.add(animKey(row, 'start'));
        if (row.due?.animated) initialFlags.current.add(animKey(row, 'due'));
      }
  }
  const dismissedFlags = React.useRef(new Set<string>());
  const [, rerender] = React.useReducer((n: number) => n + 1, 0);
  const isLive = (row: PlanningRow, field: 'start' | 'due') => {
    const d = field === 'start' ? row.start : row.due;
    const key = animKey(row, field);
    return !!d?.animated && !initialFlags.current!.has(key) && !dismissedFlags.current.has(key);
  };
  const dismissFlag = (row: PlanningRow, field: 'start' | 'due') => {
    const key = animKey(row, field);
    if (dismissedFlags.current.has(key)) return;
    dismissedFlags.current.add(key);
    rerender();
    onAnimationDismiss?.(row, field);
  };
  /* Leaving the page while a date is still playing dismisses it too: it must not be waiting when they return. */
  const liveNow = React.useRef<Array<{ row: PlanningRow; field: 'start' | 'due' }>>([]);
  liveNow.current = sections.flatMap((section) =>
    section.rows.flatMap((row) =>
      (['start', 'due'] as const).filter((field) => isLive(row, field)).map((field) => ({ row, field })),
    ),
  );
  const onDismissRef = React.useRef(onAnimationDismiss);
  onDismissRef.current = onAnimationDismiss;
  React.useEffect(
    () => () => liveNow.current.forEach(({ row, field }) => onDismissRef.current?.(row, field)),
    [],
  );
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
            <TitleButton row={row} onOpen={onOpen} />
          ) : (
            <TruncatedText className="text-label-sm-medium text-text-primary">{row.title}</TruncatedText>
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
          /* The name on hover and focus — an avatar alone says who only to people who know the face.
             The avatar's own name already says it, so the tooltip does not describe it again. */
          <Tooltip content={row.initiator.name} describe={false}>
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
      cellProps: (row) => (isLive(row, 'start') ? liveCell(() => dismissFlag(row, 'start')) : undefined),
      fit: true,
      width: '10%',
      label: 'Start Date',
      hint: <ColumnHint text={hints.start} column="start date" icon="function" />,
      render: (row) =>
        row.start ? (
          <AnimatedCell
            live={isLive(row, 'start')}
            playKey={animKey(row, 'start')}
            onDismiss={() => dismissFlag(row, 'start')}
          >
            <EstimateHint estimated={row.start.estimated}>
              <InlineDateEdit
                label={`start date for ${row.ref}`}
                value={row.start.value}
                format={() => dateText(row.start!, dates.format)}
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
      cellProps: (row) => (isLive(row, 'due') ? liveCell(() => dismissFlag(row, 'due')) : undefined),
      fit: true,
      width: '11%',
      label: 'Due Date',
      hint: <ColumnHint text={hints.due} column="due date" icon="function" />,
      render: (row) =>
        row.due ? (
          <AnimatedCell
            live={isLive(row, 'due')}
            playKey={animKey(row, 'due')}
            onDismiss={() => dismissFlag(row, 'due')}
          >
            <EstimateHint estimated={row.due.estimated}>
              <InlineDateEdit
                label={`due date for ${row.ref}`}
                value={row.due.value}
                format={() => dateText(row.due!, dates.format)}
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

  /* The Actions column: a ⋯ button per movable row, opening a menu whose one item is **Move to Cycle**, a submenu of the sections the row can go to
     (the way to move a row without dragging). A section where no row can move (a Cycle, when only Backlog rows move) has no Actions column at all, rather than a column of empty cells. "Cycle" because that is what they are; with `moves="anywhere"` the Backlog is a choice too, and then it says only "Move to". */
  const actionsColumn = (section: PlanningSection): DataTableColumn<PlanningRow> => ({
    key: 'actions',
    label: 'Actions',
    fit: true,
    width: '4%',
    render: (row) => {
      const targets = movable(row, section) ? targetsFrom(section) : [];
      if (targets.length === 0) return null;
      const label = targets.every((to) => to.kind !== 'backlog') ? 'Move to Cycle' : 'Move to';
      return (
        <Menu
          align="right"
          trigger={<IconButton variant="neutral-tertiary" icon="dots-three" label={`Actions for ${row.ref}`} data-row-actions={row.id} />}
          items={[
            {
              key: 'move',
              label,
              heading: label,
              items: targets.map((to) => ({
                key: `move:${to.id}`,
                label: (
                  <span className="flex items-baseline gap-2">
                    <span>{to.title}</span>
                    {to.dates && <span className="text-body-sm-regular text-text-secondary">{to.dates}</span>}
                  </span>
                ),
                onClick: () => {
                  sent.current = { rowId: row.id, fromId: section.id };
                  onMoveRow?.(row, section, to);
                },
              })),
            },
          ]}
        />
      );
    },
  });

  return (
    <div ref={rootRef} className={cn('flex flex-col gap-5', className)} {...props}>
      {sections.map((section) => {
        const isFolded = folded.includes(section.id);
        const headingId = `${baseId}-${section.id}-title`;
        const bodyId = `${baseId}-${section.id}-body`;
        /* A section is a drop target while a row that may go there is in the air — and lights up when it is over it. */
        const draggedFrom = dragging ? sectionById.get(dragging.fromId) : undefined;
        const isDropTarget = !!draggedFrom && targetsFrom(draggedFrom).some((t) => t.id === section.id);
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
                columns={onMoveRow && section.rows.some((r) => movable(r, section)) ? [...columns, actionsColumn(section)] : columns}
                rows={section.rows}
                sort={sort}
                onSortChange={onSortChange}
                className="rounded-none border-0"
                rowProps={(row) =>
                  movable(row, section)
                    ? {
                        draggable: true,
                        onDragStart: (event) => {
                          event.dataTransfer.effectAllowed = 'move';
                          sent.current = null;
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
                      }
                    : {}
                }
                caption={`${section.title} Added Values`}
                empty={empty}
              />
            </div>
          </section>
        );
      })}

    </div>
  );
}
PlanningTable.displayName = 'PlanningTable';

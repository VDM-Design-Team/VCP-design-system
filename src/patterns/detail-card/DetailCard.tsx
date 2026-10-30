import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { Icon } from '../../atoms/icon';
import { Input } from '../../atoms/input';
import { Tag } from '../../atoms/tag';
import { Chip } from '../../components/chip';
import { CycleTag } from '../../components/cycle-tag';
import { DatePicker } from '../../components/date-picker';
import { DueDateTag, dueDateTone } from '../../components/due-date-tag';
import { Popover } from '../../components/popover';
import { SearchSelect, type SearchSelectOption } from '../../components/search-select';
import { AV_STATUSES, StatusTag, type AVStatus } from '../../components/status-tag';
import { AV_TYPES, TypeTag, type AVType } from '../../components/type-tag';
import { AV_URGENCIES, UrgencyTag, type AVUrgency } from '../../components/urgency-tag';

/**
 * DetailCard — the facts about one Added Value, down the right of its page: who started it and
 * who is on it, the dates, the cycle, the status, how urgent it is, what kind, which projects and
 * tags. Read it, or edit it in place. Read off Figma's `Detail_Card` set and its `_Detail_Card_Item_*`
 * rows.
 *
 * **`type` picks which of the four cards it is**, and each is a fixed list of fields, as the design
 * draws them (the table is in `docs/detail-card.md`): `viewing` (everything), `duplicate` (an AV
 * initiated to another domain: a Duplicates row, no people or dates), `editing` (the fields that can
 * be changed, so no Status) and `new` (an AV being created: Initiator, Projects, Category, Tags,
 * Type, Urgency). `domain` then trims it: **Design has no Cycle**; Development has every field.
 *
 * Values go in as `value` and come out through `onChange` (editing), and the options for the
 * dropdowns as `options`. The page owns the data, the people pickers (the + beside Initiator and
 * Assignee only report) and the viewers list (a placeholder pill for now).
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type DetailCardType = 'viewing' | 'duplicate' | 'editing' | 'new';
export type DetailCardDomain = 'design' | 'development';

export interface DetailCardPerson {
  name: string;
  /** Photo. Without it the avatar draws initials. */
  src?: string;
  /** Under the name on an assignee: "Assignee". */
  description?: string;
  /** Their capacity points, shown as the chip's count. */
  points?: number;
}

export interface DetailCardDuplicate {
  /** The domain it was initiated to: "Design". */
  domain: string;
  /** Its status there: "Initiated". */
  status: string;
}

/** What the card shows. Every field is optional; the card draws the ones its `type` has. ISO `yyyy-mm-dd` for dates. */
export interface DetailCardValue {
  initiator?: DetailCardPerson;
  assignees?: readonly DetailCardPerson[];
  startDate?: string;
  dueDate?: string;
  /** The cycle's `value` from `options.cycles`. */
  cycle?: string;
  status?: string;
  urgency?: AVUrgency;
  type?: AVType;
  projects?: readonly string[];
  category?: string;
  tags?: readonly string[];
  capacityPoints?: number;
  duplicates?: readonly DetailCardDuplicate[];
  deploymentDate?: string;
  dateInitiated?: string;
  dateAccepted?: string;
}

export type DetailCardField = Exclude<keyof DetailCardValue, never>;

/** The cycle options carry the dates, so the read card can draw a `CycleTag`. */
export interface DetailCardCycle {
  value: string;
  code: string;
  start: string;
  end: string;
}

export interface DetailCardOptions {
  cycles?: readonly DetailCardCycle[];
  projects?: ReadonlyArray<string | SearchSelectOption>;
  categories?: ReadonlyArray<string | SearchSelectOption>;
  tags?: ReadonlyArray<string | SearchSelectOption>;
}

/* THE mapping — card type → the fields it has, in order. Off Figma's four `Detail_Card` types. */
const FIELDS: Record<DetailCardType, readonly DetailCardField[]> = {
  viewing: [
    'initiator', 'assignees', 'startDate', 'dueDate', 'cycle', 'status', 'urgency', 'type',
    'projects', 'category', 'tags', 'capacityPoints', 'deploymentDate', 'dateInitiated',
  ],
  duplicate: [
    'initiator', 'duplicates', 'status', 'urgency', 'type', 'projects', 'category', 'tags',
    'deploymentDate', 'dateInitiated',
  ],
  editing: [
    'initiator', 'assignees', 'startDate', 'dueDate', 'cycle', 'projects', 'category', 'tags',
    'type', 'urgency', 'capacityPoints',
  ],
  new: ['initiator', 'projects', 'category', 'tags', 'type', 'urgency'],
};

const LABEL: Partial<Record<DetailCardField, string>> = {
  initiator: 'Initiator',
  assignees: 'Assignee',
  startDate: 'Start Date',
  dueDate: 'Due Date',
  cycle: 'Cycle',
  duplicates: 'Duplicates',
  status: 'Status',
  urgency: 'Urgency',
  type: 'Type',
  projects: 'Projects',
  category: 'AV Category',
  tags: 'Tags',
  capacityPoints: 'Capacity Points',
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const parts = (iso: string) => iso.split('-').map(Number) as [number, number, number];
/** "October 1, 2025". */
const longDate = (iso: string) => {
  const [y, m, d] = parts(iso);
  return MONTHS[m - 1] ? `${MONTHS[m - 1]} ${d}, ${y}` : iso;
};
/** "10-01-2025", as the editing field shows it. */
const fieldDate = (iso: string) => {
  const [y, m, d] = parts(iso);
  return `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}-${y}`;
};
const toDate = (iso: string) => {
  const [y, m, d] = parts(iso);
  return new Date(y, m - 1, d);
};

export interface DetailCardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Which card. Fixes the fields; see the table in the docs. */
  type: DetailCardType;
  /** Design has no Cycle; Development has every field. Default `development`. */
  domain?: DetailCardDomain;
  value: DetailCardValue;
  /** Editing and new: fires with the whole value, changed. */
  onChange?: (value: DetailCardValue) => void;
  /** The dropdowns' options. */
  options?: DetailCardOptions;
  /** Editing and new: a message under a field, which also marks it invalid. */
  errors?: Partial<Record<DetailCardField, string>>;
  /** Editing: the + beside Initiator and Assignee. The page opens its people picker. */
  onAddInitiator?: () => void;
  onAddAssignee?: () => void;
  /** The viewers pill, a placeholder until Edit Viewers is built: shows the count and reports a press. */
  viewerCount?: number;
  onViewers?: () => void;
  /** Due dates this many days away or fewer read as due soon. Default 3. */
  dueSoonWithinDays?: number;
}

const toOptions = (rows: ReadonlyArray<string | SearchSelectOption> = []) => rows;

export const DetailCard = React.forwardRef<HTMLElement, DetailCardProps>(
  (
    {
      className,
      type,
      domain = 'development',
      value,
      onChange,
      options,
      errors,
      onAddInitiator,
      onAddAssignee,
      viewerCount,
      onViewers,
      dueSoonWithinDays = 3,
      ...props
    },
    ref,
  ) => {
    const editing = type === 'editing' || type === 'new';
    const fields = FIELDS[type].filter((f) => !(domain === 'design' && f === 'cycle'));
    const set = (patch: Partial<DetailCardValue>) => onChange?.({ ...value, ...patch });
    const cycles = options?.cycles ?? [];
    const cycleOptions: SearchSelectOption[] = cycles.map((c) => ({
      value: c.value,
      label: `${c.code} (${c.start} - ${c.end})`,
      shortLabel: c.code,
    }));

    const people = (list: readonly DetailCardPerson[] | undefined, role?: string) =>
      (list ?? []).map((p) => (
        <Chip
          key={p.name}
          variant={editing ? 'outline' : 'tonal'}
          size="sm"
          avatar={<Avatar name={p.name} src={p.src} size="sm" />}
          label={p.name}
          description={p.description ?? role}
          count={p.points}
        />
      ));

    const body: Partial<Record<DetailCardField, React.ReactNode>> = {};

    body.initiator = <div className="flex gap-2">{people(value.initiator ? [value.initiator] : [])}</div>;
    body.assignees = <div className="flex flex-wrap gap-2">{people(value.assignees, 'Assignee')}</div>;

    body.startDate = editing ? (
      <DateField label="Start Date" value={value.startDate} onChange={(v) => set({ startDate: v })} error={errors?.startDate} />
    ) : value.startDate ? (
      <Tag tone="neutral">{longDate(value.startDate)}</Tag>
    ) : null;
    body.dueDate = editing ? (
      <DateField label="Due Date" value={value.dueDate} onChange={(v) => set({ dueDate: v })} error={errors?.dueDate} />
    ) : value.dueDate ? (
      <DueDateTag
        proximity={dueDateTone({ due: toDate(value.dueDate), soonWithinDays: dueSoonWithinDays })}
      >
        {longDate(value.dueDate)}
      </DueDateTag>
    ) : null;

    const cycle = cycles.find((c) => c.value === value.cycle);
    body.cycle = editing ? (
      <SearchSelect
        aria-label="Cycle"
        fullWidth
        placeholder="Select cycle"
        searchPlaceholder="Search cycles"
        options={cycleOptions}
        value={value.cycle ?? ''}
        onChange={(v: string) => set({ cycle: v })}
        error={errors?.cycle}
      />
    ) : cycle ? (
      <CycleTag code={cycle.code} start={cycle.start} end={cycle.end} />
    ) : null;

    body.status = value.status ? (
      (AV_STATUSES as readonly string[]).includes(value.status) ? (
        <StatusTag status={value.status as AVStatus} />
      ) : (
        <StatusTag custom={value.status} />
      )
    ) : null;
    body.duplicates = (
      <ul className="flex w-full flex-col gap-2">
        {(value.duplicates ?? []).map((d) => (
          <li
            key={d.domain}
            className="flex items-center justify-between gap-2 rounded-sm border border-stroke-subtle px-3 py-2 text-body-sm-regular text-text-primary"
          >
            {d.domain}
            {(AV_STATUSES as readonly string[]).includes(d.status) ? (
              <StatusTag status={d.status as AVStatus} />
            ) : (
              <StatusTag custom={d.status} />
            )}
          </li>
        ))}
      </ul>
    );

    body.urgency = editing ? (
      <SearchSelect
        aria-label="Urgency"
        fullWidth
        placeholder="Select urgency"
        searchable={false}
        options={[...AV_URGENCIES]}
        value={value.urgency ?? ''}
        onChange={(v: string) => set({ urgency: v as AVUrgency })}
        error={errors?.urgency}
      />
    ) : value.urgency ? (
      <UrgencyTag urgency={value.urgency} />
    ) : null;
    body.type = editing ? (
      <SearchSelect
        aria-label="Type"
        fullWidth
        placeholder="Select type"
        searchable={false}
        options={[...AV_TYPES]}
        value={value.type ?? ''}
        onChange={(v: string) => set({ type: v as AVType })}
        error={errors?.type}
      />
    ) : value.type ? (
      <TypeTag type={value.type} />
    ) : null;

    const tagList = (items: readonly string[] | undefined, tone: 'brand' | 'neutral') => (
      <div className="flex flex-wrap gap-2">
        {(items ?? []).map((t) => (
          <Tag key={t} tone={tone}>
            {t}
          </Tag>
        ))}
      </div>
    );
    body.projects = editing ? (
      <SearchSelect
        multiple
        display="tags"
        aria-label="Projects"
        fullWidth
        placeholder="Select projects"
        searchPlaceholder="Search projects"
        options={toOptions(options?.projects)}
        value={[...(value.projects ?? [])]}
        onChange={(v: string[]) => set({ projects: v })}
        error={errors?.projects}
      />
    ) : (
      tagList(value.projects, 'brand')
    );
    body.category = editing ? (
      <SearchSelect
        aria-label="AV Category"
        fullWidth
        placeholder="Select category"
        searchable={false}
        options={toOptions(options?.categories)}
        value={value.category ?? ''}
        onChange={(v: string) => set({ category: v })}
        error={errors?.category}
      />
    ) : value.category ? (
      <Tag tone="neutral">{value.category}</Tag>
    ) : null;
    body.tags = editing ? (
      <SearchSelect
        multiple
        display="tags"
        aria-label="Tags"
        fullWidth
        placeholder="Select tags"
        searchPlaceholder="Search tags"
        options={toOptions(options?.tags)}
        value={[...(value.tags ?? [])]}
        onChange={(v: string[]) => set({ tags: v })}
        error={errors?.tags}
      />
    ) : (
      tagList(value.tags, 'neutral')
    );
    body.capacityPoints = editing ? (
      <Input
        type="number"
        fullWidth
        aria-label="Capacity Points"
        value={value.capacityPoints ?? ''}
        onChange={(e) =>
          set({ capacityPoints: e.target.value === '' ? undefined : Number(e.target.value) })
        }
      />
    ) : value.capacityPoints !== undefined ? (
      <Tag tone="neutral">{String(value.capacityPoints)}</Tag>
    ) : null;

    const hasViewers = viewerCount !== undefined && !editing;

    return (
      <section
        ref={ref}
        aria-label="Details"
        className={cn('flex flex-col gap-6 rounded-md bg-surface-elevated p-6 font-sans', className)}
        {...props}
      >
        {fields.map((field) => {
          if (field === 'deploymentDate') {
            return value.deploymentDate ? (
              <Muted key={field} label="Deployment Date" date={longDate(value.deploymentDate)} />
            ) : null;
          }
          if (field === 'dateInitiated') {
            if (!value.dateInitiated && !value.dateAccepted) return null;
            return (
              <div key={field} className="flex gap-4">
                {value.dateInitiated && <Muted label="Date Initiated" date={longDate(value.dateInitiated)} />}
                {value.dateAccepted && (
                  <>
                    <span aria-hidden="true" className="w-px self-stretch bg-stroke-subtle" />
                    <Muted label="Date Accepted" date={longDate(value.dateAccepted)} />
                  </>
                )}
              </div>
            );
          }
          const node = body[field];
          if (node === null || node === undefined) return null;
          const addAction =
            editing && field === 'initiator' ? onAddInitiator : editing && field === 'assignees' ? onAddAssignee : undefined;
          return (
            <Item
              key={field}
              label={LABEL[field] ?? field}
              onAdd={addAction}
              aside={field === 'initiator' && hasViewers ? <Viewers count={viewerCount} onPress={onViewers} /> : undefined}
            >
              {node}
            </Item>
          );
        })}
      </section>
    );
  },
);
DetailCard.displayName = 'DetailCard';

/** One field: its label, an optional + beside it, an optional control at the far right, and the value under. */
function Item({
  label,
  onAdd,
  aside,
  children,
}: {
  label: string;
  onAdd?: () => void;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  const id = React.useId();
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col items-start gap-2">
      <div className="flex w-full items-center gap-2">
        <span id={id} className="text-title-sm-semibold text-text-primary">
          {label}
        </span>
        {onAdd && (
          <button
            type="button"
            aria-label={`Add ${label.toLowerCase()}`}
            onClick={onAdd}
            className={cn(
              'relative grid size-5 place-items-center rounded-full bg-action-primary-surface-default text-action-primary-content-default',
              'hover:bg-action-primary-surface-hover active:bg-action-primary-surface-pressed before:absolute before:-inset-2.5',
              'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
            )}
          >
            <Icon name="plus" size="sm" aria-hidden="true" />
          </button>
        )}
        {aside && <span className="ml-auto">{aside}</span>}
      </div>
      {children}
    </div>
  );
}

function Muted({ label, date }: { label: string; date: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-title-sm-semibold text-text-tertiary">{label}</span>
      <span className="text-body-sm-regular text-text-tertiary">{date}</span>
    </div>
  );
}

/** The viewers pill: an eye and a count. A placeholder until Edit Viewers is built; it only reports a press. */
function Viewers({ count, onPress }: { count: number; onPress?: () => void }) {
  return (
    <button
      type="button"
      aria-label={`${count} viewers`}
      onClick={onPress}
      className={cn(
        'inline-flex h-6 items-center gap-1 rounded-sm border border-neutral-outline-border-default px-2',
        'text-caption-md-medium text-neutral-outline-content-default',
        'hover:bg-neutral-outline-surface-hover active:bg-neutral-outline-surface-pressed',
        'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
      )}
    >
      <Icon name="eye" size="sm" aria-hidden="true" />
      {count}
    </button>
  );
}

/** A date in the editing card: a field that shows it and a calendar that picks it. */
function DateField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value?: string;
  onChange: (iso: string) => void;
  error?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const errorId = React.useId();
  return (
    <div className="w-full">
      <Popover
        open={open}
        onOpenChange={setOpen}
        align="left"
        className="w-full"
        trigger={
          <button
            type="button"
            aria-label={label}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              'flex h-10 w-full items-center gap-2 rounded-md border bg-surface-elevated px-3 text-left transition-colors',
              error ? 'border-accent-critical-outline-border-default' : 'border-stroke-strong hover:border-stroke-focused',
              'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
            )}
          >
            <Icon name="calendar-blank" size="sm" aria-hidden="true" className="text-text-tertiary" />
            <span className={cn('text-body-sm-regular', value ? 'text-text-primary' : 'text-text-subtle')}>
              {value ? fieldDate(value) : 'MM-DD-YYYY'}
            </span>
          </button>
        }
        content={
          <DatePicker
            mode="day"
            value={value}
            onChange={(iso) => {
              onChange(iso);
              setOpen(false);
            }}
          />
        }
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-caption-md-medium text-accent-critical-outline-content-default">
          {error}
        </p>
      )}
    </div>
  );
}

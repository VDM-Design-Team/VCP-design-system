import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { Badge } from '../../atoms/badge';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { Input } from '../../atoms/input';
import { Tag } from '../../atoms/tag';
import { Chip } from '../../atoms/chip';
import { CycleTag } from '../../components/cycle-tag';
import { DatePicker } from '../../components/date-picker';
import { DueDateTag, dueDateTone } from '../../components/due-date-tag';
import { Popover } from '../../components/popover';
import { SearchSelect, type SearchSelectOption } from '../../components/search-select';
import { AV_STATUSES, StatusTag, type AVStatus } from '../../components/status-tag';
import { AV_TYPES, TypeTag, type AVType } from '../../components/type-tag';
import { AV_URGENCIES, UrgencyTag, type AVUrgency } from '../../components/urgency-tag';
import { useDateFormat } from '../../lib/format-date';

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
 * dropdowns as `options`. **People are added, edited and removed in the card**, as the design's flow
 * draws it: the + beside Initiator or Assignee opens a small form under the chips (a user, for an
 * assignee a role and capacity points, then Cancel and Add); a chip's pencil turns that chip into
 * the same form (Cancel and Save); its ✕ removes it. The Initiator has no pencil. The page owns the
 * data and the viewers list (a placeholder pill for now).
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
  /** Several people can start an AV. */
  initiators?: readonly DetailCardPerson[];
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
  /** Who can be added as Initiator or Assignee. */
  people?: readonly DetailCardPerson[];
  /** The roles an Assignee can be given. Default QA, Design and Assignee. */
  roles?: readonly string[];
  cycles?: readonly DetailCardCycle[];
  projects?: ReadonlyArray<string | SearchSelectOption>;
  categories?: ReadonlyArray<string | SearchSelectOption>;
  tags?: ReadonlyArray<string | SearchSelectOption>;
}

/* THE mapping — card type → the fields it has, in order. Off Figma's four `Detail_Card` types. */
const FIELDS: Record<DetailCardType, readonly DetailCardField[]> = {
  viewing: [
    'initiators', 'assignees', 'startDate', 'dueDate', 'cycle', 'status', 'urgency', 'type',
    'projects', 'category', 'tags', 'capacityPoints', 'deploymentDate', 'dateInitiated',
  ],
  duplicate: [
    'initiators', 'duplicates', 'status', 'urgency', 'type', 'projects', 'category', 'tags',
    'deploymentDate', 'dateInitiated',
  ],
  editing: [
    'initiators', 'assignees', 'startDate', 'dueDate', 'cycle', 'projects', 'category', 'tags',
    'type', 'urgency', 'capacityPoints',
  ],
  new: ['initiators', 'projects', 'category', 'tags', 'type', 'urgency'],
};

const LABEL: Partial<Record<DetailCardField, string>> = {
  initiators: 'Initiator',
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

const parts = (iso: string) => iso.split('-').map(Number) as [number, number, number];
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
  /** The viewers pill, a placeholder until Edit Viewers is built: shows the count and reports a press. */
  viewerCount?: number;
  onViewers?: () => void;
  /** Due dates this many days away or fewer read as due soon. Default 3. */
  dueSoonWithinDays?: number;
}

/** The capacity points an AV can be given: the Fibonacci steps the team estimates in. */
const POINTS = ['0', '1', '2', '3', '5', '8', '13'];

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
      viewerCount,
      onViewers,
      dueSoonWithinDays = 3,
      ...props
    },
    ref,
  ) => {
    const editing = type === 'editing' || type === 'new';
    /* Every date the card reads out: dd/mm/yyyy, or the person's locale when the product sets one — the same as every date in the system. */
    const { format: showDate, range: showRange } = useDateFormat();
    const fields = FIELDS[type].filter((f) => !(domain === 'design' && f === 'cycle'));
    const set = (patch: Partial<DetailCardValue>) => onChange?.({ ...value, ...patch });
    const cycles = options?.cycles ?? [];
    const cycleOptions: SearchSelectOption[] = cycles.map((c) => ({
      value: c.value,
      label: `${c.code} (${showRange(c.start, c.end)})`,
      shortLabel: c.code,
    }));

    const people = (list: readonly DetailCardPerson[] | undefined, role?: string) =>
      (list ?? []).map((p) => (
        <Chip
          key={p.name}
          size="md"
          tone="brand"
          avatar={<Avatar name={p.name} src={p.src} tone="brand" size="sm" />}
          label={p.name}
          description={p.description ?? role}
          count={p.points}
        />
      ));

    const body: Partial<Record<DetailCardField, React.ReactNode>> = {};

    body.initiators = <div className="flex flex-wrap gap-2">{people(value.initiators)}</div>;
    body.assignees = <div className="flex flex-wrap gap-2">{people(value.assignees, 'Assignee')}</div>;

    body.startDate = editing ? (
      <DateField label="Start Date" value={value.startDate} onChange={(v) => set({ startDate: v })} error={errors?.startDate} />
    ) : value.startDate ? (
      <Tag size="md" tone="neutral">{showDate(value.startDate)}</Tag>
    ) : null;
    body.dueDate = editing ? (
      <DateField label="Due Date" value={value.dueDate} onChange={(v) => set({ dueDate: v })} error={errors?.dueDate} />
    ) : value.dueDate ? (
      <DueDateTag size="md" date={value.dueDate} proximity={dueDateTone({ due: toDate(value.dueDate), soonWithinDays: dueSoonWithinDays })} />
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
      <CycleTag size="md" code={cycle.code} start={cycle.start} end={cycle.end} />
    ) : null;

    body.status = value.status ? (
      (AV_STATUSES as readonly string[]).includes(value.status) ? (
        <StatusTag size="md" status={value.status as AVStatus} />
      ) : (
        <StatusTag size="md" custom={value.status} />
      )
    ) : null;
    body.duplicates = (
      <ul className="flex w-full flex-col gap-2">
        {(value.duplicates ?? []).map((d) => (
          <li
            key={d.domain}
            className="flex min-h-14 items-center justify-between gap-2 rounded-md border border-stroke-default px-3 text-body-sm-regular text-text-primary"
          >
            {d.domain}
            {(AV_STATUSES as readonly string[]).includes(d.status) ? (
              <StatusTag size="md" status={d.status as AVStatus} />
            ) : (
              <StatusTag size="md" custom={d.status} />
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
      <UrgencyTag size="md" variant="tonal" urgency={value.urgency} />
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
      <TypeTag size="md" variant="faint" info type={value.type} />
    ) : null;

    const tagList = (items: readonly string[] | undefined, tone: 'brand' | 'neutral') => (
      <div className="flex flex-wrap gap-2">
        {(items ?? []).map((t) => (
          <Tag key={t} size="md" tone={tone}>
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
      <Tag size="md" tone="neutral">{value.category}</Tag>
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
      <SearchSelect
        aria-label="Capacity Points"
        fullWidth
        placeholder="Select points"
        searchable={false}
        options={POINTS}
        value={value.capacityPoints === undefined ? '' : String(value.capacityPoints)}
        onChange={(v: string) => set({ capacityPoints: Number(v) })}
        error={errors?.capacityPoints}
      />
    ) : value.capacityPoints !== undefined ? (
      <Badge size="lg" tone="neutral">{String(value.capacityPoints)}</Badge>
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
              <Muted key={field} label="Deployment Date" date={showDate(value.deploymentDate)} />
            ) : null;
          }
          if (field === 'dateInitiated') {
            if (!value.dateInitiated && !value.dateAccepted) return null;
            return (
              <div key={field} className="flex gap-4">
                {value.dateInitiated && <Muted label="Date Initiated" date={showDate(value.dateInitiated)} />}
                {value.dateAccepted && (
                  <>
                    <span aria-hidden="true" className="w-px self-stretch bg-stroke-subtle" />
                    <Muted label="Date Accepted" date={showDate(value.dateAccepted)} />
                  </>
                )}
              </div>
            );
          }
          if (editing && (field === 'initiators' || field === 'assignees')) {
            const isInitiator = field === 'initiators';
            return (
              <PeopleField
                key={field}
                kind={isInitiator ? 'initiator' : 'assignee'}
                label={LABEL[field] ?? field}
                people={(isInitiator ? value.initiators : value.assignees) ?? []}
                directory={options?.people ?? []}
                roles={options?.roles ?? ['QA', 'Design', 'Assignee']}
                onChange={(list) => (isInitiator ? set({ initiators: list }) : set({ assignees: list }))}
                aside={isInitiator && hasViewers ? <Viewers count={viewerCount} onPress={onViewers} /> : undefined}
              />
            );
          }
          const node = body[field];
          if (node === null || node === undefined) return null;
          return (
            <Item
              key={field}
              label={LABEL[field] ?? field}
              aside={field === 'initiators' && hasViewers ? <Viewers count={viewerCount} onPress={onViewers} /> : undefined}
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
  addDisabled,
  addRef,
  aside,
  children,
}: {
  label: string;
  onAdd?: () => void;
  /** The + button, for a field that puts focus back on it. */
  addRef?: React.Ref<HTMLButtonElement>;
  /** The + is dimmed and does nothing while a form is open. */
  addDisabled?: boolean;
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
            ref={addRef}
            type="button"
            aria-label={`Add ${label.toLowerCase()}`}
            onClick={onAdd}
            disabled={addDisabled}
            className={cn(
              'disabled:pointer-events-none disabled:bg-action-primary-surface-disabled',
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
  /* dd/mm/yyyy, or the person's locale when the product sets one — the same as every date in the system. */
  const dates = useDateFormat();
  return (
    <div className="w-full">
      <Popover
        open={open}
        onOpenChange={setOpen}
        align="left"
        className="w-full"
        /* As InlineDateEdit sets it: the panel is the picker, no wider and with no padding of its own. */
        width="auto"
        panelClassName="p-0"
        trigger={
          <Input
            readOnly
            /* It opens a calendar, so it is a combobox: that role allows the expanded state the popover sets. */
            role="combobox"
            fullWidth
            aria-label={label}
            invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            leadingIcon={<Icon name="calendar-blank" size="sm" />}
            placeholder={dates.placeholder}
            value={value ? dates.format(value) : ''}
            onClick={() => setOpen(true)}
          />
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

/**
 * Initiator or Assignee while editing: the chips, each with a pencil (an assignee) and a ✕ on hover or
 * focus, and the + that opens the form for a new person under them. A chip being edited turns into the
 * form in its place. While a form is open the + is dimmed. There can be several initiators. An initiator has no pencil: it is removed
 * and added again.
 */
function PeopleField({
  kind,
  label,
  people,
  directory,
  roles,
  onChange,
  aside,
}: {
  kind: 'initiator' | 'assignee';
  label: string;
  people: readonly DetailCardPerson[];
  directory: readonly DetailCardPerson[];
  roles: readonly string[];
  onChange: (people: DetailCardPerson[]) => void;
  aside?: React.ReactNode;
}) {
  const [mode, setMode] = React.useState<{ type: 'add' } | { type: 'edit'; index: number } | null>(null);
  /* Focus never falls to the page when the control that had it goes: opening the form disables the + (and replaces a chip), closing it removes the form, and removing a chip removes its buttons. Each step
     says where focus belongs next; the effect below puts it there once that control is on screen. */
  const addButton = React.useRef<HTMLButtonElement>(null);
  const row = React.useRef<HTMLDivElement>(null);
  const focusNext = React.useRef<{ to: 'add' } | { to: 'chip'; index: number } | null>(null);
  const done = () => setMode(null);
  /* The first action on a chip: Edit (an assignee) or Remove (an initiator has no pencil). */
  const chipAction = (person: DetailCardPerson | undefined) =>
    person
      ? (row.current?.querySelector<HTMLElement>(`button[aria-label="Edit ${person.name}"], button[aria-label="Remove ${person.name}"]`) ?? null)
      : null;
  React.useEffect(() => {
    const target = focusNext.current;
    if (!target || mode !== null) return;
    const el = target.to === 'add' ? addButton.current : chipAction(people[target.index]);
    /* Nothing to land on in the row (the last chip went): the + is what is left. */
    const landing = el ?? addButton.current;
    if (!landing || landing.hasAttribute('disabled')) return;
    focusNext.current = null;
    landing.focus();
  }, [mode, people]); // eslint-disable-line react-hooks/exhaustive-deps

  const form = (initial: DetailCardPerson | undefined, submitLabel: string, commit: (p: DetailCardPerson) => void) => (
    <PersonForm
      kind={kind}
      initial={initial}
      directory={directory}
      roles={roles}
      submitLabel={submitLabel}
      onCancel={() => {
        focusNext.current = mode?.type === 'edit' ? { to: 'chip', index: mode.index } : { to: 'add' };
        done();
      }}
      onSubmit={(person) => {
        commit(person);
        focusNext.current = mode?.type === 'edit' ? { to: 'chip', index: mode.index } : { to: 'add' };
        done();
      }}
    />
  );

  return (
    <Item
      label={label}
      onAdd={() => setMode({ type: 'add' })}
      addDisabled={mode !== null}
      addRef={addButton}
      aside={aside}
    >
      {/* One wrapping row. A chip being edited is replaced, in its own place among the others, by the form,
          which takes a whole row (`w-full`) so the chips before it stay above and the ones after it below. */}
      <div ref={row} className="flex w-full flex-wrap gap-2">
        {people.map((p, index) =>
          mode?.type === 'edit' && mode.index === index ? (
            <React.Fragment key={p.name}>
              {form(p, 'Save', (person) =>
                onChange(people.map((existing, i) => (i === index ? person : existing))),
              )}
            </React.Fragment>
          ) : (
            <Chip
              key={p.name}
              size="md"
              tone="brand"
              variant="outline"
              actions="hover"
              avatar={<Avatar name={p.name} src={p.src} tone="brand" size="sm" />}
              label={p.name}
              description={kind === 'assignee' ? (p.description ?? 'Assignee') : undefined}
              count={p.points}
              /* Named for the person, so a row of chips is not a row of identical "Edit" and "Remove". */
              editLabel={`Edit ${p.name}`}
              removeLabel={`Remove ${p.name}`}
              onEdit={kind === 'assignee' ? () => setMode({ type: 'edit', index }) : undefined}
              onRemove={() => {
                /* The next chip's action (the one now at this place), or the + when it was the last. */
                focusNext.current = { to: 'chip', index };
                onChange(people.filter((_, i) => i !== index));
              }}
            />
          ),
        )}
        {mode?.type === 'add' &&
          form(undefined, 'Add', (person) => onChange([...people, person]))}
      </div>
    </Item>
  );
}

/** The form under the chips: a user, for an assignee a role and capacity points, then Cancel and Add / Save. */
function PersonForm({
  kind,
  initial,
  directory,
  roles,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  kind: 'initiator' | 'assignee';
  initial?: DetailCardPerson;
  directory: readonly DetailCardPerson[];
  roles: readonly string[];
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (person: DetailCardPerson) => void;
}) {
  const [name, setName] = React.useState(initial?.name ?? '');
  const [role, setRole] = React.useState(initial?.description ?? (roles.includes('Assignee') ? 'Assignee' : roles[0]) ?? 'Assignee');
  const [points, setPoints] = React.useState(initial?.points !== undefined ? String(initial.points) : '');
  const known = directory.find((p) => p.name === name);
  /* Opening the form disables the + that had focus, so focus goes into the form: the "Select user" field. */
  const formRef = React.useRef<HTMLFormElement>(null);
  React.useEffect(() => {
    formRef.current?.querySelector<HTMLElement>('button[aria-haspopup="listbox"]')?.focus();
  }, []);

  return (
    <form
      ref={formRef}
      className="flex w-full flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name) return;
        onSubmit({
          ...(known ?? { name }),
          name,
          description: kind === 'assignee' ? role : undefined,
          points: kind === 'assignee' && points !== '' ? Number(points) : undefined,
        });
      }}
    >
      <SearchSelect
        aria-label={kind === 'initiator' ? 'Initiator' : 'User'}
        fullWidth
        placeholder="Select user"
        searchPlaceholder="Search by name"
        options={directory.map((p) => ({ value: p.name, label: p.name }))}
        value={name}
        onChange={(v: string) => setName(v)}
      />
      {kind === 'assignee' && (
        <div className="flex gap-2">
          <SearchSelect
            aria-label="Role"
            searchable={false}
            options={[...roles]}
            value={role}
            onChange={(v: string) => setRole(v)}
          />
          <div className="min-w-0 flex-1">
            <SearchSelect
              aria-label="Capacity points"
              fullWidth
              placeholder="Points"
              searchable={false}
              options={POINTS}
              value={points}
              onChange={(v: string) => setPoints(v)}
            />
          </div>
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={!name}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { HolidayTable, holidayDateStatus, type HolidayFilters, type HolidayRow } from './HolidayTable';
import { HolidayModal, type HolidayDraft } from '../holiday-modal';
import { ConfirmDeleteModal } from '../confirm-delete-modal';

const PEOPLE = ['Jordan Lee', 'Priya Nair', 'Sam Okafor'];

const ROWS: HolidayRow[] = [
  { id: '1', name: 'Labour Day', start: '2026-05-01', type: 'public', appliesTo: PEOPLE, allDay: true, recurring: true, addedBy: 'system', source: 'google-calendar' },
  { id: '2', name: 'Some Holiday Name', start: '2026-05-01', type: 'individual', appliesTo: PEOPLE, allDay: true, recurring: false, addedBy: 'system', source: 'google-calendar' },
  { id: '3', name: 'Some Holiday Name', start: '2026-05-01', end: '2026-05-03', type: 'public', appliesTo: PEOPLE, allDay: true, recurring: true, addedBy: { name: 'Priya Nair' }, source: 'manual' },
  { id: '4', name: 'Founders Day', start: '2026-05-01', end: '2026-05-03', type: 'team', appliesTo: PEOPLE, allDay: false, recurring: true, addedBy: 'system', source: 'hubstaff' },
  { id: '5', name: 'Some Holiday Name', duplicateOfHubstaff: true, start: '2026-05-01', type: 'public', appliesTo: PEOPLE, allDay: true, recurring: true, addedBy: { name: 'Sam Okafor' }, source: 'manual' },
];

const USERS = PEOPLE.map((name) => ({ value: name, label: name }));

/** Figma's sprint list for the Period filter. */
const SPRINTS = [
  { label: 'Current Sprint', value: '2026-05-19', rangeEnd: '2026-05-22' },
  { label: 'Sprint 35 (25-29 May)', value: '2026-05-25', rangeEnd: '2026-05-29' },
  { label: 'Sprint 34 (19-22 May)', value: '2026-05-19', rangeEnd: '2026-05-22' },
  { label: 'Sprint 33 (1-15 May)', value: '2026-05-01', rangeEnd: '2026-05-15' },
];

const NO_FILTERS: HolidayFilters = { type: '', period: null, user: 'all' };

const meta = {
  title: 'Patterns/HolidayTable',
  component: HolidayTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The Holiday Registry: filters (type, period, who it applies to), Add Holiday and Import from Hubstaff for an admin, the table, and the pagination. `DataTable` specialised, owning no mapping of its own.',
      },
    },
  },
  args: {
    rows: ROWS,
    filters: NO_FILTERS,
    onFiltersChange: fn(),
    users: USERS,
    periodPresets: SPRINTS,
    admin: true,
    onAdd: fn(),
    onImport: fn(),
    onEdit: fn(),
    onDelete: fn(),
    page: 2,
    pageCount: 25,
    onPageChange: fn(),
    itemCount: 1250,
    pageSize: 50,
    onPageSizeChange: fn(),
  },
} satisfies Meta<typeof HolidayTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's admin view: the filter row with Add Holiday and Import from Hubstaff, then the rows with their Actions. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('button', { name: 'Add Holiday' })).toBeVisible();
    await expect(c.getByRole('button', { name: 'Import from Hubstaff' })).toBeVisible();
    await expect(c.getByRole('columnheader', { name: /Actions/ })).toBeVisible();
    await expect(c.getAllByText('01/05/2026 – 03/05/2026', { exact: false }).length).toBeGreaterThan(0);
    await expect(c.getAllByText('3 days').length).toBeGreaterThan(0);
  },
};

/** A normal user: the same table with no buttons and no Actions. */
export const NormalUser: Story = {
  args: { admin: false },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole('button', { name: 'Add Holiday' })).toBeNull();
    await expect(c.queryByRole('columnheader', { name: /Actions/ })).toBeNull();
  },
};

/** Figma's `Empty Table = Yes`: the headers, "No holidays have been added yet.", and the filters and paging stay. */
export const Empty: Story = {
  args: { rows: [], pageCount: 1, itemCount: 0, page: 1 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('No holidays have been added yet.')).toBeVisible();
  },
};

/** Filters are on and nothing matches: it says so, with a Reset that puts them back. The filters and paging stay. */
export const EmptyWhenFiltered: Story = {
  args: { rows: [], pageCount: 1, itemCount: 0, page: 1, filters: { type: 'team', period: null, user: 'all' }, onResetFilters: fn() },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByText('No holidays match your filters.')).toBeVisible();
    await expect(c.queryByText('No holidays have been added yet.')).toBeNull();
    await userEvent.click(c.getByRole('button', { name: 'Reset' }));
    await expect(args.onResetFilters).toHaveBeenCalled();
  },
};

/** Given what today is, each Date cell wears its status beside the day count: Upcoming (info), Today (success), Past (neutral), as Figma's Date Status badge. */
export const DateStatus: Story = {
  args: {
    today: '2026-05-02',
    rows: [
      ROWS[0],
      ROWS[2],
      { id: '6', name: 'Summer Day', start: '2026-06-01', type: 'team', appliesTo: PEOPLE, allDay: true, recurring: false, addedBy: 'system', source: 'manual' },
    ],
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const color = (el: HTMLElement) => getComputedStyle(el).color;
    const past = c.getByText('Past');
    const today = c.getByText('Today');
    const upcoming = c.getByText('Upcoming');
    /* One day in the past (1 May), a range under way (1-3 May) and one to come (1 June). */
    await expect(new Set([color(past), color(today), color(upcoming)]).size).toBe(3);
    /* The badge sits in the Date cell, after the day count. */
    const cell = within(c.getByText('Labour Day').closest('tr') as HTMLElement);
    await expect(past.closest('td')).toBe(cell.getByText('1 day').closest('td'));
  },
};

/** Without `today` no status is shown. */
export const NoStatusWithoutToday: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByText('Upcoming')).toBeNull();
    await expect(c.queryByText('Past')).toBeNull();
  },
};

/** The status rule (hidden, tested): before it begins, any of its days, or after it ends. */
export const StatusRule: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => <div />,
  play: async () => {
    await expect(holidayDateStatus('2026-05-10', '2026-05-12', '2026-05-09')).toBe('Upcoming');
    await expect(holidayDateStatus('2026-05-10', '2026-05-12', '2026-05-10')).toBe('Today');
    await expect(holidayDateStatus('2026-05-10', '2026-05-12', '2026-05-11')).toBe('Today');
    await expect(holidayDateStatus('2026-05-10', '2026-05-12', '2026-05-12')).toBe('Today');
    await expect(holidayDateStatus('2026-05-10', '2026-05-12', '2026-05-13')).toBe('Past');
  },
};

/** A system-added row can be deleted but not edited, as Figma draws it; a person's has both. Both are 40 (the touch minimum), and the delete is `critical-tonal`: its hover and pressed fills and its glyph change in every state. */
export const RowActions: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole('button', { name: 'Edit Labour Day' })).toBeNull();
    const bin = c.getByRole('button', { name: 'Delete Labour Day' });
    await expect(Math.round(bin.getBoundingClientRect().height)).toBe(40);
    await expect(Math.round(c.getAllByRole('button', { name: 'Edit Some Holiday Name' })[0]!.getBoundingClientRect().width)).toBe(40);
    await expect(bin.className).toContain('hover:bg-accent-critical-tonal-surface-hover');
    await expect(bin.className).toContain('hover:text-accent-critical-tonal-content-hover');
    await userEvent.click(c.getByRole('button', { name: 'Delete Labour Day' }));
    await expect(args.onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
    await userEvent.click(c.getAllByRole('button', { name: 'Edit Some Holiday Name' })[0]);
    await expect(args.onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: '3' }));
  },
};

/** The flagged name: a warning glyph whose tooltip says Hubstaff already has the entry (it opens on focus as well as hover). */
export const DuplicateOfHubstaff: Story = {
  args: { rows: [ROWS[4]] },
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    const flag = within(canvasElement).getByRole('img', { name: 'Duplicate of a Hubstaff entry' });
    flag.focus();
    /* Other cells keep their own (closed) tooltips in the page, so the one wanted is found by what it says. */
    const tip = await screen.findByText('Hubstaff already includes this entry. Remove it from VCP to avoid duplicate coverage.');
    await waitFor(() => expect(tip).toBeVisible());
  },
};

function Live(args: React.ComponentProps<typeof HolidayTable>) {
  const [filters, setFilters] = React.useState<HolidayFilters>(NO_FILTERS);
  const [sort, setSort] = React.useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  return <HolidayTable {...args} filters={filters} onFiltersChange={setFilters} sort={sort} onSortChange={setSort} />;
}

/** The filters are the page's: the Period filter opens the sprints and a year of months, and a choice reads in the field ("May 2026, Sprint 33 (1-15 May)"). */
export const PickingAPeriod: Story = {
  render: (args) => <Live {...args} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('combobox', { name: 'Period' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Sprint 33 (1-15 May)' }));
    await expect(c.getByRole('combobox', { name: 'Period' })).toHaveValue('May 2026, Sprint 33 (1-15 May)');
  },
};

/** The whole page: Add Holiday opens the modal, the new holiday lands in the table; Edit opens it filled. */
export const OnThePage: Story = {
  render: (args) => {
    const [rows, setRows] = React.useState<readonly HolidayRow[]>(args.rows);
    const [editing, setEditing] = React.useState<HolidayRow | null>(null);
    const [adding, setAdding] = React.useState(false);
    const [deleting, setDeleting] = React.useState<HolidayRow | null>(null);
    const root = React.useRef<HTMLDivElement>(null);
    /* The row's Delete goes with the row, so focus goes on: the next row's Delete, else the previous one's, else Add Holiday (the table only asks; this is the page's). */
    const focusAfter = React.useRef<{ name: string | null } | null>(null);
    React.useEffect(() => {
      const pending = focusAfter.current;
      if (!pending || (deleting && rows.some((r) => r.id === deleting.id))) return;
      focusAfter.current = null;
      const timer = setTimeout(() => {
        const next = pending.name ? root.current?.querySelector<HTMLElement>(`button[aria-label="${pending.name}"], button[title="${pending.name}"]`) : null;
        (next ?? root.current?.querySelector<HTMLElement>('button'))?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }, [rows, deleting]);
    const toRow = (draft: HolidayDraft, id: string): HolidayRow => ({
      id,
      name: draft.name,
      start: draft.start,
      end: draft.end,
      type: draft.type,
      appliesTo: PEOPLE,
      allDay: true,
      recurring: draft.recurring,
      addedBy: { name: 'Priya Nair' },
      source: 'manual',
    });
    return (
      <div ref={root}>
        <Live {...args} rows={rows} onAdd={() => setAdding(true)} onEdit={setEditing} onDelete={setDeleting} />
        {/* Until the design's "(Future)" dialog exists, a delete is confirmed with `ConfirmDeleteModal`. */}
        <ConfirmDeleteModal
          open={deleting !== null}
          onClose={() => setDeleting(null)}
          itemLabel="Holiday"
          itemName={deleting?.name ?? ''}
          onConfirm={() => {
            if (!deleting) return;
            const at = rows.findIndex((r) => r.id === deleting.id);
            const neighbour = rows[at + 1] ?? rows[at - 1];
            focusAfter.current = { name: neighbour ? `Delete ${neighbour.name}` : null };
            setRows((now) => now.filter((r) => r.id !== deleting.id));
            setDeleting(null);
          }}
        />
        <HolidayModal
          open={adding}
          onClose={() => setAdding(false)}
          onSubmit={(draft) => {
            setRows((now) => [toRow(draft, `new-${now.length}`), ...now]);
            setAdding(false);
          }}
        />
        <HolidayModal
          open={editing !== null}
          onClose={() => setEditing(null)}
          holiday={editing ? { name: editing.name, recurring: editing.recurring, start: editing.start, end: editing.end ?? editing.start, type: editing.type } : undefined}
          onSubmit={(draft) => {
            setRows((now) => now.map((r) => (r.id === editing?.id ? toRow(draft, r.id) : r)));
            setEditing(null);
          }}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Add Holiday' }));
    const d = within(await screen.findByRole('dialog', { name: 'Add Holiday' }));
    await userEvent.type(d.getByRole('textbox', { name: 'Holiday Name' }), 'Company Day');
    await userEvent.click(d.getByRole('combobox', { name: 'Date' }));
    const first = within(await within(document.body).findByRole('group', { name: 'First calendar' }));
    await userEvent.click(first.getByRole('button', { name: /^10 / }));
    await userEvent.click(within(document.body).getByRole('button', { name: 'Apply' }));
    await userEvent.click(d.getByRole('combobox', { name: 'Holiday Type' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Team Holiday' }));
    await userEvent.click(d.getByRole('button', { name: 'Add' }));
    await waitFor(() => expect(c.getByText('Company Day')).toBeVisible());

    /* Delete asks first: Cancel keeps the holiday, Delete removes it, and focus does not fall to the page. */
    await userEvent.click(c.getByRole('button', { name: 'Delete Labour Day' }));
    const confirm = await screen.findByRole('alertdialog');
    await userEvent.click(within(confirm).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await expect(c.getByText('Labour Day')).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Delete Labour Day' }));
    await userEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(c.queryByText('Labour Day')).toBeNull());
    await waitFor(() => expect(document.body).not.toHaveFocus());
    await expect(c.getAllByRole('button').includes(document.activeElement as HTMLElement)).toBe(true);
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

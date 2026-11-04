import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { HolidayTable, type HolidayFilters, type HolidayRow } from './HolidayTable';
import { HolidayModal, type HolidayDraft } from '../holiday-modal';

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

/** A system-added row can be deleted but not edited, as Figma draws it; a person's has both. */
export const RowActions: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole('button', { name: 'Edit Labour Day' })).toBeNull();
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
      <>
        <Live {...args} rows={rows} onAdd={() => setAdding(true)} onEdit={setEditing} onDelete={(row) => setRows((now) => now.filter((r) => r.id !== row.id))} />
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
      </>
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
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

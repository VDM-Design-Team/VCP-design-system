import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { TaskLogTrail, type TaskLogRow } from './TaskLogTrail';
import { Select } from '../../atoms/select';
import { FilterBar } from '../filter-bar';

const TASK = '[VCP] Automated Planning Workspace for VCP Planning List - DESIGN';
const LONG_TASK =
  '[VCP] Automated Planning Workspace for VCP Planning List - DESIGN, including the long tail of follow-ups that nobody will read in full on a log row, the capacity reviews, the cycle hand-offs and every other thing that was ever attached to it';

const ROWS: TaskLogRow[] = [
  { id: 1, ref: 'VCP-1234', task: TASK, change: { from: { status: 'In Progress' }, to: { custom: 'Design Review' }, field: 'Status' }, source: 'VCP', changedAt: '2026-06-10T14:37:00', changedBy: 'User’s Name' },
  { id: 2, ref: 'VCP-1235', task: 'Rework the notification bell so unread state survives a reload', change: { from: { event: 'Initial Creation' }, to: { status: 'Draft' }, field: 'Status' }, source: 'VCP', changedAt: '2026-06-09T11:02:00', changedBy: 'Eve Chen' },
  { id: 3, ref: 'VCP-1236', task: TASK, change: { from: { event: 'Handoff' }, to: { custom: 'Design Review' }, field: 'Workflow' }, source: 'VCP', changedAt: '2026-06-08T16:15:00', changedBy: 'Ali Rahman' },
  { id: 4, ref: 'VCP-1237', task: LONG_TASK, change: { from: { status: 'Pending' }, to: { status: 'Accepted' }, field: 'Status' }, source: 'VCP', changedAt: '2026-06-07T09:48:00', changedBy: 'Dana Lu' },
  { id: 5, ref: 'VCP-1238', task: TASK, change: { from: { status: 'Accepted' }, to: { status: 'In Progress' }, field: 'Workflow' }, source: 'VCP', changedAt: '2026-06-06T13:20:00', changedBy: 'User’s Name' },
  { id: 6, ref: 'VCP-1239', task: 'Add the capacity bar to the cycle summary', change: { from: { person: 'Dana Lu' }, to: { person: 'Eve Chen' }, field: 'Assignee' }, source: 'VCP', changedAt: '2026-06-05T10:05:00', changedBy: 'Ali Rahman' },
  { id: 7, ref: 'VCP-1240', task: 'Add the capacity bar to the cycle summary', change: { from: { date: '2026-06-12' }, to: { date: '2026-06-19' }, field: 'Due Date' }, source: 'VCP', changedAt: '2026-06-04T15:30:00', changedBy: 'Eve Chen' },
];

const PRESETS = [
  { label: 'Last 3 days', value: '2026-06-08', rangeEnd: '2026-06-10' },
  { label: 'First week', value: '2026-06-04', rangeEnd: '2026-06-07' },
];

const meta = {
  title: 'Patterns/TaskLogTrail',
  component: TaskLogTrail,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The log of changes made to Added Values: ID, Task, Change (old → new, and which field: Status, Workflow, Assignee, Start Date or Due Date), Source, ' +
          'Changed At and Changed By, with the pages beneath. Controlled: it filters nothing and pages nothing itself. The task is shown in full, and the new ' +
          'value is the coloured one; the old value is a quiet grey tag.',
      },
    },
  },
  args: { rows: ROWS, page: 2, pageCount: 25, itemCount: 1250, pageSize: 50, onPageChange: fn() },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TaskLogTrail>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's table: the change reads "In Progress → Design Review (Status)", with the Initial Creation and Handoff tags, and the Workflow, Assignee and Due Date fields too. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('table', { name: 'Task log trail' })).toBeVisible();
    await expect(c.getByText('Initial Creation')).toBeVisible();
    await expect(c.getByText('Handoff')).toBeVisible();
    await expect(c.getAllByText('(Status)').length).toBe(3);
    await expect(c.getAllByText('(Workflow)').length).toBe(2);
    await expect(c.getByText('(Assignee)')).toBeVisible();
    await expect(c.getByText('(Due Date)')).toBeVisible();
    await expect(c.getAllByText('VCP').length).toBe(7);
    /* The arrow is named, so the change reads "In Progress, changed to, Design Review". */
    await expect(c.getAllByRole('img', { name: 'changed to' }).length).toBe(7);
    /* A person is a name; a date is ISO in, dd/mm/yyyy out. */
    await expect(within(c.getByText('VCP-1239').closest('tr') as HTMLElement).getAllByText('Dana Lu')).toHaveLength(1);
    await expect(c.getByText('12/06/2026')).toBeVisible();
    await expect(c.getByText('19/06/2026')).toBeVisible();
    /* ISO in, "dd/mm/yyyy HH:mm" out (24-hour), in a <time> that keeps the ISO. */
    const changed = c.getByText('10/06/2026 14:37');
    await expect(changed.tagName).toBe('TIME');
    await expect(changed).toHaveAttribute('datetime', '2026-06-10T14:37:00');
    await expect(c.getByText('08/06/2026 16:15')).toBeVisible();
    await expect(c.queryByText(/PM|AM/)).toBeNull();
  },
};

/** The task is shown **in full**: at least 40 characters wide, it wraps and nothing cuts it, so there is no hover title to be out of a keyboard's reach. */
export const LongTask: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const long = c.getByText(LONG_TASK);
    const style = getComputedStyle(long);
    await expect(style.webkitLineClamp).not.toBe('3');
    await expect(long.getAttribute('title')).toBeNull();
    await expect(long.getBoundingClientRect().width).toBeGreaterThanOrEqual(320);
    /* Whole: it is taller than three lines, and not clipped. */
    const line = parseFloat(style.lineHeight);
    await expect(long.getBoundingClientRect().height).toBeGreaterThan(line * 3);
    await expect(long.scrollHeight).toBeLessThanOrEqual(Math.ceil(long.clientHeight) + 1);
  },
};

/** The new value is the coloured one; the old value, and "Initial Creation" and "Handoff", are quiet grey tags — as `StatusHistory` draws them. */
export const OldGreyNewColoured: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const color = (el: HTMLElement) => getComputedStyle(el).color;
    const row = (ref: string) => c.getByText(ref).closest('tr') as HTMLElement;
    /* In Progress → Design Review (Status): the old "In Progress" is grey, the new step is the blue custom tone. */
    const first = within(row('VCP-1234'));
    await expect(color(first.getByText('In Progress'))).not.toBe(color(first.getByText('Design Review')));
    /* The same status reads grey as an old value and in its own colour as a new one. */
    const fifth = within(row('VCP-1238'));
    const fourth = within(row('VCP-1237'));
    await expect(color(fifth.getByText('Accepted'))).not.toBe(color(fourth.getByText('Accepted')));
    /* Events are grey, and the same grey as an old status. */
    await expect(color(within(row('VCP-1236')).getByText('Handoff'))).toBe(color(first.getByText('In Progress')));
    await expect(color(within(row('VCP-1235')).getByText('Initial Creation'))).toBe(color(first.getByText('In Progress')));
  },
};

/**
 * The whole page: a `FilterBar` inside the table's card, above it (as `AccountsTable` carries its search) — search, the period, and a select for which field changed. One **Reset** clears them all
 * (Figma draws a dates-only "Clear dates"). There is no Source filter: every change is from VCP.
 */
export const WithFilters: Story = {
  render: (args) => {
    const [search, setSearch] = React.useState('');
    const [field, setField] = React.useState('');
    const [period, setPeriod] = React.useState<{ start?: string; end?: string }>({});
    const q = search.trim().toLowerCase();
    const rows = (args.rows as TaskLogRow[]).filter((r) => {
      const day = r.changedAt.slice(0, 10);
      return (
        (!q || `${r.task} ${r.ref}`.toLowerCase().includes(q)) &&
        (!field || r.change.field === field) &&
        (!period.start || day >= period.start) &&
        (!period.end || day <= period.end)
      );
    });
    const reset = () => {
      setSearch('');
      setField('');
      setPeriod({});
    };
    return (
      <TaskLogTrail
        {...args}
        rows={rows}
        itemCount={rows.length}
        pageCount={1}
        page={1}
        filtered={Boolean(q || field || period.start || period.end)}
        filters={
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            period={{ value: period, onChange: setPeriod, presets: PRESETS }}
            onReset={reset}
          >
            <Select
              aria-label="Changed"
              emphasis="regular"
              className="w-48"
              options={[{ value: '', label: 'All Changes' }, 'Status', 'Workflow', 'Assignee', 'Start Date', 'Due Date']}
              value={field}
              onChange={setField}
            />
          </FilterBar>
        }
      />
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByRole('row')).toHaveLength(1 + 7);
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Changed' }), 'Workflow');
    await expect(c.getAllByRole('row')).toHaveLength(1 + 2);
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Changed' }), 'Assignee');
    await expect(c.getAllByRole('row')).toHaveLength(1 + 1);
    /* The period: a preset fills it and narrows the log to those days. */
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Changed' }), '');
    await userEvent.click(c.getByRole('button', { name: 'Period' }));
    await userEvent.click(within(document.body).getByRole('button', { name: 'First week' }));
    await waitFor(() => expect(c.getAllByRole('row')).toHaveLength(1 + 4));
    await expect(c.getByRole('button', { name: /^Period, / })).toBeVisible();
    /* Reset puts everything back. */
    await userEvent.click(c.getByRole('button', { name: 'Reset' }));
    await expect(c.getAllByRole('row')).toHaveLength(1 + 7);
    await userEvent.type(c.getByRole('searchbox', { name: 'Search by title or ID' }), 'zzz');
    await expect(await c.findByText('No changes match these filters.')).toBeVisible();
  },
};

/** No changes at all. */
export const Empty: Story = {
  args: { rows: [], itemCount: 0, pageCount: 1, page: 1 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('No changes yet.')).toBeVisible();
  },
};

/** Filters are on and nothing matches: it says so, and how to get back. */
export const EmptyWhenFiltered: Story = {
  args: { rows: [], itemCount: 0, pageCount: 1, page: 1, filtered: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('No changes match these filters.')).toBeVisible();
    await expect(c.getByText('Try widening the dates, or reset the filters.')).toBeVisible();
  },
};

/** While the log loads: the headers stay, each cell is a placeholder, and one status says so. */
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('status')).toHaveTextContent('Loading the task log trail');
    await expect(c.queryByText('VCP-1234')).toBeNull();
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

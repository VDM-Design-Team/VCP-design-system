import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { TaskLogTrail, type TaskLogRow } from './TaskLogTrail';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { Input } from '../../atoms/input';
import { Select } from '../../atoms/select';
import { DateField } from '../../components/date-field';

const TASK = '[VCP] Automated Planning Workspace for VCP Planning List - DESIGN';
const LONG_TASK =
  '[VCP] Automated Planning Workspace for VCP Planning List - DESIGN, including the long tail of follow-ups that nobody will read in full on a log row, the capacity reviews, the cycle hand-offs and every other thing that was ever attached to it';

const ROWS: TaskLogRow[] = [
  { id: 1, ref: 'VCP-1234', task: TASK, change: { from: { status: 'In Progress' }, to: { custom: 'Design Review' }, field: 'Status' }, source: 'VCP', changedAt: 'Jun 10, 2026 2:37 PM', changedBy: 'User’s Name' },
  { id: 2, ref: 'VCP-1235', task: 'Rework the notification bell so unread state survives a reload', change: { from: { event: 'Initial Creation' }, to: { status: 'Draft' }, field: 'Status' }, source: 'VCP', changedAt: 'Jun 9, 2026 11:02 AM', changedBy: 'Eve Chen' },
  { id: 3, ref: 'VCP-1236', task: TASK, change: { from: { event: 'Handoff' }, to: { custom: 'Design Review' }, field: 'Workflow' }, source: 'VCP', changedAt: 'Jun 8, 2026 4:15 PM', changedBy: 'Ali Rahman' },
  { id: 4, ref: 'VCP-1237', task: LONG_TASK, change: { from: { status: 'Pending' }, to: { status: 'Accepted' }, field: 'Status' }, source: 'VCP', changedAt: 'Jun 7, 2026 9:48 AM', changedBy: 'Dana Lu' },
  { id: 5, ref: 'VCP-1238', task: TASK, change: { from: { status: 'Accepted' }, to: { status: 'In Progress' }, field: 'Workflow' }, source: 'VCP', changedAt: 'Jun 6, 2026 1:20 PM', changedBy: 'User’s Name' },
];

const meta = {
  title: 'Patterns/TaskLogTrail',
  component: TaskLogTrail,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The log of changes made to Added Values: ID, Task, Change (old → new, and whether it was the Status or the Workflow), Source, Changed At and ' +
          'Changed By, with the pages beneath. Controlled: it filters nothing and pages nothing itself. The task is at least 40 characters wide and wraps ' +
          'to three lines before it is cut.',
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

/** Figma's table: the change reads "In Progress → Design Review (Status)", with the Initial Creation and Handoff tags and the Workflow field too. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('table', { name: 'Task log trail' })).toBeVisible();
    await expect(c.getByText('Initial Creation')).toBeVisible();
    await expect(c.getByText('Handoff')).toBeVisible();
    await expect(c.getAllByText('(Status)').length).toBe(3);
    await expect(c.getAllByText('(Workflow)').length).toBe(2);
    await expect(c.getAllByText('VCP').length).toBe(5);
    /* The arrow is named, so the change reads "In Progress, changed to, Design Review". */
    await expect(c.getAllByRole('img', { name: 'changed to' }).length).toBe(5);
  },
};

/** The task is at least 40 characters wide, and wraps to three lines at most; a longer one is cut with an ellipsis (its whole text is the hover title). */
export const LongTask: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const long = c.getByTitle(LONG_TASK);
    const style = getComputedStyle(long);
    await expect(style.webkitLineClamp).toBe('3');
    await expect(long.getBoundingClientRect().width).toBeGreaterThanOrEqual(320);
    const line = parseFloat(style.lineHeight);
    await expect(long.getBoundingClientRect().height).toBeLessThanOrEqual(line * 3 + 1);
  },
};

/**
 * The whole page: the filters inside the table's card, above it (as `AccountsTable` carries its search) — pieced together from the system's own fields, with no filters pattern of its own. One **Reset**
 * clears all of them, as every filter row in the system does (Figma draws a dates-only "Clear dates").
 */
export const WithFilters: Story = {
  render: (args) => {
    const [search, setSearch] = React.useState('');
    const [status, setStatus] = React.useState('');
    const [source, setSource] = React.useState('');
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    const q = search.trim().toLowerCase();
    const rows = (args.rows as TaskLogRow[]).filter(
      (r) =>
        (!q || `${r.task} ${r.ref}`.toLowerCase().includes(q)) &&
        (!status || r.change.field === status) &&
        (!source || r.source === source),
    );
    const reset = () => {
      setSearch('');
      setStatus('');
      setSource('');
      setStartDate('');
      setEndDate('');
    };
    return (
      <TaskLogTrail
        {...args}
        rows={rows}
        itemCount={rows.length}
        pageCount={1}
        page={1}
        filtered={Boolean(q || status || source || startDate || endDate)}
        filters={
          /* One row of the system's own fields, inside the table's card: search, the selects, the dates, Reset. */
          <div className="flex flex-wrap items-center gap-3">
            <Input
              type="search"
              aria-label="Search by title or ID"
              placeholder="Search by title or ID"
              leadingIcon={<Icon name="magnifying-glass" size="sm" />}
              className="min-w-64 flex-1"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select
              aria-label="Changed"
              emphasis="regular"
              className="w-48"
              options={[{ value: '', label: 'All Changes' }, 'Status', 'Workflow']}
              value={status}
              onChange={setStatus}
            />
            <Select
              aria-label="Source"
              emphasis="regular"
              className="w-48"
              options={[{ value: '', label: 'All Sources' }, 'VCP']}
              value={source}
              onChange={setSource}
            />
            <DateField aria-label="Start date" emphasis="regular" placeholder="Start Date" className="w-40" value={startDate} onChange={setStartDate} />
            <DateField
              aria-label="End date"
              emphasis="regular"
              placeholder="End Date"
              className="w-40"
              value={endDate}
              onChange={setEndDate}
              picker={{ min: startDate || undefined }}
            />
            <Button type="button" variant="tertiary" size="sm" onClick={reset}>
              Reset
            </Button>
          </div>
        }
      />
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByRole('row')).toHaveLength(1 + 5);
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Changed' }), 'Workflow');
    await expect(c.getAllByRole('row')).toHaveLength(1 + 2);
    /* The date fields open their calendar (an empty field used to crash it). */
    await userEvent.click(c.getByRole('combobox', { name: 'Start date' }));
    await expect(await within(document.body).findByRole('button', { name: /^15\b/ })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    /* Reset puts everything back. */
    await userEvent.click(c.getByRole('button', { name: 'Reset' }));
    await expect(c.getAllByRole('row')).toHaveLength(1 + 5);
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

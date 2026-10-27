import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { GanttChart, type GanttBar, type GanttCycle, type GanttRow, type GanttView } from './GanttChart';

const TODAY = '2026-07-25';

/* Cycle 37 starts on 21 July 2026 and every cycle is a fortnight, so the
   earlier and later ones can be counted out from there. */
const DAY = 86_400_000;
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const C37 = Date.UTC(2026, 6, 21);
const CYCLES: GanttCycle[] = Array.from({ length: 27 }, (_, i) => {
  const n = 23 + i;
  const start = C37 + (n - 37) * 14 * DAY;
  return { id: `c${n}`, label: `Cycle ${n}`, short: `C${n}`, start: iso(start), end: iso(start + 13 * DAY) };
});

const bar = (b: GanttBar): GanttBar => b;

const ROWS: GanttRow[] = [
  {
    id: 'john',
    name: 'John Mason Smith',
    stats: [
      { label: 'WIP', value: 1, tone: 'warning' },
      { label: 'Planned', value: 1, tone: 'brand' },
      { label: 'EAD', value: '03.02' },
      { label: 'EAD TD', value: '7 Days' },
    ],
    bars: [
      bar({
        id: 'a1',
        title: '(Part 18/24) Brand Name',
        status: 'in-progress',
        start: '2026-07-21',
        end: '2026-07-27',
        points: 2,
        project: 'Project Alpha',
        details: [
          { label: 'Status', value: 'AB Testing' },
          { label: 'Initiator', value: 'User 1' },
          { label: 'Est. Due Date', value: '27/07/2026' },
        ],
      }),
      bar({ id: 'a2', title: '(Part 19/24) Brand Name', status: 'completed', start: '2026-07-21', end: '2026-07-25', points: 2 }),
      bar({ id: 'a3', title: 'Checkout redesign', status: 'planned', start: '2026-07-28', end: '2026-08-12', points: 5 }),
    ],
  },
  {
    id: 'priya',
    name: 'Priya Raman',
    stats: [
      { label: 'WIP', value: 0, tone: 'warning' },
      { label: 'Planned', value: 2, tone: 'brand' },
      { label: 'EAD', value: '04.11' },
      { label: 'EAD TD', value: '9 Days' },
    ],
    bars: [
      bar({ id: 'b1', title: 'Onboarding emails', status: 'planned', start: '2026-07-24', end: '2026-08-03', points: 3 }),
      bar({ id: 'b2', title: 'Invoice export', status: 'overdue', start: '2026-07-14', end: '2026-07-22', points: 2 }),
      bar({ id: 'b3', title: 'Supplier scorecard', status: 'pre-delivered', start: '2026-07-22', end: '2026-07-30', points: 1 }),
    ],
  },
  {
    id: 'brand',
    name: 'Brand Refresh',
    kind: 'project',
    bars: [
      bar({ id: 'c1', title: 'Logo lockups', status: 'completed', start: '2026-07-06', end: '2026-07-16', points: 4 }),
      bar({ id: 'c2', title: 'Colour audit', status: 'in-progress', start: '2026-07-20', end: '2026-07-31', points: 6 }),
      bar({ id: 'c3', title: 'Launch checklist', status: 'planned', start: '2026-08-04', end: '2026-08-14', points: 3 }),
    ],
  },
  {
    id: 'marvin',
    name: 'Marvin Ode',
    bars: [bar({ id: 'd1', title: 'Warehouse feed', status: 'planned', start: '2026-07-27', end: '2026-08-28', points: 12 })],
  },
];

const USERS = ['John Mason Smith', 'Priya Raman', 'Marvin Ode'];
const PROJECTS = ['Project Alpha', 'Brand Refresh', 'Warehouse'];

function Demo({ initialView = 'cycle', rows = ROWS }: { initialView?: GanttView; rows?: GanttRow[] }) {
  const [view, setView] = React.useState<GanttView>(initialView);
  const [date, setDate] = React.useState(TODAY);
  const [users, setUsers] = React.useState<string[]>([]);
  const [projects, setProjects] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState<string>('');
  const visible = users.length ? rows.filter((r) => users.includes(r.name) || r.kind === 'project') : rows;
  return (
    <div className="flex flex-col gap-3">
      <GanttChart
        infoText="Bars run from an Added Value's start to its due date."
        view={view}
        onViewChange={setView}
        date={date}
        onDateChange={setDate}
        cycles={CYCLES}
        today={TODAY}
        rows={visible}
        defaultExpandedIds={['john']}
        projectOptions={PROJECTS.map((p) => ({ value: p, label: p }))}
        projectIds={projects}
        onProjectIdsChange={setProjects}
        userOptions={USERS.map((u) => ({ value: u, label: u }))}
        userIds={users}
        onUserIdsChange={setUsers}
        onResetFilters={() => {
          setUsers([]);
          setProjects([]);
        }}
        onBarSelect={(b) => setSelected(b.title)}
      />
      <output className="text-caption-md-regular text-text-tertiary">{selected && `Opened: ${selected}`}</output>
    </div>
  );
}

const noop = () => {};
/* Controlled props the chart needs; every story renders the wrapper instead. */
const required: React.ComponentProps<typeof GanttChart> = {
  view: 'cycle',
  onViewChange: noop,
  date: TODAY,
  onDateChange: noop,
  cycles: CYCLES,
  rows: [],
};

const meta = {
  title: 'Patterns/GanttChart',
  component: GanttChart,
  args: required,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'People or projects down the side, time across the top, each Added Value a bar from its start ' +
          'to its due date. Cycle, month and year views of the same data; a Today column; a legend; ' +
          'a tooltip on every bar. The caller owns the data and the filters — `rows`, `view`, `date` and ' +
          'the filter values are all controlled props.',
      },
    },
  },
} satisfies Meta<typeof GanttChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One cycle by the day. John Mason Smith is open: the stats panel and one bar per Added Value. */
export const Cycle: Story = {
  render: () => <Demo initialView="cycle" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Cycle 37')).toBeVisible();
    await expect(canvas.getByText('TODAY')).toBeVisible();
    /* An open row draws each bar; a closed one draws a summary. */
    await expect(canvas.getByRole('button', { name: /Brand Name, Work In Progress/ })).toBeVisible();
    await expect(canvas.getByText('3 Added Values')).toBeVisible();
  },
};

/** A month by the day, with each day's cycle named above it. */
export const Month: Story = {
  render: () => <Demo initialView="month" />,
};

/** A year by the cycle, with the months spanning them. Bars one column wide keep only their points. */
export const Year: Story = {
  render: () => <Demo initialView="year" />,
};

export const Empty: Story = {
  render: () => <Demo initialView="cycle" rows={[]} />,
};

/**
 * **Flow:** the arrows move the period, a closed row opens to show its bars,
 * the view menu switches the columns, and a bar answers hover with its card.
 */
export const Flow: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => <Demo initialView="cycle" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Next period' }));
    await expect(canvas.getByText('Cycle 38')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Previous period' }));
    await expect(canvas.getByText('Cycle 37')).toBeVisible();

    const priya = canvas.getByRole('button', { name: /Priya Raman/ });
    await expect(priya).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(priya);
    await expect(priya).toHaveAttribute('aria-expanded', 'true');
    const bar = canvas.getByRole('button', { name: /Onboarding emails, Planned/ });

    await userEvent.hover(bar);
    const card = () => document.getElementById(bar.getAttribute('aria-describedby')!.split(' ').pop()!)!;
    await waitFor(() => expect(card().parentElement).toHaveClass('opacity-100'), { timeout: 2000 });
    /* The card fades in, so wait for it to be seen, not just classed open. */
    await waitFor(() => expect(within(card()).getByText('Onboarding emails')).toBeVisible());

    await userEvent.selectOptions(canvas.getByLabelText('View'), 'year');
    await expect(canvas.getByText('C37')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: /Next period/ }));
    await expect(canvas.getByText('2027')).toBeVisible();
  },
};

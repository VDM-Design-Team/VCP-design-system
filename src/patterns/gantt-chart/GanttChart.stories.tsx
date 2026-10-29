import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  GanttChart,
  type GanttCycle,
  type GanttProject,
  type GanttStatus,
  type GanttTask,
  type GanttUser,
  type GanttView,
} from './GanttChart';

/* ---- Fixtures: the payload a backend would send --------------------------
   A fortnightly cycle count that puts today (Thursday 29 October 2026) in
   Cycle 44, which runs 27 October to 9 November — so the cycle view crosses a
   month boundary, and the year view has a full year of cycles behind and ahead.
   Every task, and every user's availability figures, is derived from one seeded
   generator, so the numbers on screen agree with each other. */

const TODAY = '2026-10-29';
const DAY = 86_400_000;
const day = (iso: string) => Math.round(Date.parse(`${iso}T00:00:00Z`) / DAY);
const iso = (d: number) => new Date(d * DAY).toISOString().slice(0, 10);

/* Cycle 37 began on 21 July 2026; every cycle is a fortnight. */
const CYCLES: GanttCycle[] = Array.from({ length: 32 }, (_, i) => {
  const n = 21 + i;
  const start = day('2026-07-21') + (n - 37) * 14;
  return { id: `c${n}`, label: `Cycle ${n}`, short: `C${n}`, start: iso(start), end: iso(start + 13) };
});

const PROJECTS: GanttProject[] = [
  { id: 'vcp', name: 'VCP' },
  { id: 'offerpump', name: 'OfferPump' },
  { id: 'whu', name: 'WHU' },
  { id: 'nt', name: 'NT' },
];

const PEOPLE = [
  'John Mason Smith',
  'Alice Carter',
  'Jack Morgan',
  'Lena Novak',
  'Adam Reyes',
  'Noah Foster',
  'Maya Bennett',
  'Marvin Ode',
];

const TITLES: Record<string, string[]> = {
  vcp: ['Collapsible sidebar for improved tables', 'Planning list filters', 'Holiday registry export', 'Task log trail'],
  offerpump: ['Offer template editor', 'Supplier scorecard', 'Bulk offer upload', 'Price break rules'],
  whu: ['Warehouse feed sync', 'Pallet label printing', 'Dock scheduling', 'Returns intake form'],
  nt: ['Invoice export', 'Credit note matching', 'Payment run report', 'Ledger reconciliation'],
};

const WORKFLOW: Record<GanttStatus, string[]> = {
  planned: ['Accepted', 'Backlog'],
  'in-progress': ['In Progress', 'Design Review', 'AB Testing'],
  'pre-delivered': ['Ready for Deploy'],
  completed: ['Completed'],
  overdue: ['In Progress', 'For Review'],
};

function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function build() {
  const rand = seeded(2026);
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)];
  const today = day(TODAY);
  const tasks: GanttTask[] = [];
  PEOPLE.forEach((name, u) => {
    const userId = `u${u + 1}`;
    let cursor = day('2026-01-05') + Math.floor(rand() * 6);
    let n = 0;
    while (cursor < day('2026-12-31')) {
      const length = 4 + Math.floor(rand() * 8);
      const start = cursor;
      const end = start + length - 1;
      const project = pick(PROJECTS);
      const status: GanttStatus =
        end < today
          ? rand() < 0.88
            ? 'completed'
            : 'overdue'
          : start > today
            ? 'planned'
            : rand() < 0.2
              ? 'pre-delivered'
              : 'in-progress';
      tasks.push({
        id: `t-${userId}-${n++}`,
        title: `${rand() < 0.3 ? `(Part ${1 + Math.floor(rand() * 5)}/6) ` : ''}${pick(TITLES[project.id])}`,
        userId,
        projectId: project.id,
        status,
        statusLabel: pick(WORKFLOW[status]),
        initiator: pick(PEOPLE.filter((p) => p !== name)),
        points: 1 + Math.floor(rand() * 8),
        start: iso(start),
        end: iso(end),
      });
      /* Now and then a second task runs alongside, so rows have more than one line. */
      if (rand() < 0.25) {
        const s2 = start + 2;
        const e2 = s2 + 3 + Math.floor(rand() * 5);
        const p2 = pick(PROJECTS);
        const st2: GanttStatus = e2 < today ? 'completed' : s2 > today ? 'planned' : 'in-progress';
        tasks.push({
          id: `t-${userId}-${n++}`,
          title: pick(TITLES[p2.id]),
          userId,
          projectId: p2.id,
          status: st2,
          statusLabel: pick(WORKFLOW[st2]),
          initiator: pick(PEOPLE.filter((p) => p !== name)),
          points: 1 + Math.floor(rand() * 5),
          start: iso(s2),
          end: iso(e2),
        });
      }
      cursor = end + 1 + Math.floor(rand() * 4);
    }
  });

  /* Availability, from the same tasks: what is open now, and when the person is next free. */
  const users: GanttUser[] = PEOPLE.map((name, u) => {
    const id = `u${u + 1}`;
    const mine = tasks.filter((t) => t.userId === id);
    const open = mine.filter((t) => t.status !== 'completed');
    const free = Math.max(today, ...open.map((t) => day(t.end) + 1));
    return {
      id,
      name,
      wip: mine.filter((t) => t.status === 'in-progress').length,
      planned: mine.filter((t) => t.status === 'planned').length,
      ead: iso(free),
      eadTd: free - today,
    };
  });
  return { tasks, users };
}

const { tasks: TASKS, users: USERS } = build();

function Demo({
  initialView = 'cycle',
  initialDate = TODAY,
  initialProjects = [],
  initialUsers = [],
  tasks = TASKS,
}: {
  initialView?: GanttView;
  initialDate?: string;
  initialProjects?: string[];
  initialUsers?: string[];
  tasks?: GanttTask[];
}) {
  const [view, setView] = React.useState<GanttView>(initialView);
  const [date, setDate] = React.useState(initialDate);
  const [projectIds, setProjectIds] = React.useState<string[]>(initialProjects);
  const [userIds, setUserIds] = React.useState<string[]>(initialUsers);
  const [opened, setOpened] = React.useState('');
  return (
    <div className="flex flex-col gap-3">
      <GanttChart
        infoText="Each bar is an Added Value, from start to due date. Open a row to see its bars."
        view={view}
        onViewChange={setView}
        date={date}
        onDateChange={setDate}
        cycles={CYCLES}
        today={TODAY}
        tasks={tasks}
        users={USERS}
        projects={PROJECTS}
        projectIds={projectIds}
        onProjectIdsChange={setProjectIds}
        userIds={userIds}
        onUserIdsChange={setUserIds}
        defaultExpandedIds={['u1']}
        onTaskSelect={(t) => setOpened(t.title)}
      />
      <output className="text-caption-md-regular text-text-tertiary">{opened && `Opened: ${opened}`}</output>
    </div>
  );
}

const noop = () => {};
/* Required props; every story renders the wrapper above instead. */
const required: React.ComponentProps<typeof GanttChart> = {
  view: 'cycle',
  onViewChange: noop,
  date: TODAY,
  onDateChange: noop,
  cycles: CYCLES,
  tasks: [],
  users: [],
  projects: [],
  projectIds: [],
  onProjectIdsChange: noop,
  userIds: [],
  onUserIdsChange: noop,
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
          'Each Added Value as a bar from its start to its due date, against people down the side and ' +
          'time across the top. Cycle, month and year views of the same data; a Today column; a legend; ' +
          'a tooltip on every bar. Give it flat `tasks`, `users`, `projects` and `cycles`, as a backend ' +
          'would send them: with no project filter it lists people, with one it groups by project and ' +
          'then person. The view, the period and the filters are controlled props.',
      },
    },
  },
} satisfies Meta<typeof GanttChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Cycle 44, 27 October to 9 November. John Mason Smith is open: his figures, and one line per concurrent task. */
export const Cycle: Story = {
  render: () => <Demo initialView="cycle" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Cycle 44')).toBeVisible();
    await expect(canvas.getByText('October – November')).toBeVisible();
    await expect(canvas.getByText('TODAY')).toBeVisible();
    /* Every person has their availability figures when open. */
    await waitFor(() => expect(canvas.getAllByText('EAD TD')[0]).toBeVisible());
  },
};

/** October 2026, by the day, with each day's cycle named above it. */
export const Month: Story = {
  render: () => <Demo initialView="month" />,
};

/** 2026 by the cycle, with the months spanning them. Tasks inside one cycle keep only their points. */
export const Year: Story = {
  render: () => <Demo initialView="year" />,
};

/** Two projects selected: the chart groups by project, then person, and each person shows only that project's tasks. */
export const ByProject: Story = {
  render: () => <Demo initialView="cycle" initialProjects={['offerpump', 'whu']} />,
};

/** Two people selected, across all projects. */
export const ByUser: Story = {
  render: () => <Demo initialView="cycle" initialUsers={['u1', 'u4']} />,
};

/** The data is on its way: the header, Today column and legend stay, the rows are placeholders. */
export const Loading: Story = {
  render: () => (
    <GanttChart
      {...required}
      loading
      today={TODAY}
      users={USERS}
      projects={PROJECTS}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chart = canvas.getByRole('region', { name: 'Gantt Chart' });
    await expect(chart).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.getByRole('status')).toHaveTextContent('Loading Gantt Chart');
    await expect(canvas.getByText('Cycle 44')).toBeVisible();
    /* No rows, no empty message, and the filters are off. */
    await expect(canvas.queryByText('Nothing matches these filters.')).toBeNull();
    await expect(canvas.getByRole('button', { name: 'Reset Filters' })).toBeDisabled();
  },
};

/** A period with nothing in it. */
export const Empty: Story = {
  render: () => <Demo initialView="cycle" tasks={[]} initialUsers={['u9']} />,
};

/**
 * **Flow:** the arrows move the period, a closed row opens to show its bars and
 * figures, filtering by project regroups the chart, the view menu switches the
 * columns, and a bar answers hover with its card.
 */
export const Flow: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => <Demo initialView="cycle" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    /* A change of period starts again from the left edge, however far along the user had scrolled. */
    const scroller = canvas.getByRole('region', { name: /scrolls sideways/ });
    scroller.scrollLeft = 300;
    await userEvent.click(canvas.getByRole('button', { name: 'Next period' }));
    await expect(canvas.getByText('Cycle 45')).toBeVisible();
    await waitFor(() => expect(scroller.scrollLeft).toBe(0));
    await userEvent.click(canvas.getByRole('button', { name: 'Previous period' }));
    await expect(canvas.getByText('Cycle 44')).toBeVisible();

    /* Today brings the chart back from another period; the period label opens a picker to jump anywhere. */
    await userEvent.click(canvas.getByRole('button', { name: 'Next period' }));
    await expect(canvas.getByText('Cycle 45')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Today' }));
    await expect(canvas.getByText('Cycle 44')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: /Cycle 44/ }));
    await expect(await canvas.findByRole('dialog', { name: 'Jump to' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('dialog', { name: 'Jump to' })).toBeNull());

    const alice = canvas.getByRole('button', { name: /Alice Carter/ });
    await expect(alice).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(alice);
    await expect(alice).toHaveAttribute('aria-expanded', 'true');

    /* Open row → real bars, each a button named with its facts; hover shows the card. */
    let bar: HTMLElement | undefined;
    /* The bars fade into reach as the row opens. */
    await waitFor(() => {
      bar = within(canvasElement.querySelector('section')!)
        .getAllByRole('button', { name: /points,/ })
        .find((b) => alice.closest('div.flex')?.contains(b));
      expect(bar).toBeDefined();
    });
    await userEvent.hover(bar!);
    const card = () => document.getElementById(bar!.getAttribute('aria-describedby')!.split(' ').pop()!)!;
    await waitFor(() => expect(card().parentElement).toHaveClass('opacity-100'), { timeout: 2000 });
    await waitFor(() => expect(within(card()).getByText('Est. Due Date:')).toBeVisible());

    /* Filtering by project turns the people into groups under project headers. */
    const projects = canvas.getByRole('button', { name: /Projects/ });
    await userEvent.click(projects);
    await userEvent.click(canvas.getByRole('option', { name: 'OfferPump' }));
    await userEvent.click(canvas.getByRole('option', { name: 'WHU' }));
    await expect(canvas.getAllByText(/AVs? \|/)).toHaveLength(2);
    await expect(canvas.getByRole('button', { name: /OfferPump/, expanded: true })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Reset Filters' }));
    await waitFor(() => expect(canvas.queryByRole('button', { name: /OfferPump/, expanded: true })).toBeNull());

    await userEvent.selectOptions(canvas.getByLabelText('View'), 'year');
    await expect(canvas.getByText('C44')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Next period' }));
    await expect(canvas.getByText('2027')).toBeVisible();
  },
};

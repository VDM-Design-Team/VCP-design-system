import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { PlanningPage, type PlanningPageProps } from './PlanningPage';
import { Button } from '../../atoms/button';
import type { PlanningRow, PlanningSection } from '../planning-table';
import type { PlanningFiltersValue } from '../planning-filters';

const TITLES = ['Automated Planning Workspace', 'Billing export', 'Calendar sync', 'Dashboard filters', 'Email digests'];
const row = (n: number, extra: Partial<PlanningRow> = {}): PlanningRow => ({
  id: `vcp-${n}`,
  ref: `VCP-${1230 + n}`,
  title: `[VCP] ${TITLES[(n - 1) % TITLES.length]} for VCP Planning List - DESIGN`,
  domain: 'VCP',
  urgency: 'Normal',
  type: 'Type 3',
  initiator: { name: 'Marvin Reed' },
  assignee: { name: 'John Doe', availability: 'available' },
  start: { value: '2026-03-04' },
  points: 1,
  due: { value: '2026-03-16' },
  status: { custom: 'For QA' },
  ...extra,
});

const SECTIONS: PlanningSection[] = [
  {
    id: 'cycle-27',
    kind: 'cycle',
    title: 'Cycle 27',
    dates: '(02/03/2026 - 16/03/2026)',
    totalCapacity: 237,
    remainingCapacity: 130,
    rows: [row(1), row(2), row(3, { due: { value: '2026-03-16', estimated: true } })],
  },
  { id: 'backlog', kind: 'backlog', title: 'Backlog', rows: [row(4, { status: { status: 'Backlog' } }), row(5, { status: { status: 'Backlog' } })] },
];

const STATUSES = ['Backlog', 'Accepted', 'In Progress', 'For QA', 'Completed'];
const NONE: PlanningFiltersValue = { search: '', status: '', priority: '' };

const meta = {
  title: 'Patterns/PlanningPage',
  component: PlanningPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The main content of the Planning page: the title, the filter row on the canvas, the Cycle and Backlog sections (each its own card) and the pages beneath. ' +
          'The table keeps editing in place, drag and move, and folding; the page owns the data and lays them out. It goes inside `AppShell`.',
      },
    },
  },
  args: { table: { sections: SECTIONS } },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-surface-canvas">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlanningPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/* A page as the app writes it: it owns the filters, narrows the rows by them, and edits a cell in place. */
function Page({ withFilters = true, withPagination = true, ...props }: Partial<PlanningPageProps> & { withFilters?: boolean; withPagination?: boolean }) {
  const [filters, setFilters] = React.useState(NONE);
  const [sections, setSections] = React.useState(SECTIONS);
  const [page, setPage] = React.useState(1);
  const q = filters.search.trim().toLowerCase();
  const shown = sections.map((s) => ({
    ...s,
    rows: s.rows.filter((r) => (!q || `${r.ref} ${r.title}`.toLowerCase().includes(q)) && (!filters.priority || r.urgency === filters.priority)),
  }));
  const patch = (id: string, change: Partial<PlanningRow>) =>
    setSections((now) => now.map((s) => ({ ...s, rows: s.rows.map((r) => (r.id === id ? { ...r, ...change } : r)) })));
  return (
    <PlanningPage
      filters={
        withFilters
          ? { value: filters, onChange: setFilters, statusOptions: STATUSES, onReset: () => setFilters(NONE), onViewCycle: fn() }
          : undefined
      }
      table={{
        sections: shown,
        defaultCollapsed: ['backlog'],
        onPointsChange: (r, points) => patch(r.id, { points }),
        onStartChange: (r, iso) => patch(r.id, { start: { value: iso } }),
        onDueChange: (r, iso) => patch(r.id, { due: { value: iso } }),
        empty: <p className="px-4 py-6 text-body-sm-medium text-text-secondary">No added values match.</p>,
      }}
      pagination={withPagination ? { page, pageCount: 25, onChange: setPage, itemCount: 1250, pageSize: 50, pageSizeOptions: [25, 50, 100], onPageSizeChange: fn() } : undefined}
      {...props}
    />
  );
}

/** The whole page: filters on the canvas, the sections as cards, the pages under them on the right. */
export const Default: Story = {
  render: () => <Page />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { level: 1, name: 'Planning List' })).toBeVisible();
    await expect(c.getByRole('search', { name: 'Filter the planning list' })).toBeVisible();
    await expect(c.getByRole('button', { name: /View Cycle/ })).toBeVisible();
    await expect(c.getByText('Cycle 27')).toBeVisible();
    await expect(c.getByRole('navigation', { name: /pagination/i })).toBeVisible();
  },
};

/** The page narrows the rows by the filters it owns; Reset puts them back. */
export const Filtering: Story = {
  render: () => <Page />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByText(/Billing export/).length).toBeGreaterThan(0);
    await userEvent.type(c.getByRole('searchbox', { name: 'Search by title or ID' }), 'Calendar');
    await expect(c.queryByText(/Billing export/)).toBeNull();
    await expect(c.getAllByText(/Calendar sync/).length).toBeGreaterThan(0);
    await userEvent.click(c.getByRole('button', { name: 'Reset' }));
    await expect(c.getAllByText(/Billing export/).length).toBeGreaterThan(0);
  },
};

/** Typed sections: leave out the filters and the pagination and the page is the title and the sections. */
export const SectionsOnly: Story = {
  render: () => <Page withFilters={false} withPagination={false} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole('search')).toBeNull();
    await expect(c.queryByRole('navigation', { name: /pagination/i })).toBeNull();
    await expect(c.getByText('Cycle 27')).toBeVisible();
  },
};

/*
 * The page's part of the animated cells (`PlanningTable`'s one-shot signal): when moving a Backlog row onto a Cycle calculates its dates, the page marks them `estimated` and `animated`, and clears
 * `animated` when the table reports the date seen. The table plays the three loops and never replays one (not on filtering, paging or a refresh).
 */
function MovingPage() {
  const [sections, setSections] = React.useState<PlanningSection[]>([
    SECTIONS[0]!,
    { id: 'backlog', kind: 'backlog', title: 'Backlog', rows: [row(6, { status: { status: 'Backlog' }, start: undefined, due: undefined, points: 3 })] },
  ]);
  const clear = (r: PlanningRow, field: 'start' | 'due') =>
    setSections((now) => now.map((sec) => ({ ...sec, rows: sec.rows.map((x) => (x.id === r.id && x[field] ? { ...x, [field]: { ...x[field]!, animated: false } } : x)) })));
  return (
    <PlanningPage
      table={{
        sections,
        onAnimationDismiss: clear,
        onMoveRow: (moved, from, to) =>
          setSections((now) =>
            now.map((sec) => {
              if (sec.id === from.id) return { ...sec, rows: sec.rows.filter((x) => x.id !== moved.id) };
              if (sec.id !== to.id) return sec;
              /* The calculation that moves it into the Cycle: estimated dates, flagged to play once. */
              const calculated = { ...moved, start: { value: '2026-03-04', estimated: true, animated: true }, due: { value: '2026-03-16', estimated: true, animated: true } };
              return { ...sec, rows: [...sec.rows, calculated] };
            }),
          ),
      }}
    />
  );
}

/**
 * Try it: **drag the Backlog row (VCP-1236) onto Cycle 27**. Its dates are calculated, so they play the cell animation (the sweep and the text colour, three loops, stopping if you hover them) and then never again.
 * The page flags the dates and clears the flag when the table says they were seen. **Start over** puts the row back.
 */
export const BacklogRowMovedToACycle: Story = {
  render: function Render() {
    const [run, setRun] = React.useState(0);
    return (
      <div>
        <div className="px-8 pt-4">
          <Button variant="secondary" onClick={() => setRun((n) => n + 1)}>
            Start over
          </Button>
        </div>
        <MovingPage key={run} />
      </div>
    );
  },
};

/** The behaviour, tested (hidden): a drop onto a Cycle plays the animation, and touching a cell ends it. */
export const BacklogRowMovedToACycleBehaviour: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => <MovingPage />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const playing = () => document.getAnimations().filter((a) => (a.effect as KeyframeEffect | null)?.getTiming().duration === 2500);
    await expect(playing()).toHaveLength(0);
    /* Dragged from the Backlog onto the Cycle, as the design draws it. */
    const data = new DataTransfer();
    await fireEvent.dragStart(c.getByText('VCP-1236').closest('tr')!, { dataTransfer: data });
    await fireEvent.dragOver(c.getByRole('region', { name: /Cycle 27/ }), { dataTransfer: data });
    await fireEvent.drop(c.getByRole('region', { name: /Cycle 27/ }), { dataTransfer: data });
    const cycle = c.getByRole('region', { name: /Cycle 27/ });
    await waitFor(() => expect(within(cycle).getByText('VCP-1236')).toBeInTheDocument());
    await waitFor(() => expect(playing().length).toBeGreaterThan(0));
    /* Touching the cell ends it, and the page clears the flag. */
    const before = playing().length;
    await userEvent.hover(Array.from(canvasElement.querySelectorAll('td.isolate'))[0]!);
    await waitFor(() => expect(playing().length).toBeLessThan(before));
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { render: () => <Page />, globals: { theme: 'dark' } };

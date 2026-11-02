import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../../atoms/button';
import { PlanningTable, type PlanningRow, type PlanningSection } from './PlanningTable';

const TITLES = ['Automated Planning Workspace', 'Billing export', 'Calendar sync', 'Dashboard filters', 'Email digests'];
const titleFor = (n: number) => `[VCP] ${TITLES[(n - 1) % TITLES.length]} for VCP Planning List - DESIGN`;

const row = (n: number, extra: Partial<PlanningRow> = {}): PlanningRow => ({
  id: `vcp-${n}`,
  ref: `VCP-${1230 + n}`,
  title: titleFor(n),
  domain: 'VCP',
  urgency: 'Normal',
  type: 'Type 3',
  initiator: { name: 'Marvin Reed' },
  assignee: { name: 'John Doe', availability: 'available' },
  start: { value: '2026-03-04' },
  points: 1,
  due: { value: '2026-03-04' },
  status: { custom: 'For QA' },
  ...extra,
});

const SECTIONS: PlanningSection[] = [
  {
    id: 'cycle-27',
    kind: 'cycle',
    title: 'Cycle 27',
    dates: '(Mar 02, 2026 - Mar 16, 2026)',
    totalCapacity: 237,
    remainingCapacity: 130,
    rows: [
      row(1),
      row(2, { assignee: { name: 'John Doe', availability: 'busy' }, status: { status: 'Review' } }),
      row(3, { assignee: { name: 'John Doe', availability: 'unavailable' }, due: { value: '2026-03-16', estimated: true } }),
    ],
  },
  { id: 'backlog', kind: 'backlog', title: 'Backlog', rows: [row(4), row(5)] },
];

const meta = {
  title: 'Patterns/PlanningTable',
  component: PlanningTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The Planning list: Added Values in collapsible Cycle and Backlog sections, ten columns, ' +
          'with Start Date, Points and Due Date editable in place and the assignee’s availability on ' +
          'their avatar. `DataTable` specialised, as `AVTable` is; it owns no vocabulary.',
      },
    },
  },
  args: { sections: SECTIONS },
  /* Every story edits in place, as the product does: a cell is editable once its handler exists. */
  render: (args) => <Editable {...args} />,
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlanningTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Cycle open, Backlog folded — the Planning page as it opens. */
export const Default: Story = { args: { defaultCollapsed: ['backlog'] } };

export const BothOpen: Story = {};

export const BothFolded: Story = { args: { defaultCollapsed: ['cycle-27', 'backlog'] } };

/** Each section is its own card with its own table; one with no rows says so. */
export const EmptySection: Story = {
  args: {
    sections: [SECTIONS[0]!, { id: 'backlog', title: 'Backlog', rows: [] }],
    empty: 'Nothing in the backlog.',
  },
};

export const WithPagination: Story = {
  args: {
    defaultCollapsed: ['backlog'],
    page: 2,
    pageCount: 25,
    onPageChange: () => {},
    itemCount: 1250,
    pageSize: 50,
    pageSizeOptions: [25, 50, 100],
    onPageSizeChange: () => {},
  },
};

/**
 * Every header glyph has the design's tooltip by default: Start Date, Points and Due Date the formula
 * copy under a ƒ in a ring; Urgency and Type Figma's own; Status a placeholder (Figma has none). Pass a
 * string to change a column's copy, or `''` to drop its glyph.
 */
export const WithHints: Story = {
  args: { defaultCollapsed: ['backlog'], hints: { status: '' } },
};

export const DarkTheme: Story = { args: { defaultCollapsed: ['backlog'] }, globals: { theme: 'dark' } };

function Editable(args: React.ComponentProps<typeof PlanningTable>) {
  const [sections, setSections] = React.useState(args.sections);
  const patch = (id: string, change: Partial<PlanningRow>) =>
    setSections((now) =>
      now.map((s) => ({ ...s, rows: s.rows.map((r) => (r.id === id ? { ...r, ...change } : r)) })),
    );
  return (
    <PlanningTable
      {...args}
      sections={sections}
      onStartChange={(r, iso) => patch(r.id, { start: { value: iso } })}
      onDueChange={(r, iso) => patch(r.id, { due: { value: iso } })}
      onPointsChange={(r, points) => patch(r.id, { points })}
      onMoveRow={args.onMoveRow}
    />
  );
}

/** Fold a section from its caret, pick a row's points from the dropdown. */
export const FoldingAndEditing: Story = {
  args: { defaultCollapsed: ['backlog'] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cycle = canvas.getByRole('button', { name: /Cycle 27/ });
    const backlog = canvas.getByRole('button', { name: /Backlog/ });
    await expect(cycle).toHaveAttribute('aria-expanded', 'true');
    await expect(backlog).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(backlog);
    await expect(backlog).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(backlog);
    await expect(backlog).toHaveAttribute('aria-expanded', 'false');

    /* Points: the pen, a new number, confirm. */
    const firstRow = canvas.getAllByRole('row')[1]!;
    await userEvent.hover(firstRow);
    await userEvent.click(within(firstRow).getByRole('button', { name: 'Edit points' }));
    const field = within(firstRow).getByRole('combobox', { name: /Points for/ });
    await userEvent.selectOptions(field, '5');
    await userEvent.click(within(firstRow).getByRole('button', { name: 'Save' }));
    await expect(within(firstRow).getByText('5')).toBeInTheDocument();
  },
};

/** More than one Cycle can be on the page at once: each is a drop target, and a Backlog row can go to any of them. */
export const MultipleCycles: Story = {
  args: {
    defaultCollapsed: ['cycle-28'],
    sections: [
      SECTIONS[0]!,
      {
        id: 'cycle-28',
        kind: 'cycle',
        title: 'Cycle 28',
        dates: '(Mar 16, 2026 - Mar 30, 2026)',
        totalCapacity: 240,
        remainingCapacity: 212,
        rows: [row(6)],
      },
      SECTIONS[1]!,
    ],
    onMoveRow: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const source = canvas.getByText('VCP-1234').closest('tr')!;
    const next = canvas.getByRole('region', { name: /Cycle 28/ });
    const first = canvas.getByRole('region', { name: /Cycle 27/ });
    const data = new DataTransfer();
    await fireEvent.dragStart(source, { dataTransfer: data });
    await fireEvent.dragOver(next, { dataTransfer: data });
    /* Only the Cycle it is over lights up. */
    await expect(next).toHaveClass('outline-2');
    await expect(first).not.toHaveClass('outline-2');
    await fireEvent.drop(next, { dataTransfer: data });
    const [row, from, to] = (args.onMoveRow as ReturnType<typeof fn>).mock.calls[0]!;
    await expect([row.ref, from.id, to.id]).toEqual(['VCP-1234', 'backlog', 'cycle-28']);
  },
};

/** A Backlog row has nothing planned yet: no dates, no points — each reads as a hyphen. */
export const EmptyDates: Story = {
  args: {
    sections: [
      {
        id: 'backlog',
        kind: 'backlog',
        title: 'Backlog',
        rows: [
          row(4, { start: undefined, due: undefined, points: undefined, status: { status: 'Backlog' } }),
          row(5, { start: undefined, due: undefined, status: { status: 'Backlog' } }),
        ],
      },
    ],
  },
};

/**
 * The animation is a signal for *this session's* auto-calculation, never a reminder. Here VCP-1233 already
 * carries `animated` when the page loads (an old flag left in someone's state) and does **not** play; press the
 * button — the page calculating dates — and VCP-1234's start and due dates do: a sweep and a blue → white flash,
 * three times, stopping early when the pointer enters. Each date reports itself seen (`onAnimationDismiss`) and
 * the page clears its flag; it never plays again.
 */
export const AnimatedDates: Story = {
  args: { onAnimationDismiss: fn() },
  render: function AnimatedDatesStory(args) {
    const flagged = (extra: Partial<PlanningRow>): PlanningRow => ({
      ...row(3),
      status: { status: 'Accepted' },
      ...extra,
    });
    const [rows, setRows] = React.useState<PlanningRow[]>([
      row(1),
      flagged({
        start: { value: '2026-03-04', estimated: true, animated: true },
        due: { value: '2026-03-16', estimated: true, animated: true },
      }),
      flagged({ id: 'vcp-9', ref: 'VCP-1239', start: { value: '2026-03-02' }, due: { value: '2026-03-09' } }),
    ]);
    const clear = (r: PlanningRow, field: 'start' | 'due') => {
      setRows((now) =>
        now.map((x) => (x.id === r.id && x[field] ? { ...x, [field]: { ...x[field]!, animated: false } } : x)),
      );
      args.onAnimationDismiss?.(r, field);
    };
    return (
      <div className="flex flex-col gap-4">
        <Button
          variant="secondary"
          onClick={() =>
            setRows((now) =>
              now.map((x) =>
                x.id === 'vcp-9'
                  ? {
                      ...x,
                      start: { value: '2026-03-06', estimated: true, animated: true },
                      due: { value: '2026-03-19', estimated: true, animated: true },
                    }
                  : x,
              ),
            )
          }
        >
          Auto-calculate VCP-1239’s dates
        </Button>
        <PlanningTable
          {...args}
          sections={[{ ...SECTIONS[0]!, rows }]}
          onStartChange={() => {}}
          onDueChange={() => {}}
          onAnimationDismiss={clear}
        />
      </div>
    );
  }
};

/** The behaviour, tested (hidden): an old flag does not play on load, a new one does, the first touch dismisses, and editing works. */
export const AnimatedDatesBehaviour: Story = {
  ...AnimatedDates,
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const playing = () =>
      document.getAnimations().filter((a) => (a.effect as KeyframeEffect | null)?.getTiming().duration === 1600);
    /* Loaded with an old flag: nothing plays. */
    await expect(playing()).toHaveLength(0);

    await userEvent.click(canvas.getByRole('button', { name: /Auto-calculate/ }));
    await waitFor(() => expect(playing().length).toBeGreaterThan(0));
    await expect((playing()[0]!.effect as KeyframeEffect).getTiming().iterations).toBe(3);

    /* Entering a cell dismisses it, and only it. */
    const [sweepCell] = Array.from(canvasElement.querySelectorAll('td.isolate'));
    await userEvent.hover(sweepCell!);
    await waitFor(() => expect(args.onAnimationDismiss).toHaveBeenCalledTimes(1));
    await expect(args.onAnimationDismiss).toHaveBeenCalledWith(expect.objectContaining({ ref: 'VCP-1239' }), 'start');

    /* The cell stays editable while it plays: reaching for its button opens the picker and dismisses it. */
    const edit = canvas.getByRole('button', { name: 'Change due date for VCP-1239' });
    await userEvent.click(edit);
    await expect(edit).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(args.onAnimationDismiss).toHaveBeenCalledTimes(2));
    await expect(args.onAnimationDismiss).toHaveBeenLastCalledWith(expect.objectContaining({ ref: 'VCP-1239' }), 'due');
  },
};

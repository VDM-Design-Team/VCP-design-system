import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { PlanningTable, type PlanningRow, type PlanningSection } from './PlanningTable';

const TITLE = '[VCP] Automated Planning Workspace for VCP Planning List - DESIGN';

const row = (n: number, extra: Partial<PlanningRow> = {}): PlanningRow => ({
  id: `vcp-${n}`,
  ref: `VCP-${1230 + n}`,
  title: TITLE,
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
  { id: 'backlog', title: 'Backlog', rows: [row(4), row(5)] },
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
  args: { defaultCollapsed: ['backlog'], page: 2, pageCount: 25, onPageChange: () => {} },
};

/** The info glyphs only draw where there is copy; there is no default copy. */
export const WithHints: Story = {
  args: {
    defaultCollapsed: ['backlog'],
    hints: {
      urgency: 'How soon this needs doing.',
      type: 'How heavy the change is.',
      start: 'When work is planned to start.',
      points: 'The capacity this takes.',
      due: 'When it is due.',
      status: 'Where the Added Value is now.',
    },
  },
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
    />
  );
}

/** Fold a section from its caret, change a row's points in place. */
export const FoldingAndEditing: Story = {
  args: { defaultCollapsed: ['backlog'] },
  render: (args) => <Editable {...args} />,
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
    const field = within(firstRow).getByRole('spinbutton', { name: /Points for/ });
    await userEvent.clear(field);
    await userEvent.type(field, '5');
    await userEvent.click(within(firstRow).getByRole('button', { name: 'Save' }));
    await expect(within(firstRow).getByText('5')).toBeInTheDocument();
  },
};

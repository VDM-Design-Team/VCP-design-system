import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { UserCapacity } from './UserCapacity';

const half = (name: string, id = name) => ({
  id,
  name,
  segments: [
    { series: 'completed', value: 15 },
    { series: 'committed', value: 15 },
  ] as const,
});

const meta = {
  title: 'Patterns/UserCapacity',
  component: UserCapacity,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'How each person’s capacity for a cycle is spent: one row per person (name, a stacked bar, their total) and one legend for all of them. Pass the members; the totals and the legend follow. With room, a row is one line; in a narrow card the name takes a line of its own.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    hint: 'How each person’s capacity for this cycle is spent.',
    members: [half('John'), half('Jiriko Jan Lapa'), half('Francis Magallen'), half('Winston Fale'), half('Earl')],
  },
} satisfies Meta<typeof UserCapacity>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Five people, one row each; every total is its own bar's sum. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('region', { name: 'User Capacity' })).toBeInTheDocument();
    const rows = within(c.getAllByRole('list')[0]!).getAllByRole('listitem');
    await expect(rows).toHaveLength(5);
    await expect(within(rows[1]!).getByText('Jiriko Jan Lapa')).toBeVisible();
    await expect(within(rows[1]!).getByText('30 pts')).toBeVisible();
    await expect(within(rows[1]!).getByRole('img')).toHaveAttribute('aria-label', 'Completed 15, Committed 15, total 30 pts');
  },
};

/** "Leave" is in the legend only when somebody has some, and the legend is the series across every row. */
export const WithLeaveAndOverdue: Story = {
  args: {
    members: [
      half('John'),
      { id: 'earl', name: 'Earl', segments: [{ series: 'completed', value: 10 }, { series: 'overdue', value: 5 }, { series: 'leave', value: 15 }] },
    ],
  },
  play: async ({ canvasElement }) => {
    const legend = within(within(canvasElement).getByRole('list', { name: 'Legend' }));
    await expect(legend.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Completed', 'Committed', 'Overdue', 'Leave']);
  },
};

/** `scale="shared"`: each bar is its share of the largest total, so a part-timer's row is visibly shorter. The default fills every row. */
export const SharedScale: Story = {
  args: {
    scale: 'shared',
    members: [
      { id: 'a', name: 'Full time', segments: [{ series: 'completed', value: 20 }, { series: 'available', value: 20 }] },
      { id: 'b', name: 'Part time', segments: [{ series: 'completed', value: 10 }, { series: 'available', value: 10 }] },
    ],
  },
  play: async ({ canvasElement }) => {
    const [full, part] = within(canvasElement).getAllByRole('img').map((el) => el.getBoundingClientRect().width);
    await expect(part! / full!).toBeGreaterThan(0.45);
    await expect(part! / full!).toBeLessThan(0.55);
  },
};

/** A name that does not fit is cut, and says the whole of it on hover and focus. */
export const LongName: Story = {
  args: { members: [half('Bartholomew Montgomery-Featherstonehaugh'), half('Earl')] },
  decorators: [
    (Story) => (
      <div className="w-176">
        <Story />
      </div>
    ),
  ],
};

/** It reflows with the card: at 320 the name takes a line of its own over the bar and its total, and nothing overflows. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('section') as HTMLElement;
    await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
  },
};

/** With nobody in it, the card says so rather than drawing an empty frame. */
export const Empty: Story = {
  args: { members: [], hint: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('No one has capacity in this cycle.')).toBeVisible();
  },
};

/** While the data loads: placeholders for five rows, and one status says so. */
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('status')).toHaveTextContent('Loading User Capacity');
    await expect(c.getByRole('region', { name: 'User Capacity' })).toHaveAttribute('aria-busy', 'true');
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

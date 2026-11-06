import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { TeamCapacity } from './TeamCapacity';

const meta = {
  title: 'Patterns/TeamCapacity',
  component: TeamCapacity,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'How a team’s capacity for a cycle is spent, as one stacked bar: title, a line saying what is left, the bar with its total, and a legend. Pass the segments; the total and the legend follow from them. It fills its card, so it is as responsive as its parent.',
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
    hint: 'How much of the team’s capacity for this cycle is completed, committed, overdue and still available.',
    remaining: 60,
    segments: [
      { series: 'completed', value: 60 },
      { series: 'committed', value: 30 },
      { series: 'overdue', value: 30 },
      { series: 'available', value: 60 },
    ],
  },
} satisfies Meta<typeof TeamCapacity>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The total is the sum of the segments, the legend is the series the data has, and the hint is a real, focusable button. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('region', { name: 'Team Capacity' })).toBeInTheDocument();
    await expect(c.getByText('180 pts')).toBeVisible();
    await expect(c.getByText('60 points of capacity remaining this cycle.')).toBeVisible();
    const legend = within(c.getByRole('list', { name: 'Legend' }));
    await expect(legend.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Completed', 'Committed', 'Overdue', 'Available']);
    await userEvent.tab();
    await expect(c.getByRole('button', { name: 'About Team Capacity' })).toHaveFocus();
  },
};

/** The data changes: the total, the bar and the legend all follow, with nothing else to keep in step. */
export const OnlyWhatThereIs: Story = {
  args: { remaining: undefined, hint: undefined, segments: [{ series: 'completed', value: 12 }, { series: 'available', value: 28 }] },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('40 pts')).toBeVisible();
    await expect(within(c.getByRole('list', { name: 'Legend' })).getAllByRole('listitem')).toHaveLength(2);
    await expect(c.queryByRole('button')).toBeNull();
  },
};

/** No data yet: an empty track, a total of 0 and no legend. */
export const Empty: Story = {
  args: { segments: [], remaining: 0, hint: undefined },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('0 pts')).toBeVisible();
    await expect(c.queryByRole('list', { name: 'Legend' })).toBeNull();
  },
};

/** While the data loads: placeholders, and one status says so. */
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('status')).toHaveTextContent('Loading Team Capacity');
    await expect(c.getByRole('region', { name: 'Team Capacity' })).toHaveAttribute('aria-busy', 'true');
  },
};

/** It reflows with the card, not the screen: here in 320, the legend wraps and the title truncates before it pushes the total out. */
export const Narrow: Story = {
  args: { title: 'Team Capacity for the whole of the Engineering and Design organisation' },
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

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

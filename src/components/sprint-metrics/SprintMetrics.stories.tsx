import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { SprintMetrics } from './SprintMetrics';

const SPRINTS = [
  { key: 1, label: 'Jan 18 - Feb 1', values: { available: 120, committed: 96, completed: 88, overdue: 8 } },
  { key: 2, label: 'Feb 1 - Feb 15', values: { available: 120, committed: 110, completed: 104, overdue: 6 } },
  { key: 3, label: 'Feb 15 - Mar 1', values: { available: 120, committed: 92, completed: 60, overdue: 32 } },
  { key: 4, label: 'Mar 1 - Mar 15', values: { available: 120, committed: 100 } },
];

const meta = {
  title: 'Components/Display/SprintMetrics',
  component: SprintMetrics,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'How each sprint’s capacity was used, as grouped bars (Capacity, Commitment, Completed, Overdue), with the numbers over the bars and the legend on top. Pass the data; the axis, bars and legend follow.',
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
  args: { data: SPRINTS, description: 'Current: Mar 1 - Mar 15' },
} satisfies Meta<typeof SprintMetrics>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Capacity and Commitment are the system's Available and Committed series, so the blues match every other chart. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('region', { name: 'Sprint Metrics' })).toBeInTheDocument();
    await expect(c.getByText('Current: Mar 1 - Mar 15')).toBeVisible();
    await expect(within(c.getByRole('list', { name: 'Legend' })).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Capacity', 'Commitment', 'Completed', 'Overdue']);
    await expect(within(c.getByRole('table', { name: 'Sprint Metrics' })).getByRole('row', { name: /Feb 15 - Mar 1/ })).toHaveTextContent('32 pts');
  },
};

/** The current sprint has capacity and a commitment but nothing done yet: a series with no value is not drawn. */
export const OnlyCapacity: Story = {
  args: { data: SPRINTS.map((s) => ({ ...s, values: { available: 120 } })) },
};

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('Loading Sprint Metrics');
  },
};

export const Empty: Story = {
  args: { data: [], empty: 'No sprints yet.' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('No sprints yet.')).toBeVisible();
  },
};

/** Narrow: the bars narrow, give up numbers that will not fit, and the sprint labels thin out. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-96">
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

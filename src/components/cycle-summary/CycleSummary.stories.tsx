import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CycleSummary, completionBand } from './CycleSummary';

const meta = {
  title: 'Components/Display/CycleSummary',
  component: CycleSummary,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'How a cycle went: points committed, completed and carried over, and a half-ring gauge of the completion rate ' +
          'in its band colour. It reflows with the card’s own width — four across, two by two, stacked.',
      },
    },
  },
  args: { committed: 180, completed: 142, carriedOver: 38, completion: 90 },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CycleSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 90% and above is green — 100% too. */
export const Default: Story = {};
export const Complete: Story = { args: { completion: 100 } };
/** 70–89% is amber. */
export const Medium: Story = { args: { completion: 70 } };
/** Under 70% is red. */
export const Low: Story = { args: { completion: 60 } };
/** No rate yet: an empty ring over "-%". */
export const Empty: Story = {
  args: { committed: 0, completed: 0, carriedOver: 0, completion: null },
  play: async ({ canvasElement }) => {
    /* Named "Completion"; with no rate it says so, rather than announcing a 0. */
    const gauge = within(canvasElement).getByRole('progressbar', { name: 'Completion' });
    await expect(gauge).toHaveAttribute('aria-valuetext', 'No rate yet');
  },
};

/** All five, as Figma's `_Cycle_Summary_Half_Donut_Chart` frame draws them. */
export const AllBands: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {/* Each card has its own name: two sections called the same read as one landmark twice. */}
      {[100, 90, 70, 60, null].map((completion) => (
        <CycleSummary
          key={String(completion)}
          {...args}
          title={`Cycle Summary, ${completion === null ? 'no rate' : `${completion}%`}`}
          completion={completion}
        />
      ))}
    </div>
  ),
};

/** The card reflows by its own width: here 600 — two by two, a divider before the second column. */
export const Narrow: Story = {
  decorators: [(Story) => <div className="w-150"><Story /></div>],
};

/** …and here 300 — stacked, no dividers. */
export const VeryNarrow: Story = {
  decorators: [(Story) => <div className="w-75"><Story /></div>],
};

export const DarkTheme: Story = { globals: { theme: 'dark' } };

/** The bands, and the gauge's name (hidden: tested). */
export const Bands: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  play: async ({ canvasElement }) => {
    await expect([100, 95, 90, 89, 70, 69, 0, null, undefined].map(completionBand)).toEqual([
      'complete', 'high', 'high', 'medium', 'medium', 'low', 'low', 'none', 'none',
    ]);
    /* The band follows the rate as shown: 89.5 reads "90%" (green), 69.5 reads "70%" (amber), 99.6 reads "100%". */
    await expect([89.5, 69.5, 99.6, 89.4, 69.4].map(completionBand)).toEqual(['high', 'medium', 'complete', 'medium', 'low']);
    /* Named once by its caption, valued by its number: "Completion", 90 — not "Completion 90%… 90". */
    const gauge = within(canvasElement).getByRole('progressbar', { name: 'Completion' });
    await expect(gauge).toHaveAttribute('aria-valuenow', '90');
    await expect(gauge).not.toHaveAttribute('aria-valuetext');
  },
};

import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ChartLegend } from './ChartLegend';
import type { ChartSeries } from '../../lib/chart-series';

const meta = {
  title: 'Components/Display/ChartLegend',
  component: ChartLegend,
  parameters: {
    docs: {
      description: {
        component:
          'The row of series under a chart: a colour and the word for each, from the one place that owns them. With `onToggleSeries` each entry is a button that shows or hides its series.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="rounded-md bg-surface-elevated p-6">
        <Story />
      </div>
    ),
  ],
  args: { series: ['completed', 'committed', 'overdue', 'available'] },
} satisfies Meta<typeof ChartLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Plain text: the colour and the word. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Completed', 'Committed', 'Overdue', 'Available']);
    await expect(c.queryAllByRole('button')).toHaveLength(0);
  },
};

/** A different word for a series in this chart. */
export const Relabelled: Story = { args: { series: ['available', 'committed'], labels: { available: 'Capacity', committed: 'Commitment' } } };

/** With `onToggleSeries` each entry is a button with `aria-pressed`; a hidden one is struck through and its colour goes grey, so colour is never the only signal. */
export const Toggling: Story = {
  args: { onToggleSeries: fn() },
  render: (args) => {
    const [hidden, setHidden] = React.useState<ChartSeries[]>([]);
    return <ChartLegend {...args} hiddenSeries={hidden} onToggleSeries={(s) => setHidden((h) => (h.includes(s) ? h.filter((x) => x !== s) : [...h, s]))} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const overdue = c.getByRole('button', { name: 'Overdue' });
    await expect(overdue).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(overdue);
    await expect(overdue).toHaveAttribute('aria-pressed', 'false');
    await expect(getComputedStyle(overdue).textDecorationLine).toContain('line-through');
    /* Keyboard: Tab to it, Space turns it back on. */
    overdue.focus();
    await userEvent.keyboard(' ');
    await expect(overdue).toHaveAttribute('aria-pressed', 'true');
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { args: { hiddenSeries: ['overdue'], onToggleSeries: () => {} }, globals: { theme: 'dark' } };

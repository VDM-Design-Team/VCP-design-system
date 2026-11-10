import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { MetricTile } from './MetricTile';

const meta = {
  title: 'Atoms/MetricTile',
  component: MetricTile,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One number with its name and a tinted icon tile: “Total Announcements 11”. The quiet settings-page tile — not a ' +
          'dashboard `StatCard`. The tone tints the icon and is decoration only; the icon is hidden from assistive tech.',
      },
    },
  },
  args: { icon: 'megaphone', tone: 'info', label: 'Total Announcements', value: '11' },
  argTypes: { tone: { control: 'radio', options: ['info', 'success', 'brand'] } },
  decorators: [
    (Story) => (
      <div className="w-96 bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MetricTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Total Announcements')).toBeVisible();
    await expect(c.getByText('11')).toBeVisible();
    /* The icon tile is decoration. */
    await expect(canvasElement.querySelector('svg')?.closest('[aria-hidden="true"]')).not.toBeNull();
  },
};

/** The three tones, as the Announcements tab uses them: blue, green, and brand. */
export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <MetricTile icon="megaphone" tone="info" label="Total Announcements" value="11" />
      <MetricTile icon="eye" tone="success" label="Latest Version" value="v1.18.1" />
      <MetricTile icon="calendar-blank" tone="brand" label="Last Updated" value="May 20, 2026" />
    </div>
  ),
};

/** A long value truncates inside the tile instead of pushing it wider. */
export const LongValue: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { value: 'A value that is far too long to fit beside the icon in a tile this narrow' },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' }, render: Tones.render };

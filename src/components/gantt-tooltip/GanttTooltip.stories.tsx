import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, waitFor } from 'storybook/test';
import { GanttTooltip } from './GanttTooltip';
import { Button } from '../../atoms/button';

const details = [
  { label: 'Status', value: 'AB Testing' },
  { label: 'Initiator', value: 'User 1' },
  { label: 'Est. Due Date', value: '05/04/2025' },
];

const meta = {
  title: 'Components/Overlays/GanttTooltip',
  component: GanttTooltip,
  parameters: {
    docs: {
      description: {
        component:
          'The card a Gantt bar shows on hover or keyboard focus: the work item’s title with a ' +
          'link glyph, then label/value lines. It is `Tooltip` with the content filled in, so it ' +
          'opens on focus, is wired with `aria-describedby`, and closes on Escape. Nothing in it ' +
          'is interactive — the bar is the link.',
      },
    },
  },
  args: {
    title: 'VCP: Added Value Title Name Here',
    details,
    placement: 'bottom',
    defaultOpen: true,
    /* The bar stands in as a button here; on a chart it is the bar itself. */
    children: <Button variant="secondary">Bar</Button>,
  },
  argTypes: {
    placement: { control: 'radio', options: ['top', 'bottom', 'left', 'right'] },
    defaultOpen: { control: 'boolean' },
    title: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div className="px-24 pb-24 pt-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GanttTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Bar' });
    /* The bubble is drawn in a portal, outside the canvas: find it by the id the trigger points at. */
    const tip = document.getElementById(trigger.getAttribute('aria-describedby')!.split(' ').pop()!) as HTMLElement;
    await expect(tip).toHaveAttribute('role', 'tooltip');
    await waitFor(() => expect(within(tip).getByText('VCP: Added Value Title Name Here')).toBeVisible());
    await expect(tip.querySelectorAll('dt')).toHaveLength(3);
    await expect(within(tip).getByText('Status:')).toBeVisible();
  },
};

/** The title truncates to one line, so every card is the same width. */
export const LongTitle: Story = {
  args: {
    title: 'VCP: A very long added value title that cannot fit on a single line of the card',
  },
};

export const LightAndDark: Story = {
  name: 'Light and dark',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="grid grid-cols-1 gap-4">
      <div className="bg-surface-canvas pb-28">
        <GanttTooltip {...args} />
      </div>
      <div className="dark bg-surface-canvas pb-28">
        <GanttTooltip {...args} />
      </div>
    </div>
  ),
};

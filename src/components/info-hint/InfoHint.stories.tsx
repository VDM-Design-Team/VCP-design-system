import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { InfoHint } from './InfoHint';

const meta = {
  title: 'Components/Overlays/InfoHint',
  component: InfoHint,
  parameters: {
    docs: {
      description: {
        component:
          'The small "i" beside a card title or a stat label, with its explanation in a tooltip. One control for every card: a 16 glyph, a button named "About {label}", the tooltip opening below, and a 40 press area around the glyph.',
      },
    },
  },
  args: { label: 'In Case You Missed It', content: 'Added Values that have been waiting for a while and may need your attention.' },
  argTypes: { placement: { control: 'radio', options: ['top', 'bottom', 'left', 'right'] } },
  decorators: [
    (Story) => (
      <div className="px-24 pb-24 pt-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InfoHint>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const button = c.getByRole('button', { name: 'About In Case You Missed It' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await waitFor(() => expect(document.getElementById(button.getAttribute('aria-describedby')!.split(' ').pop()!)).toHaveAttribute('role', 'tooltip'));
    /* The glyph is 16; the press area (the ::after) is 40. */
    await expect(button.getBoundingClientRect().width).toBe(16);
    await expect(parseFloat(getComputedStyle(button, '::after').width)).toBe(40);
  },
};

/** Beside a card title (16 semibold) and beside a stat label (14 medium): the same icon in both. */
export const BesideText: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex items-center gap-1">
        <h2 className="m-0 text-title-sm-semibold text-text-primary">Team Capacity</h2>
        <InfoHint label="Team Capacity" content="How much of the team's capacity this cycle is used." />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-body-sm-medium text-text-secondary">Committed</span>
        <InfoHint label="Committed" content="Points the team agreed to take on." />
      </div>
    </div>
  ),
};

export const Placements: Story = {
  parameters: { controls: { disable: true } },
  decorators: [(Story) => <div className="px-40 py-24"><Story /></div>],
  render: () => (
    <div className="flex gap-16">
      {(['top', 'bottom', 'left', 'right'] as const).map((p) => (
        <InfoHint key={p} label={p} placement={p} content={`Opens ${p}.`} defaultOpen={p === 'bottom'} />
      ))}
    </div>
  ),
};

export const LightAndDark: Story = {
  name: 'Light and dark',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="grid grid-cols-1 gap-4">
      <div className="bg-surface-canvas pb-16"><InfoHint {...args} defaultOpen /></div>
      <div className="dark bg-surface-canvas pb-16"><InfoHint {...args} defaultOpen /></div>
    </div>
  ),
};

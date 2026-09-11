import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { UrgencyTag, AV_URGENCIES } from './UrgencyTag';

const meta = {
  title: 'Atoms/UrgencyTag',
  component: UrgencyTag,
  parameters: {
    docs: {
      description: {
        component:
          'How urgent an Added Value is — the owner of VCP’s urgency vocabulary and its ' +
          'urgency → glyph/colour mapping. **The label is not the colour**: every urgency ' +
          'writes its word in the same neutral and only the glyph carries the temperature, so ' +
          'a column of them reads as a scale rather than four unrelated statuses. Each step ' +
          'has a distinct shape as well as a distinct hue, so the scale survives greyscale.',
      },
    },
  },
  args: { urgency: 'Normal' },
  argTypes: {
    urgency: { control: 'radio', options: AV_URGENCIES },
  },
} satisfies Meta<typeof UrgencyTag>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The whole vocabulary, least urgent to most — the scale the glyphs draw. */
export const AllUrgencies: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {AV_URGENCIES.map((urgency) => (
        <UrgencyTag key={urgency} urgency={urgency} />
      ))}
    </div>
  ),
};

/**
 * Stacked, as a table column shows them. The words line up at one weight and
 * the glyphs rise — which is the point of the design's decision.
 */
export const AsAColumn: Story = {
  render: () => (
    <div className="flex w-40 flex-col items-start gap-1">
      {AV_URGENCIES.map((urgency) => (
        <UrgencyTag key={urgency} urgency={urgency} />
      ))}
    </div>
  ),
};

/**
 * The glyph is decorative, so each tag announces its word exactly once — not
 * "Urgent Urgent". This is the check that keeps it that way.
 */
export const AnnouncesOnce: Story = {
  render: () => <UrgencyTag urgency="Urgent" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Urgent')).toBeInTheDocument();
    await expect(canvasElement.textContent).toBe('Urgent');
  },
};

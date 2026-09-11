import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { TypeTag, AV_TYPES } from './TypeTag';

const meta = {
  title: 'Atoms/TypeTag',
  component: TypeTag,
  parameters: {
    docs: {
      description: {
        component:
          'An Added Value’s type — the owner of VCP’s type vocabulary and its type → ' +
          'glyph/colour mapping. **Type is a scale and the glyph is the scale**: same caret ' +
          'family, one more stroke each step, heaviest first. Unlike `StatusPill`’s, the ' +
          'vocabulary is closed — the design draws exactly three and the numbering is the ' +
          'meaning.',
      },
    },
  },
  args: { type: 'Type 3' },
  argTypes: {
    type: { control: 'radio', options: AV_TYPES },
  },
} satisfies Meta<typeof TypeTag>;

export default meta;
type Story = StoryObj<typeof meta>;

/** All three, heaviest first — the ranking the carets draw. */
export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {AV_TYPES.map((type) => (
        <TypeTag key={type} type={type} />
      ))}
    </div>
  ),
};

/** Stacked, as a table column shows them. */
export const AsAColumn: Story = {
  render: () => (
    <div className="flex w-40 flex-col items-start gap-1">
      {AV_TYPES.map((type) => (
        <TypeTag key={type} type={type} />
      ))}
    </div>
  ),
};

/** The glyph is decorative, so each tag announces its word exactly once. */
export const AnnouncesOnce: Story = {
  render: () => <TypeTag type="Type 1" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Type 1')).toBeInTheDocument();
    await expect(canvasElement.textContent).toBe('Type 1');
  },
};

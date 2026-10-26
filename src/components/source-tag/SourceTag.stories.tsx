import type { Meta, StoryObj } from '@storybook/react-vite';
import { SourceTag } from './SourceTag';

const meta = {
  title: 'Components/Display/SourceTag',
  component: SourceTag,
  parameters: {
    docs: {
      description: {
        component:
          'Where an Added Value came from — the source’s name in a blue tag. A `Tag` with the ' +
          'info tonal fill and the info outline border, as the design draws it. Sources are data, ' +
          'so the text is shown exactly as given: there is no mapping and no vocabulary here.',
      },
    },
  },
  args: { source: 'BESA DIGITAL' },
} satisfies Meta<typeof SourceTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The design's example, then a source written in ordinary case — the tag changes nothing. */
export const AsGiven: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <SourceTag source="BESA DIGITAL" />
      <SourceTag source="Supplier portal" />
    </div>
  ),
};

/** In a narrow column a long name is cut with an ellipsis rather than overflowing the cell. */
export const LongName: Story = {
  render: () => (
    <div className="w-40">
      <SourceTag source="Northern Europe Procurement Operations" />
    </div>
  ),
};

/** Every colour is a semantic token, so the dark theme comes for free via `.dark`. */
export const LightAndDark: Story = {
  name: 'Light and dark',
  render: () => {
    const set = (
      <div className="flex flex-wrap items-center gap-4 bg-surface-canvas p-8">
        <SourceTag source="BESA DIGITAL" />
        <SourceTag source="Supplier portal" />
      </div>
    );
    return (
      <div className="grid grid-cols-1 gap-4">
        <div>{set}</div>
        <div className="dark">{set}</div>
      </div>
    );
  },
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { SourceTag } from '../source-tag';
import { CycleTag, formatCycleRange } from './CycleTag';

const meta = {
  title: 'Components/Display/CycleTag',
  component: CycleTag,
  parameters: {
    docs: {
      description: {
        component:
          'The cycle an Added Value belongs to: its code and the dates it runs. An outlined ' +
          '`Tag` at its large size, 28 tall, in the design’s lighter border. Cycles are data — pass the code and ' +
          'the ISO start and end dates; the tag writes them the way VCP does everywhere.',
      },
    },
  },
  args: { code: 'C18', start: '2025-09-20', end: '2026-10-02' },
  argTypes: {
    start: { control: 'text' },
    end: { control: 'text' },
  },
} satisfies Meta<typeof CycleTag>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The dates are written from the ISO string, with no `Date`, so no time zone
 * can move a cycle by a day, and the cycle reads as one string.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const text = 'C18 (Sep 20, 2025 - Oct 02, 2026)';
    await expect(within(canvasElement).getByText(text)).toBeInTheDocument();
    await expect(canvasElement.textContent).toBe(text);
    await expect(formatCycleRange('2026-01-01', '2026-12-31')).toBe('Jan 01, 2026 - Dec 31, 2026');
  },
};

/** A different code and a short cycle — the shape is the same, only the words move. */
export const Another: Story = { args: { code: 'C33', start: '2026-05-25', end: '2026-06-08' } };

/** In a narrow column the text is cut with an ellipsis rather than overflowing. */
export const Narrow: Story = {
  render: (args) => (
    <div className="w-40">
      <CycleTag {...args} />
    </div>
  ),
};

/** On a detail card the source and the cycle sit side by side. */
export const BesideSource: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <SourceTag source="BESA DIGITAL" />
      <CycleTag {...args} />
    </div>
  ),
};

/** Every colour is a semantic token, so the dark theme comes for free via `.dark`. */
export const LightAndDark: Story = {
  name: 'Light and dark',
  render: (args) => {
    const set = (
      <div className="flex flex-wrap items-center gap-4 bg-surface-canvas p-8">
        <CycleTag {...args} />
        <CycleTag code="C33" start="2026-05-25" end="2026-06-08" />
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

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { DescriptionCard } from './DescriptionCard';

const meta = {
  title: 'Atoms/DescriptionCard',
  component: DescriptionCard,
  parameters: {
    docs: {
      description: {
        component:
          'One numbered entry in an Added Value’s description: a coloured number block and the ' +
          'paragraph beside it. The colour is the type — problem, solution, deliverable, desired ' +
          'outcome. The list is the caller’s.',
      },
    },
  },
  args: { children: 'Some paragraph here', type: 'problem', position: 1 },
  argTypes: {
    type: { control: 'radio', options: ['problem', 'solution', 'deliverable', 'desired-outcome'] },
    position: { control: 'number' },
    children: { control: 'text' },
  },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
} satisfies Meta<typeof DescriptionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The four types the Figma set draws, one of each. */
export const Types: Story = {
  render: () => (
    <ol className="m-0 flex list-none flex-col gap-4 p-0">
      {(
        [
          ['problem', 'Warehouse managers cannot see which suppliers are overdue.'],
          ['solution', 'Show a supplier scorecard on the planning page.'],
          ['deliverable', 'A scorecard page with the overdue count and a CSV export.'],
          ['desired-outcome', 'Overdue suppliers are chased within a day.'],
        ] as const
      ).map(([type, text]) => (
        <li key={type}>
          <DescriptionCard type={type}>{text}</DescriptionCard>
        </li>
      ))}
    </ol>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('1')).toHaveLength(4);
    await expect(canvas.getByText('Show a supplier scorecard on the planning page.')).toBeVisible();
  },
};

/** A long paragraph wraps inside the panel and the number block keeps its width. */
export const LongParagraph: Story = {
  args: {
    position: 12,
    children:
      'A longer paragraph wraps onto as many lines as it needs. The panel grows with it, and the number ' +
      'block stretches to the same height so the two stay one card.',
  },
};

/** Fills and the panel are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex flex-col gap-4 bg-surface-canvas p-8">
            {(['problem', 'solution', 'deliverable', 'desired-outcome'] as const).map((type) => (
              <DescriptionCard key={type} type={type}>
                Some paragraph here
              </DescriptionCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

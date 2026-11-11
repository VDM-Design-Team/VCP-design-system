import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { HolidayTypeTag, HOLIDAY_TYPES } from './HolidayTypeTag';

const meta = {
  title: 'Components/Data Display/HolidayTypeTag',
  component: HolidayTypeTag,
  parameters: {
    docs: { description: { component: 'The kind of holiday a Holiday Registry row is, as a glyph and a word: Public (a globe), Team (a group) or Individual (one person).' } },
  },
  args: { type: 'public' },
} satisfies Meta<typeof HolidayTypeTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Public: Story = {};
export const Team: Story = { args: { type: 'team' } };
export const Individual: Story = { args: { type: 'individual' } };

/** All three — the closed vocabulary, in the design's order. */
export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      {HOLIDAY_TYPES.map((type) => (
        <HolidayTypeTag key={type} type={type} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    for (const word of ['Public', 'Team', 'Individual']) await expect(c.getByText(word)).toBeVisible();
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' }, render: AllTypes.render };

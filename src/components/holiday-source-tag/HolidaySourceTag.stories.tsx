import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { HolidaySourceTag } from './HolidaySourceTag';

const meta = {
  title: 'Components/Data Display/HolidaySourceTag',
  component: HolidaySourceTag,
  parameters: { docs: { description: { component: 'Where a Holiday Registry entry came from: Manual Entry (a pencil), Google Calendar (a calendar) or In Hubstaff (a link).' } } },
  args: { source: 'manual' },
} satisfies Meta<typeof HolidaySourceTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ManualEntry: Story = {};
export const GoogleCalendar: Story = { args: { source: 'google-calendar' } };
export const InHubstaff: Story = { args: { source: 'hubstaff' } };

/** All three — the closed vocabulary. */
export const AllSources: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <HolidaySourceTag source="manual" />
      <HolidaySourceTag source="google-calendar" />
      <HolidaySourceTag source="hubstaff" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    for (const word of ['Manual Entry', 'Google Calendar', 'In Hubstaff']) await expect(c.getByText(word)).toBeVisible();
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' }, render: AllSources.render };

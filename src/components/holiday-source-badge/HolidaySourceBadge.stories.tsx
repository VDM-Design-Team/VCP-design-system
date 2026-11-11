import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { HolidaySourceBadge } from './HolidaySourceBadge';

const meta = {
  title: 'Components/Data Display/HolidaySourceBadge',
  component: HolidaySourceBadge,
  parameters: { docs: { description: { component: 'Where a Holiday Registry entry came from: Manual Entry (a pencil), Google Calendar (a calendar) or In Hubstaff (a link), as pill badges.' } } },
  args: { source: 'manual' },
} satisfies Meta<typeof HolidaySourceBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ManualEntry: Story = {};
export const GoogleCalendar: Story = { args: { source: 'google-calendar' } };
export const InHubstaff: Story = { args: { source: 'hubstaff' } };

/** All three — the closed vocabulary. */
export const AllSources: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <HolidaySourceBadge source="manual" />
      <HolidaySourceBadge source="google-calendar" />
      <HolidaySourceBadge source="hubstaff" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    for (const word of ['Manual Entry', 'Google Calendar', 'In Hubstaff']) await expect(c.getByText(word)).toBeVisible();
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' }, render: AllSources.render };

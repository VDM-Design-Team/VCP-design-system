import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { AnnouncementsOverview } from './AnnouncementsOverview';

const meta = {
  title: 'Patterns/AnnouncementsOverview',
  component: AnnouncementsOverview,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The top of the Announcements tab: a title card and three facts under it — the total, the latest version and when it was ' +
          'last updated. It shows what it is given; the page counts and formats.',
      },
    },
  },
  args: { total: 11, latestVersion: 'v1.18.1', lastUpdated: 'May 20, 2026' },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AnnouncementsOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's top: the title card, then Total Announcements, Latest Version and Last Updated side by side. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { name: 'Announcements' })).toBeVisible();
    await expect(c.getByText('View and manage announcements')).toBeVisible();
    await expect(c.getByText('Total Announcements')).toBeVisible();
    await expect(c.getByText('11')).toBeVisible();
    await expect(c.getByText('v1.18.1')).toBeVisible();
    await expect(c.getByText('May 20, 2026')).toBeVisible();
  },
};

/** In a narrow column the tiles stack (a container query, not the viewport's). */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

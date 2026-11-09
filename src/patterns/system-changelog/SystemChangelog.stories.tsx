import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { SystemChangelog, type ChangelogRelease } from './SystemChangelog';

const FEATURES = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
];
const MESSAGE =
  'Some changelog message goes here. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

const RELEASES: ChangelogRelease[] = [
  { id: 3, title: 'Changelog Title', version: 'v1.3.0', date: '2026-03-01', message: MESSAGE, features: FEATURES },
  { id: 2, title: 'Changelog Title', version: 'v1.2.0', date: '2026-02-01', message: MESSAGE, features: FEATURES },
  { id: 1, title: 'Changelog Title', version: 'v1.1.0', date: '2026-01-01', message: MESSAGE, features: FEATURES },
];

const meta = {
  title: 'Patterns/SystemChangelog',
  component: SystemChangelog,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The page that lists every release: a “System Changelog” title over one card per release, in the order given. It shows what ' +
          'it is given; titles and versions as they read, dates as ISO shown the system way.',
      },
    },
  },
  args: { releases: RELEASES },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SystemChangelog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's page: the title, then a card per release. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('region', { name: 'System Changelog' })).toBeVisible();
    await expect(c.getByRole('heading', { level: 2, name: 'System Changelog' })).toBeVisible();
    await expect(c.getAllByRole('article')).toHaveLength(3);
    await expect(c.getByText('v1.3.0')).toBeVisible();
  },
};

/** No releases. */
export const Empty: Story = {
  args: { releases: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('No releases yet.')).toBeVisible();
  },
};

/** While they load: the title stays, placeholder cards stand in, and one status says so. */
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('status')).toHaveTextContent('Loading changelog');
    await expect(c.queryByRole('article')).toBeNull();
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

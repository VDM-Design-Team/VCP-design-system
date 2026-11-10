import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SystemChangelog, type ChangelogRelease } from './SystemChangelog';

const FEATURES = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
];
const MESSAGE =
  'Some changelog message goes here. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

const RELEASES: ChangelogRelease[] = [
  { id: 3, title: 'Changelog Title', kind: 'feature', changelogUrl: 'https://example.com/changelog/v1.3.0', version: 'v1.3.0', date: '2026-03-01', description: MESSAGE, features: FEATURES },
  { id: 2, title: 'Changelog Title', kind: 'update', changelogUrl: 'https://example.com/changelog/v1.2.0', version: 'v1.2.0', date: '2026-02-01', description: MESSAGE, features: FEATURES },
  { id: 1, title: 'Changelog Title', kind: 'experimental', changelogUrl: 'https://example.com/changelog/v1.1.0', version: 'v1.1.0', date: '2026-01-01', description: MESSAGE, features: FEATURES },
];

/* Twelve releases, three to a page, for the paged story. */
const MANY: ChangelogRelease[] = Array.from({ length: 12 }, (_, i) => {
  const n = 12 - i;
  return { id: n, title: `Release ${n}`, kind: 'update', changelogUrl: `https://example.com/changelog/v1.${n}.0`, version: `v1.${n}.0`, date: `2026-${String(n).padStart(2, '0')}-01`, description: MESSAGE, features: FEATURES };
});

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

/** Each card's title links to its changelog document, and its glyph says what kind of announcement it is. */
export const LinkedCards: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const links = c.getAllByRole('link', { name: 'Changelog Title (opens in a new tab)' });
    await expect(links).toHaveLength(3);
    await expect(links[0]).toHaveAttribute('href', 'https://example.com/changelog/v1.3.0');
    await expect(c.getByText('New feature')).toBeInTheDocument();
  },
};

/** Many releases are paged with `Pagination`, under the cards. It is controlled: the page passes the releases that are showing. */
export const Paged: Story = {
  args: { onPageChange: fn() },
  render: function PagedChangelog(args) {
    const [page, setPage] = React.useState(1);
    return (
      <SystemChangelog
        {...args}
        releases={MANY.slice((page - 1) * 3, page * 3)}
        page={page}
        pageCount={4}
        onPageChange={(next) => {
          setPage(next);
          args.onPageChange?.(next);
        }}
      />
    );
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('navigation', { name: 'Pagination' })).toBeVisible();
    await expect(c.getByRole('heading', { level: 3, name: /Release 12/ })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Page 2' }));
    await expect(args.onPageChange).toHaveBeenCalledWith(2);
    await expect(c.getByRole('heading', { level: 3, name: /Release 9/ })).toBeVisible();
    await expect(c.queryByRole('heading', { level: 3, name: /Release 12/ })).toBeNull();
    await expect(c.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
  },
};

/** One page, or none given: no pagination. */
export const OnePage: Story = {
  args: { page: 1, pageCount: 1 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('navigation', { name: 'Pagination' })).toBeNull();
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

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ChangelogItem } from './ChangelogItem';
import { formatVersion, VERSION_PATTERN } from '../../lib/announcement';
import { CHANGELOG_KIND_ORDER, CHANGELOG_KINDS } from '../../lib/changelog-kinds';

const meta = {
  title: 'Atoms/ChangelogItem',
  component: ChangelogItem,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One release in the System Changelog: title and version, when it was posted, the description, and the features and updates ' +
          'it brought. The version reads as given; the date is ISO and shown dd/mm/yyyy (or the reader locale), in a time element.',
      },
    },
  },
  args: {
    title: 'Changelog Title',
    version: 'v1.18.1',
    date: '2026-01-01',
    description:
      'Some changelog message goes here. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    features: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    ],
  },
  decorators: [
    (Story) => (
      <div className="max-w-4xl bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChangelogItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's card: title and version, "Posted on …", the description, then Features/Updates over a bulleted list. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('article')).toBeVisible();
    await expect(c.getByRole('heading', { level: 3, name: 'Changelog Title' })).toBeVisible();
    await expect(c.getByText('v1.18.1')).toBeVisible();
    /* The ISO date reads dd/mm/yyyy, in a <time> that carries the ISO. */
    const posted = canvasElement.querySelector('time') as HTMLElement;
    await expect(posted).toHaveTextContent('01/01/2026');
    await expect(posted.parentElement).toHaveTextContent('Posted on 01/01/2026');
    await expect(c.getByText('Features/Updates:')).toBeVisible();
    await expect(c.getAllByRole('listitem')).toHaveLength(2);
  },
};

/** The date is a `<time>` carrying the ISO date, and reads dd/mm/yyyy. */
export const WithMachineDate: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('time')).toHaveAttribute('datetime', '2026-01-01');
  },
};

/** `kind` draws the announcement's glyph before the title; a screen reader hears what it is. The glyph and words come from the one owner `ChangeLogModal` reads. */
export const WithKind: Story = {
  args: { kind: 'feature' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('New feature')).toBeInTheDocument();
    await expect(c.getByRole('heading', { level: 3, name: 'Changelog Title' })).toBeVisible();
  },
};

/** The three kinds: a flask, a megaphone and a rocket. */
export const Kinds: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <ChangelogItem {...args} kind="experimental" title="Experimental Features Available" />
      <ChangelogItem {...args} kind="update" title="New Release" />
      <ChangelogItem {...args} kind="feature" title="New Feature" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Experimental feature')).toBeInTheDocument();
    await expect(c.getByText('Release')).toBeInTheDocument();
    await expect(c.getByText('New feature')).toBeInTheDocument();
  },
};

/** `changelogUrl` makes the title a link to the release's changelog document. It opens in a new tab, and says so. */
export const LinkedTitle: Story = {
  args: { changelogUrl: 'https://example.com/changelog/v1.18.1' },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Changelog Title (opens in a new tab)' });
    await expect(link).toHaveAttribute('href', 'https://example.com/changelog/v1.18.1');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    /* Still the card's heading. */
    await expect(within(canvasElement).getByRole('heading', { level: 3 })).toContainElement(link);
  },
};

/** No description and no features: just the title, version and date. */
export const Bare: Story = {
  args: { description: undefined, features: undefined },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByText('Features/Updates:')).toBeNull();
    await expect(c.queryByRole('list')).toBeNull();
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

/** The shared announcement record's helpers (hidden, tested): the version reads "v1.18.1", and every kind has its Type word and tag tone. */
export const SharedAnnouncementShape: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => <div />,
  play: async () => {
    await expect(formatVersion('1.18.1')).toBe('v1.18.1');
    await expect(formatVersion('V1.18.1')).toBe('v1.18.1');
    await expect(formatVersion(' v1.18.1 ')).toBe('v1.18.1');
    /* Not semantic: handed back as it was, for the field to say so. */
    await expect(formatVersion('V.1.1')).toBe('V.1.1');
    await expect(VERSION_PATTERN.test('v1.0')).toBe(false);
    await expect(CHANGELOG_KIND_ORDER.map((kind) => CHANGELOG_KINDS[kind].name)).toEqual(['Experimental', 'Update', 'Feature']);
    await expect(CHANGELOG_KIND_ORDER.map((kind) => CHANGELOG_KINDS[kind].tone)).toEqual(['success', 'warning', 'info']);
  },
};

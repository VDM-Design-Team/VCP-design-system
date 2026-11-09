import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ChangelogItem } from './ChangelogItem';

const meta = {
  title: 'Components/Data Display/ChangelogItem',
  component: ChangelogItem,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One release in the System Changelog: title and version, when it was posted, the message, and the features and updates ' +
          'it brought. The version reads as given; the date is ISO and shown dd/mm/yyyy (or the reader locale), in a time element.',
      },
    },
  },
  args: {
    title: 'Changelog Title',
    version: 'v1.18.1',
    date: '2026-01-01',
    message:
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

/** Figma's card: title and version, "Posted on …", the message, then Features/Updates over a bulleted list. */
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

/** No message and no features: just the title, version and date. */
export const Bare: Story = {
  args: { message: undefined, features: undefined },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByText('Features/Updates:')).toBeNull();
    await expect(c.queryByRole('list')).toBeNull();
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

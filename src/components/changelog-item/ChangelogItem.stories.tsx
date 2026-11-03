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
          'it brought. Nothing is formatted here — the version and date read as given.',
      },
    },
  },
  args: {
    title: 'Changelog Title',
    version: 'V.1.1',
    date: '01/01/2026',
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
    await expect(c.getByText('V.1.1')).toBeVisible();
    await expect(c.getByText('Posted on 01/01/2026')).toBeVisible();
    await expect(c.getByText('Features/Updates:')).toBeVisible();
    await expect(c.getAllByRole('listitem')).toHaveLength(2);
  },
};

/** With `dateTime` the date is a `<time>`. */
export const WithMachineDate: Story = {
  args: { dateTime: '2026-01-01' },
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

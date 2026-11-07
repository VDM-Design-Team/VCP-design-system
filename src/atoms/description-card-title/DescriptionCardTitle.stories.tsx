import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { DescriptionCardTitle } from './DescriptionCardTitle';
import { SIDE_BY_SIDE } from '../../lib/story-a11y';

const meta = {
  title: 'Atoms/DescriptionCardTitle',
  component: DescriptionCardTitle,
  parameters: {
    docs: {
      description: {
        component:
          'The card at the top of an Added Value page that names it: the reference over the title. ' +
          'The page’s second header — `AVHeader` above it is the ID row and holds the `<h1>`; this ' +
          'card’s title is the `<h2>` under it.',
      },
    },
  },
  args: { reference: 'VCP-1234', title: 'Collapsible sidebar for improved tables' },
  argTypes: {
    headingLevel: { control: 'inline-radio', options: [2, 3] },
  },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DescriptionCardTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    /* The title is the heading; the reference is plain text above it. */
    await expect(c.getByRole('heading', { level: 2 })).toHaveTextContent('Collapsible sidebar for improved tables');
    await expect(c.getByText('VCP-1234').tagName).toBe('P');
  },
};

/** A long title wraps rather than being cut: this card is the one place the whole title shows. */
export const LongTitle: Story = {
  args: {
    reference: 'VCP-12408',
    title:
      'Rework the notification bell so the unread state survives a reload, a sign-out and a switch between the Design and Development domains',
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};

/** Deeper in a page, under another `<h2>`. */
export const HeadingLevel3: Story = {
  args: { headingLevel: 3 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading', { level: 3 })).toBeVisible();
  },
};

/** Every colour is a token, so dark comes free. */
export const LightAndDark: Story = {
  parameters: { controls: { disable: true }, ...SIDE_BY_SIDE },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-6">
            <DescriptionCardTitle {...args} />
          </div>
        </div>
      ))}
    </div>
  ),
};

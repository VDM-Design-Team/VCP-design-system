import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { InCaseYouMissedItCard, MISSED_ITEM_TYPES } from './InCaseYouMissedItCard';

const meta = {
  title: 'Components/Display/InCaseYouMissedItCard',
  component: InCaseYouMissedItCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'One Added Value that has been waiting: who raised it, its title, and what is wrong — Overdue, Due Soon, ' +
          'Awaiting Review or Pending — with how long. The card opens it; the ✕ dismisses it.',
      },
    },
  },
  args: {
    type: 'overdue',
    title: 'Revamp customer onboarding documentation',
    user: { name: 'John Smith' },
    created: '6 months ago',
    days: 3,
    onOpen: fn(),
    onDismiss: fn(),
  },
  argTypes: { type: { control: 'radio', options: MISSED_ITEM_TYPES } },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InCaseYouMissedItCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overdue: Story = {};
export const DueSoon: Story = { args: { type: 'due-soon', days: 2 } };
export const AwaitingReview: Story = { args: { type: 'awaiting-review', days: 5 } };
export const Pending: Story = { args: { type: 'pending', days: 1 } };

/** All four, as Figma's `_ICYM_Card` frame draws them. */
export const AllTypes: Story = {
  render: (args) => (
    <div className="flex flex-col">
      {MISSED_ITEM_TYPES.map((type) => (
        <InCaseYouMissedItCard key={type} {...args} type={type} />
      ))}
    </div>
  ),
};

/** No `onDismiss`, no ✕. */
export const WithoutDismiss: Story = { args: { onDismiss: undefined } };

/** A long title keeps to two lines. */
export const LongTitle: Story = {
  args: { title: 'Revamp the customer onboarding documentation, the welcome emails and the first-week checklist for every domain' },
};

export const DarkTheme: Story = { globals: { theme: 'dark' }, render: AllTypes.render };

/** The face opens it, the ✕ dismisses it, and neither triggers the other (hidden: tested). */
export const OpeningAndDismissing: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /^John Smith/ }));
    await expect(args.onOpen).toHaveBeenCalledTimes(1);
    await expect(args.onDismiss).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss Revamp customer onboarding documentation' }));
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
    await expect(args.onOpen).toHaveBeenCalledTimes(1);
    /* The message is written for the type. */
    await expect(canvas.getByText('since 3 days ago')).toBeInTheDocument();
  },
};

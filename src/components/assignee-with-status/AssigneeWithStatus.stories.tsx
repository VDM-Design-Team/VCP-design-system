import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, screen, within } from 'storybook/test';
import { AssigneeWithStatus } from './AssigneeWithStatus';

const meta = {
  title: 'Components/Display/AssigneeWithStatus',
  component: AssigneeWithStatus,
  parameters: {
    docs: {
      description: {
        component:
          'An assignee’s avatar with their availability dot, and a tooltip that says it in words: ' +
          '“John Doe (Assignee, Busy)”. The same sentence names the avatar for a screen reader.',
      },
    },
  },
  args: { name: 'John Doe', status: 'available' },
  argTypes: { status: { control: 'radio', options: ['available', 'busy', 'unavailable'] } },
  decorators: [(Story) => <div className="p-12"><Story /></div>],
} satisfies Meta<typeof AssigneeWithStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllStatuses: Story = {
  render: (args) => (
    <div className="flex gap-4">
      {(['available', 'busy', 'unavailable'] as const).map((status) => (
        <AssigneeWithStatus key={status} {...args} status={status} />
      ))}
    </div>
  ),
};

export const WithoutTooltip: Story = { args: { tooltip: false } };

export const DarkTheme: Story = { globals: { theme: 'dark' }, render: AllStatuses.render };

/** Hover or focus says it in words. */
export const SayingItInWords: Story = {
  args: { status: 'busy' },
  play: async ({ canvasElement }) => {
    const avatar = within(canvasElement).getByRole('img', { name: 'John Doe (Assignee, Busy)' });
    await userEvent.hover(avatar);
    await expect(await screen.findByRole('tooltip')).toHaveTextContent('John Doe (Assignee, Busy)');
  },
};

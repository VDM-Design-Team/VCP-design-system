import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, within } from 'storybook/test';
import { DetailCardMenu } from './DetailCardMenu';

const meta = {
  title: 'Components/Overlays/DetailCardMenu',
  component: DetailCardMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The ⋮ button at the head of an Added Value page and its menu: Edit and Delete for everyone, with the ' +
          'moves between Draft, Pending and Backlog that the role and the status allow. The component owns which ' +
          'actions are offered; the handlers are the page\'s.',
      },
    },
  },
  args: {
    role: 'user',
    onEdit: fn(),
    onDelete: fn(),
    onMoveToBacklog: fn(),
    onMoveToDraft: fn(),
    onMoveToPending: fn(),
  },
  argTypes: {
    role: { control: 'inline-radio', options: ['user', 'admin'] },
    status: { control: 'select', options: ['Draft', 'Pending', 'Backlog', 'Accepted', 'In Progress', 'Review'] },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-72 w-56 justify-end p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DetailCardMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/* A danger item carries a screen-reader qualifier ("destructive action") after its label. */
const names = () =>
  screen.getAllByRole('menuitem').map((item) => item.textContent?.replace(/destructive action$/, ''));

/** A user on an AV past Draft: Edit and Delete. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'AV options' }));
    await expect(names()).toEqual(['Edit', 'Delete']);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
    await expect(args.onEdit).toHaveBeenCalledTimes(1);
  },
};

/** An admin on a Pending AV: both moves, then Edit and Delete. */
export const AdminPending: Story = {
  args: { role: 'admin', status: 'Pending' },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'AV options' }));
    await expect(names()).toEqual(['Move to Backlog', 'Move to Draft', 'Edit', 'Delete']);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Move to Draft' }));
    await expect(args.onMoveToDraft).toHaveBeenCalledTimes(1);
  },
};

/** An admin on a Backlog AV: back to Pending or Draft. */
export const AdminBacklog: Story = {
  args: { role: 'admin', status: 'Backlog' },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'AV options' }));
    await expect(names()).toEqual(['Move to Pending', 'Move to Draft', 'Edit', 'Delete']);
  },
};

/** A Draft AV: the one move on offer is the backlog, for a user or an admin. */
export const Draft: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { status: 'Draft' },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'AV options' }));
    await expect(names()).toEqual(['Move to Backlog', 'Edit', 'Delete']);
  },
};

/** An admin on an AV past Pending (a domain step, say) gets no moves. */
export const AdminOtherStatus: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { role: 'admin', status: 'In Progress' },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'AV options' }));
    await expect(names()).toEqual(['Edit', 'Delete']);
  },
};

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
          'moves between Draft, Pending and Backlog that the role and the status allow (an admin can also reopen a ' +
          'Rejected AV and park one that is in progress). The component owns which ' +
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
    status: { control: 'select', options: ['Draft', 'Pending', 'Backlog', 'Rejected', 'Accepted', 'In Progress', 'Review', 'Completed'] },
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

/* A critical item carries a screen-reader qualifier ("destructive action") after its label. */
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

/** An admin on a Rejected AV: Rejected is not final. It can be parked, reopened as Pending or sent back to Draft. */
export const AdminRejected: Story = {
  args: { role: 'admin', status: 'Rejected' },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'AV options' }));
    await expect(names()).toEqual(['Move to Backlog', 'Move to Pending', 'Move to Draft', 'Edit', 'Delete']);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Move to Pending' }));
    await expect(args.onMoveToPending).toHaveBeenCalledTimes(1);
  },
};

/** An admin on an AV that is accepted or in progress (a domain step, say): it can be parked or sent back to Draft. */
export const AdminInProgress: Story = {
  args: { role: 'admin', status: 'In Progress' },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'AV options' }));
    await expect(names()).toEqual(['Move to Backlog', 'Move to Draft', 'Edit', 'Delete']);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Move to Backlog' }));
    await expect(args.onMoveToBacklog).toHaveBeenCalledTimes(1);
  },
};

/** Accepted and Review are in progress too. */
export const AdminAcceptedAndReview: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { role: 'admin', status: 'Accepted' },
  render: (args) => (
    <div className="flex gap-4">
      <DetailCardMenu {...args} label="Accepted AV options" />
      <DetailCardMenu {...args} status="Review" label="Review AV options" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const name of ['Accepted AV options', 'Review AV options']) {
      await userEvent.click(within(canvasElement).getByRole('button', { name }));
      await expect(names()).toEqual(['Move to Backlog', 'Move to Draft', 'Edit', 'Delete']);
      await userEvent.keyboard('{Escape}');
    }
  },
};

/** Nothing moves a Completed AV, and a user gets no moves past Draft, Rejected included. */
export const NoMoves: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { role: 'admin', status: 'Completed' },
  render: (args) => (
    <div className="flex gap-4">
      <DetailCardMenu {...args} label="Completed AV options" />
      <DetailCardMenu {...args} role="user" status="Rejected" label="Rejected AV options" />
      <DetailCardMenu {...args} role="user" status="In Progress" label="In progress AV options" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const name of ['Completed AV options', 'Rejected AV options', 'In progress AV options']) {
      await userEvent.click(within(canvasElement).getByRole('button', { name }));
      await expect(names()).toEqual(['Edit', 'Delete']);
      await userEvent.keyboard('{Escape}');
    }
  },
};

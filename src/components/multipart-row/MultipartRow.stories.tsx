import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MultipartRow } from './MultipartRow';

const meta = {
  title: 'Components/Data Display/MultipartRow',
  component: MultipartRow,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One part of a multipart Added Value: its number, title, assignee, capacity points, due date and status. The number turns green ' +
          'when the part is completed. It does nothing itself: pressing the title only asks.',
      },
    },
  },
  args: {
    number: 1,
    title: 'Some custom title',
    assignee: { name: 'Marvin R' },
    capacityPoints: 10,
    dueDate: 'October 1, 2025',
    customStatus: 'Ready for Deploy',
    onOpen: fn(),
  },
  decorators: [
    (Story) => (
      <div className="max-w-3xl bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MultipartRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's row: the number, the title, the avatar, "10 CP", "Due Date:" and the date, a rule, and the status. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByText('10 CP')).toBeVisible();
    await expect(c.getByText('Due Date:')).toBeVisible();
    await expect(c.getByText('October 1, 2025')).toBeVisible();
    await expect(c.getByText('Ready for Deploy')).toBeVisible();
    /* The title is the button; its name says which part it is. */
    await userEvent.click(c.getByRole('button', { name: 'Part 1: Some custom title' }));
    await expect(args.onOpen).toHaveBeenCalled();
  },
};

/** Completed: the number is green, the status is the spine's own. */
export const Completed: Story = {
  args: { number: 2, status: 'Completed', customStatus: undefined },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Completed')).toBeVisible();
    const num = canvasElement.querySelector('[aria-hidden="true"]') as HTMLElement;
    await expect(num.className).toContain('success');
  },
};

/** A part just added: no assignee, no points and no date yet. */
export const Empty: Story = {
  args: { number: 4, title: '(4/4) Parent AV Title is Here', assignee: undefined, capacityPoints: null, dueDate: undefined, customStatus: undefined, status: 'Accepted' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('- CP')).toBeVisible();
    await expect(c.getByText('-', { selector: 'span' })).toBeVisible();
  },
};

/** A long title is cut with an ellipsis; the row keeps its shape. */
export const LongTitle: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { title: '(1/3) Parent AV title that is far too long to fit beside everything else in this row of the section' },
};

/** Without `onOpen` the title is plain text. */
export const NotOpenable: Story = {
  args: { onOpen: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

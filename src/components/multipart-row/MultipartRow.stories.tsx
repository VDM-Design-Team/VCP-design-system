import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MultipartRow, MultipartRowGroup } from './MultipartRow';

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
  /* A row is a subgrid: it always lives in a `MultipartRowGroup`. */
  render: (args) => (
    <div className="max-w-3xl">
      <MultipartRowGroup>
        <MultipartRow {...args} />
      </MultipartRowGroup>
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
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

/**
 * Together, rows share their columns: whatever the status or the points, each column starts at the same place in every row, and the
 * status column is only as wide as the widest tag.
 */
export const Aligned: Story = {
  render: (args) => (
    <div className="w-[72rem]">
      <MultipartRowGroup>
        <MultipartRow {...args} number={1} title="Some Parent Title Here (1/3)" customStatus="Ready for Deploy" />
        <MultipartRow {...args} number={2} title="Some Parent Title Here (2/3)" customStatus={undefined} status="Completed" capacityPoints={5} />
        <MultipartRow {...args} number={3} title="Some Parent Title Here (3/3)" customStatus={undefined} status="Accepted" dueDate="Oct 1, 2025" />
      </MultipartRowGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const left = (el: HTMLElement) => Math.round(el.getBoundingClientRect().left);
    /* "Due Date:" starts in the same column in every row, whatever the points before it... */
    await expect(new Set(c.getAllByText('Due Date:').map(left)).size).toBe(1);
    /* ...and so do the status tags, whatever their width. */
    const tags = ['Ready for Deploy', 'Completed', 'Accepted'].map((t) => c.getByText(t));
    await expect(new Set(tags.map(left)).size).toBe(1);
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DomainCard, type DomainCardItem } from './DomainCard';

const meta = {
  title: 'Patterns/DomainCard',
  component: DomainCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'One list in Tag Management — a titled card, an “Add New” button, and rows. The seven ' +
          'cards in the design are this one component with different titles and rows. Draggable ' +
          'rows reorder by pointer or by ↑ / ↓ on their grip.',
      },
    },
  },
  args: { title: 'Domains', items: [] },
  decorators: [
    (Story) => (
      <div className="w-100">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DomainCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const items = (...labels: string[]): DomainCardItem[] =>
  labels.map((label) => ({ id: label, label }));

export const Domains: Story = {
  args: {
    title: 'Domains',
    items: items('Design', 'BESA Content', 'BESA Partner'),
    onAdd: fn(),
    onEdit: fn(),
    onDelete: fn(),
  },
};

/** Super Admin sees these two; Design Admin sees the rest — the page decides, not the card. */
export const GlobalTags: Story = {
  args: { ...Domains.args, title: 'Global Tags', items: items('Bug', 'New Feature', 'Improvement') },
};

export const OneRow: Story = {
  args: { ...Domains.args, title: 'Domain Tags', items: items('General Design') },
};

const STATUS: DomainCardItem[] = [
  { id: 'pending', label: 'Pending', variant: 'locked' },
  { id: 'accepted', label: 'Accepted', variant: 'locked' },
  { id: 'initiated', label: 'Initiated', variant: 'locked' },
  { id: 'progress', label: 'In Progress', variant: 'draggable' },
  { id: 'review-design', label: 'Design Review', variant: 'draggable' },
  { id: 'review', label: 'Review', variant: 'locked' },
  { id: 'completed', label: 'Completed', variant: 'locked' },
];

/** Locked built-ins around two draggable rows; only the draggable ones move, and only among themselves. */
export const Status: Story = {
  args: { ...Domains.args, title: 'Status', items: STATUS },
  render: function StatusStory(args) {
    const [rows, setRows] = React.useState(args.items);
    return (
      <DomainCard
        {...args}
        items={rows}
        onReorder={(ids) => setRows(ids.map((id) => rows.find((row) => row.id === id)!))}
      />
    );
  },
};

export const WithoutAdd: Story = {
  args: { ...Domains.args, onAdd: undefined },
};

export const DarkTheme: Story = {
  ...Status,
  globals: { theme: 'dark' },
};

/**
 * Keyboard moves are deliberate: an arrow key alone does nothing. Space picks the row up, ↓ moves
 * it (announced, focus stays), Space drops it — only then does `onReorder` fire — and Escape puts
 * it back without firing at all.
 */
export const ReorderingByKeyboard: Story = {
  ...Status,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const grip = () => canvas.getByRole('button', { name: 'Move In Progress' });
    const names = () => canvas.getAllByRole('listitem').map((li) => li.textContent);
    const at = (text: string) => names().findIndex((name) => name?.includes(text));

    grip().focus();
    await userEvent.keyboard('{ArrowDown}');
    /* Not picked up: nothing moved. */
    await expect(at('In Progress')).toBeLessThan(at('Design Review'));

    await userEvent.keyboard(' ');
    await expect(grip()).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('status')).toHaveTextContent('In Progress moved to position 2 of 2');
    await expect(grip()).toHaveFocus();
    await expect(at('Design Review')).toBeLessThan(at('In Progress'));
    /* Last among the draggable rows: a locked row is never passed. */
    await userEvent.keyboard('{ArrowDown}');
    await expect(at('In Progress')).toBeLessThan(at('ReviewDefault'));

    /* Escape puts it back. */
    await userEvent.keyboard('{Escape}');
    await expect(grip()).toHaveAttribute('aria-pressed', 'false');
    await expect(at('In Progress')).toBeLessThan(at('Design Review'));

    /* Pick up, move, drop: the order sticks. */
    await userEvent.keyboard(' {ArrowDown} ');
    await expect(canvas.getByRole('status')).toHaveTextContent('In Progress dropped at position 2 of 2');
    await expect(at('Design Review')).toBeLessThan(at('In Progress'));
  },
};

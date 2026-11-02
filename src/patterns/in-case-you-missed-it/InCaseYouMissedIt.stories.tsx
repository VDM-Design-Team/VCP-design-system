import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { InCaseYouMissedIt, type InCaseYouMissedItItem } from './InCaseYouMissedIt';

const TITLE = 'Revamp customer onboarding documentation';

const ITEMS: InCaseYouMissedItItem[] = [
  { id: 'av-1', type: 'overdue', title: TITLE, user: { name: 'John Smith' }, created: '6 months ago', days: 12 },
  { id: 'av-2', type: 'due-soon', title: TITLE, user: { name: 'John Smith' }, created: '6 months ago', days: 2 },
  { id: 'av-3', type: 'awaiting-review', title: TITLE, user: { name: 'John Smith' }, created: '6 months ago', days: 9 },
  { id: 'av-4', type: 'pending', title: TITLE, user: { name: 'John Smith' }, created: '6 months ago', days: 7 },
  { id: 'av-5', type: 'pending', title: TITLE, user: { name: 'John Smith' }, created: '6 months ago', days: 14 },
  { id: 'av-6', type: 'overdue', title: TITLE, user: { name: 'John Smith' }, created: '5 months ago', days: 30 },
];

const meta = {
  title: 'Patterns/InCaseYouMissedIt',
  component: InCaseYouMissedIt,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The dashboard strip that brings back Added Values that have been waiting: a titled card over a row of cards ' +
          'that scrolls sideways, with an arrow at each edge on hover. It owns no state — the caller removes a dismissed ' +
          'card and remembers it.',
      },
    },
  },
  args: { items: ITEMS, onOpen: fn(), onDismiss: fn() },
  decorators: [
    (Story) => (
      <div className="max-w-5xl bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InCaseYouMissedIt>;

export default meta;
type Story = StoryObj<typeof meta>;

function Dismissable(args: React.ComponentProps<typeof InCaseYouMissedIt>) {
  const [items, setItems] = React.useState(args.items);
  return (
    <InCaseYouMissedIt
      {...args}
      items={items}
      onDismiss={(item) => {
        setItems((now) => now.filter((x) => x.id !== item.id));
        args.onDismiss?.(item);
      }}
    />
  );
}

export const Default: Story = { render: (args) => <Dismissable {...args} /> };

/** Few enough to fit: no arrows. */
export const FewItems: Story = { args: { items: ITEMS.slice(0, 2) }, render: (args) => <Dismissable {...args} /> };

/** Nothing missed, nothing drawn. */
export const Empty: Story = { args: { items: [] } };

/** No `onDismiss`, no ✕ on the cards. */
export const WithoutDismiss: Story = { args: { onDismiss: undefined } };

export const DarkTheme: Story = { globals: { theme: 'dark' }, render: (args) => <Dismissable {...args} /> };

/** Arrows appear only where there is more to see; each moves one card; dismissing removes the card (hidden: tested). */
export const ScrollingAndDismissing: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: (args) => <Dismissable {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    /* At the start: forward only. */
    await expect(canvas.queryByRole('button', { name: 'Previous' })).toBeNull();
    const next = await canvas.findByRole('button', { name: 'Next' });
    await userEvent.click(next);
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Previous' })).toBeInTheDocument());

    await userEvent.click(canvas.getAllByRole('button', { name: /^Dismiss/ })[0]!);
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
    await expect(canvas.getAllByRole('listitem')).toHaveLength(ITEMS.length - 1);
  },
};

/** With no scrollbar to grab, a mouse can drag the row; letting go over a card does not open it (hidden: tested). */
export const DraggingTheRow: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: (args) => <Dismissable {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const row = canvas.getAllByRole('list')[0]!;
    await expect(row.scrollLeft).toBe(0);
    const card = canvas.getAllByRole('button', { name: /^John Smith/ })[0]!;
    const box = card.getBoundingClientRect();
    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: card, coords: { clientX: box.left + 250, clientY: box.top + 40 } },
      { target: card, coords: { clientX: box.left + 120, clientY: box.top + 40 } },
      { target: card, coords: { clientX: box.left + 40, clientY: box.top + 40 } },
      { keys: '[/MouseLeft]', target: card, coords: { clientX: box.left + 40, clientY: box.top + 40 } },
    ]);
    await waitFor(() => expect(row.scrollLeft).toBeGreaterThan(50));
    await expect(args.onOpen).not.toHaveBeenCalled();
  },
};

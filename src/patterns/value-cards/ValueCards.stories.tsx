import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ValueCards, type ValueCardItem } from './ValueCards';

/* Figma's six, in its order. */
const ITEMS: ValueCardItem[] = [
  { key: 'completed', label: 'Completed', value: 12, accent: 'success' },
  { key: 'in-review', label: 'In Review', value: 6, accent: 'brand' },
  { key: 'overdue', label: 'Overdue', value: 3, accent: 'critical' },
  { key: 'in-progress', label: 'In Progress', value: 8, accent: 'brand' },
  { key: 'pending', label: 'Pending', value: 4, accent: 'yellow' },
  { key: 'draft', label: 'Draft', value: 5, accent: 'neutral' },
];

/* The "whose" filter's options, as Figma lists them. */
const WHOSE = ['All', 'Initiated', 'Assigned', 'Team'];

const meta = {
  title: 'Patterns/ValueCards',
  component: ValueCards,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The dashboard’s count of Added Values by status: a titled card of `StatCard`s with an optional "whose" filter. Pass the items; the cards follow. Figma draws six, one row when the card is wide enough; it reflows with its card, down to one column.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
  args: { items: ITEMS },
} satisfies Meta<typeof ValueCards>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's six statuses, each a stripe in its own tone, and the "whose" filter. */
export const Default: Story = {
  args: { filter: { label: 'Show', value: 'Assigned', options: WHOSE, onChange: () => {} } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('region', { name: 'Value Cards' })).toBeInTheDocument();
    for (const label of ['Completed', 'In Review', 'Overdue', 'In Progress', 'Pending', 'Draft']) await expect(c.getByText(label)).toBeVisible();
    await expect(c.getByText('8')).toBeVisible();
    await expect(c.getByRole('combobox', { name: 'Show' })).toHaveValue('Assigned');
  },
};

/** Live: the page does the counting; the card redraws from what it is given. */
export const FilterChangesTheCounts: Story = {
  render: (args) => {
    const [who, setWho] = React.useState('Assigned');
    const items = who === 'Assigned' ? ITEMS : ITEMS.map((i) => ({ ...i, value: Number(i.value) * 3 }));
    return <ValueCards {...args} items={items} filter={{ label: 'Show', value: who, options: ['Assigned', 'All'], onChange: setWho }} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Show' }), 'All');
    await expect(c.getByText('24')).toBeVisible();
  },
};

/** Without a filter it is just the cards (a user's own dashboard). */
export const NoFilter: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('combobox')).toBeNull();
  },
};

/** Fewer statuses: pass the ones the role sees. */
export const FourStatuses: Story = { args: { items: ITEMS.filter((i) => ['overdue', 'in-progress', 'pending', 'draft'].includes(i.key)) } };

/** Fewer still. */
export const ThreeStatuses: Story = { args: { items: ITEMS.slice(0, 3) } };

/** While the figures load: placeholders, and one status says so. */
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('status')).toHaveTextContent('Loading Value Cards');
    await expect(c.getByRole('region', { name: 'Value Cards' })).toHaveAttribute('aria-busy', 'true');
  },
};

export const Empty: Story = {
  args: { items: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('No Added Values to count yet.')).toBeVisible();
  },
};

/** It reflows with its card: at 360 the six cards are one column, and nothing overflows. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-90">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('section') as HTMLElement;
    await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

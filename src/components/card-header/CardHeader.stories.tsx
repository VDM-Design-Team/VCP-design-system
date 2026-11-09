import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CardHeader } from './CardHeader';
import { Select } from '../../atoms/select';
import { Button } from '../../atoms/button';

/* A card to put the header in, as the dashboard's cards are. */
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <section className={`rounded-md bg-surface-elevated p-6 font-sans ${className ?? ''}`}>{children}</section>
);

const meta = {
  title: 'Components/Display/CardHeader',
  component: CardHeader,
  parameters: {
    docs: {
      description: {
        component:
          'The head of a dashboard card: the title (the card\'s `h2`), an optional info icon that explains it, and an optional slot for controls on the right. One version for every card, so their titles, icons and filters line up.',
      },
    },
  },
  args: { title: 'Team Capacity' },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Card>
          <Story />
        </Card>
      </div>
    ),
  ],
} satisfies Meta<typeof CardHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A title alone. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading', { level: 2, name: 'Team Capacity' })).toBeInTheDocument();
  },
};

/** With the info icon: a 16 glyph 4 from the title, named "About Team Capacity", its tooltip below. */
export const WithHint: Story = {
  args: { hint: 'How much of the team\'s capacity this cycle is spent, by status.' },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'About Team Capacity' });
    await expect(Math.round(button.getBoundingClientRect().width)).toBe(16);
  },
};

/** With controls on the right: a filter, or a period picker and a button. */
export const WithControls: Story = {
  args: {
    title: 'Value Cards',
    actions: <Select size="sm" aria-label="Show" value="Assigned" options={['All', 'Initiated', 'Assigned', 'Team']} onChange={() => {}} />,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('combobox', { name: 'Show' })).toBeInTheDocument();
  },
};

/** Everything: title, hint and a row of controls. */
export const Full: Story = {
  args: {
    title: 'Domain Budget',
    hint: 'What the domain has been allocated and what it has spent this quarter.',
    actions: (
      <>
        <Button variant="secondary" size="sm">
          Go to Current Quarter
        </Button>
        <Select size="sm" aria-label="Quarter" value="Q3" options={['Q1', 'Q2', 'Q3', 'Q4']} onChange={() => {}} />
        <Select size="sm" aria-label="Year" value="2026" options={['2026', '2025']} onChange={() => {}} />
      </>
    ),
  },
};

/** A long title truncates rather than pushing the controls off, and when the card is narrow the controls drop under it. */
export const Narrow: Story = {
  args: {
    title: 'A very long card title that cannot fit on a single line of the card',
    hint: 'Explains the card.',
    actions: <Select size="sm" aria-label="Show" value="Assigned" options={['All', 'Assigned']} onChange={() => {}} />,
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const header = canvasElement.querySelector('header') as HTMLElement;
    const right = header.getBoundingClientRect().right;
    /* What you can see stays inside the header: the title (truncated), the icon and the control. (The icon's invisible 40 press area may reach past the edge; the card's padding takes it.) */
    for (const el of [c.getByRole('heading', { level: 2 }), c.getByRole('button', { name: /^About / }), c.getByRole('combobox', { name: 'Show' })]) {
      await expect(Math.round(el.getBoundingClientRect().right)).toBeLessThanOrEqual(Math.round(right));
    }
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' }, args: { hint: 'Explains the card.', actions: <Select size="sm" aria-label="Show" value="All" options={['All']} onChange={() => {}} /> } };

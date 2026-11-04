import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, within } from 'storybook/test';
import { PeriodSelect, type Period } from './PeriodSelect';

const SPRINTS = [
  { label: 'Sprint 35 (25-29 May)', value: '2026-05-25', rangeEnd: '2026-05-29' },
  { label: 'Sprint 34 (19-22 May)', value: '2026-05-19', rangeEnd: '2026-05-22' },
  { label: 'Sprint 33 (1-15 May)', value: '2026-05-01', rangeEnd: '2026-05-15' },
];

const meta = {
  title: 'Components/Forms/PeriodSelect',
  component: PeriodSelect,
  parameters: {
    docs: {
      description: {
        component:
          'A filter that picks a period: a month, or one of the named stretches you offer (sprints). The field says what is picked; the panel has the named periods, a year of months, and Clear.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-96 w-64">
        <Story />
      </div>
    ),
  ],
  args: { value: null, onChange: () => {}, presets: SPRINTS },
} satisfies Meta<typeof PeriodSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled(args: React.ComponentProps<typeof PeriodSelect>) {
  const [value, setValue] = React.useState<Period | null>(args.value);
  return <PeriodSelect {...args} value={value} onChange={setValue} />;
}

/** Figma's Empty: "Select Period". */
export const Empty: Story = { render: (args) => <Controlled {...args} /> };

/** Figma's Filled: a named period reads after its month. */
export const Filled: Story = { args: { value: { start: '2026-05-01', end: '2026-05-15' } }, render: (args) => <Controlled {...args} /> };

/** Figma's Dropdown: the named periods and a year of months; a preset picks its dates, a month the whole month, and Clear empties it. */
export const Choosing: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('combobox', { name: 'Select Period' });
    await userEvent.click(field);
    await userEvent.click(await screen.findByRole('button', { name: 'Sprint 34 (19-22 May)' }));
    await expect(field).toHaveValue('May 2026, Sprint 34 (19-22 May)');
    await userEvent.click(field);
    await userEvent.click(await screen.findByRole('button', { name: 'Clear' }));
    await expect(field).toHaveValue('');
  },
};

export const Disabled: Story = { args: { disabled: true }, render: (args) => <Controlled {...args} /> };

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' }, args: { value: { start: '2026-05-01', end: '2026-05-15' } }, render: (args) => <Controlled {...args} /> };

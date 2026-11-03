import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { DateField } from './DateField';

const meta = {
  title: 'Components/Forms/DateField',
  component: DateField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A date in a form: a read-only field with a calendar glyph, and a calendar that picks it. Estimated dates ' +
          'read “(est.)”. The calendar floats over a scrolling dialog or table instead of being clipped by it.',
      },
    },
  },
  args: { 'aria-label': 'Due date' },
  decorators: [
    (Story) => (
      <div className="h-96 w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled(args: React.ComponentProps<typeof DateField>) {
  const [value, setValue] = React.useState(args.value);
  const [estimated, setEstimated] = React.useState(args.estimated);
  return (
    <DateField
      {...args}
      value={value}
      estimated={estimated}
      onChange={(iso) => {
        setValue(iso);
        setEstimated(false);
      }}
    />
  );
}

export const Empty: Story = { render: (args) => <Controlled {...args} /> };

export const WithADate: Story = { args: { value: '2026-03-02' }, render: (args) => <Controlled {...args} /> };

/** A calculated date: “(est.)”. Picking a day yourself makes it yours. */
export const Estimated: Story = {
  args: { value: '2026-03-12', estimated: true },
  render: (args) => <Controlled {...args} />,
};

export const Invalid: Story = { args: { value: '2026-03-02', invalid: true } };

export const Disabled: Story = { args: { value: '2026-03-02', disabled: true } };

export const DarkTheme: Story = { globals: { theme: 'dark' }, args: { value: '2026-03-02' } };

/** Open the calendar, pick a day: the field shows it and the estimate is gone. */
export const PickingADay: Story = {
  args: { value: '2026-03-12', estimated: true },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', { name: 'Due date' });
    await expect(field).toHaveValue('2026-03-12 (est.)');
    await userEvent.click(field);
    await userEvent.click(await canvas.findByRole('button', { name: /^15\b/ }));
    await expect(field).toHaveValue('2026-03-15');
  },
};

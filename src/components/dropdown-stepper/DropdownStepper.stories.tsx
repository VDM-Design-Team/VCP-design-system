import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { DropdownStepper } from './DropdownStepper';

const YEARS = ['2024', '2025', '2026', '2027', '2028'];
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

const meta = {
  title: 'Components/Forms/DropdownStepper',
  component: DropdownStepper,
  parameters: {
    docs: {
      description: {
        component:
          'One choice from an ordered list: step to the neighbour with the arrows, or jump ' +
          'anywhere from the dropdown. Years, quarters, cycles. The arrows change the value — ' +
          'they are not navigation. Every change is announced politely.',
      },
    },
  },
  args: { options: YEARS, label: 'Year', defaultValue: '2026' },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md'] },
    wrap: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
} satisfies Meta<typeof DropdownStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Step with the arrows or jump from the list; the arrows die at the ends. */
export const Default: Story = {
  render: (args) => (
    <div className="h-64">
      <DropdownStepper {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Next Year' }));
    await expect(c.getByRole('button', { name: 'Year: 2027' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Year: 2027' }));
    await userEvent.click(await c.findByRole('menuitemradio', { name: '2024' }));
    await expect(c.getByRole('button', { name: 'Year: 2024' })).toBeVisible();
    /* First option: nowhere earlier to step. */
    await expect(c.getByRole('button', { name: 'Previous Year' })).toBeDisabled();
    await expect(c.getByRole('button', { name: 'Next Year' })).toBeEnabled();
  },
};

/** `wrap` carries on past either end — for a cycle like quarters. */
export const Wrapping: Story = {
  args: { options: QUARTERS, label: 'Quarter', defaultValue: 'Q4', wrap: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Next Quarter' }));
    await expect(c.getByRole('button', { name: 'Quarter: Q1' })).toBeVisible();
  },
};

/** Options can be `{ value, label, disabled }`; the arrows step over disabled ones. */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState('q2');
    return (
      <div className="flex flex-col items-start gap-3">
        <DropdownStepper
          label="Quarter"
          value={value}
          onChange={setValue}
          options={[
            { value: 'q1', label: 'Q1 — closed', disabled: true },
            { value: 'q2', label: 'Q2' },
            { value: 'q3', label: 'Q3' },
            { value: 'q4', label: 'Q4' },
          ]}
        />
        <p className="text-caption-md-regular text-text-tertiary">value: {value}</p>
      </div>
    );
  },
};

/** `md` 40 by default; `sm` 32 for dense toolbars. `fullWidth` spans the container. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex w-72 flex-col gap-4">
      <DropdownStepper {...args} size="md" fullWidth />
      <DropdownStepper {...args} size="sm" fullWidth />
    </div>
  ),
};

/**
 * `invalid` alone is the critical border; `error` adds the caption and implies
 * `invalid`. The caption is announced and tied to the dropdown.
 */
export const Invalid: Story = {
  args: { options: QUARTERS, label: 'Quarter', defaultValue: 'Q1', error: 'Q1 is closed for edits' },
  render: (args) => (
    <div className="flex flex-col items-start gap-6">
      <DropdownStepper {...args} />
      <DropdownStepper {...args} error={undefined} invalid label="Quarter, border only" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const alert = c.getByRole('alert');
    await expect(alert).toHaveTextContent('Q1 is closed for edits');
    const dropdown = c.getByRole('button', { name: 'Quarter: Q1' });
    await expect(dropdown).toHaveAttribute('aria-describedby', alert.id);
    /* Critical border, not the resting stroke.strong (#64748b). */
    await expect(getComputedStyle(dropdown.parentElement!.parentElement!).borderTopColor).not.toBe('rgb(100, 116, 139)');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

/** Shell, buttons and list are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex gap-6 bg-surface-canvas p-8">
            <DropdownStepper {...args} />
            <DropdownStepper {...args} disabled />
          </div>
        </div>
      ))}
    </div>
  ),
};

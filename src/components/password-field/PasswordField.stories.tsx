import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { PasswordField } from './PasswordField';
import { Field } from '../field';

const meta = {
  title: 'Components/Forms/PasswordField',
  component: PasswordField,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A password input with the eye at its end that shows what you typed. A real button inside the field, named "Show password" with ' +
          '`aria-pressed` — dots until it is pressed, then plain text.',
      },
    },
  },
  args: { 'aria-label': 'Password', defaultValue: 'correct horse battery' },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PasswordField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Dots until the eye is pressed, then plain text — and back. The eye keeps one name; `aria-pressed` says whether it is showing. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const field = c.getByLabelText('Password');
    const eye = c.getByRole('button', { name: 'Show password' });
    await expect(field).toHaveAttribute('type', 'password');
    await expect(eye).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(eye);
    await waitFor(() => expect(field).toHaveAttribute('type', 'text'));
    await expect(field).toHaveValue('correct horse battery');
    await expect(c.getByRole('button', { name: 'Show password' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(c.getByRole('button', { name: 'Show password' }));
    await waitFor(() => expect(field).toHaveAttribute('type', 'password'));
  },
};

/** The eye is a real, keyboard-reachable control inside the field — and its press area is the 40 minimum. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.tab();
    await expect(c.getByLabelText('Password')).toHaveFocus();
    await userEvent.tab();
    const eye = c.getByRole('button', { name: 'Show password' });
    await expect(eye).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(c.getByLabelText('Password')).toHaveAttribute('type', 'text'));
    /* A 24 button with a 40 press area (its ::after reaches 8 past it on every side). */
    const after = getComputedStyle(eye, '::after');
    await expect(Number.parseFloat(after.width)).toBeGreaterThanOrEqual(40);
  },
};

/** Inside a `Field`, which wires the label, hint and error onto the input. */
export const InAField: Story = {
  args: { 'aria-label': undefined, defaultValue: '' },
  render: (args) => (
    <Field label="New Password" helper="Use at least 12 characters.">
      <PasswordField {...args} fullWidth autoComplete="new-password" placeholder="Enter a strong password" />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const field = c.getByLabelText('New Password');
    await expect(field).toHaveAccessibleDescription('Use at least 12 characters.');
    await expect(field).toHaveAttribute('autocomplete', 'new-password');
  },
};

/** The error state is `Input`'s: a critical border and `aria-invalid`, with the message under it. */
export const WithAnError: Story = {
  args: { 'aria-label': undefined, defaultValue: '' },
  render: (args) => (
    <Field label="Old Password" error="Old password is required">
      <PasswordField {...args} fullWidth placeholder="Enter your current password" />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByLabelText('Old Password')).toHaveAttribute('aria-invalid', 'true');
    await expect(c.getByText('Old password is required')).toBeVisible();
  },
};

/** Controlled: the page shows or hides several fields together. */
export const Controlled: Story = {
  render: (args) => {
    const [visible, setVisible] = React.useState(false);
    return (
      <div className="flex flex-col gap-3">
        <PasswordField {...args} aria-label="New password" visible={visible} onVisibleChange={setVisible} />
        <PasswordField {...args} aria-label="Confirm password" visible={visible} onVisibleChange={setVisible} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getAllByRole('button', { name: 'Show password' })[0]);
    await waitFor(() => expect(c.getByLabelText('New password')).toHaveAttribute('type', 'text'));
    await waitFor(() => expect(c.getByLabelText('Confirm password')).toHaveAttribute('type', 'text'));
  },
};

/** Reports a press, and the field is not changed by it from outside. */
export const ReportsAPress: Story = {
  args: { onVisibleChange: fn() },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Show password' }));
    await expect(args.onVisibleChange).toHaveBeenCalledWith(true);
  },
};

/** Disabled locks the eye too. */
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByLabelText('Password')).toBeDisabled();
    await expect(c.getByRole('button', { name: 'Show password' })).toBeDisabled();
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

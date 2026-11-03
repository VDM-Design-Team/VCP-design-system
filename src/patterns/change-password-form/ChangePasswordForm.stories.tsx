import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ChangePasswordForm, type PasswordVerdict } from './ChangePasswordForm';

/* A toy rule — the page's real one is product policy. The same shape as PasswordStrength's story. */
const getStrength = (v: string): PasswordVerdict => {
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(v)).length;
  const points = (v.length >= 8 ? 1 : 0) + (v.length >= 12 ? 1 : 0) + classes - 1;
  const strength = (['very-weak', 'weak', 'fair', 'good', 'strong'] as const)[Math.max(0, Math.min(4, points))];
  return { strength, message: strength === 'very-weak' || strength === 'weak' ? 'Add a number or a symbol' : undefined };
};

const meta = {
  title: 'Patterns/ChangePasswordForm',
  component: ChangePasswordForm,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The Password tab of Settings: the old password, the new one with a strength meter, the new one again, and Set Password. ' +
          'It keeps its own draft and hands the old and new passwords to `onSubmit`; the page scores the strength.',
      },
    },
  },
  args: { onSubmit: fn(), getStrength },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChangePasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const type = async (c: ReturnType<typeof within>, name: string, text: string) =>
  userEvent.type(c.getByLabelText(name, { selector: 'input' }), text);

/** Figma's tab: Old, New and Confirm Password, and Set Password. Valid, it hands over the old and new passwords. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByPlaceholderText('Enter your current password')).toBeVisible();
    await expect(c.getByPlaceholderText('Enter a strong password')).toBeVisible();
    await expect(c.getByPlaceholderText('Confirm your new password')).toBeVisible();
    /* Dots until an eye is pressed; each field has its own. */
    await expect(c.getByLabelText('Old Password', { selector: 'input' })).toHaveAttribute('type', 'password');
    await expect(c.getAllByRole('button', { name: 'Show password' })).toHaveLength(3);

    await type(c, 'Old Password', 'old-secret');
    await type(c, 'New Password', 'Correct-horse-9');
    await type(c, 'Confirm Password', 'Correct-horse-9');
    await userEvent.click(c.getByRole('button', { name: 'Set Password' }));
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalledWith({ oldPassword: 'old-secret', newPassword: 'Correct-horse-9' }));
  },
};

/** Autocomplete tells a password manager which is which. */
export const AutoComplete: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByLabelText('Old Password', { selector: 'input' })).toHaveAttribute('autocomplete', 'current-password');
    await expect(c.getByLabelText('New Password', { selector: 'input' })).toHaveAttribute('autocomplete', 'new-password');
    await expect(c.getByLabelText('Confirm Password', { selector: 'input' })).toHaveAttribute('autocomplete', 'new-password');
  },
};

/** The strength meter appears under New Password as you type, and the field is described by it — the meter is not announced on its own. */
export const StrengthMeter: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole('meter')).toBeNull();
    await type(c, 'New Password', 'abc');
    /* The meter is rendered a beat after the keystrokes. */
    await expect(await c.findByRole('meter')).toHaveAttribute('aria-valuetext', 'Very Weak');
    await expect(await c.findByText('Add a number or a symbol')).toBeVisible();
    await userEvent.clear(c.getByLabelText('New Password', { selector: 'input' }));
    await type(c, 'New Password', 'Correct-horse-9-battery');
    await waitFor(() => expect(c.getByRole('meter')).toHaveAttribute('aria-valuetext', 'Strong'));
    /* Focusing the field reads the strength. */
    const meterRoot = c.getByRole('meter').closest('[id]') as HTMLElement;
    await expect(c.getByLabelText('New Password', { selector: 'input' }).getAttribute('aria-describedby')).toContain(meterRoot.id);
  },
};

/** No `getStrength`, no meter. */
export const WithoutAMeter: Story = {
  args: { getStrength: undefined },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await type(c, 'New Password', 'abc');
    /* Give a would-be meter its beat to appear, then check it did not. */
    await expect(c.getByLabelText('New Password', { selector: 'input' })).toHaveValue('abc');
    await expect(c.queryByRole('meter')).toBeNull();
  },
};

/** Set Password with nothing filled in: Figma's own words under each field, focus on the first, and it does not go through. */
export const Validation: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Set Password' }));
    await expect(await c.findByText('Old password is required')).toBeVisible();
    await expect(await c.findByText('New password is required')).toBeVisible();
    await expect(await c.findByText('Password confirmation is required')).toBeVisible();
    await expect(args.onSubmit).not.toHaveBeenCalled();
    await waitFor(() => expect(c.getByLabelText('Old Password', { selector: 'input' })).toHaveFocus());
    /* Fixing a field clears what was said about it. */
    await type(c, 'Old Password', 'x');
    await waitFor(() => expect(c.queryByText('Old password is required')).toBeNull());
  },
};

/** A confirmation that is not the new password. (Figma draws no such error; this is an addition.) */
export const Mismatch: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await type(c, 'Old Password', 'old-secret');
    await type(c, 'New Password', 'Correct-horse-9');
    await type(c, 'Confirm Password', 'Correct-horse-8');
    await userEvent.click(c.getByRole('button', { name: 'Set Password' }));
    await expect(await c.findByText('Passwords do not match')).toBeVisible();
    await waitFor(() => expect(c.getByLabelText('Confirm Password', { selector: 'input' })).toHaveFocus());
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

/** What only the server knows. */
export const ServerErrors: Story = {
  args: { errors: { oldPassword: 'Old password is incorrect' } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Old password is incorrect')).toBeVisible();
    await expect(c.getByLabelText('Old Password', { selector: 'input' })).toHaveAttribute('aria-invalid', 'true');
  },
};

/** While Set Password is in flight, the button spins and every field (and eye) is locked. */
export const Saving: Story = {
  args: { saving: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('button', { name: 'Set Password' })).toHaveAttribute('aria-busy', 'true');
    await expect(c.getByLabelText('Old Password', { selector: 'input' })).toBeDisabled();
    for (const eye of c.getAllByRole('button', { name: 'Show password' })) await expect(eye).toBeDisabled();
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ChangePasswordForm } from './ChangePasswordForm';
import { scorePassword } from '../../lib/password-strength';

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
  args: { onSubmit: fn() },
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
    /* The one rule is said before Set Password, and the field is described by it. */
    await expect(c.getByLabelText('New Password', { selector: 'input' })).toHaveAccessibleDescription('At least 8 characters');

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
    /* Scored 300ms after the last keystroke. */
    await expect(await c.findByRole('meter')).toHaveAttribute('aria-valuetext', 'Very Weak');
    await expect(await c.findByText('Your password is too simple')).toBeVisible();
    await userEvent.clear(c.getByLabelText('New Password', { selector: 'input' }));
    await type(c, 'New Password', 'Correct-horse-9-battery');
    await waitFor(() => expect(c.getByRole('meter')).toHaveAttribute('aria-valuetext', 'Strong'));
    /* Focusing the field reads the strength. */
    const meterRoot = c.getByRole('meter').closest('[id]') as HTMLElement;
    await expect(c.getByLabelText('New Password', { selector: 'input' }).getAttribute('aria-describedby')).toContain(meterRoot.id);
  },
};

/** `getStrength={null}`: no meter. */
export const WithoutAMeter: Story = {
  args: { getStrength: null },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await type(c, 'New Password', 'abc');
    /* Give a would-be meter its beat to appear, then check it did not. */
    await expect(c.getByLabelText('New Password', { selector: 'input' })).toHaveValue('abc');
    await expect(c.queryByRole('meter')).toBeNull();
  },
};

/** VCP's score: length + (kinds − 1) − 2 for a common password, clamped to 0–4. */
export const Scoring: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  play: async () => {
    const cases: Array<[string, number, string | undefined]> = [
      ['abc', 0, 'Your password is too simple'],
      ['abcdefgh', 1, 'Your password is too simple'],
      ['abcdefg1', 2, undefined],
      ['Abcdefg1', 3, undefined],
      ['abcdefghijkl', 2, undefined],
      ['Abcdefghijk1!', 4, undefined],
      ['PASSWORD', 0, 'Your password contains common patterns'],
      ['Password', 0, 'Your password contains common patterns'],
    ];
    for (const [password, score, message] of cases) {
      const verdict = scorePassword(password);
      await expect([password, verdict.score, verdict.message]).toEqual([password, score, message]);
    }
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
    /* Each field's edge turns critical with its message, not just its `aria-invalid`. */
    const edge = (name: string) => c.getByLabelText(name, { selector: 'input' }).closest('div');
    for (const name of ['Old Password', 'New Password', 'Confirm Password']) {
      await expect(edge(name)).toHaveClass('border-accent-critical-outline-border-default');
    }
    /* Fixing a field clears what was said about it, and its edge with it. */
    await type(c, 'Old Password', 'x');
    await waitFor(() => expect(c.queryByText('Old password is required')).toBeNull());
    await expect(edge('Old Password')).not.toHaveClass('border-accent-critical-outline-border-default');
  },
};

/** Eight characters at least; strength is advice, not a gate. */
export const TooShort: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await type(c, 'Old Password', 'old-secret');
    await type(c, 'New Password', 'Ab1!');
    await type(c, 'Confirm Password', 'Ab1!');
    await userEvent.click(c.getByRole('button', { name: 'Set Password' }));
    await expect(await c.findByText('Password must be at least 8 characters')).toBeVisible();
    await expect(args.onSubmit).not.toHaveBeenCalled();
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

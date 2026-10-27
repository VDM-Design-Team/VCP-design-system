import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { PasswordStrength, type PasswordStrengthLevel } from './PasswordStrength';
import { Input } from '../../atoms/input';

const meta = {
  title: 'Components/Forms/PasswordStrength',
  component: PasswordStrength,
  parameters: {
    docs: {
      description: {
        component:
          'A labelled five-step meter for the password being typed. The caller scores the ' +
          'password and passes `strength`; this only draws and announces it. Colour is never the ' +
          'only signal — the level is printed and read out as `aria-valuetext`.',
      },
    },
  },
  args: { strength: 'very-weak', message: 'Your password is too simple' },
  argTypes: {
    strength: { control: 'radio', options: ['very-weak', 'weak', 'fair', 'good', 'strong'] },
    label: { control: 'text' },
    message: { control: 'text' },
  },
} satisfies Meta<typeof PasswordStrength>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-96">
      <PasswordStrength {...args} />
    </div>
  ),
};

const LEVELS: Array<[PasswordStrengthLevel, string, string?]> = [
  ['very-weak', 'Very Weak', 'Your password is too simple'],
  ['weak', 'Weak', 'Add a number or a symbol'],
  ['fair', 'Fair'],
  ['good', 'Good'],
  ['strong', 'Strong'],
];

/**
 * Five steps, 20% each. Very Weak and Weak both use `critical`; the length
 * tells them apart. Only the two weak levels colour the message.
 */
export const Levels: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-6">
      {LEVELS.map(([strength, , message]) => (
        <PasswordStrength key={strength} strength={strength} label={strength} message={message} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const meters = within(canvasElement).getAllByRole('meter');
    expect(meters.map((m) => m.getAttribute('aria-valuetext'))).toEqual(
      LEVELS.map(([, text]) => text),
    );
    expect(meters.map((m) => m.getAttribute('aria-valuenow'))).toEqual(['1', '2', '3', '4', '5']);
  },
};

/** The caller owns the scoring: here, a toy rule driving the meter as you type. */
export const WithAPasswordField: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    const score = (v: string): PasswordStrengthLevel => {
      const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(v)).length;
      const points = (v.length >= 8 ? 1 : 0) + (v.length >= 12 ? 1 : 0) + classes - 1;
      return (['very-weak', 'weak', 'fair', 'good', 'strong'] as const)[
        Math.max(0, Math.min(4, v ? points : 0))
      ];
    };
    const strength = score(value);
    return (
      <div className="flex w-96 flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-label-sm-medium text-text-primary">
          New password
          <Input
            type="password"
            fullWidth
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="new-password"
          />
        </label>
        <PasswordStrength
          strength={strength}
          message={
            strength === 'very-weak' || strength === 'weak' ? 'Your password is too simple' : undefined
          }
        />
      </div>
    );
  },
};

/** Fills and track are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex flex-col gap-6 bg-surface-canvas p-8">
            {LEVELS.map(([strength, , message]) => (
              <PasswordStrength key={strength} strength={strength} message={message} />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Stepper } from './Stepper';
import { Field } from '../field';

const meta = {
  title: 'Components/Forms/Stepper',
  component: Stepper,
  parameters: {
    docs: {
      description: {
        component:
          'A small number chosen by nudging — capacity points, a quantity. Minus, a typeable ' +
          'value, plus. Typing is draft-based: half-typed states pass through and the value ' +
          'commits clamped on blur or Enter; Arrow Up/Down nudge. For free-form numbers use ' +
          '`Input` with `inputMode="numeric"`.',
      },
    },
  },
  args: { value: 12, label: 'Capacity points' },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md'] },
    variant: { control: 'radio', options: ['plus-minus', 'up-down'] },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Live: nudge, type past the range and blur — it commits clamped. */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value);
    return <Stepper {...args} value={value} onChange={setValue} max={40} />;
  },
  play: async ({ canvasElement }) => {
    /* A control's boundary is `stroke.strong` (slate-500, #64748b) — 4.76:1 on the field. */
    const shell = canvasElement.querySelector('input')!.closest('[class*="border-stroke-strong"]')!;
    await expect(getComputedStyle(shell).borderTopColor).toBe('rgb(100, 116, 139)');
  },
};

/**
 * `variant="up-down"` — the number-input layout: value left, one up/down caret
 * pair at the end. The carets leave the tab order; Arrow Up/Down is the
 * keyboard path. Behaviour is the same as `plus-minus`, including the ends.
 */
export const UpDown: Story = {
  args: { variant: 'up-down', value: 12, label: 'Capacity points' },
  render: (args) => {
    const [value, setValue] = React.useState(args.value);
    return (
      <div className="flex items-center gap-6">
        <Stepper {...args} value={value} onChange={setValue} max={13} />
        <Stepper {...args} size="sm" value={value} onChange={setValue} max={13} label="Dense" />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const [field] = c.getAllByRole('textbox');
    await userEvent.click(c.getAllByRole('button', { name: 'Increase Capacity points' })[0]);
    await expect(field).toHaveValue('13');
    /* At max the up caret is dead, the down caret is not. */
    await expect(c.getAllByRole('button', { name: 'Increase Capacity points' })[0]).toBeDisabled();
    /* Hitting the limit disables a caret, not the field: the shell keeps its
       resting border and the input stays enabled. */
    await expect(field).toBeEnabled();
    await expect(getComputedStyle(field.parentElement!).borderTopColor).toBe('rgb(100, 116, 139)');
    await userEvent.type(field, '{ArrowDown}');
    await expect(field).toHaveValue('12');
    /* Carets are a pointer affordance, not extra tab stops. */
    await expect(c.getAllByRole('button', { name: 'Decrease Capacity points' })[0]).toHaveAttribute('tabindex', '-1');
  },
};

/** The buttons die at the ends; the value can still be typed and re-clamped. */
export const AtTheEnds: Story = {
  render: (args) => {
    const [a, setA] = React.useState(0);
    const [b, setB] = React.useState(40);
    return (
      <div className="flex gap-6">
        <Stepper {...args} label="At minimum" value={a} min={0} max={40} onChange={setA} />
        <Stepper {...args} label="At maximum" value={b} min={0} max={40} onChange={setB} />
      </div>
    );
  },
};

/** `suffix` names the unit inline; the accessible name still comes from `label`. */
export const WithSuffix: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(12);
    return <Stepper {...args} value={value} onChange={setValue} suffix="pts" max={40} />;
  },
};

/** `step` snaps the nudge; typed values are clamped but not snapped. */
export const SteppingByFive: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(10);
    return <Stepper {...args} label="Batch size" value={value} step={5} max={100} onChange={setValue} />;
  },
};

/** Inside a Field — its label points at the input, so omit `label` here or keep them identical. */
export const InAField: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(12);
    return (
      <Field label="Capacity points" helper="Consumed as work lands.">
        <Stepper {...args} value={value} onChange={setValue} max={40} />
      </Field>
    );
  },
};

/**
 * `invalid` alone is the critical border; `error` adds the caption and implies
 * `invalid`. Either variant. The caption is announced and tied to the input.
 */
export const Invalid: Story = {
  args: { value: 45, label: 'Capacity points' },
  render: (args) => (
    <div className="flex items-start gap-8">
      <Stepper {...args} error="Max 40 points" />
      <Stepper {...args} variant="up-down" error="Max 40 points" label="Capacity points, up-down" />
      <Stepper {...args} variant="up-down" invalid label="Capacity points, border only" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const [first] = c.getAllByRole('textbox');
    const alert = c.getAllByRole('alert')[0];
    await expect(alert).toHaveTextContent('Max 40 points');
    await expect(first).toHaveAttribute('aria-invalid', 'true');
    await expect(first).toHaveAttribute('aria-describedby', alert.id);
    /* accent.critical.outline.border.default, not the resting stroke.strong. */
    await expect(getComputedStyle(first.parentElement!).borderTopColor).not.toBe('rgb(100, 116, 139)');
    /* Border-only: invalid with no caption has nothing to point at. */
    await expect(c.getAllByRole('alert')).toHaveLength(2);
    await expect(c.getAllByRole('textbox')[2]).not.toHaveAttribute('aria-describedby');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

/** Shell, buttons and value are tokens, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="flex gap-6 bg-surface-canvas p-8">
            <Stepper {...args} value={12} suffix="pts" />
            <Stepper {...args} value={12} disabled />
            <Stepper {...args} variant="up-down" value={12} />
          </div>
        </div>
      ))}
    </div>
  ),
};

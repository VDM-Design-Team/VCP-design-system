import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { Stepper } from './Stepper';
import { Field } from '../../components/field';

const meta = {
  title: 'Atoms/Stepper',
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

/**
 * A field with no value yet shows its placeholder ("Set Budget") in italic `text.tertiary`. Nudging up gives it the
 * minimum; down has nothing to go to. Clearing the field and leaving it takes the value back to nothing (`onClear`).
 */
export const EmptyUntilSet: Story = {
  args: { variant: 'up-down', size: 'sm', value: null, label: 'Allocated points', placeholder: 'Set Budget', min: 0 },
  render: (args) => {
    const [value, setValue] = React.useState<number | null>(null);
    return <Stepper {...args} value={value} onChange={setValue} onClear={() => setValue(null)} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const field = c.getByRole('textbox', { name: 'Allocated points' });
    await expect(field).toHaveValue('');
    await expect(field).toHaveAttribute('placeholder', 'Set Budget');
    /* Nothing to step down to. */
    await expect(c.getByRole('button', { name: 'Decrease Allocated points' })).toBeDisabled();
    await userEvent.click(c.getByRole('button', { name: 'Increase Allocated points' }));
    await expect(field).toHaveValue('0');
    await userEvent.clear(field);
    await userEvent.type(field, '120{Enter}');
    await expect(field).toHaveValue('120');
    /* Cleared and committed, it is empty again. */
    await userEvent.clear(field);
    await userEvent.tab();
    await expect(field).toHaveValue('');
  },
};

/**
 * Hold a button and it keeps stepping: once at once, then — after a beat — repeatedly until it is let go. A single
 * click is still a single step, and the keyboard is unchanged.
 */
export const HoldToRepeat: Story = {
  args: { variant: 'up-down', value: 0, label: 'Capacity points', max: 60 },
  render: (args) => {
    const [value, setValue] = React.useState(0);
    return <Stepper {...args} value={value} onChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const field = c.getByRole('textbox', { name: 'Capacity points' }) as HTMLInputElement;
    const up = c.getByRole('button', { name: 'Increase Capacity points' });

    /* A click is one step — the press steps, and the click that follows it does not step again. */
    await userEvent.click(up);
    await expect(field).toHaveValue('1');

    /* Held: the press steps at once, then carries on after the pause. */
    fireEvent.pointerDown(up, { button: 0, pointerType: 'mouse' });
    await waitFor(() => expect(field).toHaveValue('2'));
    await waitFor(() => expect(Number(field.value)).toBeGreaterThan(5), { timeout: 3000 });
    fireEvent.pointerUp(up, { button: 0, pointerType: 'mouse' });

    /* Let go, it stops. */
    const stopped = field.value;
    await new Promise((resolve) => setTimeout(resolve, 300));
    await expect(field.value).toBe(stopped);

    /* The keyboard is untouched: Enter on a focused caret is one step. */
    up.focus();
    await userEvent.keyboard('{Enter}');
    await expect(Number(field.value)).toBe(Number(stopped) + 1);
  },
};

/** Held to the end, it stops there: the caret is dead at the maximum and the value never passes it. */
export const HoldStopsAtTheEnd: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { variant: 'up-down', value: 0, label: 'Capacity points', max: 3 },
  render: (args) => {
    const [value, setValue] = React.useState(0);
    return <Stepper {...args} value={value} onChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const field = c.getByRole('textbox', { name: 'Capacity points' });
    const up = c.getByRole('button', { name: 'Increase Capacity points' });
    fireEvent.pointerDown(up, { button: 0, pointerType: 'mouse' });
    await waitFor(() => expect(field).toHaveValue('3'), { timeout: 3000 });
    await expect(up).toBeDisabled();
    await new Promise((resolve) => setTimeout(resolve, 300));
    await expect(field).toHaveValue('3');
  },
};

/** Held up from an empty field, it gives it its first number and carries on from there. */
export const HoldFromEmpty: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { variant: 'up-down', value: null, label: 'Allocated points', placeholder: 'Set Budget', max: 60 },
  render: (args) => {
    const [value, setValue] = React.useState<number | null>(null);
    return <Stepper {...args} value={value} onChange={setValue} onClear={() => setValue(null)} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const field = c.getByRole('textbox', { name: 'Allocated points' }) as HTMLInputElement;
    const up = c.getByRole('button', { name: 'Increase Allocated points' });
    fireEvent.pointerDown(up, { button: 0, pointerType: 'mouse' });
    await waitFor(() => expect(Number(field.value)).toBeGreaterThan(4), { timeout: 3000 });
    fireEvent.pointerUp(up, { button: 0, pointerType: 'mouse' });
  },
};

/**
 * `commitDelay` commits what is typed after a pause in typing, without leaving the field — so whatever is derived from the
 * value (a total, a bar) follows while it is typed. Off by default: a stepper commits on blur or Enter.
 */
export const CommitAfterAPause: Story = {
  args: { variant: 'up-down', value: 10, label: 'Allocated points', commitDelay: 250 },
  render: (args) => {
    const [value, setValue] = React.useState<number | null>(10);
    return (
      <div className="flex items-center gap-4">
        <Stepper {...args} value={value} onChange={setValue} />
        <span className="font-sans text-caption-md-medium text-text-tertiary">
          Committed: <output aria-label="Committed value">{value}</output>
        </span>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const field = c.getByRole('textbox', { name: 'Allocated points' });
    await userEvent.clear(field);
    await userEvent.type(field, '45');
    /* Still typing: nothing has been committed yet… */
    await expect(c.getByLabelText('Committed value')).toHaveTextContent('10');
    /* …after the pause it is, and the field keeps focus. */
    await waitFor(() => expect(c.getByLabelText('Committed value')).toHaveTextContent('45'));
    await expect(field).toHaveFocus();
  },
};

/** Only a number can be typed: letters are dropped as they are typed, and a minus only where the range goes below zero. */
export const OnlyNumbers: Story = {
  args: { variant: 'up-down', value: 0, label: 'Points' },
  render: (args) => (
    <div className="flex items-center gap-4">
      <Stepper {...args} label="Points" min={0} value={0} />
      <Stepper {...args} label="Balance" min={-50} value={0} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const points = c.getByRole('textbox', { name: 'Points' });
    await userEvent.clear(points);
    await userEvent.type(points, 'a1b2-3.');
    await expect(points).toHaveValue('123');
    const balance = c.getByRole('textbox', { name: 'Balance' });
    await userEvent.clear(balance);
    await userEvent.type(balance, '-4x2');
    await expect(balance).toHaveValue('-42');
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

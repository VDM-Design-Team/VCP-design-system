import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
          </div>
        </div>
      ))}
    </div>
  ),
};

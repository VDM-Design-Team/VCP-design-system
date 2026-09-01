import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toggle } from './Toggle';

const meta = {
  title: 'Forms/Toggle',
  component: Toggle,
  parameters: {
    docs: {
      description: {
        component:
          'An on/off switch that commits immediately — flipping it *is* the action, there is no ' +
          'Save. Use a Checkbox instead when the value only takes effect once a form is submitted. ' +
          'The knob position, not the track colour, is what carries the state.',
      },
    },
  },
  args: { label: 'Email notifications' },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onChange: { action: 'changed' },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = { args: { checked: false } };
export const On: Story = { args: { checked: true } };
export const DisabledOff: Story = { args: { checked: false, disabled: true } };
export const DisabledOn: Story = { args: { checked: true, disabled: true } };

/** The label is inside the `<label>`, so clicking the text toggles too. */
export const WithLabel: Story = {
  args: { label: 'Share usage data', defaultChecked: true, checked: undefined },
};

/** No visible label means `aria-label` is mandatory — the switch is otherwise unnamed. */
export const WithoutLabel: Story = {
  args: { label: undefined, checked: undefined, 'aria-label': 'Email notifications' },
};

/**
 * The realistic case: a settings list. The row title names the switch via
 * `aria-labelledby`, and `-mr-2` pulls the Toggle's touch padding flush with
 * the row edge without shrinking the target.
 */
export const SettingsRow: Story = {
  args: { label: undefined, checked: undefined },
  render: () => {
    const rows = [
      {
        id: 'setting-email',
        title: 'Email notifications',
        description: 'Send a digest when a claim changes status.',
        defaultChecked: true,
      },
      {
        id: 'setting-sms',
        title: 'SMS alerts',
        description: 'Text the primary contact for urgent claims only.',
        defaultChecked: false,
      },
      {
        id: 'setting-sso',
        title: 'Enforce SSO',
        description: 'Locked by your organisation administrator.',
        defaultChecked: true,
        disabled: true,
      },
    ];
    return (
      <div className="w-96 divide-y divide-stroke-subtle rounded-md border border-stroke-subtle bg-surface-elevated">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <span className="flex flex-col gap-1">
              <span id={row.id} className="font-sans text-label-lg text-text-primary">
                {row.title}
              </span>
              <span className="font-sans text-body-sm text-text-tertiary">{row.description}</span>
            </span>
            <Toggle
              className="-mr-2"
              aria-labelledby={row.id}
              defaultChecked={row.defaultChecked}
              disabled={row.disabled}
            />
          </div>
        ))}
      </div>
    );
  },
};

function ControlledDemo() {
  const [on, setOn] = React.useState(false);
  return (
    <div className="flex flex-col items-start gap-2">
      <Toggle checked={on} onChange={setOn} label="Maintenance mode" />
      <p className="font-sans text-body-sm text-text-tertiary">
        Maintenance mode is <strong className="text-text-primary">{on ? 'on' : 'off'}</strong>.
      </p>
    </div>
  );
}

/** `onChange` hands back the next boolean, so the parent owns the value. */
export const Controlled: Story = {
  args: { label: undefined, checked: undefined },
  render: () => <ControlledDemo />,
};

/** Every colour is a semantic token, so the dark theme comes for free. */
export const LightAndDark: Story = {
  args: { label: undefined, checked: undefined },
  render: () => {
    const set = (
      <div className="flex flex-col gap-2">
        <Toggle label="Off" defaultChecked={false} />
        <Toggle label="On" defaultChecked />
        <Toggle label="Disabled, off" defaultChecked={false} disabled />
        <Toggle label="Disabled, on" defaultChecked disabled />
      </div>
    );
    return (
      <div className="flex gap-4">
        <div className="rounded-md bg-surface-canvas p-4">{set}</div>
        <div className="dark rounded-md bg-surface-canvas p-4">{set}</div>
      </div>
    );
  },
};

import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Toggle } from './Toggle';
import { Field } from '../../components/field';
import { useFakeSave } from '../../lib/story-saving';

const meta = {
  title: 'Atoms/Toggle',
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
    status: { control: 'inline-radio', options: ['idle', 'pending', 'success', 'error'] },
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

/* ---------------------------------------------------------------------------
 * Saving a change. The parent drives `status`; the switch only shows it.
 * The contract is docs/saving-states.md.
 * ------------------------------------------------------------------------- */

const BothThemes = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-4">
    <div className="rounded-md bg-surface-canvas p-4">{children}</div>
    <div className="dark rounded-md bg-surface-canvas p-4">{children}</div>
  </div>
);

/** A save in flight: the knob carries a spinner, the input is `aria-busy`, and further flips are ignored. */
export const Pending: Story = {
  args: { checked: true, status: 'pending', label: 'Email notifications' },
  render: (args) => (
    <BothThemes>
      <Toggle {...args} />
    </BothThemes>
  ),
};

/** The save landed: a check in the knob for the moment the parent leaves it there. */
export const Success: Story = {
  args: { checked: true, status: 'success', label: 'Email notifications' },
  render: (args) => (
    <BothThemes>
      <Toggle {...args} />
    </BothThemes>
  ),
};

/**
 * The save failed. The track takes the critical ring and the input
 * `aria-invalid`; the message belongs to `Field`. The parent has kept the
 * previous state, which is why the switch is still off.
 */
export const ErrorState: Story = {
  args: { checked: false, status: 'error', label: 'Email notifications' },
  render: (args) => (
    <BothThemes>
      <Field error="Couldn’t save. Try again.">
        {(control) => <Toggle {...args} {...control} />}
      </Field>
    </BothThemes>
  ),
};

/* ---------------------------------------------------------------------------
 * Interaction tests. Each `play` runs in the browser under `npm test`.
 * ------------------------------------------------------------------------- */

/** Clicking the label flips the switch — the text is inside the `<label>`. */
export const FlipsOnClick: Story = {
  args: { checked: undefined, defaultChecked: false, label: 'Email notifications' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch', { name: 'Email notifications' });
    await expect(toggle).not.toBeChecked();
    await userEvent.click(canvas.getByText('Email notifications'));
    await expect(toggle).toBeChecked();
    await userEvent.click(toggle);
    await expect(toggle).not.toBeChecked();
  },
};

/** Tab reaches it, Space flips it — both native to the checkbox underneath. */
export const KeyboardSpace: Story = {
  args: { checked: undefined, defaultChecked: false, label: 'Email notifications' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch', { name: 'Email notifications' });
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(toggle).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(toggle).not.toBeChecked();
  },
};

/** The parent's half of the contract, from the shared story helper. */
function SavingSwitch({ outcome }: { outcome: 'resolve' | 'reject' }) {
  const { value, status, error, save } = useFakeSave(false, outcome);
  return (
    <Field error={error}>
      {(control) => (
        <Toggle label="Email notifications" checked={value} onChange={save} status={status} {...control} />
      )}
    </Field>
  );
}

/** Flip, wait, saved: pending → success → idle, each observable, and a flip during pending is ignored. */
export const SaveSucceeds: Story = {
  args: { checked: undefined, label: undefined },
  render: () => <SavingSwitch outcome="resolve" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch', { name: 'Email notifications' });
    const wrapper = toggle.closest('label') as HTMLElement;
    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();
    await expect(toggle).toHaveAttribute('aria-busy', 'true');
    await expect(wrapper).toHaveAttribute('data-status', 'pending');
    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();
    await waitFor(() => expect(wrapper).toHaveAttribute('data-status', 'success'));
    await expect(toggle).not.toHaveAttribute('aria-busy');
    await waitFor(() => expect(wrapper).toHaveAttribute('data-status', 'idle'), { timeout: 3000 });
    await expect(toggle).toBeChecked();
  },
};

/** Flip, wait, failed: the switch goes back, the message is announced and wired to the input. */
export const SaveFails: Story = {
  args: { checked: undefined, label: undefined },
  render: () => <SavingSwitch outcome="reject" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch', { name: 'Email notifications' });
    const wrapper = toggle.closest('label') as HTMLElement;
    await userEvent.click(toggle);
    await expect(wrapper).toHaveAttribute('data-status', 'pending');
    await waitFor(() => expect(wrapper).toHaveAttribute('data-status', 'error'));
    await expect(toggle).not.toBeChecked();
    await expect(toggle).toHaveAttribute('aria-invalid', 'true');
    const message = canvas.getByRole('alert');
    await expect(message).toHaveTextContent('Couldn’t save');
    await expect(toggle).toHaveAttribute('aria-describedby', message.id);
    await userEvent.click(toggle);
    await expect(wrapper).toHaveAttribute('data-status', 'pending');
  },
};

import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field } from './Field';
import { Button } from '../../atoms/button';
import { Input } from '../../atoms/input';
import { Select } from '../../atoms/select';
import { Textarea } from '../../atoms/textarea';
import { expect, userEvent, within } from 'storybook/test';

/**
 * A plain control used only to demonstrate Field. Replace with the real
 * Input/Select/Textarea primitives once they land.
 */
function DemoInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        'h-10 w-full rounded-md border border-stroke-default bg-surface-elevated px-3 ' +
        'font-sans text-body-sm-regular text-text-primary placeholder:text-text-subtle ' +
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused ' +
        'aria-invalid:border-accent-critical-outline-border-default'
      }
    />
  );
}

function DemoTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={3}
      className={
        'w-full rounded-md border border-stroke-default bg-surface-elevated p-3 ' +
        'font-sans text-body-sm-regular text-text-primary placeholder:text-text-subtle ' +
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused ' +
        'aria-invalid:border-accent-critical-outline-border-default'
      }
    />
  );
}

function DemoSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={
        'h-10 w-full rounded-md border border-stroke-default bg-surface-elevated px-3 ' +
        'font-sans text-body-sm-regular text-text-primary ' +
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused'
      }
    >
      <option>Draft</option>
      <option>In review</option>
      <option>Published</option>
    </select>
  );
}

const meta = {
  title: 'Components/Forms/Field',
  component: Field,
  parameters: {
    docs: {
      description: {
        component:
          'The wrapper every form control sits in. It owns the label, the required marker, the ' +
          'optional "+" affordance for repeatable groups, and the single message slot below the ' +
          'control — helper text, replaced by the error message when the field is invalid. ' +
          'Field generates the control id and wires `htmlFor`, `aria-describedby` and ' +
          '`aria-invalid` for you.',
      },
    },
  },
  args: {
    label: 'Supplier name',
    children: <DemoInput placeholder="Acme Logistics" />,
  },
  argTypes: {
    variant: { control: 'radio', options: ['stacked', 'inline'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
  decorators: [
    (Story) => (
      <div className="w-96 max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHelper: Story = {
  args: { helper: 'The legal entity name, as it appears on the contract.' },
};

export const WithError: Story = {
  args: {
    helper: 'The legal entity name, as it appears on the contract.',
    error: 'Enter a supplier name.',
    children: <DemoInput defaultValue="" />,
  },
  parameters: {
    docs: {
      description: {
        story: '`error` replaces `helper` entirely — the two never show at once.',
      },
    },
  },
};

export const Required: Story = {
  args: { required: true, helper: 'Required for onboarding.' },
};

export const WithAddAffordance: Story = {
  args: {
    label: 'Contact email',
    required: true,
    onAdd: () => {},
    helper: 'Use the + to add another contact.',
    children: <DemoInput type="email" placeholder="ops@acme.com" />,
  },
  parameters: {
    docs: {
      description: {
        story:
          'The "+" is an icon-only control, so it carries an `aria-label` — `Add <label>` by ' +
          'default, overridable with `addLabel`.',
      },
    },
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Field {...args} size="sm" label="Small" helper="Dense tables and toolbars." />
      <Field {...args} size="md" label="Medium" helper="The default." />
      <Field {...args} size="lg" label="Large" helper="Marketing and onboarding forms." />
    </div>
  ),
};

export const Inline: Story = {
  args: { variant: 'inline', helper: 'Label sits beside the control.' },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl">
        <Story />
      </div>
    ),
  ],
};

export const WrappingDifferentControls: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Field {...args} label="Supplier name" helper="Free text.">
        <DemoInput placeholder="Acme Logistics" />
      </Field>
      <Field {...args} label="Notes" helper="Visible to the buyer.">
        <DemoTextarea placeholder="Anything the buyer should know…" />
      </Field>
      <Field {...args} label="Status" error="Pick a status before publishing.">
        <DemoSelect />
      </Field>
      <Field {...args} label="Attachments" helper="Up to five files.">
        <Button variant="secondary">Choose files…</Button>
      </Field>
    </div>
  ),
};

export const RenderPropControl: Story = {
  args: {
    label: 'Invoice reference',
    helper: 'Wire the control yourself when it is not a single element.',
    children: (controlProps) => (
      <div className="flex items-center gap-2">
        <DemoInput {...controlProps} placeholder="INV-0001" />
        <Button variant="secondary" size="md">
          Look up
        </Button>
      </div>
    ),
  },
};

/**
 * A control that brings its **own `id` or `aria-describedby`** keeps them, and Field works with them. The label points at
 * the control's own id, so clicking it focuses the control, and the helper or error is added to the control's own
 * description instead of dropped: both are read.
 */
export const ControlWithItsOwnIds: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <p id="field-own-ids-format" className="text-body-sm-regular text-text-tertiary">
        Purchase orders look like PO-12345.
      </p>
      <Field label="Purchase order" helper="From the supplier's confirmation.">
        <Input id="field-own-ids-po" aria-describedby="field-own-ids-format" fullWidth />
      </Field>
      <Field label="Invoice" error="Enter the invoice's PO number.">
        <Input id="field-own-ids-invoice" aria-describedby="field-own-ids-format" fullWidth />
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const po = canvas.getByRole('textbox', { name: 'Purchase order' });
    await expect(po).toHaveAttribute('id', 'field-own-ids-po');
    await userEvent.click(canvas.getByText('Purchase order'));
    await expect(po).toHaveFocus();
    await expect(po).toHaveAccessibleDescription("Purchase orders look like PO-12345. From the supplier's confirmation.");

    const invoice = canvas.getByRole('textbox', { name: 'Invoice' });
    await userEvent.click(canvas.getByText('Invoice'));
    await expect(invoice).toHaveFocus();
    await expect(invoice).toHaveAccessibleDescription("Purchase orders look like PO-12345. Enter the invoice's PO number.");
  },
};

export const Loading: Story = {
  args: {
    label: 'Contact email',
    onAdd: () => {},
    loading: true,
    helper: 'Saving… the + is disabled until this settles.',
  },
};

export const DarkTheme: Story = {
  render: (args) => (
    <div className="dark flex flex-col gap-6 rounded-lg bg-surface-canvas p-6">
      <Field {...args} label="Supplier name" helper="The legal entity name." />
      <Field {...args} label="Contact email" required onAdd={() => {}} error="Enter a valid email." />
    </div>
  ),
};

export const LightAndDark: Story = {
  render: (args) => (
    <div className="grid gap-4">
      <div className="flex flex-col gap-6 rounded-lg bg-surface-canvas p-6">
        <Field {...args} required helper="Light theme." />
        <Field {...args} label="Contact email" onAdd={() => {}} error="Enter a valid email." />
      </div>
      <div className="dark flex flex-col gap-6 rounded-lg bg-surface-canvas p-6">
        <Field {...args} required helper="Dark theme." />
        <Field {...args} label="Contact email" onAdd={() => {}} error="Enter a valid email." />
      </div>
    </div>
  ),
};

/**
 * A `Field` with an `error` turns its control's **edge red** as well as showing the message: the control is `aria-invalid`, and `Input`, `Select`, `Textarea` and `SearchSelect` draw the critical border for
 * that — nothing to pass but the `error`.
 */
export const ErrorTurnsTheEdgeRed: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-6">
      <Field label="Name" error="Enter a name.">
        <Input />
      </Field>
      <Field label="Type" error="Select a type.">
        <Select placeholder="Select a type" options={['One', 'Two']} />
      </Field>
      <Field label="Notes" error="Add a note.">
        <Textarea />
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const edge = (el: HTMLElement) => el.closest('[class*="border-accent-critical-outline-border-default"]') ?? el;
    await expect(edge(c.getByRole('textbox', { name: 'Name' })).className).toContain('border-accent-critical-outline-border-default');
    await expect(edge(c.getByRole('combobox', { name: 'Type' })).className).toContain('border-accent-critical-outline-border-default');
    await expect(c.getByRole('textbox', { name: 'Notes' }).className).toContain('border-accent-critical-outline-border-default');
  },
};

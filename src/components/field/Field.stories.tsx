import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field } from './Field';
import { Button } from '../button/Button';

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
        'font-sans text-body-md text-text-primary placeholder:text-text-subtle ' +
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
        'font-sans text-body-md text-text-primary placeholder:text-text-subtle ' +
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
        'font-sans text-body-md text-text-primary ' +
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
  title: 'Forms/Field',
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

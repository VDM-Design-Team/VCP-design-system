import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './Textarea';

const meta = {
  title: 'Forms/Textarea',
  component: Textarea,
  parameters: {
    docs: {
      description: {
        component:
          'Multi-line free text entry. Shares Input’s shell — same radius, border, padding and ' +
          'focus ring — so the two sit together in a form without a visual seam. Use it when the ' +
          'answer is a sentence or more; use Input when it is a single value.',
      },
    },
  },
  args: { placeholder: 'Add a note for the approver…' },
  argTypes: {
    invalid: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    rows: { control: { type: 'number', min: 2, max: 20 } },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A realistic form column: a real `<label for>`, the field, and a hint wired up
 * with `aria-describedby`. Every story uses it — a Textarea without a label is
 * the single most common way to ship this component broken.
 */
const Field = ({
  id,
  label,
  hint,
  critical,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  critical?: boolean;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5 w-96 max-w-full">
    <label htmlFor={id} className="font-sans text-label-lg text-text-primary">
      {label}
    </label>
    {children}
    {hint && (
      <span
        id={`${id}-hint`}
        className={
          'font-sans text-body-sm ' +
          (critical ? 'text-accent-critical-outline-content-default' : 'text-text-tertiary')
        }
      >
        {hint}
      </span>
    )}
  </div>
);

export const Default: Story = {
  render: (args) => (
    <Field id="note" label="Note">
      <Textarea {...args} id="note" />
    </Field>
  ),
};

export const Placeholder: Story = {
  args: { placeholder: 'What changed, and why? Reviewers read this first.' },
  render: (args) => (
    <Field id="summary" label="Change summary" hint="Plain language beats jargon.">
      <Textarea {...args} id="summary" aria-describedby="summary-hint" />
    </Field>
  ),
};

export const Invalid: Story = {
  args: { invalid: true, defaultValue: 'No' },
  render: (args) => (
    <Field
      id="rejection"
      label="Rejection reason"
      hint="A rejection reason needs at least 20 characters."
      critical
    >
      <Textarea {...args} id="rejection" aria-describedby="rejection-hint" />
    </Field>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'Locked once the value assessment is submitted.',
  },
  render: (args) => (
    <Field id="locked" label="Note" hint="Read-only after submission.">
      <Textarea {...args} id="locked" aria-describedby="locked-hint" />
    </Field>
  ),
};

export const WithRows: Story = {
  name: 'With rows',
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Field id="rows-2" label="Two rows">
        <Textarea {...args} id="rows-2" rows={2} />
      </Field>
      <Field id="rows-4" label="Four rows (default)">
        <Textarea {...args} id="rows-4" />
      </Field>
      <Field id="rows-10" label="Ten rows">
        <Textarea {...args} id="rows-10" rows={10} />
      </Field>
    </div>
  ),
};

/**
 * The character count lives in the consuming form, not in the component — the
 * counter is a field-description concern and the limit is business logic. Wire it
 * up with `aria-describedby` and mirror the over-limit state onto `invalid`.
 */
const WithCount = () => {
  const LIMIT = 180;
  const [value, setValue] = React.useState('Supplier missed the Q3 delivery window twice.');
  const over = value.length > LIMIT;
  return (
    <Field id="comment" label="Reviewer comment">
      <Textarea
        id="comment"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        invalid={over}
        aria-describedby="comment-count"
        placeholder="What should the next reviewer know?"
      />
      <span
        id="comment-count"
        aria-live="polite"
        className={
          'self-end font-numeric text-caption-md ' +
          (over ? 'text-accent-critical-outline-content-default' : 'text-text-tertiary')
        }
      >
        {value.length} / {LIMIT}
      </span>
    </Field>
  );
};

export const ControlledWithCharacterCount: Story = {
  name: 'Controlled with character count',
  render: () => <WithCount />,
};

export const FullWidth: Story = {
  name: 'Full width',
  render: (args) => (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fw-on" className="font-sans text-label-lg text-text-primary">
          fullWidth (default) — fills the form column
        </label>
        <Textarea {...args} id="fw-on" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fw-off" className="font-sans text-label-lg text-text-primary">
          {'fullWidth={false}'} — intrinsic width from cols
        </label>
        <Textarea {...args} id="fw-off" fullWidth={false} cols={30} />
      </div>
    </div>
  ),
};

const Panel = ({ scheme, className }: { scheme: string; className: string }) => (
  <div className={'flex flex-col gap-4 rounded-md p-4 bg-surface-canvas ' + className}>
    <span className="font-sans text-label-lg text-text-secondary">{scheme}</span>
    <Field id={`${scheme}-note`} label="Note">
      <Textarea id={`${scheme}-note`} placeholder="Add a note…" />
    </Field>
    <Field id={`${scheme}-reason`} label="Rejection reason" hint="Needs more detail." critical>
      <Textarea id={`${scheme}-reason`} invalid defaultValue="No" aria-describedby={`${scheme}-reason-hint`} />
    </Field>
    <Field id={`${scheme}-locked`} label="Locked">
      <Textarea id={`${scheme}-locked`} disabled defaultValue="Read-only after submission." />
    </Field>
  </div>
);

export const LightAndDark: Story = {
  name: 'Light and dark',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div
      className="grid gap-4 p-4"
      style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))' }}
    >
      <Panel scheme="light" className="" />
      <Panel scheme="dark" className="dark" />
    </div>
  ),
};

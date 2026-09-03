import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { Field } from '../field';
import { Input } from '../../atoms/input';

const meta = {
  title: 'Components/Display/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          'A surface that groups related content on the canvas: an optional title, an optional ' +
          'right-aligned header action, a body, and an optional footer. A Card is a container, ' +
          'not a control — it has no role, no tabindex and no click handler. Put a real link or ' +
          'button inside it instead.',
      },
    },
  },
  args: {
    children:
      'Claims raised in the last 30 days are reconciled nightly. The next run starts at 02:00 UTC.',
  },
  argTypes: {
    headingLevel: { control: 'select', options: [2, 3, 4, 5, 6] },
    padded: { control: 'boolean' },
    title: { control: 'text' },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No title, no footer — just a padded surface. The plainest useful Card. */
export const Default: Story = {
  render: (args) => (
    <div className="w-96">
      <Card {...args} />
    </div>
  ),
};

/** `title` renders a real heading — `h3` by default. */
export const WithTitle: Story = {
  render: (args) => (
    <div className="w-96">
      <Card {...args} title="Reconciliation" />
    </div>
  ),
};

/**
 * The `action` slot is an ordinary child, so it is in the tab order and the
 * screen reader hears it. An icon-only button carries its name in `aria-label`
 * — the glyph itself stays decorative.
 */
export const WithTitleAndAction: Story = {
  render: (args) => (
    <div className="flex w-96 flex-col gap-4">
      <Card
        {...args}
        title="Reconciliation"
        action={
          <Button variant="tertiary" size="sm" aria-label="Reconciliation options">
            <Icon name="dots-three" />
          </Button>
        }
      />
      <Card
        {...args}
        title="Reconciliation"
        action={
          <Button variant="link" size="sm">
            View all
          </Button>
        }
      />
    </div>
  ),
};

/** The footer is a tinted band, divided from the body. Actions live flush right. */
export const WithFooter: Story = {
  render: (args) => (
    <div className="w-96">
      <Card
        {...args}
        title="Reconciliation"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm">
              Skip
            </Button>
            <Button size="sm">Run now</Button>
          </div>
        }
      />
    </div>
  ),
};

/**
 * `padded={false}` hands the body's edges to the content — rows, tables, images.
 * Anything focusable in an unpadded body should carry its own padding, because
 * the card clips to its radius.
 */
export const Unpadded: Story = {
  render: (args) => {
    const rows = [
      { id: 'CLM-4471', status: 'Reconciled' },
      { id: 'CLM-4472', status: 'Pending' },
      { id: 'CLM-4473', status: 'Pending' },
    ];
    return (
      <div className="w-96">
        <Card {...args} title="Recent claims" padded={false}>
          <ul className="divide-y divide-stroke-subtle border-t border-stroke-subtle">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center justify-between px-4 py-3">
                <span className="font-numeric text-caption-md text-text-primary">{row.id}</span>
                <span className="text-body-sm text-text-tertiary">{row.status}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    );
  },
};

/**
 * A Card is the usual home for a short form. The `<form>` owns submission; the
 * Card only groups it. Labels come from `Field`, never from the card title.
 */
export const WithForm: Story = {
  render: (args) => (
    <div className="w-96">
      <Card
        {...args}
        title="Contact details"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button">
              Cancel
            </Button>
            <Button size="sm" type="submit" form="card-contact-form">
              Save
            </Button>
          </div>
        }
      >
        <form id="card-contact-form" className="flex flex-col gap-4">
          <Field label="Full name" required>
            <Input fullWidth placeholder="Ada Lovelace" />
          </Field>
          <Field label="Work email" helper="We only use this for claim notifications.">
            <Input fullWidth type="email" placeholder="ada@example.com" />
          </Field>
        </form>
      </Card>
    </div>
  ),
};

/**
 * Cards in a grid all sit at the same heading level, so the outline stays flat.
 * The grid owns the gutters; the card never sets an outer margin.
 */
export const Grid: Story = {
  render: (args) => {
    const cards = [
      { title: 'Open claims', body: '128 claims are waiting on a first response.' },
      { title: 'Reconciled', body: '1,204 claims cleared in the last 30 days.' },
      { title: 'Escalations', body: '6 claims breached their response window.' },
      { title: 'Drafts', body: '17 claims have never been submitted.' },
      { title: 'Suppliers', body: '42 suppliers are active on the programme.' },
      { title: 'Audits', body: 'The next audit sample is drawn on Monday.' },
    ];
    return (
      <div className="grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card {...args} key={c.title} title={c.title}>
            {c.body}
          </Card>
        ))}
      </div>
    );
  },
};

/** Every colour is a semantic token, so the dark theme comes for free. */
export const LightAndDark: Story = {
  render: (args) => {
    const set = (
      <div className="flex w-80 flex-col gap-4">
        <Card
          {...args}
          title="Reconciliation"
          action={
            <Button variant="tertiary" size="sm" aria-label="Reconciliation options">
              <Icon name="dots-three" />
            </Button>
          }
          footer={
            <div className="flex justify-end">
              <Button size="sm">Run now</Button>
            </div>
          }
        />
        <Card {...args} />
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

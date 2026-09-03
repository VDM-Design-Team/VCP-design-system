import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Popover } from './Popover';
import { Button } from '../../atoms/button';
import { IconButton } from '../../atoms/icon-button';
import { Input } from '../../atoms/input';

const meta = {
  title: 'Components/Overlays/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A floating panel anchored to a trigger. The trigger carries `aria-expanded` and, ' +
          'while open, `aria-controls`. Escape closes and returns focus to the trigger; a click ' +
          'outside closes; moving focus out of the popover closes. It does **not** trap focus — ' +
          'that is Modal’s job — and it does **not** flip or shift to stay on screen: ' +
          'placement is exactly `top` or `bottom`, aligned to one edge. See docs/popover.md.',
      },
    },
  },
  args: {
    trigger: <Button variant="secondary">Open popover</Button>,
    content: 'Deliverables move to In review once every checklist item is signed off.',
  },
  argTypes: {
    placement: { control: 'radio', options: ['top', 'bottom'] },
    align: { control: 'radio', options: ['left', 'right'] },
    width: { control: 'radio', options: ['auto', 'sm', 'md', 'lg'] },
    autoFocus: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-80 items-center justify-center p-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * `bottom` (the default) and `top`. That is the whole placement contract — there
 * is no flipping, so pick the one that fits where the trigger actually sits.
 */
export const Placement: Story = {
  render: (args) => (
    <div className="flex items-center gap-8">
      <Popover
        {...args}
        placement="bottom"
        trigger={<Button variant="secondary">Below</Button>}
        content="Placement “bottom” — the panel opens under the trigger."
      />
      <Popover
        {...args}
        placement="top"
        trigger={<Button variant="secondary">Above</Button>}
        content="Placement “top” — the panel opens over the trigger."
      />
    </div>
  ),
};

/**
 * Interactive content: this is the case for `autoFocus`. The panel exists so the
 * user can operate the control inside it, so focus goes to that control on open,
 * and Escape brings it back to the trigger.
 */
export const InteractiveContent: Story = {
  name: 'With interactive content',
  args: {
    autoFocus: true,
    width: 'md',
    trigger: <IconButton icon="funnel-simple" label="Filter deliverables" variant="secondary" />,
    content: (
      <div className="flex flex-col gap-3">
        <Input aria-label="Owner" placeholder="Search people" fullWidth />
        <div className="flex justify-end gap-2">
          <Button variant="tertiary" size="sm">
            Reset
          </Button>
          <Button size="sm">Apply</Button>
        </div>
      </div>
    ),
  },
};

/**
 * Plain text: no `autoFocus`. Focus stays on the trigger, where the user can read
 * the panel with a screen reader and dismiss it with Escape without first having
 * to find their way back out of a dead end.
 */
export const PlainText: Story = {
  name: 'With plain text',
  args: {
    width: 'sm',
    trigger: <IconButton icon="info" label="About review status" variant="tertiary" />,
    content:
      'A deliverable is In review from the moment it is submitted until every reviewer has signed off.',
  },
};

/** The caller owns the state. `onOpenChange` reports every close — Escape, outside click, focus leaving. */
export const Controlled: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="flex flex-col items-center gap-4">
        <Popover {...args} open={open} onOpenChange={setOpen} />
        <div className="flex items-center gap-3">
          <Button size="sm" variant="tertiary" onClick={() => setOpen((o) => !o)}>
            Toggle from outside
          </Button>
          <span className="font-sans text-label-md text-text-subtle">
            open: {String(open)}
          </span>
        </div>
      </div>
    );
  },
};

/** `width="lg"` for a panel that has to hold a real block of content. */
export const Wide: Story = {
  args: {
    width: 'lg',
    content: (
      <div className="flex flex-col gap-2">
        <p className="text-label-lg text-text-primary">Review policy</p>
        <p className="text-body-md text-text-secondary">
          Every deliverable needs two sign-offs before it can leave In review. The second reviewer
          cannot be the person who submitted it, and neither sign-off survives a change to the
          scope — editing the brief sends the deliverable back to Draft.
        </p>
      </div>
    ),
  },
};

/** Every colour is a semantic token, so the dark theme comes for free via `.dark`. */
export const LightAndDark: Story = {
  name: 'Light and dark',
  render: (args) => {
    const set = (
      <div className="flex min-h-56 items-start justify-center bg-surface-canvas p-8">
        <Popover {...args} defaultOpen />
      </div>
    );
    return (
      <div className="grid grid-cols-1 gap-4">
        <div>{set}</div>
        <div className="dark">{set}</div>
      </div>
    );
  },
};

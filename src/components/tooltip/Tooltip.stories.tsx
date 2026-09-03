import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './Tooltip';
import { Button } from '../../atoms/button';
import { IconButton } from '../../atoms/icon-button';

const meta = {
  title: 'Components/Overlays/Tooltip',
  component: Tooltip,
  parameters: {
    docs: {
      description: {
        component:
          'A small floating label describing the element it is attached to. It opens on hover ' +
          '**and on keyboard focus**, wires the trigger with `aria-describedby`, stays open while ' +
          'the pointer moves onto it, and closes on Escape — the two halves of WCAG 2.1 §1.4.13. ' +
          'Placement is static: four sides, no collision detection, no flipping. ' +
          'Never put anything in a tooltip that is not also available elsewhere — it cannot be ' +
          'reached on touch, and it disappears. Never put anything interactive in one either; ' +
          'that is a Popover.',
      },
    },
  },
  args: {
    content: 'Reconciled nightly at 02:00 UTC',
    placement: 'top',
    /* Every story below supplies its own trigger via `render`; this is the
       default one the controls panel drives. */
    children: <Button variant="secondary">Last reconciliation</Button>,
  },
  argTypes: {
    placement: { control: 'radio', options: ['top', 'bottom', 'left', 'right'] },
    openDelay: { control: { type: 'number' } },
    defaultOpen: { control: 'boolean' },
    content: { control: 'text' },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hover it, or Tab to it. Both work; only one of them works for everyone. */
export const Default: Story = {
  render: (args) => (
    <div className="p-12">
      <Tooltip {...args}>
        <Button variant="secondary">Last reconciliation</Button>
      </Tooltip>
    </div>
  ),
};

/**
 * The four placements, forced open with `defaultOpen` so the geometry is visible
 * in one shot. There is no collision detection: each side is a fixed CSS offset
 * off the trigger, so a tooltip near a viewport edge will clip rather than flip.
 * Choose the side with room.
 */
export const Placements: Story = {
  name: 'Placements',
  render: (args) => (
    <div className="grid grid-cols-2 gap-16 p-16">
      {(['top', 'bottom', 'left', 'right'] as const).map((placement) => (
        <div key={placement} className="flex justify-center">
          <Tooltip {...args} placement={placement} defaultOpen content={`Placement “${placement}”`}>
            <Button variant="secondary">{placement}</Button>
          </Tooltip>
        </div>
      ))}
    </div>
  ),
};

/**
 * On a `Button`. The button already says what it does, so the tooltip adds
 * something the label cannot carry — a constraint, a timestamp, a shortcut.
 * If the tooltip is the only place that information exists, it is in the wrong
 * place: put it on the page.
 */
export const OnAButton: Story = {
  name: 'On a Button',
  render: (args) => (
    <div className="flex items-center gap-4 p-12">
      <Tooltip {...args} content="Ctrl + S">
        <Button>Save changes</Button>
      </Tooltip>
      <Tooltip {...args} content="Runs against the last closed period only">
        <Button variant="secondary">Reconcile</Button>
      </Tooltip>
    </div>
  ),
};

/**
 * On an `IconButton`. **Watch the double announcement.** `IconButton` requires
 * `label`, which is already the control's accessible name — a tooltip repeating
 * it makes a screen reader say the same words twice, once as the name and once
 * as the description.
 *
 * The first pair below is right: the tooltip says something the name does not.
 * The last one is the mistake — `content` and `label` are the same string.
 */
export const OnAnIconButton: Story = {
  name: 'On an IconButton',
  render: (args) => (
    <div className="flex items-center gap-4 p-12">
      <Tooltip {...args} content="Delete — this cannot be undone">
        <IconButton icon="trash" label="Delete deliverable" variant="danger" />
      </Tooltip>
      <Tooltip {...args} content="Filters apply to the current page only">
        <IconButton icon="funnel-simple" label="Filter results" variant="secondary" />
      </Tooltip>
      <Tooltip {...args} content="Edit deliverable">
        <IconButton icon="pencil-simple" label="Edit deliverable" variant="secondary" />
      </Tooltip>
      <span className="text-body-sm text-text-subtle">
        ← the third one duplicates its own accessible name. Don’t.
      </span>
    </div>
  ),
};

/**
 * Long content wraps at `max-w-64` rather than running off the screen — the
 * source pattern used `white-space: nowrap`, which cannot survive a real
 * sentence. Two or three lines is the ceiling: past that the content is not a
 * description, it is body copy, and it belongs on the page.
 */
export const LongText: Story = {
  name: 'Long text',
  render: (args) => (
    <div className="p-16">
      <Tooltip
        {...args}
        defaultOpen
        placement="bottom"
        content="Reconciliation compares every claim raised in the period against the ledger, and flags any row where the two disagree by more than a penny."
      >
        <Button variant="secondary">What does reconcile do?</Button>
      </Tooltip>
    </div>
  ),
};

/**
 * **Keyboard focus, demonstrable.** Click the first field, then press Tab. Every
 * control below is a tooltip trigger, and the tooltip appears on focus with no
 * delay — the hover delay is not applied to the keyboard route. Press Escape
 * while one is showing and it dismisses without moving focus (§1.4.13
 * "Dismissible"); Tab away and back to bring it again.
 *
 * A hover-only tooltip would show nothing at all in this story. That is the
 * failure this component is built to prevent.
 */
export const KeyboardFocus: Story = {
  name: 'Keyboard focus',
  render: (args) => (
    <div className="flex flex-col gap-6 px-24 py-12">
      <p className="max-w-96 text-body-md text-text-secondary">
        Start here, then press <kbd className="text-label-md">Tab</kbd> four times. Then press{' '}
        <kbd className="text-label-md">Esc</kbd>.
      </p>
      <div className="flex items-center gap-4">
        <Tooltip {...args} placement="bottom" content="Focus me with Tab — no delay">
          <Button variant="secondary">First</Button>
        </Tooltip>
        <Tooltip {...args} placement="bottom" content="Still no delay on focus">
          <Button variant="secondary">Second</Button>
        </Tooltip>
        <Tooltip {...args} placement="bottom" content="Escape dismisses this one">
          <IconButton icon="info" label="About reconciliation" variant="secondary" />
        </Tooltip>
        <Tooltip {...args} placement="bottom" content="aria-describedby points at this text">
          <Button>Last</Button>
        </Tooltip>
      </div>
    </div>
  ),
};

/**
 * The pointer can travel onto the tooltip and it stays open — §1.4.13
 * "Hoverable". The gap between trigger and bubble is padding on the positioner,
 * so there is no dead zone in the middle that would snap it shut halfway across.
 */
export const Hoverable: Story = {
  render: (args) => (
    <div className="p-16">
      <Tooltip
        {...args}
        placement="right"
        content="Move the pointer onto this bubble — it stays open, so a long description can actually be read."
      >
        <Button variant="secondary">Hover, then move onto the tooltip</Button>
      </Tooltip>
    </div>
  ),
};

/**
 * The hover delay, side by side. `openDelay={0}` fires on contact and turns a
 * sweep across a toolbar into a strobe; the 300ms default waits for a pause that
 * reads as intent. Neither applies to focus.
 */
export const OpenDelay: Story = {
  name: 'Open delay',
  render: (args) => (
    <div className="flex items-center gap-4 p-12">
      <Tooltip {...args} openDelay={0} content="openDelay = 0 — fires on contact">
        <Button variant="secondary">No delay</Button>
      </Tooltip>
      <Tooltip {...args} content="openDelay = 300 — the default">
        <Button variant="secondary">Default (300ms)</Button>
      </Tooltip>
      <Tooltip {...args} openDelay={1000} content="openDelay = 1000 — too slow to feel wired up">
        <Button variant="secondary">Sluggish (1000ms)</Button>
      </Tooltip>
    </div>
  ),
};

/**
 * Both themes. The bubble is an inverted surface — `surface.neutral.stronger`
 * with `text.inverted.primary` — so it flips with the theme and stays legible:
 * 10.35:1 in light, 16.36:1 in dark, both well past AA. Every colour is a
 * semantic token, so the dark theme comes for free via `.dark`.
 */
export const LightAndDark: Story = {
  name: 'Light and dark',
  render: (args) => {
    const set = (
      <div className="flex items-center gap-8 bg-surface-canvas px-24 pt-16 pb-8">
        <Tooltip {...args} defaultOpen content="Reconciled nightly at 02:00 UTC">
          <Button variant="secondary">Top</Button>
        </Tooltip>
        <Tooltip {...args} defaultOpen placement="bottom" content="Ctrl + S">
          <Button>Bottom</Button>
        </Tooltip>
        <Tooltip {...args} defaultOpen placement="right" content="Delete — cannot be undone">
          <IconButton icon="trash" label="Delete deliverable" variant="danger" />
        </Tooltip>
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

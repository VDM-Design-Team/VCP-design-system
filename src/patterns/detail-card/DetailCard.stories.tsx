import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DetailCard, type DetailCardValue } from './DetailCard';
import { SIDE_BY_SIDE } from '../../lib/story-a11y';

const PEOPLE = [{ name: 'Marvin R' }, { name: 'John Kestrel' }, { name: 'Jane Doe' }, { name: 'Amy Lee' }];

const OPTIONS = {
  people: PEOPLE,
  roles: ['QA', 'Design', 'Assignee'],
  cycles: [
    { value: 'c18', code: 'C18', start: '2025-09-20', end: '2026-10-02' },
    { value: 'c19', code: 'C19', start: '2026-10-03', end: '2026-10-16' },
  ],
  projects: ['VCP', 'BESA', 'Planning'],
  categories: ['Improvement', 'Bug', 'New Feature'],
  tags: ['Development', 'Design', 'Operations'],
};

const VIEWING: DetailCardValue = {
  initiators: [{ name: 'Marvin R' }, { name: 'Amy Lee' }],
  assignees: [
    { name: 'John Kestrel', points: 5 },
    { name: 'Jane Doe', points: 5 },
  ],
  startDate: '2025-10-01',
  dueDate: '2099-10-01',
  cycle: 'c18',
  status: 'In Progress',
  urgency: 'Low',
  type: 'Type 1',
  projects: ['VCP'],
  category: 'Improvement',
  tags: ['Development'],
  capacityPoints: 10,
  deploymentDate: '2025-10-07',
  dateInitiated: '2025-09-01',
  dateAccepted: '2025-09-12',
};

const meta = {
  title: 'Patterns/DetailCard',
  component: DetailCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The facts about one Added Value, down the right of its page. `type` picks which of the four cards it is ' +
          '(`viewing`, `duplicate`, `editing`, `new`), each a fixed list of fields; `domain` trims it (Design has no Cycle). ' +
          'Values in as `value`, changes out through `onChange`, dropdown choices as `options`.',
      },
    },
  },
  args: { type: 'viewing', value: VIEWING, options: OPTIONS, viewerCount: 3, onViewers: fn() },
  argTypes: {
    type: { control: 'inline-radio', options: ['viewing', 'duplicate', 'editing', 'new'] },
    domain: { control: 'inline-radio', options: ['design', 'development'] },
  },
  decorators: [
    (Story) => (
      <div className="w-116 max-w-full bg-surface-canvas p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DetailCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Viewing: every field, as tags and chips. The pill at the top right is the viewers placeholder. */
export const Viewing: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    for (const name of ['Initiator', 'Assignee', 'Start Date', 'Due Date', 'Cycle', 'Status', 'Urgency', 'Type', 'Projects', 'AV Category', 'Tags', 'Capacity Points']) {
      await expect(canvas.getByRole('group', { name })).toBeVisible();
    }
    await userEvent.click(canvas.getByRole('button', { name: '3 viewers' }));
    await expect(args.onViewers).toHaveBeenCalledTimes(1);
  },
};

/** Editing: the same fields as inputs, with a + beside Initiator and Assignee. Changes come out through `onChange`. */
export const Editing: Story = {
  args: { type: 'editing', viewerCount: undefined, onChange: fn() },
  render: (args) => {
    const [value, setValue] = React.useState<DetailCardValue>(args.value);
    return <DetailCard {...args} value={value} onChange={(next) => { setValue(next); args.onChange?.(next); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('group', { name: 'Status' })).toBeNull();
    /* Capacity points is a dropdown of 0, 1, 2, 3, 5, 8, 13. */
    await userEvent.click(canvas.getByRole('combobox', { name: /^Capacity Points/ }));
    await expect(within(canvasElement).getAllByRole('option').map((o) => o.textContent)).toEqual(['0', '1', '2', '3', '5', '8', '13']);
    await userEvent.click(within(canvasElement).getByRole('option', { name: '8' }));
    await expect(canvas.getByRole('combobox', { name: /^Capacity Points/ })).toHaveTextContent('8');
  },
};

/**
 * People are added, edited and removed in the card, as the design's flow draws it: the + opens a form under the
 * chips (a user, a role, capacity points, then Cancel and Add), a chip's pencil turns it into that form (Save), its ✕
 * removes it. The + is dimmed while a form is open.
 */
export const EditingPeople: Story = {
  args: { type: 'editing', viewerCount: undefined, onChange: fn() },
  render: (args) => {
    const [value, setValue] = React.useState<DetailCardValue>(args.value);
    return <DetailCard {...args} value={value} onChange={(next) => { setValue(next); args.onChange?.(next); }} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const assignees = within(canvas.getByRole('group', { name: 'Assignee' }));
    /* Add: the + opens the form and is dimmed meanwhile. */
    await userEvent.click(assignees.getByRole('button', { name: 'Add assignee' }));
    await expect(assignees.getByRole('button', { name: 'Add assignee' })).toBeDisabled();
    await userEvent.click(assignees.getByRole('button', { name: /^User/ }));
    await userEvent.click(within(canvasElement).getByRole('option', { name: 'Amy Lee' }));
    await userEvent.click(assignees.getByRole('button', { name: 'Add' }));
    await expect(assignees.getByText('Amy Lee')).toBeVisible();
    /* Remove: the ✕ takes a chip out. */
    await userEvent.click(assignees.getByRole('button', { name: 'Remove Amy Lee' }));
    await expect(assignees.queryByText('Amy Lee')).toBeNull();
    /* Edit: the pencil turns a chip into the form, with Save. */
    await userEvent.click(assignees.getByRole('button', { name: 'Edit John Kestrel' }));
    await expect(assignees.getByRole('button', { name: 'Save' })).toBeVisible();
    /* In place: the form sits where the first chip was, so the second chip still follows it. */
    const form = assignees.getByRole('button', { name: 'Save' }).closest('form') as HTMLElement;
    const second = assignees.getByRole('button', { name: 'Edit Jane Doe' });
    await expect(form.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await userEvent.click(assignees.getByRole('button', { name: 'Cancel' }));
    await expect(assignees.getByText('John Kestrel')).toBeVisible();
    /* Several initiators; none has a pencil. */
    const initiator = within(canvas.getByRole('group', { name: 'Initiator' }));
    await expect(initiator.queryByRole('button', { name: /^Edit/ })).toBeNull();
    await expect(initiator.getByRole('button', { name: 'Remove Marvin R' })).toBeInTheDocument();
    await expect(initiator.getByRole('button', { name: 'Remove Amy Lee' })).toBeInTheDocument();
  },
};

/** An AV being created: only Initiator, Projects, Category, Tags, Type and Urgency. */
export const NewAV: Story = {
  args: { type: 'new', value: { initiators: [{ name: 'Marvin R' }], projects: ['VCP'], category: 'Improvement', tags: ['Development'], type: 'Type 1', urgency: 'Low' }, viewerCount: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('group', { name: 'Due Date' })).toBeNull();
    await expect(canvas.getByRole('group', { name: 'Projects' })).toBeVisible();
  },
};

/** An AV initiated to another domain: a Duplicates row, and no people or dates to plan. */
export const InitiatedToOtherDomain: Story = {
  args: { type: 'duplicate', value: { ...VIEWING, status: 'Initiated', duplicates: [{ domain: 'Design', status: 'Initiated' }] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('group', { name: 'Duplicates' })).toBeVisible();
    await expect(canvas.queryByRole('group', { name: 'Assignee' })).toBeNull();
  },
};

/** Design has no Cycle; Development has every field. */
export const DesignHasNoCycle: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { domain: 'design' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('group', { name: 'Cycle' })).toBeNull();
    await expect(canvas.getByRole('group', { name: 'Start Date' })).toBeVisible();
  },
};

/** A missing required field: its message under it, and the field marked invalid. */
export const WithAnError: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { type: 'new', value: { initiators: [{ name: 'Marvin R' }] }, errors: { projects: 'Please select a project before submitting' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Please select a project before submitting')).toBeVisible();
    await expect(canvas.getByRole('button', { name: /^Projects/ })).toHaveAttribute('aria-invalid', 'true');
  },
};

/** Both themes. */
export const LightAndDark: Story = {
  /* Two identical cards side by side, one per theme: the landmark-uniqueness rules stand down. */
  parameters: { layout: 'fullscreen', controls: { disable: true }, ...SIDE_BY_SIDE },
  decorators: [],
  render: (args) => (
    <div className="grid grid-cols-2">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-6">
            <DetailCard {...args} />
          </div>
        </div>
      ))}
    </div>
  ),
};

import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { DetailCard, type DetailCardPerson, type DetailCardValue } from './DetailCard';
import { SIDE_BY_SIDE } from '../../lib/story-a11y';
import { DateFormatProvider } from '../../lib/format-date';

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
    (Story, context) =>
      /* The side-by-side story frames its own cards. */
      context.parameters.layout === 'fullscreen' ? (
        <Story />
      ) : (
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
    /* Every date reads dd/mm/yyyy, like every date in the system. */
    for (const date of ['01/10/2025', '01/10/2099', '07/10/2025', '01/09/2025', '12/09/2025']) {
      await expect(canvas.getByText(date)).toBeVisible();
    }
    await userEvent.click(canvas.getByRole('button', { name: '3 viewers' }));
    await expect(args.onViewers).toHaveBeenCalledTimes(1);
  },
};

/** Give the app the person's locale (`DateFormatProvider`) and the card's dates follow it: here en-US, month first. */
export const InThePersonsLocale: Story = {
  render: (args) => (
    <DateFormatProvider locale="en-US">
      <DetailCard {...args} />
    </DateFormatProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('09/12/2025')).toBeVisible();
    await expect(canvas.getByText('10/07/2025')).toBeVisible();
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
 * `readOnly`: a multipart part's edit page (Figma `1404:132644`) greys the fields it takes from its parent —
 * Projects, AV Category, Type and Urgency. They show their values but can't be opened or changed.
 */
export const EditingWithReadOnlyFields: Story = {
  name: 'Editing, some fields read-only',
  args: { type: 'editing', viewerCount: undefined, onChange: fn(), readOnly: ['projects', 'category', 'type', 'urgency'] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    /* Each field's control, by its name (a single select is a combobox; a multiple one, Projects and Tags, a button). */
    const control = (name: string) => canvas.getAllByLabelText(new RegExp(`^${name}`)).find((el) => el.matches('button, [role="combobox"]'))!;
    for (const name of ['Projects', 'AV Category', 'Type', 'Urgency']) {
      await expect(control(name)).toBeDisabled();
    }
    /* The rest still change. */
    await expect(control('Tags')).toBeEnabled();
    await expect(canvas.getByRole('combobox', { name: /^Capacity Points/ })).toBeEnabled();
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
    /* The + went dim, so focus went into the form: the "User" field. */
    await waitFor(() => expect(assignees.getByRole('button', { name: /^User/ })).toHaveFocus());
    await userEvent.click(assignees.getByRole('button', { name: /^User/ }));
    await userEvent.click(within(canvasElement).getByRole('option', { name: 'Amy Lee' }));
    await userEvent.click(assignees.getByRole('button', { name: 'Add' }));
    await expect(assignees.getByText('Amy Lee')).toBeVisible();
    /* Added: the form is gone and the + is back, with focus on it. */
    await waitFor(() => expect(assignees.getByRole('button', { name: 'Add assignee' })).toHaveFocus());
    /* Remove: the ✕ takes a chip out — the last one, so focus goes to the +. */
    await userEvent.click(assignees.getByRole('button', { name: 'Remove Amy Lee' }));
    await expect(assignees.queryByText('Amy Lee')).toBeNull();
    await waitFor(() => expect(assignees.getByRole('button', { name: 'Add assignee' })).toHaveFocus());
    /* Cancel on the add form: back to the +. */
    await userEvent.click(assignees.getByRole('button', { name: 'Add assignee' }));
    await userEvent.click(assignees.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(assignees.getByRole('button', { name: 'Add assignee' })).toHaveFocus());
    /* Edit: the pencil turns a chip into the form, with Save. */
    await userEvent.click(assignees.getByRole('button', { name: 'Edit John Kestrel' }));
    await expect(assignees.getByRole('button', { name: 'Save' })).toBeVisible();
    /* In place: the form sits where the first chip was, so the second chip still follows it. */
    const form = assignees.getByRole('button', { name: 'Save' }).closest('form') as HTMLElement;
    const second = assignees.getByRole('button', { name: 'Edit Jane Doe' });
    await expect(form.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await userEvent.click(assignees.getByRole('button', { name: 'Cancel' }));
    await expect(assignees.getByText('John Kestrel')).toBeVisible();
    /* Cancel on an edit: focus is on that chip's pencil. */
    await waitFor(() => expect(assignees.getByRole('button', { name: 'Edit John Kestrel' })).toHaveFocus());
    /* Remove a chip that has another after it: focus goes to the next chip's pencil. */
    await userEvent.click(assignees.getByRole('button', { name: 'Remove John Kestrel' }));
    await waitFor(() => expect(assignees.getByRole('button', { name: 'Edit Jane Doe' })).toHaveFocus());
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

/* People who carry an availability, so the Assignee form groups them and warns. */
const AVAILABILITY_PEOPLE: DetailCardPerson[] = [
  { name: 'John Kestrel', availability: 'available' },
  { name: 'Amy Lee', availability: 'available' },
  { name: 'Jane Doe', availability: 'busy', until: 'May 17' },
  { name: 'Eli Ross', availability: 'unavailable', until: 'May 30' },
];
const AVAILABILITY_OPTIONS = { ...OPTIONS, people: AVAILABILITY_PEOPLE };
const AVAILABILITY_BASE: DetailCardValue = {
  initiators: [{ name: 'Marvin R' }],
  projects: ['VCP'],
  category: 'Improvement',
  tags: ['Development'],
  type: 'Type 1',
  urgency: 'Low',
};
const AVAILABILITY_DATES = { startDate: '2026-03-02', dueDate: '2026-03-16', cycle: 'c19' };

/** Opens the Assignee form: the + for a new person, or a chip's pencil to change one. */
const openAssigneeForm = async (canvasElement: HTMLElement, chip?: string) => {
  const assignees = within(within(canvasElement).getByRole('group', { name: 'Assignee' }));
  await userEvent.click(assignees.getByRole('button', { name: chip ? `Edit ${chip}` : 'Add assignee' }));
  return assignees;
};

/**
 * Development only, for now. With no start date, due date or cycle there is nothing to check people against, so the
 * Assignee list says so and shows everyone in one group.
 */
export const AssigneeAvailabilityUnknown: Story = {
  args: { type: 'editing', viewerCount: undefined, options: AVAILABILITY_OPTIONS, value: { ...AVAILABILITY_BASE, assignees: [] } },
  play: async ({ canvasElement }) => {
    await openAssigneeForm(canvasElement);
    await userEvent.click(canvasElement.querySelector('form button[aria-haspopup="listbox"]') as HTMLElement);
    await expect(within(canvasElement).getByText(/availability is unknown/i)).toBeVisible();
  },
};

/** Once the dates are set the list is grouped Available, Busy and Unavailable (folded), each with when they are free. */
export const AssigneeAvailabilityKnown: Story = {
  args: { type: 'editing', viewerCount: undefined, options: AVAILABILITY_OPTIONS, value: { ...AVAILABILITY_BASE, ...AVAILABILITY_DATES, assignees: [] } },
  play: async ({ canvasElement }) => {
    await openAssigneeForm(canvasElement);
    await userEvent.click(canvasElement.querySelector('form button[aria-haspopup="listbox"]') as HTMLElement);
    await expect(within(canvasElement).queryByText(/availability is unknown/i)).toBeNull();
    /* Grouped by availability; the Unavailable group opens folded, so the list starts on people who can be assigned. */
    await expect(within(canvasElement).getByRole('option', { name: /Jane Doe/ })).toBeVisible();
    await expect(within(canvasElement).getByText('Unavailable')).toBeVisible();
  },
};

/** A busy person: an amber edge and a warning, and they can still be added. */
export const BusyAssignee: Story = {
  args: {
    type: 'editing',
    viewerCount: undefined,
    options: AVAILABILITY_OPTIONS,
    value: { ...AVAILABILITY_BASE, ...AVAILABILITY_DATES, assignees: [{ name: 'Jane Doe', description: 'Assignee', points: 3, availability: 'busy', until: 'May 17' }] },
  },
  play: async ({ canvasElement }) => {
    const assignees = await openAssigneeForm(canvasElement, 'Jane Doe');
    await expect(assignees.getByText(/busy during the selected dates, but can still be assigned/i)).toBeVisible();
    await expect(assignees.getByRole('button', { name: 'Save' })).toBeEnabled();
  },
};

/** An unavailable person: a red edge and an error, and Add or Save stays off. */
export const UnavailableAssignee: Story = {
  args: {
    type: 'editing',
    viewerCount: undefined,
    options: AVAILABILITY_OPTIONS,
    value: { ...AVAILABILITY_BASE, ...AVAILABILITY_DATES, assignees: [{ name: 'Eli Ross', description: 'Assignee', points: 3, availability: 'unavailable', until: 'May 30' }] },
  },
  play: async ({ canvasElement }) => {
    const assignees = await openAssigneeForm(canvasElement, 'Eli Ross');
    await expect(assignees.getByText(/not available during the selected dates and cannot be assigned/i)).toBeVisible();
    await expect(assignees.getByRole('button', { name: 'Save' })).toBeDisabled();
  },
};

/**
 * The dates changed after people were added. Each chip that is now busy or unavailable takes the warning's colour on
 * its edge and says so under it, by name, so with many assignees it is clear whose note it is. The chip still hugs
 * its content; the note sits under it.
 */
export const AssigneesFlaggedAfterDatesChange: Story = {
  args: {
    type: 'editing',
    viewerCount: undefined,
    options: AVAILABILITY_OPTIONS,
    value: {
      ...AVAILABILITY_BASE,
      ...AVAILABILITY_DATES,
      assignees: [
        { name: 'Jane Doe', description: 'Assignee', points: 3, availability: 'busy', until: 'May 17' },
        { name: 'Eli Ross', description: 'Assignee', points: 2, availability: 'unavailable', until: 'May 30' },
        { name: 'John Kestrel', description: 'Assignee', points: 5, availability: 'available' },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const assignees = within(within(canvasElement).getByRole('group', { name: 'Assignee' }));
    await expect(assignees.getByText('Jane Doe is busy during the selected dates, but can still be assigned.')).toBeVisible();
    await expect(assignees.getByText('Eli Ross is not available during the selected dates and cannot be assigned.')).toBeVisible();
    /* Only the flagged chips carry a note. */
    await expect(assignees.queryByText(/John Kestrel is/)).toBeNull();
  },
};

/** An AV already initiated to another domain: no one can be added to it here, and the + says why. */
export const InitiatedAssigneesLocked: Story = {
  args: {
    type: 'editing',
    viewerCount: undefined,
    options: AVAILABILITY_OPTIONS,
    value: {
      ...AVAILABILITY_BASE,
      ...AVAILABILITY_DATES,
      assignees: [{ name: 'John Kestrel', description: 'Assignee', points: 3, availability: 'available' }],
      duplicates: [{ domain: 'Design', status: 'Initiated' }],
    },
  },
  play: async ({ canvasElement }) => {
    const assignees = within(within(canvasElement).getByRole('group', { name: 'Assignee' }));
    const add = assignees.getByRole('button', { name: 'Add assignee' });
    await expect(add).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(add);
    /* It does nothing: no form opened. */
    await expect(assignees.queryByRole('button', { name: 'Cancel' })).toBeNull();
  },
};

/**
 * One box per domain the AV was duplicated to, each with the domain's name on the left and its current status on
 * the right, in the order given. Another duplication adds another box under Duplicates.
 */
export const DuplicatedToSeveralDomains: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: {
    type: 'duplicate',
    value: {
      ...VIEWING,
      status: 'Initiated',
      duplicates: [
        { domain: 'Design (BESA)', status: 'Initiated' },
        { domain: 'Development', status: 'In Progress' },
        { domain: 'Content', status: 'Draft' },
        { domain: 'Governance', status: 'Pending' },
        { domain: 'Partners', status: 'Accepted' },
        { domain: 'Quality Assurance', status: 'For QA' },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const group = within(within(canvasElement).getByRole('group', { name: 'Duplicates' }));
    await expect(group.getAllByRole('listitem')).toHaveLength(6);
    await expect(group.getByText('Quality Assurance')).toBeVisible();
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

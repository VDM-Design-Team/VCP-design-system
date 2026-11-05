import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { OVERLAY_DOCS_STORY } from '../../lib/story-docs';
import { MoveAVToCycleModal } from './MoveAVToCycleModal';
import type { AssigneeOption } from '../../components/assignee-selection-dropdown';

const PEOPLE: AssigneeOption[] = [
  { value: 'amy', label: 'Amy Lee', availability: 'available' },
  { value: 'cy', label: 'Cy Park', availability: 'busy', until: 'May 17' },
  { value: 'ed', label: 'Ed Ruiz', availability: 'unavailable', until: 'May 17' },
];

const CYCLES = [
  { value: 'c27', code: 'C27', start: '2026-03-02', end: '2026-03-23' },
  { value: 'c28', code: 'C28', start: '2026-03-24', end: '2026-04-06' },
];

/** The shape of the flow's calculation, nothing more: once someone is assigned, the due date can be worked out. */
const estimate: React.ComponentProps<typeof MoveAVToCycleModal>['estimate'] = (draft) =>
  draft.assignees.length ? { due: '2026-03-12' } : {};

const meta = {
  title: 'Patterns/MoveAVToCycleModal',
  component: MoveAVToCycleModal,
  parameters: {
    layout: 'centered',
    docs: {
      story: OVERLAY_DOCS_STORY,
      description: {
        component:
          'The dialog a Backlog row opens when it is dropped on a Cycle without an assignee, due date or capacity ' +
          'points. Assignee rows with availability, the dates (estimated ones read “(est.)”), the cycle and the points.',
      },
    },
  },
  args: {
    open: true,
    onClose: fn(),
    onConfirm: fn(),
    onInvalid: fn(),
    people: PEOPLE,
    cycles: CYCLES,
    initial: { start: { value: '2026-03-02', estimated: true }, cycle: 'c27' },
  },
} satisfies Meta<typeof MoveAVToCycleModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Missing a due date, an assignee and capacity points: the flow's first frame. */
export const MissingDetails: Story = {};

/** With `estimate`, adding an assignee fills the due date (“(est.)”) — the flow's second frame. */
export const WithEstimates: Story = { args: { estimate } };

export const DarkTheme: Story = { globals: { theme: 'dark' } };

const open = (name: string | RegExp) => screen.findByRole('dialog', { name });

/** Pressing Confirm with nothing filled in says what is missing and does not confirm (hidden: tested). */
export const ConfirmingIncomplete: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  play: async ({ args }) => {
    const dialog = await open('Add Required Details');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    await expect(within(dialog).getByText('Add at least one assignee.')).toBeInTheDocument();
    await expect(within(dialog).getByText('Add a due date.')).toBeInTheDocument();
    await expect(within(dialog).getByText('Add capacity points.')).toBeInTheDocument();
    await expect(args.onInvalid).toHaveBeenCalledWith('missing-details');
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};

/** The flow end to end: assign someone, the due date is estimated, add the points, confirm (hidden: tested). */
export const FillingItIn: Story = {
  args: { estimate },
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  play: async ({ args }) => {
    const dialog = await open('Add Required Details');
    const ui = within(dialog);
    await userEvent.click(ui.getByRole('combobox', { name: /Assignee 1/ }));
    await userEvent.click(await ui.findByRole('option', { name: /Amy Lee/ }));
    await waitFor(() => expect(ui.getByRole('combobox', { name: 'Due Date' })).toHaveValue('2026-03-12 (est.)'));
    await userEvent.selectOptions(ui.getByRole('combobox', { name: 'Capacity Points' }), '3');
    await userEvent.click(ui.getByRole('button', { name: 'Confirm' }));
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
    const result = (args.onConfirm as ReturnType<typeof fn>).mock.calls[0]![0];
    await expect(result.assignees.map((a: { person: string }) => a.person)).toEqual(['amy']);
    await expect(result.due).toEqual({ value: '2026-03-12', estimated: true });
    await expect(result.points).toBe(3);
  },
};

/**
 * Until the dates are known anyone can be picked; once the estimate sets them, an unavailable person already picked is
 * an error and Confirm will not go through (hidden: tested).
 */
export const UnavailableAssigneeBlocksConfirm: Story = {
  args: { estimate },
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  play: async ({ args }) => {
    const dialog = await open('Add Required Details');
    const ui = within(dialog);
    await userEvent.click(ui.getByRole('combobox', { name: /Assignee 1/ }));
    await userEvent.click(await ui.findByRole('option', { name: /Ed Ruiz/ }));
    await userEvent.selectOptions(ui.getByRole('combobox', { name: 'Capacity Points' }), '2');
    await waitFor(() => expect(ui.getByRole('combobox', { name: 'Due Date' })).toHaveValue('2026-03-12 (est.)'));
    await userEvent.click(ui.getByRole('button', { name: 'Confirm' }));
    await expect(args.onInvalid).toHaveBeenCalledWith('unavailable-assignee');
    await expect(args.onConfirm).not.toHaveBeenCalled();
    /* Said once, under the person's own field, and focus goes there so it is heard. */
    await expect(ui.getAllByText(/not available during the selected dates/i)).toHaveLength(1);
    await expect(ui.queryByText(/unavailable during these dates/i)).toBeNull();
    await waitFor(() => expect(ui.getByRole('combobox', { name: /Assignee 1/ })).toHaveFocus());
  },
};

/** **Flow:** adding an assignee goes to its field; removing one never drops focus (hidden: tested). */
export const FocusFollowsTheRows: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  play: async () => {
    const dialog = await open('Add Required Details');
    const ui = within(dialog);
    const add = ui.getByRole('button', { name: 'Add assignee' });
    await userEvent.click(add);
    await waitFor(() => expect(ui.getByRole('combobox', { name: /Assignee 2/ })).toHaveFocus());
    await userEvent.click(add);
    await waitFor(() => expect(ui.getByRole('combobox', { name: /Assignee 3/ })).toHaveFocus());
    /* The middle one goes: focus is on the ⊖ of the row that took its place. */
    await userEvent.click(ui.getByRole('button', { name: 'Remove assignee 2' }));
    await waitFor(() => expect(ui.getByRole('button', { name: 'Remove assignee 2' })).toHaveFocus());
    /* Down to one row, which has no ⊖: focus is on its assignee. */
    await userEvent.click(ui.getByRole('button', { name: 'Remove assignee 2' }));
    await waitFor(() => expect(ui.getByRole('combobox', { name: /Assignee 1/ })).toHaveFocus());
  },
};

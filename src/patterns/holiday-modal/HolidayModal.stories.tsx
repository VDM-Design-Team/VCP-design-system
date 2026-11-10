import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { OVERLAY_DOCS_STORY } from '../../lib/story-docs';
import { HolidayModal } from './HolidayModal';
import { Button } from '../../atoms/button';

const TEAMS = ['Design', 'Engineering', 'Operations'].map((name) => ({ value: name, label: name }));
const PEOPLE = ['Jordan Lee', 'Priya Nair', 'Sam Okafor'].map((name) => ({ value: name, label: name }));

const meta = {
  title: 'Patterns/HolidayModal',
  component: HolidayModal,
  parameters: {
    layout: 'centered',
    docs: {
      story: OVERLAY_DOCS_STORY,
      description: {
        component:
          'Adding a holiday to the registry, or changing one: name, Recurring Yearly, the date (a period, applied from a two-month calendar), All Day (off, it asks From and To), the type and, for a team or an individual holiday, who it applies to. Pass `holiday` to edit; checked when Add or Save is pressed.',
      },
    },
  },
  args: { open: true, onClose: fn(), onSubmit: fn(), teams: TEAMS, people: PEOPLE },
} satisfies Meta<typeof HolidayModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const dialog = (name: string) => within(screen.getByRole('dialog', { name }));

/** Opens the Date field's two-month calendar, picks the given days of the first month and applies. */
const pickDates = async (d: ReturnType<typeof dialog>, ...days: number[]) => {
  await userEvent.click(d.getByRole('combobox', { name: 'Date' }));
  /* Two calendars are showing, so the days are taken from the first. */
  const first = within(await within(document.body).findByRole('group', { name: 'First calendar' }));
  for (const day of days) await userEvent.click(first.getByRole('button', { name: new RegExp(`^${day} `) }));
  await userEvent.click(within(document.body).getByRole('button', { name: 'Apply' }));
};

const pickType = async (d: ReturnType<typeof dialog>, option: string) => {
  /* Once a type is chosen the field's name carries it ("Holiday Type Team"). */
  await userEvent.click(d.getByRole('combobox', { name: /^Holiday Type/ }));
  await userEvent.click(await screen.findByRole('option', { name: option }));
};

/** Applies to holds several picks, so its trigger is a button named by its label and what is picked ("Applies to 2 selected"). */
const appliesTo = (d: ReturnType<typeof dialog>) => d.getByRole('button', { name: /^Applies to/ });

/** Figma's "Adding a Holiday": empty, Recurring Yearly on. */
export const Adding: Story = {
  play: async () => {
    const d = dialog('Add Holiday');
    await expect(d.getByRole('textbox', { name: 'Holiday Name' })).toHaveValue('');
    await expect(d.getByRole('switch', { name: 'Recurring Yearly' })).toBeChecked();
    await expect(d.getByRole('button', { name: 'Add' })).toBeVisible();
    /* All Day is on too, so no times are asked; no type is chosen yet, so nothing asks who it applies to. */
    await expect(d.getByRole('switch', { name: 'All Day' })).toBeChecked();
    await expect(d.queryByLabelText('From')).toBeNull();
    await expect(d.queryByRole('button', { name: /^Applies to/ })).toBeNull();
  },
};

/** Figma's "Editing existing Holiday": filled, and the button says Save. */
export const Editing: Story = {
  args: { holiday: { name: 'Some Holiday Name', recurring: true, start: '2026-05-01', end: '2026-05-01', type: 'public', appliesTo: [], allDay: true } },
  play: async () => {
    const d = dialog('Edit Holiday');
    await expect(d.getByRole('textbox', { name: 'Holiday Name' })).toHaveValue('Some Holiday Name');
    await expect(d.getByRole('combobox', { name: 'Date' })).toHaveValue('01/05/2026');
    await expect(d.getByRole('button', { name: 'Save' })).toBeVisible();
  },
};

/** Figma's "Modal with Errors": Add pressed on an empty form — each field says what is missing, and the first takes focus. */
export const WithErrors: Story = {
  play: async ({ args }) => {
    const d = dialog('Add Holiday');
    await userEvent.click(d.getByRole('button', { name: 'Add' }));
    await expect(await d.findByText('Enter the holiday’s name')).toBeVisible();
    await expect(d.getByText('Select a date')).toBeVisible();
    await expect(d.getByText('Select a holiday type')).toBeVisible();
    await expect(d.getByRole('textbox', { name: 'Holiday Name' })).toHaveFocus();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

/** Fill it in: the name, a period from the two-month calendar (two days, then Apply), the type — and Add reports the draft once. */
export const FillingItIn: Story = {
  play: async ({ args }) => {
    const d = dialog('Add Holiday');
    await userEvent.type(d.getByRole('textbox', { name: 'Holiday Name' }), 'Founders Day');
    await userEvent.click(d.getByRole('combobox', { name: 'Date' }));
    const body = within(document.body);
    /* Two calendars are showing, so the days are taken from the first. */
    const first = within(await body.findByRole('group', { name: 'First calendar' }));
    await userEvent.click(first.getByRole('button', { name: /^10 / }));
    await userEvent.click(first.getByRole('button', { name: /^12 / }));
    await userEvent.click(body.getByRole('button', { name: 'Apply' }));
    await userEvent.click(d.getByRole('combobox', { name: 'Holiday Type' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Team Holiday' }));
    /* A team holiday says which teams. */
    await userEvent.click(appliesTo(d));
    await userEvent.click(await screen.findByRole('option', { name: 'Design' }));
    await userEvent.click(screen.getByRole('option', { name: 'Operations' }));
    await userEvent.keyboard('{Escape}');
    await userEvent.click(d.getByRole('button', { name: 'Add' }));
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalled());
    const draft = (args.onSubmit as ReturnType<typeof fn>).mock.calls[0][0];
    await expect(draft).toMatchObject({ name: 'Founders Day', recurring: true, type: 'team' });
    await expect(draft.end > draft.start).toBe(true);
    /* All Day was left on, so the draft has no times. */
    await expect(draft).toMatchObject({ appliesTo: ['Design', 'Operations'], allDay: true });
    await expect('from' in draft || 'to' in draft).toBe(false);
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  },
};

/** Editing a partial day for two people: All Day is off with its times filled (24-hour), and Applies to holds who was picked. Save reports them back unchanged. */
export const EditingAPartialDay: Story = {
  args: {
    holiday: { name: 'Medical appointment', recurring: false, start: '2026-05-04', end: '2026-05-04', type: 'individual', appliesTo: ['Jordan Lee', 'Sam Okafor'], allDay: false, from: '09:00', to: '13:30' },
  },
  play: async ({ args }) => {
    const d = dialog('Edit Holiday');
    await expect(d.getByRole('switch', { name: 'All Day' })).not.toBeChecked();
    await expect(d.getByLabelText('From')).toHaveValue('09:00');
    await expect(d.getByLabelText('To')).toHaveValue('13:30');
    await expect(appliesTo(d)).toHaveTextContent('2 selected');
    await userEvent.click(d.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalledTimes(1));
    await expect(args.onSubmit).toHaveBeenCalledWith({
      name: 'Medical appointment',
      recurring: false,
      start: '2026-05-04',
      end: '2026-05-04',
      type: 'individual',
      appliesTo: ['Jordan Lee', 'Sam Okafor'],
      allDay: false,
      from: '09:00',
      to: '13:30',
    });
  },
};

/** The Date field is named by its label, not by its placeholder ("Select period"): a screen reader says "Date". With an error it is also described by the message. */
export const DateIsNamedByItsLabel: Story = {
  play: async () => {
    const d = dialog('Add Holiday');
    const date = d.getByRole('combobox', { name: 'Date' });
    await expect(date).toHaveAccessibleName('Date');
    await expect(d.queryByRole('combobox', { name: 'Select period' })).toBeNull();
    /* Named by reference to the label, as every other control in a `Field` is. */
    const label = document.getElementById(date.getAttribute('aria-labelledby') ?? '');
    await expect(label).toHaveTextContent('Date');
    await userEvent.click(d.getByRole('button', { name: 'Add' }));
    await waitFor(() => expect(date).toHaveAccessibleDescription('Select a date'));
    await expect(date).toHaveAccessibleName('Date');
  },
};

/**
 * After "Select a date", applying a date clears the message and the red edge. (Apply used to submit the form around the calendar, which checked it again before the date had landed and put
 * the error straight back.) Apply only applies: nothing is submitted, no other field is checked again, and focus returns to the Date field.
 */
export const DateErrorClearsOnApply: Story = {
  play: async ({ args }) => {
    const d = dialog('Add Holiday');
    await userEvent.type(d.getByRole('textbox', { name: 'Holiday Name' }), 'Founders Day');
    await userEvent.click(d.getByRole('button', { name: 'Add' }));
    const date = d.getByRole('combobox', { name: 'Date' });
    await expect(await d.findByText('Select a date')).toBeVisible();
    await expect(date).toHaveAttribute('aria-invalid', 'true');
    await expect(date).toHaveFocus();
    const edge = date.parentElement as HTMLElement;
    await expect(edge.className).toContain('border-accent-critical-outline-border-default');

    await pickDates(d, 10);
    await waitFor(() => expect(d.queryByText('Select a date')).toBeNull());
    await expect(date).not.toHaveAttribute('aria-invalid');
    await expect(edge.className).not.toContain('border-accent-critical-outline-border-default');
    await expect((date as HTMLInputElement).value).toMatch(/^10\/\d{2}\/\d{4}$/);
    /* The type's own message stays: it has not been touched. */
    await expect(d.getByText('Select a holiday type')).toBeVisible();
    await expect(date).toHaveFocus();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

/**
 * All Day off asks **From** and **To**, and a failed Add looks for the first problem in the order the fields are drawn: the start time, then the end time, then (for a one-day holiday) an
 * end that is not after the start, then who it applies to. Each takes focus in turn.
 */
export const APartialDay: Story = {
  play: async ({ args }) => {
    const d = dialog('Add Holiday');
    await userEvent.type(d.getByRole('textbox', { name: 'Holiday Name' }), 'Office move');
    await pickDates(d, 10);
    await userEvent.click(d.getByRole('switch', { name: 'All Day' }));
    const from = d.getByLabelText('From');
    const to = d.getByLabelText('To');
    await pickType(d, 'Individual Holiday');
    const add = d.getByRole('button', { name: 'Add' });

    await userEvent.click(add);
    await expect(await d.findByText('Enter a start time')).toBeVisible();
    await expect(d.getByText('Enter an end time')).toBeVisible();
    await expect(d.getByText('Select who it applies to')).toBeVisible();
    await expect(from).toHaveFocus();

    await userEvent.type(from, '14:00');
    await expect(d.queryByText('Enter a start time')).toBeNull();
    await userEvent.click(add);
    await expect(to).toHaveFocus();

    /* One day: an end before the start is not a time span. */
    await userEvent.type(to, '09:30');
    await userEvent.click(add);
    await expect(await d.findByText('End time must be after the start time')).toBeVisible();
    await expect(to).toHaveFocus();

    await userEvent.clear(to);
    await userEvent.type(to, '17:30');
    await expect(d.queryByText('End time must be after the start time')).toBeNull();
    await userEvent.click(add);
    await expect(appliesTo(d)).toHaveFocus();
    await expect(args.onSubmit).not.toHaveBeenCalled();

    await userEvent.click(appliesTo(d));
    await userEvent.click(await screen.findByRole('option', { name: 'Priya Nair' }));
    await userEvent.keyboard('{Escape}');
    await expect(d.queryByText('Select who it applies to')).toBeNull();
    await userEvent.click(add);
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalledTimes(1));
    await expect((args.onSubmit as ReturnType<typeof fn>).mock.calls[0][0]).toMatchObject({ type: 'individual', appliesTo: ['Priya Nair'], allDay: false, from: '14:00', to: '17:30' });
  },
};

/** Turning All Day back on drops the times: the fields go, and switching it off again finds them empty. */
export const AllDayDropsTheTimes: Story = {
  play: async () => {
    const d = dialog('Add Holiday');
    const allDay = d.getByRole('switch', { name: 'All Day' });
    await userEvent.click(allDay);
    await userEvent.type(d.getByLabelText('From'), '09:00');
    await userEvent.type(d.getByLabelText('To'), '12:00');
    await userEvent.click(allDay);
    await expect(d.queryByLabelText('From')).toBeNull();
    await expect(d.queryByLabelText('To')).toBeNull();
    await userEvent.click(allDay);
    await expect(d.getByLabelText('From')).toHaveValue('');
    await expect(d.getByLabelText('To')).toHaveValue('');
  },
};

/** Applies to follows the type: a Team holiday picks teams, an Individual one picks people, a Public one is everyone's and has no field. Changing the type clears what was picked. */
export const AppliesToFollowsTheType: Story = {
  play: async () => {
    const d = dialog('Add Holiday');
    await pickType(d, 'Team Holiday');
    await expect(appliesTo(d)).toHaveTextContent('Select Teams');
    await userEvent.click(appliesTo(d));
    await userEvent.click(await screen.findByRole('option', { name: 'Engineering' }));
    await userEvent.keyboard('{Escape}');
    await expect(appliesTo(d)).toHaveTextContent('Engineering');

    await pickType(d, 'Individual Holiday');
    await expect(appliesTo(d)).toHaveTextContent('Select People');
    await userEvent.click(appliesTo(d));
    await expect(await screen.findByRole('option', { name: 'Jordan Lee' })).toBeVisible();
    await expect(screen.queryByRole('option', { name: 'Engineering' })).toBeNull();
    await userEvent.keyboard('{Escape}');

    await pickType(d, 'Public Holiday');
    await expect(d.queryByRole('button', { name: /^Applies to/ })).toBeNull();
  },
};

/** Everything resets each time it opens: closed half filled (a name, All Day off with a time, a type and who it applies to) and opened again, it is empty with All Day back on. */
export const ResetsWhenReopened: Story = {
  args: { open: false },
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Add Holiday</Button>
        <HolidayModal {...args} open={open} onClose={() => setOpen(false)} />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const opener = within(canvasElement).getByRole('button', { name: 'Add Holiday' });
    await userEvent.click(opener);
    let d = within(await screen.findByRole('dialog', { name: 'Add Holiday' }));
    await userEvent.type(d.getByRole('textbox', { name: 'Holiday Name' }), 'Founders Day');
    await userEvent.click(d.getByRole('switch', { name: 'All Day' }));
    await userEvent.type(d.getByLabelText('From'), '09:00');
    await pickType(d, 'Team Holiday');
    await userEvent.click(appliesTo(d));
    await userEvent.click(await screen.findByRole('option', { name: 'Design' }));
    await userEvent.keyboard('{Escape}');
    await userEvent.click(d.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    await userEvent.click(opener);
    d = within(await screen.findByRole('dialog', { name: 'Add Holiday' }));
    await expect(d.getByRole('textbox', { name: 'Holiday Name' })).toHaveValue('');
    await expect(d.getByRole('switch', { name: 'All Day' })).toBeChecked();
    await expect(d.queryByLabelText('From')).toBeNull();
    await expect(d.getByRole('combobox', { name: 'Holiday Type' })).toHaveTextContent('Select Holiday Type');
    await expect(d.queryByRole('button', { name: /^Applies to/ })).toBeNull();
  },
};

/** The ⓘ next to Recurring Yearly says what the switch does (Figma's "Tooltip and Datepicker"). */
export const RecurringTooltip: Story = {
  play: async () => {
    const d = dialog('Add Holiday');
    await userEvent.hover(d.getByRole('button', { name: 'About Recurring Yearly' }));
    await expect(await screen.findByRole('tooltip')).toHaveTextContent('Repeat this holiday every year, or keep it as a one-time event.');
  },
};

/** Saving: the button spins and nothing closes the dialog (Escape, ✕ and the backdrop stand down) until it is done. */
export const Saving: Story = {
  args: { loading: true },
  play: async ({ args }) => {
    await userEvent.keyboard('{Escape}');
    await expect(args.onClose).not.toHaveBeenCalled();
    await expect(await screen.findByRole('dialog', { name: 'Add Holiday' })).toBeVisible();
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

/** Dark, with every field showing: a partial day for two people. */
export const DarkThemeAPartialDay: Story = {
  globals: { theme: 'dark' },
  args: {
    holiday: { name: 'Medical appointment', recurring: false, start: '2026-05-04', end: '2026-05-04', type: 'individual', appliesTo: ['Jordan Lee', 'Sam Okafor'], allDay: false, from: '09:00', to: '13:30' },
  },
};

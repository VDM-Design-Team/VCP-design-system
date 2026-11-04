import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { OVERLAY_DOCS_STORY } from '../../lib/story-docs';
import { HolidayModal } from './HolidayModal';

const meta = {
  title: 'Patterns/HolidayModal',
  component: HolidayModal,
  parameters: {
    layout: 'centered',
    docs: {
      story: OVERLAY_DOCS_STORY,
      description: {
        component:
          'Adding a holiday to the registry, or changing one: name, Recurring Yearly, the date (a period, applied from a two-month calendar) and the type. Pass `holiday` to edit; checked when Add or Save is pressed.',
      },
    },
  },
  args: { open: true, onClose: fn(), onSubmit: fn() },
} satisfies Meta<typeof HolidayModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const dialog = (name: string) => within(screen.getByRole('dialog', { name }));

/** Figma's "Adding a Holiday": empty, Recurring Yearly on. */
export const Adding: Story = {
  play: async () => {
    const d = dialog('Add Holiday');
    await expect(d.getByRole('textbox', { name: 'Holiday Name' })).toHaveValue('');
    await expect(d.getByRole('switch', { name: 'Recurring Yearly' })).toBeChecked();
    await expect(d.getByRole('button', { name: 'Add' })).toBeVisible();
  },
};

/** Figma's "Editing existing Holiday": filled, and the button says Save. */
export const Editing: Story = {
  args: { holiday: { name: 'Some Holiday Name', recurring: true, start: '2026-05-01', end: '2026-05-01', type: 'public' } },
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
    await userEvent.selectOptions(d.getByRole('combobox', { name: 'Holiday Type' }), 'Team');
    await userEvent.click(d.getByRole('button', { name: 'Add' }));
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalled());
    const draft = (args.onSubmit as ReturnType<typeof fn>).mock.calls[0][0];
    await expect(draft).toMatchObject({ name: 'Founders Day', recurring: true, type: 'team' });
    await expect(draft.end > draft.start).toBe(true);
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

export const Saving: Story = { args: { loading: true } };

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

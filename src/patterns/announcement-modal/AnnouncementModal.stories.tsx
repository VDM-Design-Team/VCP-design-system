import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { AnnouncementModal } from './AnnouncementModal';
import { Button } from '../../atoms/button';

const meta = {
  title: 'Patterns/AnnouncementModal',
  component: AnnouncementModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Writes an announcement, or edits one, from the Announcements tab: Title, Version, Description, Changelog Document URL, ' +
          'Announcement Type and a list of Features. It keeps its own draft and hands the whole of it to `onSubmit`.',
      },
    },
  },
  args: {
    open: true,
    onClose: fn(),
    latestVersion: 'v1.18.1',
    typeOptions: ['Feature', 'Improvement', 'Fix'],
    onSubmit: fn(),
  },
} satisfies Meta<typeof AnnouncementModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = () => within(document.body);
const dialog = (name = 'Create Announcement') => within(body().getByRole('dialog', { name }));

/** Figma's dialog: Title and Version (required), Description, URL, Type, and one empty feature line with Add Features beneath. */
export const Create: Story = {
  play: async () => {
    const d = dialog();
    await expect(d.getByRole('textbox', { name: /Title/ })).toHaveValue('');
    await expect(d.getByText('Latest version: v1.18.1')).toBeVisible();
    await expect(d.getByPlaceholderText('Use semantic versioning, e.g., v1.0.0')).toBeVisible();
    await expect(d.getByRole('textbox', { name: 'Feature 1' })).toBeVisible();
    await expect(d.getByRole('button', { name: 'Add Features' })).toBeVisible();
    await expect(d.getByRole('button', { name: 'Create' })).toBeVisible();
    await expect(d.getByRole('button', { name: 'Cancel' })).toBeVisible();
  },
};

/** Edit: the title and button change, and the fields start filled. */
export const Edit: Story = {
  args: {
    mode: 'edit',
    initial: {
      title: 'Domain budgets arrive in Settings',
      version: 'v1.18.1',
      description: 'Budgets are editable per domain.',
      changelogUrl: 'https://example.com/changelog',
      type: 'Feature',
      features: ['Edit budget per domain', 'Cycle summary'],
    },
  },
  play: async () => {
    const d = dialog('Edit Announcement');
    await expect(d.getByRole('textbox', { name: /Title/ })).toHaveValue('Domain budgets arrive in Settings');
    await expect(d.getByRole('textbox', { name: 'Feature 2' })).toHaveValue('Cycle summary');
    await expect(d.getByRole('button', { name: 'Save' })).toBeVisible();
  },
};

/** Create with nothing filled in: Title and Version are asked for, Type is asked for, and nothing goes through. Focus goes to the first. */
export const Validation: Story = {
  play: async ({ args }) => {
    const d = dialog();
    await userEvent.click(d.getByRole('button', { name: 'Create' }));
    await expect(await d.findByText('Enter a title.')).toBeVisible();
    await expect(d.getByText('Enter a version, like v1.0.0.')).toBeVisible();
    await expect(d.getByText('Choose a type.')).toBeVisible();
    await expect(args.onSubmit).not.toHaveBeenCalled();
    await waitFor(() => expect(d.getByRole('textbox', { name: /Title/ })).toHaveFocus());
    /* Fixing a field clears what was said about it. */
    await userEvent.type(d.getByRole('textbox', { name: /Title/ }), 'Hello');
    await waitFor(() => expect(d.queryByText('Enter a title.')).toBeNull());
  },
};

/** The version must be semantic; the URL, when given, must be a web address. */
export const FormatChecks: Story = {
  play: async ({ args }) => {
    const d = dialog();
    await userEvent.type(d.getByRole('textbox', { name: /Title/ }), 'Hello');
    await userEvent.type(d.getByRole('textbox', { name: /Version/ }), 'next');
    await userEvent.type(d.getByRole('textbox', { name: /Changelog Document URL/ }), 'not a url');
    await userEvent.selectOptions(d.getByRole('combobox', { name: /Announcement Type/ }), 'Feature');
    await userEvent.click(d.getByRole('button', { name: 'Create' }));
    await expect(await d.findByText('Use semantic versioning, like v1.0.0.')).toBeVisible();
    await expect(d.getByText('Enter a web address, like https://example.com/changelog.')).toBeVisible();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

/** Valid, Create hands over the whole draft: trimmed, and with the blank feature lines dropped. */
export const Submits: Story = {
  play: async ({ args }) => {
    const d = dialog();
    await userEvent.type(d.getByRole('textbox', { name: /Title/ }), '  Faster search ');
    await userEvent.type(d.getByRole('textbox', { name: /Version/ }), 'v1.19.0');
    await userEvent.selectOptions(d.getByRole('combobox', { name: /Announcement Type/ }), 'Improvement');
    await userEvent.type(d.getByRole('textbox', { name: 'Feature 1' }), 'Search by role');
    await userEvent.click(d.getByRole('button', { name: 'Add Features' }));
    await userEvent.click(d.getByRole('button', { name: 'Create' }));
    await waitFor(() =>
      expect(args.onSubmit).toHaveBeenCalledWith({
        title: 'Faster search',
        version: 'v1.19.0',
        description: '',
        changelogUrl: '',
        type: 'Improvement',
        features: ['Search by role'],
      }),
    );
  },
};

/** Features: Add Features adds a line and focuses it; removing one moves focus on, and the last removal lands on Add Features. */
export const Features: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  play: async () => {
    const d = dialog();
    await userEvent.click(d.getByRole('button', { name: 'Add Features' }));
    await waitFor(() => expect(d.getByRole('textbox', { name: 'Feature 2' })).toHaveFocus());
    await userEvent.type(d.getByRole('textbox', { name: 'Feature 2' }), 'Second');
    await userEvent.click(d.getByRole('button', { name: 'Remove feature 1' }));
    /* The line that was second is first now, and has focus. */
    await waitFor(() => expect(d.getByRole('textbox', { name: 'Feature 1' })).toHaveValue('Second'));
    await waitFor(() => expect(d.getByRole('textbox', { name: 'Feature 1' })).toHaveFocus());
    await userEvent.click(d.getByRole('button', { name: 'Remove feature 1' }));
    await waitFor(() => expect(d.getByRole('button', { name: 'Add Features' })).toHaveFocus());
    await expect(d.queryByRole('textbox', { name: /^Feature/ })).toBeNull();
  },
};

/** What only the server knows. */
export const ServerErrors: Story = {
  args: { errors: { version: 'That version already exists.' } },
  play: async () => {
    const d = dialog();
    await expect(d.getByText('That version already exists.')).toBeVisible();
    await expect(d.getByRole('textbox', { name: /Version/ })).toHaveAttribute('aria-invalid', 'true');
  },
};

/** Create is in flight: the button spins and the fields lock. */
export const Submitting: Story = {
  args: { submitting: true },
  play: async () => {
    const d = dialog();
    await expect(d.getByRole('textbox', { name: /Title/ })).toBeDisabled();
    await expect(d.getByRole('button', { name: 'Add Features' })).toBeDisabled();
  },
};

/** Closed and reopened, it starts again from `initial`: nothing typed comes back. */
export const ResetsWhenReopened: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { open: false },
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <AnnouncementModal {...args} open={open} onClose={() => setOpen(false)} />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open' }));
    await userEvent.type(await body().findByRole('textbox', { name: /Title/ }), 'Half typed');
    await userEvent.click(body().getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(body().queryByRole('dialog')).toBeNull());
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open' }));
    await expect(await body().findByRole('textbox', { name: /Title/ })).toHaveValue('');
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

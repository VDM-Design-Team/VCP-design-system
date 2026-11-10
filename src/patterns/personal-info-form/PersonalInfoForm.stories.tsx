import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { PersonalInfoForm } from './PersonalInfoForm';
import { Icon } from '../../atoms/icon';

const LOGO = <Icon name="link" size="lg" />;

const meta = {
  title: 'Patterns/PersonalInfoForm',
  component: PersonalInfoForm,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The Personal Info tab of Settings: your name and email, and — for a domain that works in Jira — the linked Jira account. ' +
          'It keeps its own draft and hands the whole of it to `onSave`.',
      },
    },
  },
  args: {
    initial: { name: 'Ada Lovelace', email: 'ada@vdm.technology' },
    onSave: fn(),
  },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PersonalInfoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `Domain=Design`: Name and Email, then Save. */
export const Design: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('textbox', { name: 'Name' })).toHaveValue('Ada Lovelace');
    await expect(c.getByRole('textbox', { name: 'Email' })).toHaveValue('ada@vdm.technology');
    await expect(c.queryByText('Jira Account ID')).toBeNull();
    await userEvent.clear(c.getByRole('textbox', { name: 'Name' }));
    await userEvent.type(c.getByRole('textbox', { name: 'Name' }), '  Ada King ');
    await userEvent.click(c.getByRole('button', { name: 'Save' }));
    /* The whole draft, trimmed. */
    await expect(args.onSave).toHaveBeenCalledWith({ name: 'Ada King', email: 'ada@vdm.technology' });
  },
};

/** `Domain=Development`: a read-only Jira Account ID and the card to link the account. */
export const Development: Story = {
  args: {
    jira: { logo: LOGO, status: 'Not connected', onConnect: fn() },
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    /* Before the account is linked: greyed out, with its note. No example to copy: the id is never typed. */
    const id = c.getByRole('textbox', { name: 'Jira Account ID' });
    await expect(id).toBeDisabled();
    await expect(id).not.toHaveAttribute('placeholder');
    await expect(c.getByText('Auto populated after Jira connection')).toBeVisible();
    /* The card only reports its press: what connecting does is the page's. */
    await userEvent.click(c.getByRole('button', { name: 'Connect Jira' }));
    await expect(args.jira!.onConnect).toHaveBeenCalledTimes(1);
    await expect(args.onSave).not.toHaveBeenCalled();
  },
};

/** Linked: the id has arrived, and the card says so and offers Disconnect. */
export const JiraConnected: Story = {
  args: {
    jira: { accountId: '712020:abc123def456', logo: LOGO, status: 'Connected', actionLabel: 'Disconnect', onConnect: fn() },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const id = c.getByRole('textbox', { name: 'Jira Account ID' });
    await expect(id).toHaveValue('712020:abc123def456');
    /* After: a plain field (not greyed out, still read-only) and the note is gone. */
    await expect(id).toBeEnabled();
    await expect(id).toHaveAttribute('readonly');
    await expect(c.queryByText('Auto populated after Jira connection')).toBeNull();
    await expect(c.getByRole('button', { name: 'Disconnect Jira' })).toBeVisible();
  },
};

/** The id is filled in by the connection only. Connecting after the form is on screen fills it in, and Save never sends it. */
export const JiraConnectsLater: Story = {
  args: { jira: { logo: LOGO, status: 'Not connected' } },
  render: function ConnectsLater(args) {
    const [accountId, setAccountId] = React.useState<string>();
    return (
      <PersonalInfoForm
        {...args}
        jira={{
          logo: LOGO,
          accountId,
          status: accountId ? 'Connected' : 'Not connected',
          actionLabel: accountId ? 'Disconnect' : 'Connect',
          onConnect: () => setAccountId(accountId ? undefined : '712020:abc123def456'),
        }}
      />
    );
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const id = c.getByRole('textbox', { name: 'Jira Account ID' });
    await expect(id).toHaveValue('');
    await userEvent.click(c.getByRole('button', { name: 'Connect Jira' }));
    await expect(id).toHaveValue('712020:abc123def456');
    await expect(id).toHaveAttribute('readonly');
    await expect(c.queryByText('Auto populated after Jira connection')).toBeNull();
    await userEvent.click(c.getByRole('button', { name: 'Save' }));
    await expect(args.onSave).toHaveBeenCalledWith({ name: 'Ada Lovelace', email: 'ada@vdm.technology' });
  },
};

/** The profile loads after the form is on screen: the fields fill in. Once the person has typed, a later load does not overwrite it. */
export const ProfileArrivesLater: Story = {
  args: { initial: undefined },
  render: function ArrivesLater(args) {
    const [initial, setInitial] = React.useState<{ name: string; email: string }>();
    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <button type="button" onClick={() => setInitial({ name: 'Ada Lovelace', email: 'ada@vdm.technology' })}>
            Load profile
          </button>
          <button type="button" onClick={() => setInitial({ name: 'Someone Else', email: 'else@vdm.technology' })}>
            Load again
          </button>
        </div>
        <PersonalInfoForm {...args} initial={initial} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const name = c.getByRole('textbox', { name: 'Name' });
    await expect(name).toHaveValue('');
    await userEvent.click(c.getByRole('button', { name: 'Load profile' }));
    await expect(name).toHaveValue('Ada Lovelace');
    await expect(c.getByRole('textbox', { name: 'Email' })).toHaveValue('ada@vdm.technology');
    /* Typing makes the draft the person's: a later load leaves it alone. */
    await userEvent.type(name, ' King');
    await userEvent.click(c.getByRole('button', { name: 'Load again' }));
    await expect(name).toHaveValue('Ada Lovelace King');
  },
};

/** Save with Name and Email wrong: it says what, under the field, moves focus to the first, and does not go through. */
export const Validation: Story = {
  args: { initial: undefined },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Save' }));
    /* Figma's own words for the Error variant. */
    await expect(c.getByText('Name is required')).toBeVisible();
    /* The same words as `UserAccountModal`. */
    await expect(c.getByText('Enter an email address.')).toBeVisible();
    await expect(args.onSave).not.toHaveBeenCalled();
    await expect(c.getByRole('textbox', { name: 'Name' })).toHaveFocus();
    /* Fixing a field clears what was said about it. */
    await userEvent.type(c.getByRole('textbox', { name: 'Name' }), 'Ada');
    await expect(c.queryByText('Name is required')).toBeNull();
    await userEvent.type(c.getByRole('textbox', { name: 'Email' }), 'ada@');
    await userEvent.click(c.getByRole('button', { name: 'Save' }));
    await expect(c.getByText(/Enter a valid email address/)).toBeVisible();
    await expect(args.onSave).not.toHaveBeenCalled();
  },
};

/** An email this person cannot change here (a single sign-on's, or an admin's): read-only, so it can still be reached, selected and copied. It is not checked. */
export const EmailReadOnly: Story = {
  args: { emailReadOnly: true },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const email = c.getByRole('textbox', { name: 'Email' });
    await expect(email).toHaveAttribute('readonly');
    await expect(email).toBeEnabled();
    await expect(email).toHaveValue('ada@vdm.technology');
    /* Reachable with the keyboard, and typing changes nothing. */
    await userEvent.click(c.getByRole('textbox', { name: 'Name' }));
    await userEvent.tab();
    await expect(email).toHaveFocus();
    await userEvent.keyboard('x');
    await expect(email).toHaveValue('ada@vdm.technology');
    await userEvent.click(c.getByRole('button', { name: 'Save' }));
    await expect(args.onSave).toHaveBeenCalledWith({ name: 'Ada Lovelace', email: 'ada@vdm.technology' });
  },
};

/** What only the server knows. An editable Email shows it under the field. */
export const ServerErrors: Story = {
  args: { errors: { email: 'That email address is already in use.' } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('That email address is already in use.')).toBeVisible();
    await expect(c.getByRole('textbox', { name: 'Email' })).toHaveAttribute('aria-invalid', 'true');
  },
};

/** While Save is in flight, it spins and the fields lock. */
export const Saving: Story = {
  args: { saving: true, jira: { logo: LOGO, status: 'Not connected' } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('button', { name: 'Save' })).toHaveAttribute('aria-busy', 'true');
    await expect(c.getByRole('textbox', { name: 'Name' })).toBeDisabled();
    await expect(c.getByRole('button', { name: 'Connect Jira' })).toBeDisabled();
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { ...Development, globals: { theme: 'dark' }, play: undefined };

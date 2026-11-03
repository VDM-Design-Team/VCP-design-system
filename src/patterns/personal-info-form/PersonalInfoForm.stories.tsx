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
    const id = c.getByRole('textbox', { name: 'Jira Account ID' });
    await expect(id).toBeDisabled();
    await expect(id).toHaveAttribute('placeholder', 'e.g. 712020:abc123...');
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
    await expect(c.getByRole('textbox', { name: 'Jira Account ID' })).toHaveValue('712020:abc123def456');
    await expect(c.getByRole('button', { name: 'Disconnect Jira' })).toBeVisible();
  },
};

/** Save with Name and Email wrong: it says what, under the field, moves focus to the first, and does not go through. */
export const Validation: Story = {
  args: { initial: undefined },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Save' }));
    await expect(c.getByText('Enter your name.')).toBeVisible();
    await expect(c.getByText('Enter your email address.')).toBeVisible();
    await expect(args.onSave).not.toHaveBeenCalled();
    await expect(c.getByRole('textbox', { name: 'Name' })).toHaveFocus();
    /* Fixing a field clears what was said about it. */
    await userEvent.type(c.getByRole('textbox', { name: 'Name' }), 'Ada');
    await expect(c.queryByText('Enter your name.')).toBeNull();
    await userEvent.type(c.getByRole('textbox', { name: 'Email' }), 'ada@');
    await userEvent.click(c.getByRole('button', { name: 'Save' }));
    await expect(c.getByText(/Enter a valid email address/)).toBeVisible();
    await expect(args.onSave).not.toHaveBeenCalled();
  },
};

/** What only the server knows. */
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

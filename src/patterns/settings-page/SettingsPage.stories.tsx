import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SettingsPage, type SettingsAudience, type SettingsPageProps, type SettingsTabKey } from './SettingsPage';
import { Icon } from '../../atoms/icon';
import { SegmentedControl } from '../../atoms/segmented-control';
import { ChangePasswordForm } from '../change-password-form';
import { ManualsTable, type ManualRow } from '../manuals-table';
import { PersonalInfoForm } from '../personal-info-form';
import { SystemChangelog } from '../system-changelog';
import { UsersTable, type UserRow } from '../users-table';

const USERS: UserRow[] = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@vdm.technology', status: 'approved', dateAdded: '4 months ago' },
  { id: 2, name: 'Grace Hopper', email: 'grace@vdm.technology', status: 'pending', dateAdded: '2 weeks ago' },
  { id: 3, name: 'Alan Turing', email: 'alan@vdm.technology', status: 'inactive', dateAdded: '1 year ago' },
];

const MANUALS: ManualRow[] = [
  {
    id: 1,
    name: 'Getting started with VCP',
    uploadedBy: { name: 'Ada Lovelace', email: 'ada@vdm.technology' },
    attachmentCount: 2,
    dateAdded: '4 months ago',
  },
  {
    id: 2,
    name: 'Planning a cycle',
    uploadedBy: { name: 'Grace Hopper', email: 'grace@vdm.technology' },
    attachmentCount: 0,
    dateAdded: '3 weeks ago',
  },
];

/** Settings' body for a tab. The tabs with a pattern use it; the two that are not built yet say so. */
const placeholder = (what: string) => (
  <div className="rounded-md bg-surface-elevated p-6 text-body-md-regular text-text-secondary">{what}: not built yet.</div>
);

/** What a page would pass. Only the audience's own tabs show, so one set of panels serves both. */
const PANELS: Partial<Record<SettingsTabKey, React.ReactNode>> = {
  'personal-info': <PersonalInfoForm initial={{ name: 'Ada Lovelace', email: 'ada@vdm.technology' }} onSave={fn()} />,
  password: <ChangePasswordForm onSubmit={fn()} />,
  changelog: (
    <SystemChangelog
      title="Changelog"
      releases={[
        { id: 'a', title: 'Faster search', version: 'v1.18.1', date: '2026-11-04', description: 'Search answers as you type.' },
        { id: 'b', title: 'Holiday Registry', version: 'v1.18.0', date: '2026-10-21', description: 'See who is away.' },
      ]}
    />
  ),
  users: <UsersTable rows={USERS} search="" onSearchChange={fn()} page={1} pageCount={1} onPageChange={fn()} onNewUser={fn()} onView={fn()} />,
  'admin-panel': placeholder('Admin Panel'),
  announcements: placeholder('Announcements'),
  manuals: <ManualsTable rows={MANUALS} page={1} pageCount={1} onPageChange={fn()} />,
};

const meta = {
  title: 'Patterns/SettingsPage',
  component: SettingsPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The main content of Settings: the title, the tabs and the tab that is showing. The user’s and the admin’s Settings are one layout with two ' +
          'tab lists, so `audience` picks which. It goes inside `AppShell`. Controlled and slot-based: the page passes each tab’s body.',
      },
    },
  },
  args: { panels: PANELS, onTabChange: fn() },
  argTypes: { audience: { control: 'inline-radio', options: ['user', 'admin'] } },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-surface-canvas">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SettingsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const tabNames = (c: ReturnType<typeof within>) => c.getAllByRole('tab').map((t: HTMLElement) => t.textContent);

/** The user's Settings: Personal Info, Password, Changelog. Personal Info shows first. */
export const User: Story = {
  args: { audience: 'user', backLabel: 'Back to the dashboard', onBack: fn() },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
    await expect(tabNames(c)).toEqual(['Personal Info', 'Password', 'Changelog']);
    await expect(c.getByRole('tab', { name: 'Personal Info' })).toHaveAttribute('aria-selected', 'true');
    await expect(c.getByRole('textbox', { name: 'Name' })).toBeVisible();
    await userEvent.click(c.getByRole('tab', { name: 'Password' }));
    await expect(args.onTabChange).toHaveBeenCalledWith('password');
    await expect(c.getByLabelText('Old Password')).toBeVisible();
    /* The panel the tab points at is the one showing. */
    const panel = c.getByRole('tabpanel', { name: 'Password' });
    await expect(c.getByRole('tab', { name: 'Password' })).toHaveAttribute('aria-controls', panel.id);
    await expect(c.queryByRole('textbox', { name: 'Name' })).toBeNull();
  },
};

/** The admin's Settings: six tabs, with Users, Admin Panel, Announcements and Manuals between Personal Info and Password. */
export const Admin: Story = {
  args: { audience: 'admin' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(tabNames(c)).toEqual(['Personal Info', 'Users', 'Admin Panel', 'Announcements', 'Manuals', 'Password']);
    await userEvent.click(c.getByRole('tab', { name: 'Users' }));
    await expect(c.getByRole('button', { name: /New User/ })).toBeVisible();
    await userEvent.click(c.getByRole('tab', { name: 'Manuals' }));
    await expect(c.getByText('Getting started with VCP')).toBeVisible();
  },
};

/** One page that can be flipped between the two, as the audience would change with who signs in. Moving to a tab the other audience lacks lands on its first. */
export const SwitchAudience: Story = {
  render: function Render(args: SettingsPageProps) {
    const [audience, setAudience] = React.useState<SettingsAudience>('admin');
    return (
      <div>
        <div className="flex items-center gap-3 bg-surface-elevated px-8 py-3">
          <span id="audience-label" className="text-label-sm-medium text-text-secondary">
            Showing the Settings of
          </span>
          <SegmentedControl
            aria-labelledby="audience-label"
            value={audience}
            onChange={(v) => setAudience(v as SettingsAudience)}
            options={[
              { value: 'user', label: 'User' },
              { value: 'admin', label: 'Admin' },
            ]}
          />
        </div>
        <SettingsPage {...args} audience={audience} defaultTab="users" />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(tabNames(c)).toHaveLength(6);
    await expect(c.getByRole('tab', { name: 'Users' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(c.getByRole('radio', { name: 'User' }));
    await expect(tabNames(c)).toEqual(['Personal Info', 'Password', 'Changelog']);
    /* Users is the admin's: the user's Settings opens on its first tab instead of showing nothing. */
    await expect(c.getByRole('tab', { name: 'Personal Info' })).toHaveAttribute('aria-selected', 'true');
    await expect(c.getByRole('textbox', { name: 'Name' })).toBeVisible();
    await userEvent.click(c.getByRole('radio', { name: 'Admin' }));
    await expect(tabNames(c)).toHaveLength(6);
  },
};

/** Opened on another tab. */
export const StartsOnAnotherTab: Story = {
  args: { audience: 'user', defaultTab: 'changelog' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('tab', { name: 'Changelog' })).toHaveAttribute('aria-selected', 'true');
    await expect(c.getByText('Faster search')).toBeVisible();
  },
};

/** The Development domain's Personal Info carries the Jira Account ID and the card to link the account. It is the form's `jira`, which the page passes for a domain that works in Jira: the layout does not change. */
export const DevelopmentDomain: Story = {
  args: {
    audience: 'user',
    panels: {
      ...PANELS,
      'personal-info': (
        <PersonalInfoForm
          initial={{ name: 'Ada Lovelace', email: 'ada@vdm.technology' }}
          onSave={fn()}
          jira={{ logo: <Icon name="link" size="lg" />, status: 'Not connected', onConnect: fn() }}
        />
      ),
    },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('textbox', { name: 'Jira Account ID' })).toBeDisabled();
    await expect(c.getByRole('button', { name: 'Connect Jira' })).toBeVisible();
  },
};

/** A page that has not built every tab leaves it out: the bar shows only the tabs that open something. */
export const OnlyWhatIsBuilt: Story = {
  args: {
    audience: 'admin',
    panels: { 'personal-info': PANELS['personal-info'], users: PANELS.users, password: PANELS.password },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(tabNames(c)).toEqual(['Personal Info', 'Users', 'Password']);
  },
};

/** The arrow takes the person back to where they came from. */
export const WithBackLink: Story = {
  args: { audience: 'user', backHref: '/dashboard', backLabel: 'Back to the dashboard' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('link', { name: 'Back to the dashboard' })).toHaveAttribute('href', '/dashboard');
  },
};

/** Dark theme. */
export const DarkTheme: Story = {
  args: { audience: 'admin', defaultTab: 'users' },
  globals: { theme: 'dark' },
};

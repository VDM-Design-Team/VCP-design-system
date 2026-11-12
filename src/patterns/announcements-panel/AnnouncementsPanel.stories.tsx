import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import type { Announcement } from '../../lib/announcement';
import { AnnouncementsPanel, type AnnouncementsPanelProps } from './AnnouncementsPanel';

const SEED: Announcement[] = [
  { id: 3, title: 'Faster search', version: 'v1.18.1', kind: 'update', date: '2026-05-20', description: 'Search answers as you type.', features: ['Instant results'] },
  { id: 2, title: 'Domain budgets arrive in Settings', version: 'v1.18.0', kind: 'feature', date: '2026-05-04', description: 'Budgets are editable per domain.', changelogUrl: 'https://example.com/changelog', features: ['Edit budget per domain', 'Cycle summary'] },
  { id: 1, title: 'Bulk actions (preview)', version: 'v1.17.0', kind: 'experimental', date: '2026-04-12', features: [] },
];

const overviewOf = (list: readonly Announcement[]) => ({ total: list.length, latestVersion: list[0]?.version ?? 'v0.0.0', lastUpdated: list[0]?.date ?? '2026-01-01' });

/** What a page does: it owns the list and changes it when it is asked. `request` stands in for the server. */
function Harness({ request, initial = SEED, ...props }: Partial<AnnouncementsPanelProps> & { request?: () => Promise<unknown> | void; initial?: readonly Announcement[] }) {
  const [list, setList] = React.useState(initial);
  return (
    <AnnouncementsPanel
      {...props}
      announcements={list}
      overview={overviewOf(list)}
      onCreate={async (draft) => {
        await request?.();
        setList((all) => [{ ...draft, id: Date.now(), date: '2026-05-21' }, ...all]);
      }}
      onUpdate={async (announcement, draft) => {
        await request?.();
        setList((all) => all.map((a) => (a.id === announcement.id ? { ...a, ...draft } : a)));
      }}
      onDelete={async (announcement) => {
        await request?.();
        setList((all) => all.filter((a) => a.id !== announcement.id));
      }}
      onViewChangelog={props.onViewChangelog ?? fn()}
      onRefresh={props.onRefresh ?? fn()}
    />
  );
}

const meta = {
  title: 'Patterns/AnnouncementsPanel',
  component: AnnouncementsPanel,
  parameters: {
    layout: 'padded',
    docs: {
      story: { inline: false, height: '720px' },
      description: {
        component:
          'The Announcements tab of Settings: the overview, the list, and the dialogs behind it (create, edit, delete). The page passes the announcements and answers ' +
          '`onCreate`, `onUpdate` and `onDelete`; a callback may return a promise. View Changelog and Refresh only ask.',
      },
    },
  },
  args: { announcements: SEED, overview: overviewOf(SEED), onCreate: fn(), onUpdate: fn(), onDelete: fn(), onViewChangelog: fn(), onRefresh: fn() },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AnnouncementsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const dialog = (name: string) => screen.findByRole('dialog', { name });

/** The overview and the list, with New Announcement, View Changelog and Refresh above it. */
export const Default: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('button', { name: /New Announcement/ })).toBeVisible();
    await expect(c.getByRole('button', { name: /View Changelog/ })).toBeVisible();
    await expect(c.getByText('Faster search')).toBeVisible();
    await expect(c.getByText('Domain budgets arrive in Settings')).toBeVisible();
  },
};

/** New Announcement opens "Create Announcement"; Create adds the row at the top and the dialog closes. */
export const Creating: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: /New Announcement/ }));
    const d = within(await dialog('Create Announcement'));
    await userEvent.type(d.getByRole('textbox', { name: /Title/ }), 'Keyboard shortcuts');
    await userEvent.type(d.getByRole('textbox', { name: /Version/ }), 'v1.19.0');
    await userEvent.selectOptions(d.getByRole('combobox', { name: /Announcement Type/ }), 'feature');
    await userEvent.click(d.getByRole('button', { name: 'Create' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await expect(c.getByText('Keyboard shortcuts')).toBeVisible();
  },
};

/** A row's Edit opens the same form, filled; Save changes the row. */
export const Editing: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Actions for Faster search' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Edit' }));
    const d = within(await dialog('Edit Announcement'));
    const title = d.getByRole('textbox', { name: /Title/ });
    await expect(title).toHaveValue('Faster search');
    await userEvent.clear(title);
    await userEvent.type(title, 'Much faster search');
    await userEvent.click(d.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await expect(c.getByText('Much faster search')).toBeVisible();
  },
};

/** Delete asks first, naming the announcement. The row goes, and focus is not dropped: it lands on the next row's menu button. */
export const Deleting: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Actions for Faster search' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: /Delete/ }));
    const d = within(await screen.findByRole('alertdialog', { name: 'Are you sure you want to delete this announcement?' }));
    await expect(d.getByRole('textbox', { name: 'Announcement' })).toHaveValue('Faster search');
    await userEvent.click(d.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(c.queryByText('Faster search')).toBeNull());
    await waitFor(() => expect(c.getByRole('button', { name: 'Actions for Domain budgets arrive in Settings' })).toHaveFocus());
  },
};

/** Deleting the last row: focus goes to the previous row's menu button. */
export const DeletingTheLastRow: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Actions for Bulk actions (preview)' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: /Delete/ }));
    const d = within(await screen.findByRole('alertdialog'));
    await userEvent.click(d.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(c.queryByText('Bulk actions (preview)')).toBeNull());
    await waitFor(() => expect(c.getByRole('button', { name: 'Actions for Domain budgets arrive in Settings' })).toHaveFocus());
  },
};

/** Deleting the only row: the list is empty, and focus goes to New Announcement. */
export const DeletingTheOnlyRow: Story = {
  render: () => <Harness initial={[SEED[0]]} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Actions for Faster search' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: /Delete/ }));
    await userEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(c.queryByText('Faster search')).toBeNull());
    await waitFor(() => expect(c.getByRole('button', { name: /New Announcement/ })).toHaveFocus());
  },
};

/** The request fails: the dialog stays open so the person can try again, and nothing was added. */
export const WhenTheRequestFails: Story = {
  render: () => (
    <Harness
      request={async () => {
        throw new Error('Could not save');
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: /New Announcement/ }));
    const d = within(await dialog('Create Announcement'));
    await userEvent.type(d.getByRole('textbox', { name: /Title/ }), 'Keyboard shortcuts');
    await userEvent.type(d.getByRole('textbox', { name: /Version/ }), 'v1.19.0');
    await userEvent.selectOptions(d.getByRole('combobox', { name: /Announcement Type/ }), 'feature');
    await userEvent.click(d.getByRole('button', { name: 'Create' }));
    await waitFor(() => expect(d.getByRole('button', { name: 'Create' })).toBeEnabled());
    await expect(screen.getByRole('dialog', { name: 'Create Announcement' })).toBeVisible();
    await expect(c.queryByText('Keyboard shortcuts')).toBeNull();
  },
};

/** View Changelog and Refresh only ask: the page goes to the System Changelog, and reloads. */
export const ViewChangelogAndRefresh: Story = {
  args: { onViewChangelog: fn(), onRefresh: fn() },
  render: (args) => <Harness onViewChangelog={args.onViewChangelog} onRefresh={args.onRefresh} />,
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: /View Changelog/ }));
    await expect(args.onViewChangelog).toHaveBeenCalledTimes(1);
    await userEvent.click(c.getByRole('button', { name: /Refresh/ }));
    await expect(args.onRefresh).toHaveBeenCalledTimes(1);
  },
};

export const Loading: Story = { args: { loading: true } };
export const Refreshing: Story = { args: { refreshing: true, onRefresh: fn() } };
export const DarkTheme: Story = { render: () => <Harness />, globals: { theme: 'dark' } };

import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { AnnouncementsTable, type AnnouncementRow } from './AnnouncementsTable';
import { ToastProvider, ToastViewport, useToast } from '../../components/toast';
import { ConfirmDeleteModal } from '../confirm-delete-modal';

const ROWS: AnnouncementRow[] = [
  { id: 1, version: 'v1.18.1', title: 'Domain budgets arrive in Settings', kind: 'feature', date: '2026-05-20', features: ['Edit budget per domain', 'Cycle summary'] },
  { id: 2, version: 'v1.18.0', title: 'Title of announcement item goes here (very long title name that must be cut so the table keeps its shape)', kind: 'feature', date: '2026-05-06', features: ['Some announcement feature name goes on and on and on and on and on'] },
  { id: 3, version: 'v1.17.2', title: 'Faster search', kind: 'update', date: '2026-04-22', features: ['Search by role'] },
  { id: 4, version: 'v1.17.1', title: 'Fixes for the planning table', kind: 'experimental', date: '2026-04-09', features: [] },
];

const meta = {
  title: 'Patterns/AnnouncementsTable',
  component: AnnouncementsTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The Announcements tab’s list: New Announcement, View Changelog and Refresh above, and each announcement’s version, title, ' +
          'type, date and features, with Edit and Delete in a menu on every row. Controlled: every button only asks.',
      },
    },
  },
  args: {
    rows: ROWS,
    onNew: fn(),
    onViewChangelog: fn(),
    onRefresh: fn(),
    onEdit: fn(),
    onDelete: fn(),
  },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AnnouncementsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's tab: the three buttons, then Version, Title, Type, Date, Features and a menu per row. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('table', { name: 'Announcements' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'New Announcement' }));
    await expect(args.onNew).toHaveBeenCalled();
    await userEvent.click(c.getByRole('button', { name: 'View Changelog' }));
    await expect(args.onViewChangelog).toHaveBeenCalled();
    await userEvent.click(c.getByRole('button', { name: 'Refresh' }));
    await expect(args.onRefresh).toHaveBeenCalled();
    /* Each row's menu is named for its announcement; Edit and Delete only ask. */
    await userEvent.click(c.getByRole('button', { name: 'Actions for Faster search' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Edit' }));
    await expect(args.onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 3 }));
    /* The menu closes on choosing; only then open it again. */
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    await userEvent.click(c.getByRole('button', { name: 'Actions for Fixes for the planning table' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: /^Delete/ }));
    await expect(args.onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 4 }));
  },
};

/** The Type tag is the kind's word and tone from the one owner; Version is plain text, so a Feature row has one blue tag, not two. */
export const Types: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const color = (el: HTMLElement) => getComputedStyle(el).color;
    const feature = c.getAllByText('Feature')[0] as HTMLElement;
    const update = c.getByText('Update');
    const experimental = c.getByText('Experimental');
    await expect(new Set([color(feature), color(update), color(experimental)]).size).toBe(3);
    /* The version is text, not a tag: the tag's pill is not around it. */
    const version = c.getByText('v1.18.1');
    await expect(getComputedStyle(version).borderRadius).toBe('0px');
    await expect(getComputedStyle(version).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  },
};

/** The date is ISO, shown dd/mm/yyyy (or the person's locale) in a `<time>`. */
export const Dates: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const date = c.getByText('20/05/2026');
    await expect(date.tagName).toBe('TIME');
    await expect(date).toHaveAttribute('datetime', '2026-05-20');
  },
};

/** No announcements. */
export const Empty: Story = { args: { rows: [] } };

/** While they load: the buttons and headers stay, each cell is a placeholder, and one status says so. */
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('status')).toHaveTextContent('Loading announcements');
    await expect(c.queryByRole('button', { name: /^Actions for/ })).toBeNull();
    await expect(c.getByRole('button', { name: 'New Announcement' })).toBeVisible();
  },
};

/** A reload is not a first load: Refresh shows its loading state and the rows stay on screen, with no placeholders. */
export const Refreshing: Story = {
  args: { refreshing: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('button', { name: 'Refresh' })).toHaveAttribute('aria-busy', 'true');
    await expect(c.getByRole('status')).toHaveTextContent('Refreshing announcements');
    /* The rows are still there, and so are their menus. */
    await expect(c.getByText('Faster search')).toBeVisible();
    await expect(c.getByRole('button', { name: 'Actions for Faster search' })).toBeVisible();
  },
};

/* ---- The whole page: what the table asks for, and what the page does about it. ---- */

function AnnouncementsPage() {
  const [all, setAll] = React.useState<readonly AnnouncementRow[]>(ROWS);
  const [deleting, setDeleting] = React.useState<AnnouncementRow | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const { toast } = useToast();
  const root = React.useRef<HTMLDivElement>(null);
  /* Whose menu button takes focus once the row is gone (`null`: New Announcement, when nothing is left). The table only reports the delete, so the page owns this. */
  const focusAfter = React.useRef<{ title: string | null } | null>(null);
  React.useEffect(() => {
    const pending = focusAfter.current;
    if (!pending || (deleting && all.some((a) => a.id === deleting.id))) return;
    focusAfter.current = null;
    /* After the dialog has handed focus back to a button that no longer exists. */
    const timer = setTimeout(() => {
      const next = pending.title ? root.current?.querySelector<HTMLElement>(`button[aria-label="Actions for ${pending.title}"], button[title="Actions for ${pending.title}"]`) : null;
      (next ?? root.current?.querySelector<HTMLElement>('button'))?.focus();
    }, 0);
    return () => clearTimeout(timer);
  }, [all, deleting]);

  return (
    <div ref={root}>
      <AnnouncementsTable
        rows={all}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => setRefreshing(false), 400);
        }}
        onDelete={(row) => setDeleting(all.find((a) => a.id === row.id) ?? null)}
      />
      <ConfirmDeleteModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        itemLabel="Announcement"
        itemName={deleting?.title ?? ''}
        onConfirm={() => {
          if (!deleting) return;
          /* Focus goes to the next row's menu, or the previous one's when it was the last, or New Announcement when the table is empty. */
          const at = all.findIndex((row) => row.id === deleting.id);
          const neighbour = all[at + 1] ?? all[at - 1];
          focusAfter.current = { title: neighbour?.title ?? null };
          setAll((a) => a.filter((x) => x.id !== deleting.id));
          toast({ tone: 'success', title: 'Announcement deleted', description: `${deleting.title} was deleted.` });
          setDeleting(null);
        }}
      />
    </div>
  );
}

/**
 * The page around the table: **Delete** asks first (a confirmation dialog), then removes the row and says so with a toast, and **focus moves
 * on purpose** because the row's menu button goes with the row; **Refresh** shows its loading state and keeps the rows.
 */
export const OnThePage: Story = {
  render: () => (
    <ToastProvider position="top-right">
      <AnnouncementsPage />
      <ToastViewport />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const remove = async (title: string) => {
      await userEvent.click(c.getByRole('button', { name: `Actions for ${title}` }));
      await userEvent.click(await screen.findByRole('menuitem', { name: /^Delete/ }));
      const confirm = await screen.findByRole('alertdialog');
      await expect(within(confirm).getByRole('textbox', { name: 'Announcement' })).toHaveValue(title);
      await userEvent.click(within(confirm).getByRole('button', { name: 'Delete' }));
      await waitFor(() => expect(c.queryByRole('button', { name: `Actions for ${title}` })).toBeNull());
    };

    /* Refresh: its loading state, the rows stay, then it settles. */
    await userEvent.click(c.getByRole('button', { name: 'Refresh' }));
    await expect(c.getByRole('button', { name: 'Refresh' })).toHaveAttribute('aria-busy', 'true');
    await expect(c.getByText('Faster search')).toBeVisible();
    await waitFor(() => expect(c.getByRole('button', { name: 'Refresh' })).not.toHaveAttribute('aria-busy'));

    /* Delete asks first; Cancel keeps the row and the dialog returns focus to its menu. */
    await userEvent.click(c.getByRole('button', { name: 'Actions for Faster search' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: /^Delete/ }));
    await userEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await expect(c.getByText('Faster search')).toBeVisible();

    /* Delete for real: the row goes, a toast says so, and focus did not fall to the page: it is on the next row's menu button. */
    await remove('Faster search');
    await expect(await screen.findByText('Announcement deleted')).toBeVisible();
    await waitFor(() => expect(c.getByRole('button', { name: 'Actions for Fixes for the planning table' })).toHaveFocus());

    /* The last row goes: the one before it takes focus. */
    await remove('Fixes for the planning table');
    await waitFor(() => expect(c.getByRole('button', { name: /^Actions for Title of announcement/ })).toHaveFocus());

    /* Down to the last one: nothing follows or precedes it, so focus goes to New Announcement. */
    await remove('Title of announcement item goes here (very long title name that must be cut so the table keeps its shape)');
    await waitFor(() => expect(c.getByRole('button', { name: 'Actions for Domain budgets arrive in Settings' })).toHaveFocus());
    await remove('Domain budgets arrive in Settings');
    await waitFor(() => expect(c.getByRole('button', { name: 'New Announcement' })).toHaveFocus());
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

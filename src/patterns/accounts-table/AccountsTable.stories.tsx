import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { AccountsTable, type AccountRow } from './AccountsTable';
import type { DataTableSort } from '../../components/data-table';
import type { DomainAccessRow } from '../../components/domain-access-table';
import { Button } from '../../atoms/button';
import { ToastProvider, ToastViewport, useToast } from '../../components/toast';
import { ConfirmDeleteModal } from '../confirm-delete-modal';
import { UserAccountModal, type UserAccountDraft } from '../user-account-modal';

/* Twenty accounts, newest first. `days` is the story's own sort key; the table only ever sees the words. */
const PEOPLE = [
  'John', 'Michael', 'Sarah', 'David', 'Jessica', 'Daniel', 'Laura', 'Emily', 'Priya', 'Omar',
  'Chen', 'Ingrid', 'Tomas', 'Aisha', 'Lucas', 'Nadia', 'Felix', 'Mina', 'Hugo', 'Zara',
];
const DAYS = [7, 30, 90, 180, 270, 365, 730, 730, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900];
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'} ago`;
const ago = (days: number) =>
  days < 30 ? plural(days, 'day') : days < 365 ? plural(Math.round(days / 30), 'month') : plural(Math.round(days / 365), 'year');

const ACCOUNTS = PEOPLE.map((name, i) => ({
  id: name.toLowerCase(),
  name,
  email: `${name.toLowerCase()}@vdm.technology`,
  domains: i % 3 === 2 ? ['Design', 'BESA Content'] : ['Design'],
  dateAdded: ago(DAYS[i]),
  days: DAYS[i],
}));

type Account = (typeof ACCOUNTS)[number];

const PAGE_SIZE = 8;

/* What the page does with the table's state: filter by the search, sort, take a page. The table does none of it. */
function useAccounts(all: readonly Account[]) {
  const [search, setSearch] = React.useState('');
  const [sort, setSort] = React.useState<DataTableSort | undefined>(undefined);
  const [page, setPage] = React.useState(1);
  const q = search.trim().toLowerCase();
  const filtered = all.filter((a) => !q || `${a.name} ${a.email} ${a.domains.join(' ')}`.toLowerCase().includes(q));
  const sorted = sort
    ? [...filtered].sort((a, b) => {
        const d = sort.key === 'name' ? a.name.localeCompare(b.name) : a.days - b.days;
        return sort.direction === 'asc' ? d : -d;
      })
    : filtered;
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  return {
    rows: sorted.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE) as AccountRow[],
    search,
    sort,
    page: current,
    pageCount,
    itemCount: sorted.length,
    pageSize: PAGE_SIZE,
    onSearchChange: (s: string) => {
      setSearch(s);
      setPage(1);
    },
    onSortChange: setSort,
    onPageChange: setPage,
  };
}

const meta = {
  title: 'Patterns/AccountsTable',
  component: AccountsTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The Accounts page’s list of users: a search box, their name and email, the domains they are in, when they were added, ' +
          'edit and delete on every row, and the pages beneath. Controlled: it filters, sorts and pages nothing itself, and ' +
          'edit and delete only ask.',
      },
    },
  },
  args: {
    rows: ACCOUNTS.slice(0, 8) as AccountRow[],
    search: '',
    onSearchChange: fn(),
    page: 1,
    pageCount: 3,
    itemCount: 20,
    pageSize: 8,
    onPageChange: fn(),
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
} satisfies Meta<typeof AccountsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's page: a name with their email, the domains, when they were added, and edit and delete. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('table', { name: 'Accounts' })).toBeVisible();
    await expect(c.getByText('john@vdm.technology')).toBeVisible();
    await expect(c.getByText('7 days ago')).toBeVisible();
    await expect(c.getAllByText('BESA Content').length).toBeGreaterThan(0);
    /* Each button is named for its row. */
    await userEvent.click(c.getByRole('button', { name: 'Edit John' }));
    await expect(args.onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'john' }));
    await userEvent.click(c.getByRole('button', { name: 'Delete Michael' }));
    await expect(args.onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'michael' }));
    /* The row buttons are a glyph and nothing else at rest — no outline — and wash on hover. */
    const edit = c.getByRole('button', { name: 'Edit Sarah' });
    await expect(getComputedStyle(edit).borderTopWidth).toBe('0px');
    await expect(/, 0\)$/.test(getComputedStyle(edit).backgroundColor)).toBe(true);
    /* (`:hover` cannot be driven from a test, so the wash is checked as what it is: the hover and press classes.) */
    await expect(edit.className).toContain('hover:bg-action-secondary-surface-hover');
    await expect(edit.className).toContain('active:bg-action-secondary-surface-pressed');
    await expect(c.getByRole('button', { name: 'Delete Sarah' }).className).toContain('hover:bg-accent-critical-outline-surface-hover');
    /* Both sortable columns have a sort button; Domains and Actions do not. */
    await expect(c.getByRole('button', { name: /Name/ })).toBeVisible();
    await expect(c.getByRole('button', { name: /Date Added/ })).toBeVisible();
    await expect(c.queryByRole('button', { name: /Domains/ })).toBeNull();
  },
};

/** Live: search narrows the list, a header sorts it, the pager turns the page — all done by the page, not the table. */
export const Interactive: Story = {
  render: (args) => {
    const state = useAccounts(ACCOUNTS);
    return <AccountsTable {...args} {...state} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByRole('row')).toHaveLength(1 + 8);
    await userEvent.type(c.getByRole('searchbox', { name: 'Search accounts' }), 'priya');
    await waitFor(() => expect(c.getAllByRole('row')).toHaveLength(1 + 1));
    await expect(c.getByText('priya@vdm.technology')).toBeVisible();
    /* Nothing matches: it says so, with the words searched. */
    await userEvent.clear(c.getByRole('searchbox', { name: 'Search accounts' }));
    await userEvent.type(c.getByRole('searchbox', { name: 'Search accounts' }), 'zzz');
    await expect(await c.findByText('No accounts match “zzz”.')).toBeVisible();
  },
};

/** Sorting by name: the page reorders, and the header says which way (`aria-sort`). */
export const Sorting: Story = {
  render: (args) => {
    const state = useAccounts(ACCOUNTS);
    return <AccountsTable {...args} {...state} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: /Name/ }));
    await expect(c.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'ascending');
    /* A–Z: Aisha first. */
    const firstRow = c.getAllByRole('row')[1];
    await expect(within(firstRow).getByText('Aisha')).toBeVisible();
  },
};

/** No accounts at all. */
export const Empty: Story = { args: { rows: [], itemCount: 0, pageCount: 1 } };

/** While the accounts load: the search and headers stay, each cell is a placeholder, and one status says so. */
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('status')).toHaveTextContent('Loading accounts');
    await expect(c.queryByRole('button', { name: /^Edit/ })).toBeNull();
    await expect(c.getByRole('searchbox', { name: 'Search accounts' })).toBeVisible();
  },
};

/* ---- The whole page: what the table asks for, and what the page does about it. ---- */

const DOMAINS: DomainAccessRow[] = [
  { id: 'design', domain: 'Design', access: false, admin: false },
  { id: 'content', domain: 'BESA Content', access: false, admin: false },
  { id: 'partner', domain: 'BESA Partner', access: false, admin: false },
  { id: 'test', domain: 'BESA Test', access: false, admin: false },
];

function AccountsPage() {
  const [all, setAll] = React.useState<readonly Account[]>(ACCOUNTS);
  const state = useAccounts(all);
  const { toast } = useToast();
  const [editing, setEditing] = React.useState<Account | 'new' | null>(null);
  const [deleting, setDeleting] = React.useState<Account | null>(null);

  const submit = (draft: UserAccountDraft) => {
    if (editing === 'new') {
      const added: Account = {
        id: draft.name.toLowerCase(),
        name: draft.name,
        email: draft.email,
        domains: draft.access.filter((d) => d.access || d.admin).map((d) => d.domain),
        dateAdded: 'just now',
        days: 0,
      };
      setAll((a) => [added, ...a]);
      toast({ tone: 'success', title: 'User added', description: `${draft.name} was added.` });
    }
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing('new')}>Add Account</Button>
      </div>
      <AccountsTable
        {...state}
        onEdit={(row) => setEditing(all.find((a) => a.id === row.id) ?? null)}
        onDelete={(row) => setDeleting(all.find((a) => a.id === row.id) ?? null)}
      />

      <UserAccountModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        mode={editing === 'new' ? 'new' : 'edit'}
        initial={
          editing && editing !== 'new'
            ? { name: editing.name, email: editing.email, status: 'Approved', proficiency: 'Junior', capacityPoints: 10 }
            : undefined
        }
        domains={DOMAINS}
        statusOptions={['Approved', 'Pending', 'Suspended']}
        proficiencyOptions={['Junior', 'Mid', 'Senior']}
        onSubmit={submit}
      />

      <ConfirmDeleteModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        itemLabel="User"
        itemName={deleting?.name ?? ''}
        onConfirm={() => {
          if (!deleting) return;
          setAll((a) => a.filter((x) => x.id !== deleting.id));
          toast({ tone: 'success', title: 'User deleted', description: `${deleting.name} was deleted.` });
          setDeleting(null);
        }}
      />
    </div>
  );
}

/**
 * The page around the table: **Add Account** opens the user dialog (new), **edit** opens it filled, and **delete** asks first
 * — a confirmation dialog — then removes the row and says so with a toast. The table only asked; the page did the rest.
 */
export const OnThePage: Story = {
  render: () => (
    <ToastProvider position="top-right">
      <AccountsPage />
      <ToastViewport />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    /* Edit: the dialog opens with the person's name as its title. */
    await userEvent.click(c.getByRole('button', { name: 'Edit John' }));
    await expect(await screen.findByRole('dialog', { name: 'John' })).toBeVisible();
    await userEvent.click(within(screen.getByRole('dialog', { name: 'John' })).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    /* Delete: it asks first — nothing is deleted yet. */
    await userEvent.click(c.getByRole('button', { name: 'Delete Michael' }));
    const confirm = await screen.findByRole('alertdialog');
    await expect(within(confirm).getByRole('textbox', { name: 'User' })).toHaveValue('Michael');
    await expect(c.getByText('michael@vdm.technology')).toBeVisible();
    /* Cancel keeps them. */
    await userEvent.click(within(confirm).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await expect(c.getByText('michael@vdm.technology')).toBeVisible();

    /* Delete for real: the row goes, and a toast says so. */
    await userEvent.click(c.getByRole('button', { name: 'Delete Michael' }));
    await userEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(c.queryByText('michael@vdm.technology')).toBeNull());
    await expect(await screen.findByText('User deleted')).toBeVisible();

    /* Add Account: a new, empty dialog. */
    await userEvent.click(c.getByRole('button', { name: 'Add Account' }));
    await expect(await screen.findByRole('dialog', { name: 'User' })).toBeVisible();
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

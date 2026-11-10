import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { UsersTable, type UserRow } from './UsersTable';
import { ACCOUNT_STATUS_OPTIONS } from '../../components/account-status-tag';
import type { DataTableSort } from '../../components/data-table';
import { ToastProvider, ToastViewport, useToast } from '../../components/toast';
import { UserAccountModal, type UserAccountDraft } from '../user-account-modal';

/* Twenty users. `days` is the story's own sort key; the table only ever sees the words. */
const PEOPLE = [
  'John', 'Michael', 'Sarah', 'David', 'Jessica', 'Daniel', 'Laura', 'Emily', 'Priya', 'Omar',
  'Chen', 'Ingrid', 'Tomas', 'Aisha', 'Lucas', 'Nadia', 'Felix', 'Mina', 'Hugo', 'Zara',
];
const STATUSES = ['approved', 'approved', 'pending', 'approved', 'inactive', 'approved', 'approved', 'pending', 'approved', 'approved'];
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'} ago`;
const ago = (days: number) =>
  days < 30 ? plural(days, 'day') : days < 365 ? plural(Math.round(days / 30), 'month') : plural(Math.round(days / 365), 'year');

const USERS = PEOPLE.map((name, i) => ({
  id: name.toLowerCase(),
  name,
  email: `${name.toLowerCase()}@vdm.technology`,
  status: STATUSES[i % STATUSES.length],
  dateAdded: ago(30 * (i + 1)),
  days: 30 * (i + 1),
}));

type User = (typeof USERS)[number];

const PAGE_SIZE = 8;

/* What the page does with the table's state: filter by the search, sort, take a page. The table does none of it. */
function useUsers(all: readonly User[]) {
  const [search, setSearch] = React.useState('');
  const [sort, setSort] = React.useState<DataTableSort | undefined>(undefined);
  const [page, setPage] = React.useState(1);
  const q = search.trim().toLowerCase();
  const filtered = all.filter((u) => !q || `${u.name} ${u.email}`.toLowerCase().includes(q));
  const sorted = sort
    ? [...filtered].sort((a, b) => {
        const d = sort.key === 'name' ? a.name.localeCompare(b.name) : sort.key === 'status' ? a.status.localeCompare(b.status) : a.days - b.days;
        return sort.direction === 'asc' ? d : -d;
      })
    : filtered;
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  return {
    rows: sorted.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE) as UserRow[],
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
  title: 'Patterns/UsersTable',
  component: UsersTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The Settings Users tab’s list: a search box, each person’s name and email, their status and when they were added, ' +
          'View on every row, + New User in the header, and the pages beneath. Controlled: it filters, sorts and pages nothing ' +
          'itself, and New User and View only ask.',
      },
    },
  },
  args: {
    rows: USERS.slice(0, 8) as UserRow[],
    search: '',
    onSearchChange: fn(),
    page: 1,
    pageCount: 3,
    itemCount: 20,
    pageSize: 8,
    onPageChange: fn(),
    onNewUser: fn(),
    onView: fn(),
  },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UsersTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's tab: a name with their email, a status tag, when they were added, View on each row and + New User in the header. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('table', { name: 'Users' })).toBeVisible();
    await expect(c.getByText('john@vdm.technology')).toBeVisible();
    await expect(c.getByText('1 month ago')).toBeVisible();
    /* New User sits in the Actions header, which keeps its name for assistive tech. */
    await expect(c.getByRole('columnheader', { name: /Actions/ })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'New User' }));
    await expect(args.onNewUser).toHaveBeenCalled();
    /* Each View is named for its row. */
    await userEvent.click(c.getByRole('button', { name: 'View John' }));
    await expect(args.onView).toHaveBeenCalledWith(expect.objectContaining({ id: 'john' }));
    /* Name, Status and Date Added sort; Actions does not. */
    await expect(c.getByRole('button', { name: /Status/ })).toBeVisible();
    await expect(c.queryByRole('button', { name: /Actions/ })).toBeNull();
  },
};

/** The status is an `AccountStatusTag`, the owner of account statuses: Approved green, Pending yellow, Inactive grey. No status is red. */
export const StatusTones: Story = {
  args: {
    rows: [
      { id: 1, name: 'Ada', email: 'ada@vdm.technology', status: 'approved', dateAdded: '1 month ago' },
      { id: 2, name: 'Ben', email: 'ben@vdm.technology', status: 'pending', dateAdded: '2 months ago' },
      { id: 3, name: 'Cy', email: 'cy@vdm.technology', status: 'inactive', dateAdded: '3 months ago' },
    ],
    itemCount: 3,
    pageCount: 1,
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const color = (text: string) => getComputedStyle(c.getByText(text)).color;
    await expect(new Set([color('Approved'), color('Pending'), color('Inactive')]).size).toBe(3);
  },
};

/** Live: search narrows the list, a header sorts it, the pager turns the page — all done by the page, not the table. */
export const Interactive: Story = {
  render: (args) => {
    const state = useUsers(USERS);
    return <UsersTable {...args} {...state} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByRole('row')).toHaveLength(1 + 8);
    await userEvent.type(c.getByRole('searchbox', { name: 'Search users' }), 'priya');
    await waitFor(() => expect(c.getAllByRole('row')).toHaveLength(1 + 1));
    await expect(c.getByText('priya@vdm.technology')).toBeVisible();
    /* Nothing matches: it says so, with the words searched. */
    await userEvent.clear(c.getByRole('searchbox', { name: 'Search users' }));
    await userEvent.type(c.getByRole('searchbox', { name: 'Search users' }), 'zzz');
    await expect(await c.findByText('No users match “zzz”.')).toBeVisible();
  },
};

/** Sorting by name: the page reorders, and the header says which way (`aria-sort`). */
export const Sorting: Story = {
  render: (args) => {
    const state = useUsers(USERS);
    return <UsersTable {...args} {...state} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: /Name/ }));
    await expect(c.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'ascending');
    /* A–Z: Aisha first. */
    await expect(within(c.getAllByRole('row')[1]).getByText('Aisha')).toBeVisible();
  },
};

/** No users at all. */
export const Empty: Story = { args: { rows: [], itemCount: 0, pageCount: 1 } };

/** While the users load: the search, the headers and + New User stay, each cell is a placeholder, and one status says so. */
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('status')).toHaveTextContent('Loading users');
    await expect(c.queryByRole('button', { name: /^View/ })).toBeNull();
    await expect(c.getByRole('searchbox', { name: 'Search users' })).toBeVisible();
    /* + New User stays, so focus returning to it after a create does not fall to the page. */
    const add = c.getByRole('button', { name: 'New User' });
    add.focus();
    await expect(add).toHaveFocus();
    await userEvent.click(add);
    await expect(args.onNewUser).toHaveBeenCalled();
  },
};

/* ---- The whole tab: what the table asks for, and what the page does about it. ---- */

const ROLES = [
  { value: 'junior', label: 'Junior Product Designer' },
  { value: 'designer', label: 'Product Designer' },
  { value: 'senior', label: 'Senior Product Designer' },
];

function UsersPage() {
  const [all, setAll] = React.useState<readonly User[]>(USERS);
  const state = useUsers(all);
  const { toast } = useToast();
  const [open, setOpen] = React.useState<User | 'new' | null>(null);

  const submit = (draft: UserAccountDraft) => {
    if (open === 'new') {
      const added: User = {
        id: draft.name.toLowerCase(),
        name: draft.name,
        email: draft.email,
        status: draft.status || 'pending',
        dateAdded: 'just now',
        days: 0,
      };
      setAll((a) => [added, ...a]);
      toast({ tone: 'success', title: 'User created', description: `${draft.name} was created.` });
    } else {
      toast({ tone: 'success', title: 'User updated', description: `${draft.name} was updated.` });
    }
    setOpen(null);
  };

  return (
    <>
      <UsersTable {...state} onNewUser={() => setOpen('new')} onView={(row) => setOpen(all.find((u) => u.id === row.id) ?? null)} />
      <UserAccountModal
        open={open !== null}
        onClose={() => setOpen(null)}
        mode={open === 'new' ? 'new' : 'edit'}
        title={open === 'new' ? 'Create New User' : undefined}
        initial={
          open === 'new'
            ? { status: 'pending' }
            : open
              ? { name: open.name, email: open.email, status: open.status, capacityPoints: 10, roles: ['senior'] }
              : undefined
        }
        roles={ROLES}
        statusOptions={ACCOUNT_STATUS_OPTIONS}
        onSubmit={submit}
      />
    </>
  );
}

/**
 * The tab around the table: **+ New User** opens “Create New User”, **View** opens the user (their name as the title, with Roles
 * in place of Proficiency), and Submit says so with a toast. The table only asked; the page did the rest.
 */
export const OnThePage: Story = {
  render: () => (
    <ToastProvider position="top-right">
      <UsersPage />
      <ToastViewport />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    /* View: the dialog opens with the person's name, their role ticked. */
    await userEvent.click(c.getByRole('button', { name: 'View John' }));
    const view = await screen.findByRole('dialog', { name: 'John' });
    await expect(within(view).getByRole('checkbox', { name: 'Senior Product Designer' })).toBeChecked();
    await expect(within(view).getByRole('checkbox', { name: 'Junior Product Designer' })).not.toBeChecked();
    /* Roles only: no Proficiency. The Status list is the owner's three. */
    await expect(within(view).queryByRole('combobox', { name: 'Proficiency' })).toBeNull();
    await expect(within(within(view).getByRole('combobox', { name: 'Status' })).getAllByRole('option').map((o) => o.textContent).filter(Boolean)).toEqual(
      expect.arrayContaining(['Approved', 'Pending', 'Inactive']),
    );
    await userEvent.click(within(view).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    /* New User: a new dialog, titled Create New User, status Pending. */
    await userEvent.click(c.getByRole('button', { name: 'New User' }));
    const create = await screen.findByRole('dialog', { name: 'Create New User' });
    await userEvent.type(within(create).getByRole('textbox', { name: 'Name' }), 'Wren');
    await userEvent.type(within(create).getByRole('textbox', { name: 'Email' }), 'wren@vdm.technology');
    await userEvent.click(within(create).getByRole('checkbox', { name: 'Product Designer' }));
    await userEvent.click(within(create).getByRole('button', { name: 'Submit' }));
    await expect(await screen.findByText('User created')).toBeVisible();
    await waitFor(() => expect(c.getByText('wren@vdm.technology')).toBeVisible());
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

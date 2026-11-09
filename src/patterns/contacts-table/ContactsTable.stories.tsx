import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { ContactsTable, type ContactRow } from './ContactsTable';
import { ToastProvider, ToastViewport, useToast } from '../../components/toast';
import { ConfirmDeleteModal } from '../confirm-delete-modal';

/* Twenty messages. */
const WHO = ['john', 'michael', 'sarah', 'david', 'jessica', 'daniel', 'laura', 'emily', 'priya', 'omar'];
const ALL: ContactRow[] = Array.from({ length: 20 }, (_, i) => ({
  id: `m${i + 1}`,
  email: `${WHO[i % WHO.length]}${i >= WHO.length ? i : ''}@vdm.technology`,
  subject: 'Some subject here',
  message: 'Some message here',
}));

const PAGE_SIZE = 8;

const meta = {
  title: 'Patterns/ContactsTable',
  component: ContactsTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The Contact List page: the messages people sent through the contact form — who, what about, and what they said — ' +
          'with a delete button on every row and the pages beneath. Controlled: it pages nothing itself, and delete only asks.',
      },
    },
  },
  args: {
    rows: ALL.slice(0, PAGE_SIZE),
    page: 1,
    pageCount: 3,
    itemCount: ALL.length,
    pageSize: PAGE_SIZE,
    onPageChange: fn(),
    onDelete: fn(),
  },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ContactsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's page: who, the subject, the message, and a delete on every row. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('table', { name: 'Contact messages' })).toBeVisible();
    await expect(c.getByText('john@vdm.technology')).toBeVisible();
    await expect(c.getAllByText('Some subject here')).toHaveLength(8);
    /* The bin is named for its row, and only asks. */
    await userEvent.click(c.getByRole('button', { name: 'Delete message from john@vdm.technology' }));
    await expect(args.onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'm1' }));
    /* The plain glyph-only IconButton: no outline, no fill; the glyph is the critical red. */
    const bin = c.getByRole('button', { name: 'Delete message from michael@vdm.technology' });
    await expect(getComputedStyle(bin).borderTopWidth).toBe('0px');
    await expect(getComputedStyle(bin).color).not.toBe(getComputedStyle(c.getByRole('columnheader', { name: 'Email' })).color);
  },
};

/** Live: the pager turns the page (the page does the slicing, not the table). */
export const Paging: Story = {
  render: (args) => {
    const [page, setPage] = React.useState(1);
    return (
      <ContactsTable
        {...args}
        page={page}
        pageCount={Math.ceil(ALL.length / PAGE_SIZE)}
        rows={ALL.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
        onPageChange={setPage}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByRole('row')).toHaveLength(1 + 8);
    await userEvent.click(c.getByRole('button', { name: 'Page 3' }));
    /* The last page has the other four. */
    await waitFor(() => expect(c.getAllByRole('row')).toHaveLength(1 + 4));
  },
};

/** A long message wraps and is shown whole: nothing here can open it, and an admin has to be able to read what was sent. */
export const LongMessage: Story = {
  args: {
    rows: [
      {
        id: 'long',
        email: 'priya@vdm.technology',
        subject: 'Question about access for the BESA domains',
        message:
          'Hello — I was added to the Design domain last month but I still cannot see the BESA Content or BESA Partner ' +
          'domains in my sidebar. Could someone check whether my access was set up correctly, and let me know if I need ' +
          'to request it separately? Thanks very much for your help, and sorry if this is the wrong place to ask.',
      },
      ...ALL.slice(0, 2),
    ],
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const message = c.getByText(/sorry if this is the wrong place to ask/);
    await expect(message).toBeVisible();
    /* Wrapped, not cut: the whole of it is in the DOM and more than one line tall. */
    await expect(message.getBoundingClientRect().height).toBeGreaterThan(40);
  },
};

/** No messages. */
export const Empty: Story = {
  args: { rows: [], itemCount: 0, pageCount: 1 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('No messages yet.')).toBeVisible();
  },
};

/** While the messages load: the headers stay, each cell is a placeholder, and one status says so. */
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('status')).toHaveTextContent('Loading messages');
    await expect(c.queryByRole('button', { name: /^Delete/ })).toBeNull();
    await expect(c.getByRole('columnheader', { name: 'Message' })).toBeVisible();
  },
};

/* ---- The page: what the table asks for, and what the page does about it. ---- */

function ContactsPage({ initial = ALL }: { initial?: readonly ContactRow[] }) {
  const [all, setAll] = React.useState<readonly ContactRow[]>(initial);
  const [page, setPage] = React.useState(1);
  const [deleting, setDeleting] = React.useState<ContactRow | null>(null);
  const { toast } = useToast();
  const root = React.useRef<HTMLDivElement>(null);
  /* Whose Delete button takes focus once the row is gone (`null`: the empty message). The table only reports the delete, so the page owns this. */
  const focusAfter = React.useRef<{ email: string | null } | null>(null);
  React.useEffect(() => {
    const pending = focusAfter.current;
    if (!pending || (deleting && all.some((a) => a.id === deleting.id))) return;
    focusAfter.current = null;
    /* After the dialog has handed focus back to a button that no longer exists. */
    const timer = setTimeout(() => {
      const label = `Delete message from ${pending.email}`;
      const next = pending.email ? root.current?.querySelector<HTMLElement>(`button[aria-label="${label}"], button[title="${label}"]`) : null;
      /* Nothing left: the empty message says why the page is empty, so focus goes there. */
      /* Or, when the page emptied but others remain (the last row of the last page), the first Delete on the page that took its place. */
      const first = root.current?.querySelector<HTMLElement>('button[aria-label^="Delete message from"], button[title^="Delete message from"]');
      const empty = root.current?.querySelector<HTMLElement>('h3');
      if (!next && !first && empty) empty.tabIndex = -1;
      (next ?? first ?? empty)?.focus();
    }, 0);
    return () => clearTimeout(timer);
  }, [all, deleting]);
  const pageCount = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);

  return (
    <div ref={root}>
      <ContactsTable
        rows={all.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)}
        page={current}
        pageCount={pageCount}
        itemCount={all.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onDelete={setDeleting}
      />
      <ConfirmDeleteModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        itemLabel="Contact"
        itemName={deleting?.email ?? ''}
        onConfirm={() => {
          if (!deleting) return;
          /* Focus goes to the next row's Delete, or the previous one's when it was the last, or the empty message when nothing is left. */
          const visible = all.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
          const at = visible.findIndex((row) => row.id === deleting.id);
          const neighbour = visible[at + 1] ?? visible[at - 1];
          focusAfter.current = { email: neighbour?.email ?? null };
          setAll((a) => a.filter((x) => x.id !== deleting.id));
          toast({ tone: 'success', title: 'Message deleted', description: `The message from ${deleting.email} was deleted.` });
          setDeleting(null);
        }}
      />
    </div>
  );
}

/**
 * The page around the table: **delete** asks first — a confirmation dialog — then removes the row and says so with a toast. The table
 * only asked; the page did the rest.
 */
export const OnThePage: Story = {
  render: () => (
    <ToastProvider position="top-right">
      <ContactsPage />
      <ToastViewport />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Delete message from michael@vdm.technology' }));
    const confirm = await screen.findByRole('alertdialog');
    await expect(within(confirm).getByRole('textbox', { name: 'Contact' })).toHaveValue('michael@vdm.technology');
    /* Nothing is deleted until it is confirmed; Cancel keeps the message. */
    await userEvent.click(within(confirm).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await expect(c.getByText('michael@vdm.technology')).toBeVisible();

    await userEvent.click(c.getByRole('button', { name: 'Delete message from michael@vdm.technology' }));
    await userEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(c.queryByText('michael@vdm.technology')).toBeNull());
    await expect(await screen.findByText('Message deleted')).toBeVisible();
    /* Focus did not fall to the page: it is on the next message's Delete button (the one after Michael's). */
    const buttons = () => c.getAllByRole('button', { name: /^Delete message from/ });
    await waitFor(() => expect(buttons()[1]).toHaveFocus());
  },
};

/** The last message: nothing follows or precedes it, so once it is deleted focus goes to the empty message ("No messages yet.") rather than falling to the page. */
export const DeletingTheLastMessage: Story = {
  render: () => (
    <ToastProvider position="top-right">
      <ContactsPage initial={ALL.slice(0, 1)} />
      <ToastViewport />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: /^Delete message from/ }));
    await userEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(c.getByRole('heading', { name: 'No messages yet.' })).toHaveFocus());
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

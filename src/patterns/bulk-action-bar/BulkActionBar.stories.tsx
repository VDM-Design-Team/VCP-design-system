import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { BulkActionBar, type BulkAction } from './BulkActionBar';
import type { MenuItem } from '../../components/menu';
import { AVTable, type AVTableRow } from '../av-table';
import { BulkActionConfirmModal } from '../bulk-action-confirm-modal';
import { BulkActionFailedModal, type BulkActionFailure } from '../bulk-action-failed-modal';
import { ConfirmDeleteAVModal } from '../confirm-delete-av-modal';
import { ToastProvider, ToastViewport, useToast } from '../../components/toast';
import { UrgencyTag, type AVUrgency } from '../../components/urgency-tag';
import type { AVType } from '../../components/type-tag';

const URGENCIES = ['Low', 'Normal', 'High', 'Urgent'] as const;
const TYPES = ['Type 1', 'Type 2', 'Type 3'] as const;
const CYCLE_DATES = [
  ['C33', '2026-05-25', '2026-06-08'],
  ['C34', '2026-06-08', '2026-06-22'],
  ['C35', '2026-06-22', '2026-07-06'],
  ['C36', '2026-07-06', '2026-07-20'],
  ['C37', '2026-07-20', '2026-08-03'],
  ['C38', '2026-08-03', '2026-08-17'],
  ['C39', '2026-08-03', '2026-08-17'],
] as const;
const day = (iso: string) => new Date(`${iso}T00:00`).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
/* "C33 (May 25, 2026 - Jun 08, 2026)", as Figma's Cycle menu reads; the key is the code. */
const CYCLES = CYCLE_DATES.map(([code, start, end]) => ({ key: code, label: `${code} (${day(start)} - ${day(end)})`, code, start, end }));

/* Statuses are the domain's data, so the page passes them in. **Development** is Figma's list (`Bulk_Actions_Dropdowns`, Type=Status), with a submenu on Pending Review and on Review. */
const review = (key: string, label: string) => ({
  key,
  label,
  items: [
    { key: `${key}/accept`, label: 'Accept' },
    { key: `${key}/reject`, label: 'Reject' },
  ],
});
const DEVELOPMENT_STATUSES: MenuItem[] = [
  { key: 'draft', label: 'Save as Draft' },
  { key: 'submit', label: 'Submit' },
  review('pending-review', 'Pending Review'),
  { key: 'in-progress', label: 'In Progress' },
  { key: 'handoff', label: 'Handoff' },
  { key: 'for-review', label: 'For Review' },
  { key: 'in-qa', label: 'In QA' },
  { key: 'for-qa', label: 'For QA' },
  { key: 'ready-for-deploy', label: 'Ready for Deploy' },
  { key: 'confirmed-prod', label: 'Confirmed Prod' },
  review('review', 'Review'),
  { key: 'backlog', label: 'Backlog' },
];
/* **Design** has the same idea with its own steps, and a submenu where it has a review. Figma does not draw this list: it is built from the status progression (Design Review),
   so the steps and where the submenus sit are for design to confirm. */
const DESIGN_STATUSES: MenuItem[] = [
  { key: 'draft', label: 'Save as Draft' },
  { key: 'submit', label: 'Submit' },
  review('pending-review', 'Pending Review'),
  { key: 'in-progress', label: 'In Progress' },
  { key: 'handoff', label: 'Handoff' },
  { key: 'design-review', label: 'Design Review' },
  review('review', 'Review'),
  { key: 'backlog', label: 'Backlog' },
];

const actionsFor = (statuses: MenuItem[], onSelect: (property: string, key?: string) => void = fn()): BulkAction[] => [
  { key: 'status', label: 'Status', heading: 'Move to Status', items: statuses, onSelect: (key) => onSelect('Status', key) },
  { key: 'urgency', label: 'Urgency', items: URGENCIES.map((u) => ({ key: u, label: u })), onSelect: (key) => onSelect('Urgency', key) },
  { key: 'type', label: 'Type', items: TYPES.map((t) => ({ key: t, label: t })), onSelect: (key) => onSelect('Type', key) },
  { key: 'cycle', label: 'Cycle', searchable: true, items: CYCLES.map((c) => ({ key: c.key, label: c.label })), onSelect: (key) => onSelect('Cycle', key) },
];

const choose = fn();
const ACTIONS = actionsFor(DEVELOPMENT_STATUSES, choose);

const meta = {
  title: 'Patterns/BulkActionBar',
  component: BulkActionBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The bar over an AV table once rows are selected: “4 Selected ✕”, a dropdown each for Status, Urgency, Type and Cycle, and Delete. Every ' +
          'choice only asks; the page confirms before anything changes.',
      },
    },
  },
  args: { count: 4, onClear: fn(), actions: ACTIONS, onDelete: fn() },
  decorators: [
    (Story) => (
      <div className="flex h-screen items-end justify-center bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BulkActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's bar: “4 Selected ✕”, then Status, Urgency, Type, Cycle and a red Delete. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('toolbar', { name: 'Bulk actions' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: /4 Selected/ }));
    await expect(args.onClear).toHaveBeenCalled();
    await userEvent.click(c.getByRole('button', { name: 'Delete' }));
    await expect(args.onDelete).toHaveBeenCalled();
  },
};

/** Each action is a menu that opens above, with its category-style heading; a choice only asks. */
export const OpeningAMenu: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Urgency' }));
    const menu = await screen.findByRole('menu', { name: 'Urgency' });
    await expect(within(menu).getAllByRole('menuitem').map((i) => i.textContent)).toEqual(['Low', 'Normal', 'High', 'Urgent']);
    await userEvent.click(within(menu).getByRole('menuitem', { name: 'High' }));
    await expect(choose).toHaveBeenCalledWith('Urgency', 'High');
  },
};

/**
 * The Status menu for **development** (Figma's list): "Move to Status", twelve steps, and a **submenu on Pending Review and on Review** (Accept, Reject), shown with a right caret. The
 * same caret says "submenu" everywhere a `Menu` has one.
 */
export const StatusMenuDevelopment: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Status' }));
    const menu = await screen.findByRole('menu', { name: 'Move to Status' });
    await expect(within(menu).getAllByRole('menuitem')).toHaveLength(12);
    const pending = within(menu).getByRole('menuitem', { name: 'Pending Review' });
    await expect(pending).toHaveAttribute('aria-haspopup', 'menu');
    await expect(within(menu).getByRole('menuitem', { name: 'Review' })).toHaveAttribute('aria-haspopup', 'menu');
    await expect(within(menu).getByRole('menuitem', { name: 'Backlog' })).not.toHaveAttribute('aria-haspopup');
    await userEvent.click(pending);
    const sub = await screen.findByRole('menu', { name: 'Pending Review' });
    await userEvent.click(within(sub).getByRole('menuitem', { name: 'Accept' }));
    await expect(choose).toHaveBeenCalledWith('Status', 'pending-review/accept');
  },
};

/** **Design** has the same idea with its own steps (and a submenu where it has a review). Figma does not draw this list, so the steps are for design to confirm. */
export const StatusMenuDesign: Story = {
  args: { actions: actionsFor(DESIGN_STATUSES) },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Status' }));
    const menu = await screen.findByRole('menu', { name: 'Move to Status' });
    await expect(within(menu).getByRole('menuitem', { name: 'Design Review' })).toBeVisible();
    await expect(within(menu).getByRole('menuitem', { name: 'Pending Review' })).toHaveAttribute('aria-haspopup', 'menu');
  },
};

/** On a narrow screen the bar keeps its size: nothing wraps or shrinks, and it scrolls sideways inside itself. Its menus still open (they are fixed to the screen). */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const bar = c.getByRole('toolbar', { name: 'Bulk actions' });
    await expect(bar.scrollWidth).toBeGreaterThan(bar.clientWidth);
    /* One line: every control is as tall as it is in the wide bar. */
    for (const name of ['Status', 'Urgency', 'Type', 'Cycle', 'Delete']) {
      await expect(c.getByRole('button', { name }).getBoundingClientRect().height).toBeLessThan(45);
    }
    await userEvent.click(c.getByRole('button', { name: 'Urgency' }));
    await expect(await screen.findByRole('menu', { name: 'Urgency' })).toBeVisible();
  },
};

/** One selected looks the same as many. */
export const SingleSelection: Story = {
  args: { count: 1 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: /1 Selected/ })).toBeVisible();
  },
};

/** Nothing selected: nothing drawn. */
export const NothingSelected: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { count: 0 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('toolbar')).toBeNull();
  },
};

/** Without `onDelete` there is no Delete. */
export const WithoutDelete: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  args: { onDelete: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button', { name: 'Delete' })).toBeNull();
  },
};

/* ---- On a table: select rows, change Urgency, confirm, and be told what happened. ---- */

const ROWS: AVTableRow[] = [
  { id: 'a', ref: 'VCP-12345', title: 'Collapsible Sidebar for Improved Table Workspace in VCP Admin Dashboard', domain: 'VCP', urgency: 'Normal', type: 'Type 3', status: { custom: 'Ready for Deploy' }, due: { label: 'October 1, 2025' }, lastUpdated: '7 days ago' },
  { id: 'b', ref: 'VCP-12346', title: 'Rework the notification bell so unread state survives a reload', domain: 'VCP', urgency: 'Normal', type: 'Type 3', status: { status: 'Review' }, due: { label: 'October 1, 2025' }, lastUpdated: '2 days ago' },
  { id: 'c', ref: 'VCP-12347', title: 'Audit every empty state for copy that blames the reader', domain: 'Design', urgency: 'Low', type: 'Type 1', status: { status: 'Draft' }, due: { label: 'October 1, 2025' }, lastUpdated: 'yesterday' },
];

/* A choice waiting for its confirmation: what is being changed, to what, and how that reads in the tag. */
type Pending = { property: 'Status' | 'Urgency' | 'Type' | 'Cycle'; key: string; label: string };

const labelOf = (items: MenuItem[], key: string): string => {
  for (const item of items) {
    if ('items' in item && item.items) {
      const found = item.items.find((child) => child.key === key);
      if (found) return `${item.label} › ${found.label}`;
    }
    if ('key' in item && item.key === key && 'label' in item) return String(item.label);
  }
  return key;
};

/* Which confirmation a choice opens: just the action and the list, as the pattern asks. The Status menu's keys say which flow (Figma draws Backlog, Accept and Reject). */
function ConfirmFor({ pending, items, onClose, onConfirm }: { pending: Pending; items: { ref: string; title: string }[]; onClose: () => void; onConfirm: () => void }) {
  const common = { open: true, onClose, onConfirm, items };
  const reasons = [
    { value: 'incomplete', label: 'Incomplete or Unclear Submission', explanation: 'Missing key details or not clear enough to review and proceed.' },
    { value: 'duplicate', label: 'Duplicate', explanation: 'This Added Value already exists.' },
    { value: 'out-of-scope', label: 'Out of Scope', explanation: 'This is outside what the team can take on.' },
    { value: 'other', label: 'Other', other: true },
  ];
  if (pending.property === 'Urgency') return <BulkActionConfirmModal {...common} action="urgency" value={pending.key as AVUrgency} />;
  if (pending.property === 'Type') return <BulkActionConfirmModal {...common} action="type" value={pending.key as AVType} />;
  if (pending.property === 'Cycle') {
    const cycle = CYCLES.find((c) => c.key === pending.key) ?? CYCLES[0];
    return <BulkActionConfirmModal {...common} action="cycle" value={{ code: cycle.code, start: cycle.start, end: cycle.end }} />;
  }
  switch (pending.key) {
    case 'backlog':
      return <BulkActionConfirmModal {...common} action="backlog" />;
    case 'pending-review/accept':
      return <BulkActionConfirmModal {...common} action="accept-pending" domain="development" />;
    case 'pending-review/reject':
      return <BulkActionConfirmModal {...common} action="reject-pending" reasons={reasons} />;
    case 'review/accept':
      return <BulkActionConfirmModal {...common} action="accept" domain="development" />;
    case 'review/reject':
      return <BulkActionConfirmModal {...common} action="reject" reasons={reasons} />;
    default:
      return <BulkActionConfirmModal {...common} action="status" value={pending.label} />;
  }
}

function TablePage({ failSome }: { failSome?: boolean }) {
  const { toast } = useToast();
  const [rows, setRows] = React.useState<AVTableRow[]>(ROWS);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [pending, setPending] = React.useState<Pending | null>(null);
  const [changed, setChanged] = React.useState<Pending | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [failures, setFailures] = React.useState<BulkActionFailure[] | null>(null);
  const chosen = rows.filter((r) => selected.includes(r.id));

  const apply = () => {
    if (!pending) return;
    const failed = failSome ? chosen.slice(0, 1).map((r) => ({ ref: r.ref, title: r.title, reason: 'You do not have permission to change this Added Value.' })) : [];
    const failedRefs = failed.map((f) => f.ref);
    const worked = chosen.length - failed.length;
    /* The table shows urgency, type and status, so those change on the rows; a cycle has no column here, so only the toast says it. */
    setRows((all) =>
      all.map((r) => {
        if (!selected.includes(r.id) || failedRefs.includes(r.ref)) return r;
        if (pending.property === 'Urgency') return { ...r, urgency: pending.key as AVUrgency };
        if (pending.property === 'Type') return { ...r, type: pending.key as AVType };
        if (pending.property === 'Status') return { ...r, status: { custom: pending.label.split(' › ').pop() ?? pending.label } };
        return r;
      }),
    );
    if (worked > 0) {
      toast({ tone: 'success', title: 'Added Values Updated', description: `${pending.property} changed to ${pending.label} for ${worked} Added Values.` });
    }
    if (failed.length) setFailures(failed);
    setChanged(pending);
    setPending(null);
    setSelected([]);
  };

  return (
    /* The bar floats at the bottom of the table, centred over it (Figma draws it over the last rows) — the page sticks it there. */
    <div className="relative w-full">
      <AVTable rows={rows} selectable selected={selected} onSelectedChange={setSelected} />
      <div className="sticky bottom-6 mt-6 flex justify-center">
        {/* The whole bar, as it always is: Status, Urgency, Type, Cycle and Delete. The page decides what each does; here they all open their confirmation. */}
        <BulkActionBar
          count={selected.length}
          onClear={() => setSelected([])}
          onDelete={() => setDeleting(true)}
          actions={actionsFor(DEVELOPMENT_STATUSES, (property, key) => {
            if (!key) return;
            const items = property === 'Status' ? DEVELOPMENT_STATUSES : undefined;
            setPending({ property: property as Pending['property'], key, label: items ? labelOf(items, key) : key });
          })}
        />
      </div>
      {pending && (
        <ConfirmFor pending={pending} items={chosen.map((r) => ({ ref: r.ref, title: r.title }))} onClose={() => setPending(null)} onConfirm={apply} />
      )}
      <ConfirmDeleteAVModal
        open={deleting}
        onClose={() => setDeleting(false)}
        avTitles={chosen.map((r) => `${r.ref} ${r.title}`)}
        onConfirm={() => {
          setRows((all) => all.filter((r) => !selected.includes(r.id)));
          setSelected([]);
          setDeleting(false);
        }}
      />
      <BulkActionFailedModal
        open={failures !== null}
        onClose={() => setFailures(null)}
        total={chosen.length || 2}
        property={changed?.property ?? 'Urgency'}
        value={changed?.label ?? 'High'}
        failures={failures ?? []}
      />
    </div>
  );
}

/**
 * The whole thing. **Select rows** and the bar appears; pick **Urgency › High** and the confirmation lists what will change; **Confirm** applies it
 * and a toast says so, and the selection clears. The bar and the dialogs only asked; the page did the rest.
 */
export const OnTheTable: Story = {
  decorators: [(Story) => <Story />],
  render: () => (
    <ToastProvider position="top-right">
      <TablePage />
      <ToastViewport />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole('toolbar')).toBeNull();
    await userEvent.click(c.getByRole('checkbox', { name: /Select VCP-12345/ }));
    await userEvent.click(c.getByRole('checkbox', { name: /Select VCP-12346/ }));
    await expect(await c.findByRole('button', { name: /2 Selected/ })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Urgency' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'High' }));
    const dialog = await screen.findByRole('dialog', { name: 'Change Urgency for 2 Added Values' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    await expect(await screen.findByText('Added Values Updated')).toBeVisible();
    await waitFor(() => expect(c.queryByRole('toolbar')).toBeNull());
  },
};

/** **Delete** asks first, with every selected Added Value listed one per line; Delete then removes them, and the bar goes with the selection. */
export const DeletingSeveral: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  decorators: [(Story) => <Story />],
  render: () => (
    <ToastProvider position="top-right">
      <TablePage />
      <ToastViewport />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('checkbox', { name: /Select VCP-12345/ }));
    await userEvent.click(c.getByRole('checkbox', { name: /Select VCP-12346/ }));
    await userEvent.click(await c.findByRole('button', { name: 'Delete' }));
    const dialog = await screen.findByRole('alertdialog');
    await expect((within(dialog).getByRole('textbox', { name: 'Added Value' }) as HTMLTextAreaElement).value.split('\n')).toHaveLength(2);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(c.queryByText('VCP-12345')).toBeNull());
    await expect(c.getByText('VCP-12347')).toBeVisible();
  },
};

/** The Status choice goes through its submenu too: Pending Review › Accept opens the Accept Pending confirmation (the pattern draws it from the action), and Confirm changes the row's status. */
export const ChangingStatusOnTheTable: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  decorators: [(Story) => <Story />],
  render: () => (
    <ToastProvider position="top-right">
      <TablePage />
      <ToastViewport />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('checkbox', { name: /Select VCP-12345/ }));
    await userEvent.click(await c.findByRole('button', { name: 'Status' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Pending Review' }));
    await userEvent.click(await within(await screen.findByRole('menu', { name: 'Pending Review' })).findByRole('menuitem', { name: 'Accept' }));
    /* The pattern drew this itself from the action and the list: Accept Pending, development, with its Multipart Value field. */
    const dialog = await screen.findByRole('dialog', { name: 'Accept 1 Pending Added Value' });
    await expect(within(dialog).getByRole('checkbox', { name: /Multipart Value/ })).toBeVisible();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    await expect(await screen.findByText('Added Values Updated')).toBeVisible();
  },
};

/** When some fail: the toast says how many worked, and a summary names the ones that did not and why. */
export const SomeFailed: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  decorators: [(Story) => <Story />],
  render: () => (
    <ToastProvider position="top-right">
      <TablePage failSome />
      <ToastViewport />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('checkbox', { name: /Select VCP-12345/ }));
    await userEvent.click(c.getByRole('checkbox', { name: /Select VCP-12346/ }));
    await userEvent.click(await c.findByRole('button', { name: 'Urgency' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'High' }));
    const dialog = await screen.findByRole('dialog', { name: 'Change Urgency for 2 Added Values' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    await expect(await screen.findByRole('dialog', { name: 'Added Values Failed to Update' })).toBeVisible();
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

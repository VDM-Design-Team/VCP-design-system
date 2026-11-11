import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { OVERLAY_DOCS_STORY } from '../../lib/story-docs';
import type { DomainCardItem } from '../domain-card';
import { TagManagement, type TagManagementList, type TagManagementProps } from './TagManagement';

const rows = (...labels: string[]): DomainCardItem[] => labels.map((label) => ({ id: label, label }));

const DOMAINS: TagManagementList = { id: 'domains', title: 'Domains', kind: 'domain', items: rows('Design', 'BESA Content', 'BESA Partner') };
const GLOBAL: TagManagementList = { id: 'global-tags', title: 'Global Tags', items: rows('Bug', 'New Feature', 'Improvement') };
const DOMAIN_TAGS: TagManagementList = { id: 'domain-tags', title: 'Domain Tags', items: rows('General Design') };
const ROLES: TagManagementList = { id: 'roles', title: 'Roles', items: rows('Product Designer', 'Senior Product Designer', 'Design Lead') };
const STATUS: TagManagementList = {
  id: 'status',
  title: 'Status',
  items: [
    { id: 'pending', label: 'Pending', variant: 'locked' },
    { id: 'accepted', label: 'Accepted', variant: 'locked' },
    { id: 'progress', label: 'In Progress', variant: 'draggable' },
    { id: 'review-design', label: 'Design Review', variant: 'draggable' },
    { id: 'completed', label: 'Completed', variant: 'locked' },
  ],
};
const ASSIGNEE_TYPES: TagManagementList = { id: 'assignee-types', title: 'Assignee Types', items: rows('Designer', 'Reviewer') };
const PROJECTS: TagManagementList = { id: 'projects', title: 'Projects', items: rows('VCP', 'BESA', 'Design System') };

/** Super Admin sees Domains and Global Tags; Design Admin the rest. Which lists show is the page's choice. */
const SUPER_ADMIN = [DOMAINS, GLOBAL];
const DESIGN_ADMIN = [DOMAIN_TAGS, ROLES, STATUS, ASSIGNEE_TYPES, PROJECTS];

/** What a page does: it owns the lists and changes them when it is asked. */
function Harness({ initial, request, ...props }: Omit<TagManagementProps, 'lists'> & { initial: readonly TagManagementList[]; request?: () => Promise<unknown> | void }) {
  const [lists, setLists] = React.useState(initial);
  const change = (id: string, fn: (items: DomainCardItem[]) => DomainCardItem[]) =>
    setLists((all) => all.map((l) => (l.id === id ? { ...l, items: fn(l.items) } : l)));
  return (
    <TagManagement
      {...props}
      lists={lists}
      onAdd={async (list, name) => {
        await request?.();
        change(list.id, (items) => [...items, { id: name, label: name }]);
        props.onAdd?.(list, name);
      }}
      onRename={async (list, item, name) => {
        await request?.();
        change(list.id, (items) => items.map((i) => (i.id === item.id ? { ...i, label: name } : i)));
        props.onRename?.(list, item, name);
      }}
      onDelete={async (list, item) => {
        await request?.();
        change(list.id, (items) => items.filter((i) => i.id !== item.id));
        props.onDelete?.(list, item);
      }}
      onReorder={(list, ids) => {
        change(list.id, (items) => ids.map((id) => items.find((i) => i.id === id)!));
        props.onReorder?.(list, ids);
      }}
    />
  );
}

const meta = {
  title: 'Patterns/TagManagement',
  component: TagManagement,
  parameters: {
    layout: 'padded',
    docs: {
      story: OVERLAY_DOCS_STORY,
      description: {
        component:
          'The Admin Panel tab of Settings: the lists an admin keeps, as a grid of cards, and the dialogs behind them (add, rename, delete). ' +
          'The page passes the lists and answers `onAdd`, `onRename`, `onDelete` and `onReorder`; a callback may return a promise.',
      },
    },
  },
  args: { lists: SUPER_ADMIN },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TagManagement>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Super Admin: Domains and Global Tags. */
export const SuperAdmin: Story = {
  render: (args) => <Harness initial={args.lists} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { name: 'Domains' })).toBeVisible();
    await expect(c.getByRole('heading', { name: 'Global Tags' })).toBeVisible();
    await expect(c.getAllByRole('button', { name: 'Add New' })).toHaveLength(2);
  },
};

/** Design Admin: the other five. The fourth and fifth wrap under the first three. */
export const DesignAdmin: Story = {
  args: { lists: DESIGN_ADMIN },
  render: (args) => <Harness initial={args.lists} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByRole('heading').map((h) => h.textContent)).toEqual(['Domain Tags', 'Roles', 'Status', 'Assignee Types', 'Projects']);
  },
};

/** Add New opens "Add a new Tag"; the name is trimmed, the row appears, and focus is back on the button that opened it. */
export const AddingATag: Story = {
  render: (args) => <Harness initial={args.lists} onAdd={fn()} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const card = within(c.getByRole('heading', { name: 'Global Tags' }).closest('section')!);
    const add = card.getByRole('button', { name: 'Add New' });
    await userEvent.click(add);
    const dialog = await screen.findByRole('dialog', { name: 'Add a new Tag' });
    await userEvent.type(within(dialog).getByLabelText('Tag Name'), '  Chore  ');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await expect(card.getByText('Chore')).toBeVisible();
    await waitFor(() => expect(add).toHaveFocus());
  },
};

/** A domain's Add New says "Add a new Domain". */
export const AddingADomain: Story = {
  render: (args) => <Harness initial={args.lists} />,
  play: async ({ canvasElement }) => {
    const card = within(within(canvasElement).getByRole('heading', { name: 'Domains' }).closest('section')!);
    await userEvent.click(card.getByRole('button', { name: 'Add New' }));
    await expect(await screen.findByRole('dialog', { name: 'Add a new Domain' })).toBeVisible();
  },
};

/** The pencil renames: the same form, starting as the current name. */
export const RenamingATag: Story = {
  render: (args) => <Harness initial={args.lists} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Edit Bug' }));
    const dialog = await screen.findByRole('dialog', { name: 'Rename Tag' });
    const name = within(dialog).getByLabelText('Tag Name');
    await expect(name).toHaveValue('Bug');
    await userEvent.clear(name);
    await userEvent.type(name, 'Defect');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(c.getByText('Defect')).toBeVisible());
    await expect(c.queryByText('Bug')).toBeNull();
  },
};

/** A tag's delete asks first, with the system's confirmation. The row goes, and focus lands on the card's Add New, not nowhere. */
export const DeletingATag: Story = {
  render: (args) => <Harness initial={args.lists} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const card = within(c.getByRole('heading', { name: 'Global Tags' }).closest('section')!);
    await userEvent.click(card.getByRole('button', { name: 'Delete Bug' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Are you sure you want to delete this tag?' });
    await expect(within(dialog).getByRole('textbox', { name: 'Tag' })).toHaveValue('Bug');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(card.queryByText('Bug')).toBeNull());
    await waitFor(() => expect(card.getByRole('button', { name: 'Add New' })).toHaveFocus());
  },
};

/** A domain's delete is Tag Management's own question, with the domain's name. */
export const DeletingADomain: Story = {
  render: (args) => <Harness initial={args.lists} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Delete BESA Partner' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Are you sure you want to delete this domain?' });
    await expect(within(dialog).getByRole('textbox', { name: 'Domain' })).toHaveValue('BESA Partner');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await expect(c.getByText('BESA Partner')).toBeVisible();
  },
};

/** The request fails: the dialog stays open so the person can try again, and nothing was added. */
export const WhenTheRequestFails: Story = {
  render: (args) => (
    <Harness
      initial={args.lists}
      request={async () => {
        throw new Error('Could not save');
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const card = within(c.getByRole('heading', { name: 'Global Tags' }).closest('section')!);
    await userEvent.click(card.getByRole('button', { name: 'Add New' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add a new Tag' });
    await userEvent.type(within(dialog).getByLabelText('Tag Name'), 'Chore');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Submit' })).toBeEnabled());
    await expect(screen.getByRole('dialog', { name: 'Add a new Tag' })).toBeVisible();
    await expect(card.queryByText('Chore')).toBeNull();
  },
};

/** The draggable Status rows reorder, and the page hears the whole new order. */
export const Reordering: Story = {
  args: { lists: [STATUS] },
  render: (args) => <Harness initial={args.lists} onReorder={fn()} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const grip = c.getByRole('button', { name: 'Move In Progress' });
    grip.focus();
    await userEvent.keyboard(' ');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard(' ');
    /* Design Review now comes before In Progress in the page. */
    const before = c.getByText('Design Review').compareDocumentPosition(c.getByText('In Progress'));
    await expect(before & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  },
};

/** Without the callbacks the cards only read: no Add New, no pencil, no bin. */
export const ReadOnly: Story = {
  args: { lists: SUPER_ADMIN },
  render: (args) => <TagManagement lists={args.lists} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole('button', { name: 'Add New' })).toBeNull();
    await expect(c.queryByRole('button', { name: /^Edit / })).toBeNull();
  },
};

export const DarkTheme: Story = {
  args: { lists: DESIGN_ADMIN },
  render: (args) => <Harness initial={args.lists} />,
  globals: { theme: 'dark' },
};

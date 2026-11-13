import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, within } from 'storybook/test';
import { OVERLAY_DOCS_STORY } from '../../lib/story-docs';
import type { DomainCardItem } from '../domain-card';
import type { TagManagementList } from '../tag-management';
import { DomainPage, type DomainPageProps } from './DomainPage';

const rows = (...labels: string[]): DomainCardItem[] => labels.map((label) => ({ id: label, label }));

/** The Super Admin's two lists. */
const LISTS: TagManagementList[] = [
  { id: 'domains', title: 'Domains', kind: 'domain', items: rows('Design', 'BESA Content', 'BESA Partner') },
  { id: 'global-tags', title: 'Global Tags', items: rows('Bug', 'New Feature', 'Improvement') },
];

/** What the app does: it owns the lists, and changes them when it is asked. */
function Page(props: Omit<DomainPageProps, 'management'>) {
  const [lists, setLists] = React.useState(LISTS);
  const change = (id: string, fn: (items: DomainCardItem[]) => DomainCardItem[]) =>
    setLists((all) => all.map((l) => (l.id === id ? { ...l, items: fn(l.items) } : l)));
  return (
    <DomainPage
      {...props}
      management={{
        lists,
        onAdd: (list, name) => change(list.id, (items) => [...items, { id: name, label: name }]),
        onRename: (list, item, name) => change(list.id, (items) => items.map((i) => (i.id === item.id ? { ...i, label: name } : i))),
        onDelete: (list, item) => change(list.id, (items) => items.filter((i) => i.id !== item.id)),
      }}
    />
  );
}

const meta = {
  title: 'Patterns/DomainPage',
  component: DomainPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: OVERLAY_DOCS_STORY,
      description: {
        component:
          'The main content of the Super Admin’s Domain page: the title, then the Domains and Global Tags cards with their dialogs, laid out once. It goes inside `AppShell`; the app only passes the lists.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-surface-canvas">
        <Story />
      </div>
    ),
  ],
  render: () => <Page />,
} satisfies Meta<typeof DomainPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The page: its title, then the two lists. **Add New** opens the dialog, and the new name lands in its card. */
export const Default: Story = {
  args: { management: { lists: LISTS } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { level: 1, name: 'Domains' })).toBeVisible();
    const domains = c.getByRole('region', { name: 'Domains' });
    await expect(c.getByRole('region', { name: 'Global Tags' })).toBeVisible();

    await userEvent.click(within(domains).getByRole('button', { name: /Add New/ }));
    const dialog = await screen.findByRole('dialog', { name: /Add a new Domain/ });
    await userEvent.type(within(dialog).getByRole('textbox'), 'Content Studio');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
    await expect(await within(domains).findByText('Content Studio')).toBeVisible();
  },
};

export const DarkTheme: Story = { args: { management: { lists: LISTS } }, globals: { theme: 'dark' } };

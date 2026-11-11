import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ManualsTable, type ManualRow } from './ManualsTable';
import type { DataTableSort } from '../../components/data-table';

const NAMES = [
  'Onboarding guide', 'Brand guidelines', 'Design handbook', 'Release process', 'Security basics',
  'Expense policy', 'Accessibility checklist', 'Support playbook', 'Data retention', 'Writing style',
];
const PEOPLE = ['John', 'Sarah', 'Priya', 'Omar'];

const MANUALS: ManualRow[] = NAMES.map((name, i) => ({
  id: i,
  name,
  href: `https://example.com/manuals/${i}`,
  uploadedBy: { name: PEOPLE[i % PEOPLE.length], email: `${PEOPLE[i % PEOPLE.length].toLowerCase()}@vdm.technology` },
  attachmentCount: i % 4,
  dateAdded: `${i + 1} month${i === 0 ? '' : 's'} ago`,
}));

const meta = {
  title: 'Patterns/ManualsTable',
  component: ManualsTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The Settings Manuals tab’s list: each manual’s name, who uploaded it, its attachments and when it was added, with the ' +
          'pages beneath. Controlled: it sorts and pages nothing itself. Add Manual is a page-header action, not the table’s.',
      },
    },
  },
  args: {
    rows: MANUALS,
    page: 1,
    pageCount: 3,
    itemCount: 25,
    pageSize: 10,
    onPageChange: fn(),
    onSortChange: fn(),
  },
  decorators: [
    (Story) => (
      <div className="bg-surface-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ManualsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's columns: Name (sortable), Uploaded by, Attachments, Date Added. Attachments say how many. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('table', { name: 'Manuals' })).toBeVisible();
    /* The name is the way in: a link to the manual, in a new tab. */
    const name = c.getByRole('link', { name: 'Onboarding guide (opens in a new tab)' });
    await expect(name).toHaveAttribute('href', 'https://example.com/manuals/0');
    await expect(name).toHaveAttribute('target', '_blank');
    await expect(name).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(c.getAllByText('john@vdm.technology').length).toBeGreaterThan(0);
    await expect(c.getAllByText('None').length).toBeGreaterThan(0);
    await expect(c.getAllByText('1 file').length).toBeGreaterThan(0);
    await expect(c.getAllByText('2 files').length).toBeGreaterThan(0);
    /* Only Name sorts. */
    await expect(c.queryByRole('button', { name: /Uploaded by/ })).toBeNull();
    await userEvent.click(c.getByRole('button', { name: /Name/ }));
    await expect(args.onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'asc' });
  },
};

/** Sorting by name: the page reorders, and the header says which way (`aria-sort`). */
export const Sorting: Story = {
  render: (args) => {
    const [sort, setSort] = React.useState<DataTableSort | undefined>(undefined);
    const rows = sort
      ? [...MANUALS].sort((a, b) => (sort.direction === 'asc' ? 1 : -1) * a.name.localeCompare(b.name))
      : MANUALS;
    return <ManualsTable {...args} rows={rows} sort={sort} onSortChange={setSort} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: /Name/ }));
    await expect(c.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'ascending');
    await expect(within(c.getAllByRole('row')[1]).getByText('Accessibility checklist')).toBeVisible();
  },
};

/** A manual with nowhere to open (no `href`) reads as plain text, not a dead link. */
export const WithoutLinks: Story = {
  args: { rows: MANUALS.map(({ href: _href, ...row }) => row) },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Onboarding guide')).toBeVisible();
    await expect(c.queryByRole('link')).toBeNull();
  },
};

/** Figma's `Filled=No`: the headers and a database glyph over "No items." */
export const Empty: Story = {
  args: { rows: [], itemCount: 0, pageCount: 1 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('No items.')).toBeVisible();
  },
};

/** While the manuals load: the headers stay, each cell is a placeholder, and one status says so. */
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('status')).toHaveTextContent('Loading manuals');
    await expect(c.queryByText(/Onboarding guide/)).toBeNull();
    await expect(c.getByRole('columnheader', { name: /Attachments/ })).toBeVisible();
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

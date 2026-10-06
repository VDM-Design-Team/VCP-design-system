import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataTable, ColumnHint, type DataTableColumn, type DataTableSort } from './DataTable';
import { Tag } from '../../atoms/tag';
import { Avatar } from '../../atoms/avatar';
import { EmptyState } from '../empty-state';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';
import { Input } from '../../atoms/input';
import { Select } from '../../atoms/select';
import { Menu, type MenuItem } from '../menu';
import { CopyText } from '../copy-text';
import { InlineEdit, InlineDateEdit } from '../inline-edit';
import { expect, userEvent, waitFor, within } from 'storybook/test';

interface Claim {
  id: string;
  supplier: string;
  owner: string;
  status: 'active' | 'pending' | 'closed';
  points: number;
  updated: string;
}

const CLAIMS: Claim[] = [
  { id: 'AV-2041', supplier: 'Nordfjord Components', owner: 'Eve Kestrel', status: 'active', points: 34, updated: '28 Aug 2026' },
  { id: 'AV-2037', supplier: 'Baltika Fasteners', owner: 'Marvin Ode', status: 'pending', points: 12, updated: '27 Aug 2026' },
  { id: 'AV-2033', supplier: 'Helix Tooling', owner: 'Ali Reza', status: 'active', points: 21, updated: '26 Aug 2026' },
  { id: 'AV-2028', supplier: 'Nordfjord Components', owner: 'Eve Kestrel', status: 'closed', points: 40, updated: '21 Aug 2026' },
  { id: 'AV-2019', supplier: 'Verde Logistics', owner: 'Marvin Ode', status: 'pending', points: 8, updated: '19 Aug 2026' },
];

const STATUS_TONE = { active: 'success', pending: 'warning', closed: 'neutral' } as const;

const COLUMNS: DataTableColumn<Claim>[] = [
  {
    key: 'id',
    label: 'Reference',
    width: '120px',
    sortable: true,
    /* The row's action lives in a cell — a real link, reachable by keyboard.
       There is deliberately no onRowClick; see the docs. */
    render: (r) => (
      <a
        href={`#${r.id}`}
        className="rounded-sm text-label-sm-medium text-text-link-default hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused"
      >
        {r.id}
      </a>
    ),
  },
  { key: 'supplier', label: 'Supplier', sortable: true },
  { key: 'owner', label: 'Owner' },
  {
    key: 'status',
    label: 'Status',
    width: '110px',
    render: (r) => <Tag size="sm" tone={STATUS_TONE[r.status]}>{r.status}</Tag>,
  },
  {
    key: 'points',
    label: 'Points',
    width: '90px',
    sortable: true,
    render: (r) => <span className="font-numeric text-caption-md-medium text-text-primary">{r.points}</span>,
  },
  { key: 'updated', label: 'Updated', width: '130px' },
];

function useSorted(initial: DataTableSort | undefined = { key: 'id', direction: 'desc' }) {
  const [sort, setSort] = React.useState<DataTableSort | undefined>(initial);
  const rows = React.useMemo(() => {
    if (!sort) return CLAIMS;
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...CLAIMS].sort((a, b) =>
      String(a[sort.key as keyof Claim]).localeCompare(String(b[sort.key as keyof Claim]), undefined, { numeric: true }) * dir,
    );
  }, [sort]);
  return { sort, setSort, rows };
}

const meta = {
  title: 'Components/Display/DataTable',
  component: DataTable,
  parameters: {
    docs: {
      description: {
        component:
          'The generic table: a real `<table>` with `scope="col"` headers, `aria-sort`, ' +
          'optional row selection, an empty slot. It never sorts rows itself — `rows` render ' +
          'in the order given, and `onSortChange` asks the caller to reorder. There is no ' +
          '`onRowClick` (same decision as Card): put the row’s action in a cell as a real ' +
          'link. The four VCP tables will specialise this in `src/patterns/`.',
      },
    },
  },
  args: { columns: COLUMNS as DataTableColumn<unknown>[], rows: CLAIMS, caption: 'Added Value claims' },
  argTypes: {
    dense: { control: 'boolean' },
    selectable: { control: 'boolean' },
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Sortable, live: the component asks, the story reorders. */
export const Default: Story = {
  render: (args) => {
    const { sort, setSort, rows } = useSorted();
    return <DataTable {...args} rows={rows} sort={sort} onSortChange={setSort} />;
  },
};

/**
 * Selection: a select-all header checkbox (indeterminate while partial) and a
 * named checkbox per row — `selectLabel` gives each its real name.
 */
export const Selectable: Story = {
  render: (args) => {
    const [selected, setSelected] = React.useState<Array<string | number>>(['AV-2037']);
    return (
      <div className="flex flex-col gap-3">
        <DataTable
          {...args}
          selectable
          selected={selected}
          onSelectedChange={setSelected}
          selectLabel={(r) => `Select ${(r as Claim).id}`}
        />
        <span className="font-sans text-caption-md-regular text-text-tertiary">
          {selected.length} selected
        </span>
      </div>
    );
  },
};

/** 44 rows for audit-density screens. */
export const Dense: Story = {
  args: { dense: true },
};

/** The empty slot fits an `EmptyState` — copy rules from docs/empty-state.md apply. */
export const Empty: Story = {
  args: {
    rows: [],
    empty: (
      <EmptyState
        icon={<Icon name="magnifying-glass" size="lg" />}
        title="No claims match these filters"
        description="Try widening the date range or clearing the supplier filter."
        action={<Button variant="tertiary">Clear filters</Button>}
      />
    ),
  },
};

/** More width than the panel has: the container scrolls, the page does not. */
export const HorizontalScroll: Story = {
  render: (args) => (
    <div className="w-112">
      <DataTable
        {...args}
        columns={COLUMNS.map((c) => ({ ...c, width: c.width ?? '220px' })) as DataTableColumn<unknown>[]}
      />
    </div>
  ),
};

/** Every surface and stroke is a token, so dark is free. */
export const LightAndDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="grid grid-cols-1">
      {[false, true].map((isDark) => (
        <div key={String(isDark)} className={isDark ? 'dark' : undefined}>
          <div className="bg-surface-canvas p-8">
            <DataTable {...args} rows={CLAIMS.slice(0, 3)} />
          </div>
        </div>
      ))}
    </div>
  ),
};

/* ---- Recipes: how a column becomes something other than text ---- */

const ROW_ACTIONS: MenuItem[] = [
  { key: 'edit', label: 'Edit', icon: 'pencil-simple' },
  { key: 'duplicate', label: 'Duplicate' },
  { divider: true },
  { key: 'delete', label: 'Delete', icon: 'trash', tone: 'danger' },
];

const asColumns = (cols: DataTableColumn<Claim>[]) => cols as DataTableColumn<unknown>[];

/**
 * An actions column: a three-dot button that opens a `Menu`. The column's
 * `render` is just a function from the row to a node, so the menu closes over
 * the row it belongs to — `Actions for AV-2041` names the right one. The
 * trigger carries the row in its accessible name; "More actions" ten times
 * down a column is ten identical buttons to a screen reader.
 *
 * **One catch:** the menu is a child of its trigger, with no portal, so the
 * table's scroll container clips it. `className="overflow-visible"` lets it
 * out, at the price of horizontal scrolling — fine where the table fits.
 */
export const ActionsColumn: Story = {
  render: (args) => {
    const [last, setLast] = React.useState('nothing yet');
    return (
      <div className="flex min-h-80 flex-col gap-3">
        <DataTable
          {...args}
          /* A menu is a child of its trigger, so the table's own scroll
             container would clip it — `overflow-visible` lets it out. That
             costs horizontal scrolling, so use it only where the table fits. */
          className="overflow-visible"
          columns={asColumns([
            ...COLUMNS.slice(0, 4),
            {
              key: 'actions',
              label: 'Actions',
              width: '88px',
              render: (r) => (
                <Menu
                  align="right"
                  items={ROW_ACTIONS}
                  onSelect={(key) => setLast(`${key} on ${r.id}`)}
                  trigger={
                    <IconButton
                      icon="dots-three-vertical"
                      label={`Actions for ${r.id}`}
                      variant="tertiary"
                      size="sm"
                    />
                  }
                />
              ),
            },
          ])}
          rows={CLAIMS.slice(0, 3)}
        />
        <span className="font-sans text-caption-md-regular text-text-tertiary">Last chosen: {last}</span>
      </div>
    );
  },
};

/**
 * A header that explains itself: `hint` takes any node, and `ColumnHint` is the
 * ready-made one — the info glyph with a tooltip. It opens on hover and on
 * keyboard focus, and sits outside the sort button so a sortable column can
 * have one too.
 */
export const ColumnTooltips: Story = {
  render: (args) => (
    <DataTable
      {...args}
      columns={asColumns([
        { ...COLUMNS[0] },
        {
          ...COLUMNS[1],
          hint: <ColumnHint column="supplier" text="The company that raised the claim." />,
        },
        {
          ...COLUMNS[2],
          hint: <ColumnHint column="owner" text="Who is working it. Unassigned claims show nothing." />,
        },
        {
          ...COLUMNS[4],
          hint: <ColumnHint column="points" text="Capacity points the claim consumes once delivered." />,
        },
      ])}
      rows={CLAIMS.slice(0, 3)}
    />
  ),
};

/**
 * A value that is not a link but is interactive: it underlines on hover, and
 * clicking it copies it and shows "Copied" for 800ms. Use `CopyText` as the
 * cell's `render`.
 */
export const CopyableColumn: Story = {
  render: (args) => (
    <div className="pt-12">
      <DataTable
        {...args}
        columns={asColumns([
          { ...COLUMNS[0], sortable: false, render: (r) => <CopyText text={r.id} /> },
          COLUMNS[1],
          COLUMNS[2],
        ])}
        rows={CLAIMS.slice(0, 3)}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('button', { name: 'AV-2041' });
    /* Stand in for the clipboard so the test does not depend on browser permissions. */
    const written: string[] = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (t: string) => void written.push(t) },
    });
    await userEvent.click(first);
    const status = first.parentElement!.querySelector('[role="status"]')!;
    await waitFor(() => expect(status).toHaveTextContent('Copied'));
    await expect(written).toEqual(['AV-2041']);
    /* And it goes away by itself. */
    await waitFor(() => expect(status).toHaveTextContent(''), { timeout: 2000 });
  },
};

/**
 * Cells you can edit in place — three ways, one frame. **Owner** is typed
 * (`InlineEdit` around an `Input`), **Points** is chosen (`InlineEdit` around a
 * `Select`), **Due date** is picked from a calendar (`InlineDateEdit`).
 * Typing and choosing end in a confirm — cancel on the left, confirm on the
 * right, Enter and Escape too; a calendar has no confirm, because picking a day
 * is the decision. The drafts live in the story, not the components.
 *
 * The calendar opens in a popover, which the table's scroll container would
 * clip, so the table is `overflow-visible` — see Actions Column.
 */
export const InlineEditing: Story = {
  render: (args) => {
    const [rows, setRows] = React.useState(CLAIMS.slice(0, 3));
    const [due, setDue] = React.useState<Record<string, string>>({
      'AV-2041': '2026-09-28',
      'AV-2037': '2026-10-02',
      'AV-2033': '2026-10-09',
    });
    const [drafts, setDrafts] = React.useState<Record<string, string>>({});
    const draft = (id: string, key: string, fallback: string) => drafts[`${id}:${key}`] ?? fallback;
    const setDraft = (id: string, key: string, v: string) =>
      setDrafts((d) => ({ ...d, [`${id}:${key}`]: v }));
    const reset = (id: string, key: string) =>
      setDrafts((d) => {
        const next = { ...d };
        delete next[`${id}:${key}`];
        return next;
      });
    const commit = (id: string, key: 'owner' | 'points') => {
      setRows((rs) =>
        rs.map((r) =>
          r.id === id
            ? { ...r, [key]: key === 'points' ? Number(draft(id, key, String(r.points))) : draft(id, key, r.owner) }
            : r,
        ),
      );
      reset(id, key);
    };
    return (
      <div className="min-h-[28rem]">
        <DataTable
          {...args}
          className="overflow-visible"
          columns={asColumns([
            { ...COLUMNS[0], width: '110px' },
            {
              key: 'owner',
              label: 'Owner (type)',
              width: '230px',
              render: (r) => (
                <InlineEdit
                  label="owner"
                  onConfirm={() => commit(r.id, 'owner')}
                  onCancel={() => reset(r.id, 'owner')}
                  editor={
                    <Input
                      aria-label={`Owner of ${r.id}`}
                      value={draft(r.id, 'owner', r.owner)}
                      onChange={(e) => setDraft(r.id, 'owner', e.target.value)}
                    />
                  }
                >
                  {r.owner}
                </InlineEdit>
              ),
            },
            {
              key: 'points',
              label: 'Points (choose)',
              width: '190px',
              render: (r) => (
                <InlineEdit
                  label="points"
                  onConfirm={() => commit(r.id, 'points')}
                  onCancel={() => reset(r.id, 'points')}
                  editor={
                    <Select
                      aria-label={`Points for ${r.id}`}
                      size="sm"
                      value={draft(r.id, 'points', String(r.points))}
                      onChange={(v) => setDraft(r.id, 'points', v)}
                      options={['8', '12', '21', '34', '40']}
                    />
                  }
                >
                  <span className="font-numeric text-caption-md-medium text-text-primary">{r.points}</span>
                </InlineEdit>
              ),
            },
            {
              key: 'due',
              label: 'Due date (calendar)',
              width: '210px',
              render: (r) => (
                <InlineDateEdit
                  label={`due date of ${r.id}`}
                  value={due[r.id]}
                  onChange={(iso) => setDue((d) => ({ ...d, [r.id]: iso }))}
                  align="right"
                  picker={{ today: '2026-09-15' }}
                />
              ),
            },
          ])}
          rows={rows}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    /* Type: Enter confirms. */
    await userEvent.click(canvas.getAllByRole('button', { name: 'Edit owner' })[0]);
    const field = canvas.getByRole('textbox', { name: 'Owner of AV-2041' });
    await expect(field).toHaveFocus();
    /* Cancel is on the left, confirm on the right. */
    const cancel = canvas.getByRole('button', { name: 'Cancel' });
    const save = canvas.getByRole('button', { name: 'Save' });
    await expect(cancel.compareDocumentPosition(save) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await userEvent.clear(field);
    await userEvent.type(field, 'Nina Voss{Enter}');
    await expect(canvas.getByText('Nina Voss')).toBeInTheDocument();
    await expect(canvas.getAllByRole('button', { name: 'Edit owner' })[0]).toHaveFocus();

    /* Type: Escape cancels and drops the draft. */
    await userEvent.click(canvas.getAllByRole('button', { name: 'Edit owner' })[1]);
    await userEvent.type(canvas.getByRole('textbox', { name: 'Owner of AV-2037' }), 'x{Escape}');
    await expect(canvas.getByText('Marvin Ode')).toBeInTheDocument();

    /* Choose: pick, then confirm with the check. */
    await userEvent.click(canvas.getAllByRole('button', { name: 'Edit points' })[0]);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Points for AV-2041' }), '40');
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(canvas.getAllByText('40').length).toBeGreaterThan(0);

    /* Clicking away from an editing cell cancels it — here onto another cell's pen. */
    await userEvent.click(canvas.getAllByRole('button', { name: 'Edit owner' })[2]);
    await userEvent.type(canvas.getByRole('textbox', { name: 'Owner of AV-2033' }), 'zzz');
    await userEvent.click(canvas.getAllByRole('button', { name: 'Edit points' })[2]);
    await expect(canvas.queryByRole('textbox', { name: 'Owner of AV-2033' })).toBeNull();
    await expect(canvas.getByText('Ali Reza')).toBeInTheDocument();
    /* ...and so does clicking the page. */
    await userEvent.click(canvasElement.ownerDocument.body);
    await expect(canvas.queryByRole('combobox', { name: 'Points for AV-2033' })).toBeNull();

    /* The pen is not left drawn after the pointer leaves, though focus returned to it. */
    await userEvent.unhover(canvas.getAllByRole('button', { name: 'Edit points' })[2]);
    await waitFor(() =>
      expect(getComputedStyle(canvas.getAllByRole('button', { name: 'Edit points' })[2]).opacity).toBe('0'),
    );

    /* The 6 gap between a control and the buttons. */
    await userEvent.click(canvas.getAllByRole('button', { name: 'Edit owner' })[0]);
    const box = canvas.getByRole('textbox', { name: 'Owner of AV-2041' }).closest('[data-inline-editor]')!;
    await expect(
      Math.round(canvas.getByRole('button', { name: 'Cancel' }).getBoundingClientRect().left - box.getBoundingClientRect().right),
    ).toBe(6);
    await userEvent.keyboard('{Escape}');

    /* Calendar: open, pick a day, no confirm. */
    await expect(canvas.getByText('2026-09-28')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Change due date of AV-2041' }));
    await userEvent.click(await canvas.findByRole('button', { name: /^20 September 2026/ }));
    await expect(canvas.getByText('2026-09-20')).toBeInTheDocument();

    /* Dismissed — by Cancel or by clicking away — the picker is closed and the button
       is no longer held open. (That it is also not drawn without hover depends on the real
       pointer and `:focus-visible`, which a scripted click cannot reproduce; it is checked by
       hand in the browser, see the PR.) */
    const dateButton = canvas.getByRole('button', { name: 'Change due date of AV-2041' });
    await userEvent.click(dateButton);
    await expect(dateButton).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(await canvas.findByRole('button', { name: 'Cancel' }));
    await expect(dateButton).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(dateButton);
    await userEvent.click(canvasElement.ownerDocument.body);
    await expect(dateButton).toHaveAttribute('aria-expanded', 'false');
  },
};

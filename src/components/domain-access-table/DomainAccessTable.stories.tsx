import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DomainAccessTable, domainRole, type DomainAccessRow } from './DomainAccessTable';

/* The four domains Figma draws: access to one, none to the others. */
const ROWS: DomainAccessRow[] = [
  { id: 'design', domain: 'Design', access: true, admin: false },
  { id: 'content', domain: 'BESA Content', access: false, admin: false },
  { id: 'partner', domain: 'BESA Partner', access: false, admin: false },
  { id: 'test', domain: 'BESA Test', access: false, admin: false },
];

const meta = {
  title: 'Components/Forms/DomainAccessTable',
  component: DomainAccessTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Which domains a user can get into and whether they are an admin there: Access and Admin checkboxes per domain, ' +
          'and the Role they add up to. The two boxes are independent.',
      },
    },
  },
  args: { rows: ROWS, onAccessChange: fn(), onAdminChange: fn() },
  decorators: [
    (Story) => (
      <div className="w-136 bg-surface-elevated p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DomainAccessTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Live: tick Access or Admin and the Role follows. */
export const Default: Story = {
  render: (args) => {
    const [rows, setRows] = React.useState(args.rows);
    const set = (id: DomainAccessRow['id'], patch: Partial<DomainAccessRow>) =>
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    return (
      <DomainAccessTable
        {...args}
        rows={rows}
        onAccessChange={(id, access) => set(id, { access })}
        onAdminChange={(id, admin) => set(id, { admin })}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('table', { name: 'Domain access and admin rights' })).toBeVisible();
    await expect(c.getByText('User')).toBeVisible();
    await expect(c.getAllByText('No Access')).toHaveLength(3);

    await userEvent.click(c.getByRole('checkbox', { name: 'BESA Content access' }));
    await expect(c.getAllByText('User')).toHaveLength(2);
    await expect(c.getAllByText('No Access')).toHaveLength(2);

    /* Admin wins over User. ("Admin" is also the column header, so the role tag makes two.) */
    await userEvent.click(c.getByRole('checkbox', { name: 'BESA Content admin' }));
    await expect(c.getAllByText('Admin')).toHaveLength(2);
    /* Un-ticking Access does not touch Admin: the two are independent. */
    await userEvent.click(c.getByRole('checkbox', { name: 'BESA Content access' }));
    await expect(c.getByRole('checkbox', { name: 'BESA Content admin' })).toBeChecked();
    await expect(c.getAllByText('Admin')).toHaveLength(2);
  },
};

/** Both boxes are always available, in any combination — an admin with no access is the caller's to allow or refuse. */
export const Independent: Story = {
  args: { rows: [{ id: 'a', domain: 'Design', access: false, admin: true }] },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('checkbox', { name: 'Design access' })).toBeEnabled();
    await expect(c.getByRole('checkbox', { name: 'Design admin' })).toBeEnabled();
    /* Admin without Access still reads Admin: the column header and the role tag. */
    await expect(c.getAllByText('Admin')).toHaveLength(2);
  },
};

/** Reports a tick without changing anything itself: it is controlled. */
export const Controlled: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('checkbox', { name: 'Design admin' }));
    await expect(args.onAdminChange).toHaveBeenCalledWith('design', true);
    await userEvent.click(c.getByRole('checkbox', { name: 'BESA Test access' }));
    await expect(args.onAccessChange).toHaveBeenCalledWith('test', true);
    /* Nothing changed: the rows are the caller's. */
    await expect(c.getByRole('checkbox', { name: 'Design admin' })).not.toBeChecked();
  },
};

/** While a save is in flight every box is locked. */
export const Saving: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    for (const box of c.getAllByRole('checkbox')) await expect(box).toBeDisabled();
  },
};

/** No domains yet. */
export const NoDomains: Story = { args: { rows: [] } };

/** The role a row's two ticks add up to (hidden, tested). */
export const RoleRules: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => <div />,
  play: async () => {
    await expect(domainRole({ access: false, admin: false })).toBe('none');
    await expect(domainRole({ access: true, admin: false })).toBe('user');
    await expect(domainRole({ access: true, admin: true })).toBe('admin');
    await expect(domainRole({ access: false, admin: true })).toBe('admin');
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { globals: { theme: 'dark' } };

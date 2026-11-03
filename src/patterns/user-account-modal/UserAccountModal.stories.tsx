import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { UserAccountModal } from './UserAccountModal';
import type { DomainAccessRow } from '../../components/domain-access-table';
import { Button } from '../../atoms/button';

const DOMAINS: DomainAccessRow[] = [
  { id: 'design', domain: 'Design', access: false, admin: false },
  { id: 'content', domain: 'BESA Content', access: false, admin: false },
  { id: 'partner', domain: 'BESA Partner', access: false, admin: false },
  { id: 'test', domain: 'BESA Test', access: false, admin: false },
];

/* What Figma shows for John: access to Design only. */
const JOHN_DOMAINS = DOMAINS.map((d) => (d.id === 'design' ? { ...d, access: true } : d));

const meta = {
  title: 'Patterns/UserAccountModal',
  component: UserAccountModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Adds a user or edits one from the Accounts page: a photo with Upload, Status, Name, Email, Proficiency, ' +
          '(when editing) Capacity Points with its own Save, and the Domain Access & Admin Rights table. It keeps its own ' +
          'draft and hands the whole of it to `onSubmit`.',
      },
    },
  },
  args: {
    open: true,
    onClose: fn(),
    domains: DOMAINS,
    statusOptions: ['Approved', 'Pending', 'Suspended'],
    proficiencyOptions: ['Junior', 'Mid', 'Senior'],
    onSubmit: fn(),
    onSaveCapacity: fn(),
    onUploadAvatar: fn(),
  },
} satisfies Meta<typeof UserAccountModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = () => within(document.body);

/** Add New User: the title reads "User", everything starts empty, and there is no Capacity Points. */
export const AddNewUser: Story = {
  args: { mode: 'new' },
  play: async () => {
    const dialog = body().getByRole('dialog', { name: 'User' });
    const d = within(dialog);
    await expect(d.getByRole('textbox', { name: 'Name' })).toHaveValue('');
    await expect(d.getByRole('textbox', { name: 'Email' })).toHaveValue('');
    await expect(d.getByRole('combobox', { name: 'Status' })).toHaveValue('');
    await expect(d.queryByText('Capacity Points')).toBeNull();
    await expect(d.getByRole('heading', { name: 'Domain Access & Admin Rights' })).toBeVisible();
    await expect(d.getAllByText('No Access')).toHaveLength(4);
    await expect(d.getByRole('button', { name: 'Submit' })).toBeVisible();
  },
};

/** Edit User: the title is the user's name, the fields are filled, and Capacity Points saves on its own. */
export const EditUser: Story = {
  args: {
    mode: 'edit',
    domains: JOHN_DOMAINS,
    initial: { name: 'John', email: 'john@vdm.technology', status: 'Approved', proficiency: 'Junior', capacityPoints: 10 },
  },
  play: async ({ args }) => {
    const d = within(body().getByRole('dialog', { name: 'John' }));
    await expect(d.getByRole('textbox', { name: 'Name' })).toHaveValue('John');
    await expect(d.getByRole('textbox', { name: 'Email' })).toHaveValue('john@vdm.technology');
    await expect(d.getByRole('combobox', { name: 'Status' })).toHaveValue('Approved');
    await expect(d.getByRole('combobox', { name: 'Proficiency' })).toHaveValue('Junior');
    await expect(d.getByText('User')).toBeVisible();
    /* The form reads evenly: the selects' values are the same regular weight as the inputs'. */
    const weight = (el: HTMLElement) => getComputedStyle(el).fontWeight;
    await expect(weight(d.getByRole('combobox', { name: 'Status' }))).toBe(weight(d.getByRole('textbox', { name: 'Name' })));

    /* Capacity Points saves on its own: Save hands over the points, and Submit has not been pressed. */
    await userEvent.click(d.getByRole('button', { name: 'Increase Capacity Points' }));
    await userEvent.click(d.getByRole('button', { name: 'Save' }));
    await expect(args.onSaveCapacity).toHaveBeenCalledWith(11);
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

/** Submit with Name and Email wrong: it says what, under the field, moves focus to the first, and does not go through. */
export const Validation: Story = {
  args: { mode: 'new' },
  play: async ({ args }) => {
    const d = within(body().getByRole('dialog', { name: 'User' }));
    await userEvent.click(d.getByRole('button', { name: 'Submit' }));
    await expect(d.getByText('Enter a name.')).toBeVisible();
    await expect(d.getByText('Enter an email address.')).toBeVisible();
    await expect(args.onSubmit).not.toHaveBeenCalled();
    await expect(d.getByRole('textbox', { name: 'Name' })).toHaveFocus();

    /* Fixing a field clears what was said about it. */
    await userEvent.type(d.getByRole('textbox', { name: 'Name' }), 'Ada');
    await expect(d.queryByText('Enter a name.')).toBeNull();

    await userEvent.type(d.getByRole('textbox', { name: 'Email' }), 'ada@');
    await userEvent.click(d.getByRole('button', { name: 'Submit' }));
    await expect(d.getByText(/Enter a valid email address/)).toBeVisible();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

/** Valid, it hands the whole draft over: the fields, trimmed, and every domain's access. */
export const Submits: Story = {
  args: { mode: 'new' },
  play: async ({ args }) => {
    const d = within(body().getByRole('dialog', { name: 'User' }));
    await userEvent.type(d.getByRole('textbox', { name: 'Name' }), '  Ada Lovelace ');
    await userEvent.type(d.getByRole('textbox', { name: 'Email' }), 'ada@vdm.technology');
    await userEvent.selectOptions(d.getByRole('combobox', { name: 'Status' }), 'Pending');
    await userEvent.selectOptions(d.getByRole('combobox', { name: 'Proficiency' }), 'Senior');
    await userEvent.click(d.getByRole('checkbox', { name: 'Design access' }));
    await userEvent.click(d.getByRole('checkbox', { name: 'BESA Test admin' }));
    await userEvent.click(d.getByRole('button', { name: 'Submit' }));

    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    const draft = (args.onSubmit as ReturnType<typeof fn>).mock.calls[0][0];
    await expect(draft).toMatchObject({ name: 'Ada Lovelace', email: 'ada@vdm.technology', status: 'Pending', proficiency: 'Senior' });
    await expect(draft.access.find((r: DomainAccessRow) => r.id === 'design')).toMatchObject({ access: true, admin: false });
    await expect(draft.access.find((r: DomainAccessRow) => r.id === 'test')).toMatchObject({ access: false, admin: true });
  },
};

/** Upload opens the file picker and hands the chosen file over; the image shows at once. No crop, no edit. */
export const UploadsAPhoto: Story = {
  args: { mode: 'new' },
  play: async ({ args }) => {
    const dialog = body().getByRole('dialog', { name: 'User' });
    const input = dialog.querySelector<HTMLInputElement>('input[type="file"]')!;
    await expect(input).toHaveAttribute('accept', 'image/*');
    /* The button is what opens the picker: it is named for what it does. */
    await expect(within(dialog).getByRole('button', { name: 'Upload profile photo' })).toBeVisible();

    const file = new File(['(pretend this is a photo)'], 'ada.png', { type: 'image/png' });
    await userEvent.upload(input, file);
    await expect(args.onUploadAvatar).toHaveBeenCalledWith(file);
    await waitFor(() => expect(dialog.querySelector('img')?.getAttribute('src')).toMatch(/^blob:/));
  },
};

/** What only the server knows, shown under the field. */
export const ServerErrors: Story = {
  args: {
    mode: 'edit',
    domains: JOHN_DOMAINS,
    initial: { name: 'John', email: 'john@vdm.technology', status: 'Approved', proficiency: 'Junior', capacityPoints: 10 },
    errors: { email: 'That email address is already in use.' },
  },
  play: async () => {
    const d = within(body().getByRole('dialog', { name: 'John' }));
    await expect(d.getByText('That email address is already in use.')).toBeVisible();
    await expect(d.getByRole('textbox', { name: 'Email' })).toHaveAttribute('aria-invalid', 'true');
  },
};

/** While Submit is in flight, the button spins and every field is locked. */
export const Submitting: Story = {
  args: {
    mode: 'edit',
    domains: JOHN_DOMAINS,
    initial: { name: 'John', email: 'john@vdm.technology', status: 'Approved', proficiency: 'Junior', capacityPoints: 10 },
    submitting: true,
  },
  play: async () => {
    const d = within(body().getByRole('dialog', { name: 'John' }));
    await expect(d.getByRole('button', { name: 'Submit' })).toHaveAttribute('aria-busy', 'true');
    await expect(d.getByRole('textbox', { name: 'Name' })).toBeDisabled();
    await expect(d.getByRole('combobox', { name: 'Status' })).toBeDisabled();
    await expect(d.getByRole('checkbox', { name: 'Design access' })).toBeDisabled();
  },
};

/** Closed and opened again, it starts over from what it was given — nothing typed last time survives. */
export const ResetsWhenReopened: Story = {
  args: { mode: 'new' },
  render: (args) => {
    const [open, setOpen] = React.useState(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Add Account</Button>
        <UserAccountModal {...args} open={open} onClose={() => setOpen(false)} />
      </>
    );
  },
  play: async () => {
    const name = () => within(body().getByRole('dialog', { name: 'User' })).getByRole('textbox', { name: 'Name' });
    await userEvent.type(name(), 'Ada');
    await expect(name()).toHaveValue('Ada');
    await userEvent.click(body().getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(body().queryByRole('dialog')).toBeNull());
    await userEvent.click(body().getByRole('button', { name: 'Add Account' }));
    await expect(name()).toHaveValue('');
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = {
  ...EditUser,
  globals: { theme: 'dark' },
  play: undefined,
};

const ROLES = [
  { value: 'junior', label: 'Junior Product Designer' },
  { value: 'designer', label: 'Product Designer' },
  { value: 'senior', label: 'Senior Product Designer' },
];

/** The Settings Users tab's dialog: a Roles checklist stands in for the Domain Access table. Ticking is the user's draft. */
export const WithRoles: Story = {
  args: {
    mode: 'edit',
    domains: undefined,
    roles: ROLES,
    initial: { name: 'John', email: 'john@vdm.technology', status: 'Approved', proficiency: 'Senior', capacityPoints: 10, roles: ['senior'] },
  },
  play: async ({ args }) => {
    const d = within(body().getByRole('dialog', { name: 'John' }));
    await expect(d.queryByRole('heading', { name: 'Domain Access & Admin Rights' })).toBeNull();
    await expect(d.getByRole('group', { name: 'Roles' })).toBeVisible();
    await expect(d.getByRole('checkbox', { name: 'Senior Product Designer' })).toBeChecked();
    await userEvent.click(d.getByRole('checkbox', { name: 'Product Designer' }));
    await userEvent.click(d.getByRole('checkbox', { name: 'Senior Product Designer' }));
    await userEvent.click(d.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalledWith(expect.objectContaining({ roles: ['designer'] })));
  },
};

/** With `onRemoveAvatar`, a photo is Changed or Removed (Upload while there is none); focus lands on the button that is left. */
export const ChangeAndRemovePhoto: Story = {
  args: {
    mode: 'edit',
    domains: undefined,
    roles: ROLES,
    title: 'John',
    initial: { name: 'John', email: 'john@vdm.technology', avatarSrc: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==' },
    onRemoveAvatar: fn(),
  },
  play: async ({ args }) => {
    const d = within(body().getByRole('dialog', { name: 'John' }));
    await expect(d.getByRole('button', { name: 'Change profile photo' })).toBeVisible();
    await userEvent.click(d.getByRole('button', { name: 'Remove profile photo' }));
    await expect(args.onRemoveAvatar).toHaveBeenCalledTimes(1);
    /* No photo: Upload, and no Remove — and focus did not fall to the page. */
    await waitFor(() => expect(d.getByRole('button', { name: 'Upload profile photo' })).toHaveFocus());
    await expect(d.queryByRole('button', { name: 'Remove profile photo' })).toBeNull();
  },
};


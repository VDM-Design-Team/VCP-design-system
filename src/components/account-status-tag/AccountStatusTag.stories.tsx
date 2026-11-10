import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ACCOUNT_STATUSES, ACCOUNT_STATUS_OPTIONS, AccountStatusTag } from './AccountStatusTag';

const meta = {
  title: 'Components/Display/AccountStatusTag',
  component: AccountStatusTag,
  parameters: {
    docs: {
      description: {
        component:
          'A user account’s status as a tag: Approved (green), Pending (yellow) or Inactive (grey). The one owner of account ' +
          'statuses: which there are, what each is called and which colour it wears. There is no red account status.',
      },
    },
  },
  args: { status: 'approved' },
} satisfies Meta<typeof AccountStatusTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Approved')).toBeVisible();
  },
};

/** The three statuses, each with its own colour. */
export const Statuses: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {ACCOUNT_STATUSES.map((status) => (
        <AccountStatusTag key={status} status={status} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const color = (text: string) => getComputedStyle(c.getByText(text)).color;
    await expect(new Set([color('Approved'), color('Pending'), color('Inactive')]).size).toBe(3);
    /* The dialog's Status list is the same three, in the same words. */
    await expect(ACCOUNT_STATUS_OPTIONS.map((option) => option.label)).toEqual(['Approved', 'Pending', 'Inactive']);
  },
};

/** The status is matched whatever its case, so "Approved" from a select and "approved" from the server read the same. */
export const AnyCase: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <AccountStatusTag status="approved" />
      <AccountStatusTag status="Approved" />
      <AccountStatusTag status="APPROVED" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByText('Approved')).toHaveLength(3);
  },
};

/** A status this file does not know reads as given, in grey: it is shown rather than hidden, and never red. */
export const Unknown: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <AccountStatusTag status="invited" />
      <AccountStatusTag status="inactive" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('invited')).toBeVisible();
    await expect(getComputedStyle(c.getByText('invited')).color).toBe(getComputedStyle(c.getByText('Inactive')).color);
  },
};

/** Tokens only, so dark comes for free. */
export const DarkTheme: Story = { ...Statuses, globals: { theme: 'dark' } };

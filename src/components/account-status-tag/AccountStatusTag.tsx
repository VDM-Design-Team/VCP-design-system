import * as React from 'react';
import { Tag, type TagProps } from '../../atoms/tag';

/**
 * AccountStatusTag — a user account's status as a tag: **Approved** (green), **Pending** (yellow) or **Inactive** (grey). A component:
 * a `Tag` plus the status mapping.
 *
 * **This is the one owner of account statuses**: which there are, what each is called and which colour it wears (decided with design,
 * 6 Nov 2026). `UsersTable` draws it, and the user dialog's Status list is `ACCOUNT_STATUS_OPTIONS`, so a table and a dialog cannot
 * disagree and no call site picks a colour. It is to accounts what `StatusTag` is to Added Values.
 *
 * - **There is no red account status.** An account that is switched off is Inactive, and grey.
 * - **The status is matched whatever its case** ("Approved", "approved"). One this file does not know is shown as given, in grey, rather
 *   than hidden: a new status from the server still reads, and gets a colour when it is added here.
 *
 * Built to Figma's `Settings_Users` status tag, which draws only "approved".
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export type AccountStatus = 'approved' | 'pending' | 'inactive';

const STATUS: Record<AccountStatus, { label: string; tone: NonNullable<TagProps['tone']> }> = {
  approved: { label: 'Approved', tone: 'success' },
  pending: { label: 'Pending', tone: 'warning' },
  inactive: { label: 'Inactive', tone: 'neutral' },
};

/** Every account status, in the order a list shows them. */
export const ACCOUNT_STATUSES: readonly AccountStatus[] = ['approved', 'pending', 'inactive'];

/** What a status is called: "Approved". */
export const accountStatusLabel = (status: AccountStatus): string => STATUS[status].label;

/** The statuses as a select's options (`{ value, label }`): the user dialog's Status list. */
export const ACCOUNT_STATUS_OPTIONS: ReadonlyArray<{ value: AccountStatus; label: string }> = ACCOUNT_STATUSES.map((value) => ({
  value,
  label: STATUS[value].label,
}));

export interface AccountStatusTagProps extends Omit<TagProps, 'tone' | 'children'> {
  /** The account's status. Matched whatever its case; one that is not known reads as given, in grey. */
  status: AccountStatus | (string & {});
}

export const AccountStatusTag = React.forwardRef<HTMLSpanElement, AccountStatusTagProps>(({ status, size = 'sm', ...props }, ref) => {
  const known = STATUS[status.toLowerCase() as AccountStatus] as (typeof STATUS)[AccountStatus] | undefined;
  return (
    <Tag ref={ref} size={size} tone={known?.tone ?? 'neutral'} {...props}>
      {known?.label ?? status}
    </Tag>
  );
});
AccountStatusTag.displayName = 'AccountStatusTag';

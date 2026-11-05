import * as React from 'react';
import { cn } from '../../lib/cn';
import { Checkbox } from '../../atoms/checkbox';
import { Tag, type TagTone } from '../../atoms/tag';

/**
 * DomainAccessTable — which domains a user can get into, and whether they are an admin there: a row per domain, a checkbox
 * for Access and one for Admin, and the Role those two add up to. Built to Figma's `_Accounts_User_Modal_Domain_Access_Table`
 * (the "Domain Access & Admin Rights" section of the Accounts page's user modal).
 *
 * - **Admin implies Access.** Both boxes are always available, but ticking Admin also ticks Access, and un-ticking Access
 *   also un-ticks Admin, so a row never says Admin for a domain the person cannot get into.
 * - **Role is derived, and this component owns it, once** (`domainRole`): Admin if the Admin box is ticked, else User if Access
 *   is, else No Access. It is a `Tag`, so the role is words as well as a colour: Admin `brand`, User `success`, No Access
 *   `neutral`.
 *
 * It is controlled and saves nothing: rows come in, `onAccessChange` / `onAdminChange` report a tick. One click can report
 * both (that is the rule above), so update the rows functionally (`setRows((rs) => …)`) for the two to combine. A real
 * `<table>`, named by `caption`, with column headers.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

export interface DomainAccessRow {
  id: string | number;
  /** The domain's name, as it should read: "Design", "BESA Content". */
  domain: string;
  access: boolean;
  admin: boolean;
}

/** What a row's two ticks add up to. */
export type DomainRole = 'admin' | 'user' | 'none';

/** Admin if the Admin box is ticked, else User if Access is, else No Access. */
export const domainRole = (row: Pick<DomainAccessRow, 'access' | 'admin'>): DomainRole =>
  row.admin ? 'admin' : row.access ? 'user' : 'none';

/* The role → its words and tone, once. Admin is blue so it reads apart from User at a glance (design, 4 Nov 2026). */
const ROLE: Record<DomainRole, { label: string; tone: TagTone }> = {
  admin: { label: 'Admin', tone: 'brand' },
  user: { label: 'User', tone: 'success' },
  none: { label: 'No Access', tone: 'neutral' },
};

export interface DomainAccessTableProps
  extends Omit<React.TableHTMLAttributes<HTMLTableElement>, 'children' | 'onChange'> {
  rows: readonly DomainAccessRow[];
  onAccessChange?: (id: DomainAccessRow['id'], access: boolean) => void;
  onAdminChange?: (id: DomainAccessRow['id'], admin: boolean) => void;
  /** Locks every checkbox — while a save is in flight. */
  disabled?: boolean;
  /** The table's accessible name. */
  caption?: string;
}

const head = 'px-4 py-4 text-center align-middle text-body-sm-semibold text-text-primary first:text-left';
const cell = 'px-4 py-3 text-center align-middle';

export const DomainAccessTable = React.forwardRef<HTMLTableElement, DomainAccessTableProps>(
  (
    { className, rows, onAccessChange, onAdminChange, disabled, caption = 'Domain access and admin rights', ...props },
    ref,
  ) => (
    <table ref={ref} className={cn('w-full border-collapse font-sans', className)} {...props}>
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="border-b border-stroke-default">
          <th scope="col" className={head}>
            Domain
          </th>
          <th scope="col" className={head}>
            Access
          </th>
          <th scope="col" className={head}>
            Admin
          </th>
          <th scope="col" className={head}>
            Role
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const role = ROLE[domainRole(row)];
          return (
            <tr key={row.id} className="border-b border-stroke-default last:border-b-0">
              <th scope="row" className={cn(cell, 'text-left text-body-sm-regular font-normal text-text-primary')}>
                {row.domain}
              </th>
              <td className={cell}>
                <Checkbox
                  aria-label={`${row.domain} access`}
                  checked={row.access}
                  disabled={disabled}
                  onChange={(checked) => {
                    onAccessChange?.(row.id, checked);
                    /* Admin implies Access: taking Access away takes Admin with it. */
                    if (!checked && row.admin) onAdminChange?.(row.id, false);
                  }}
                />
              </td>
              <td className={cell}>
                <Checkbox
                  aria-label={`${row.domain} admin`}
                  checked={row.admin}
                  disabled={disabled}
                  onChange={(checked) => {
                    onAdminChange?.(row.id, checked);
                    /* …and making someone an admin gives them Access. */
                    if (checked && !row.access) onAccessChange?.(row.id, true);
                  }}
                />
              </td>
              <td className={cell}>
                <Tag size="sm" tone={role.tone}>
                  {role.label}
                </Tag>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  ),
);
DomainAccessTable.displayName = 'DomainAccessTable';

import * as React from 'react';
import { cn } from '../../lib/cn';
import { IconButton } from '../../atoms/icon-button';
import { Menu, type MenuItem } from '../menu';

/**
 * DetailCardMenu — the ⋮ button at the head of an Added Value page, and the menu it opens:
 * Edit and Delete for everyone, with the moves between Draft, Pending and Backlog that the
 * person's role and the AV's status allow. Read off Figma's `Detail_Card_Menu` (the button) and
 * `AV_Options_Dropdown` (the five menus); the admin's moves on a Rejected AV and on one that is
 * accepted or in progress are the live product's (decided 13 Nov 2026), which Figma does not draw.
 *
 * **The component owns which actions are offered**, the way `StatusTag` owns status → tone, so no
 * page decides it again:
 *
 * | Role | Status | Menu |
 * |---|---|---|
 * | user | Draft | Move to Backlog · Edit · Delete |
 * | user | any other | Edit · Delete |
 * | admin | Draft | Move to Backlog · Edit · Delete |
 * | admin | Pending | Move to Backlog, Move to Draft · Edit · Delete |
 * | admin | Backlog | Move to Pending, Move to Draft · Edit · Delete |
 * | admin | Rejected | Move to Backlog, Move to Pending, Move to Draft · Edit · Delete |
 * | admin | Completed | Edit · Delete |
 * | admin | any other (Accepted, a domain step, Review) | Move to Backlog, Move to Draft · Edit · Delete |
 *
 * The moves sit above a divider, then Edit, then Delete in the critical colour. No icons: the design's menu is words only. It only reports:
 * each action's handler is the page's.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type DetailCardMenuRole = 'user' | 'admin';

export interface DetailCardMenuProps {
  /** Who is looking. Admins can move an AV between Draft, Pending and Backlog, reopen a Rejected one, and park one that is in progress. */
  role?: DetailCardMenuRole;
  /** The AV's status. A user gets a move only on a Draft. An admin gets moves on everything but a Completed AV; a domain step (For QA, In QA…) counts as in progress. */
  status?: string;
  onMoveToBacklog?: () => void;
  onMoveToDraft?: () => void;
  onMoveToPending?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  /** The button's accessible name. Default "AV options". */
  label?: string;
  className?: string;
}

/** THE mapping — role and status → the moves on offer, in order. */
function movesFor(role: DetailCardMenuRole, status?: string): Array<'backlog' | 'draft' | 'pending'> {
  if (status === 'Draft') return ['backlog'];
  if (role !== 'admin') return [];
  if (status === 'Pending') return ['backlog', 'draft'];
  if (status === 'Backlog') return ['pending', 'draft'];
  /* Rejected is not final for an admin: it can be reopened (Pending), parked or sent back to its initiator as a draft. */
  if (status === 'Rejected') return ['backlog', 'pending', 'draft'];
  /* Nothing moves a finished AV. No status at all is not a status to move from either. */
  if (status === 'Completed' || !status) return [];
  /* Accepted, a domain step, Review: work in progress can be parked or sent back to Draft. */
  return ['backlog', 'draft'];
}

export const DetailCardMenu = React.forwardRef<HTMLDivElement, DetailCardMenuProps>(
  (
    {
      role = 'user',
      status,
      onMoveToBacklog,
      onMoveToDraft,
      onMoveToPending,
      onEdit,
      onDelete,
      label = 'AV options',
      className,
    },
    ref,
  ) => {
    const handlers = { backlog: onMoveToBacklog, draft: onMoveToDraft, pending: onMoveToPending };
    const labels = { backlog: 'Move to Backlog', draft: 'Move to Draft', pending: 'Move to Pending' };
    const moves = movesFor(role, status);

    const items: MenuItem[] = [
      ...moves.map((move) => ({ key: move, label: labels[move], onClick: handlers[move] })),
      ...(moves.length > 0 ? [{ divider: true as const, key: 'divider' }] : []),
      { key: 'edit', label: 'Edit', onClick: onEdit },
      { key: 'delete', label: 'Delete', tone: 'critical' as const, icon: false as const, onClick: onDelete },
    ];

    return (
      <Menu
        ref={ref}
        /* Hugs the button, even in a flex row that would stretch it: the list hangs off its bottom edge. */
        className={cn('self-start', className)}
        items={items}
        align="right"
        trigger={
          <IconButton
            icon="dots-three-outline-vertical-fill"
            variant="neutral"
            shape="square"
            size="sm"
            label={label}
            /* 32 to look at, as Figma draws it; a touch screen gets 40. */
            className="size-8 pointer-coarse:size-10"
          />
        }
      />
    );
  },
);
DetailCardMenu.displayName = 'DetailCardMenu';

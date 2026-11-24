import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Banner, type BannerProps } from '../../components/banner';
import { ConfirmModal, confirmations } from '../../components/confirm-modal';
import { DescriptionCardTitle, type DescriptionCardTitleParent } from '../../components/description-card-title';
import { DescriptionSection, type DescriptionSectionProps } from '../../components/description-section';
import { InitiateToOtherDomain, type InitiateToOtherDomainProps } from '../../components/initiate-to-other-domain';
import { StatusHistory, type StatusHistoryProps } from '../../components/status-history';
import { DetailCardMenu, type DetailCardMenuProps } from '../../components/detail-card-menu';
import { PageTitle } from '../../components/page-title';
import {
  StatusProgression,
  type AVChainStep,
  type AVProgressionRole,
  type AVTransition,
  type StatusProgressionProps,
} from '../../components/status-progression';
import type { AVStatus } from '../../components/status-tag';
import { CommentSection, type CommentSectionProps } from '../comment-section';
import { DeliverablesCard, type DeliverablesCardProps } from '../deliverables-card';
import { DetailCard, type DetailCardProps } from '../detail-card';
import { MultipartSection, type MultipartSectionProps } from '../multipart-section';

/**
 * AVPage — the main content of an Added Value's page, to read or to edit: the header, then two columns. It goes in `AppShell`'s `page` slot; the shell draws the sidebar,
 * the top bar and the footer. Built to Figma's `AV Page: Viewing AVs` and `AV Page: Editing AVs`.
 *
 * - **Left column, top to bottom:** the title (the reference and title to read, a **Title** field to edit), the four description blocks (**Problems**,
 *   **Solutions**, **Acceptance Criteria / Deliverables**, **Desired Outcome**), the **Multipart** card, then, reading, **Status History** and **Comments**, or, editing, **Initiate to other Domains**.
 *   **There is no Status History when editing**: it is for reading only, so it is left out of an editing page even if `history` is passed.
 * - **Right column:** the **Detail card**, and (reading) the **Deliverables card**.
 * - **The header** is `PageTitle` (`size="sm"` for an Added Value, `md` for "Added Value Creation"). Reading, **the status buttons and the ⋮ menu** (`DetailCardMenu`) are on its right, the menu beside the buttons; editing, the status buttons are in a bar at the bottom right with **Discard** (red text) beside them.
 *
 * **Typed sections.** The page passes each piece's own props (`details` is `DetailCard`'s, `comments` is `CommentSection`'s…) and this puts them in order, 16
 * apart, 32 in from the sides, and stacks the two columns on a narrow page. **A section shows only when the page gives it**, so what differs by status, role or
 * domain is what the page passes: the pieces already carry their own variants. `mode` says whether it is a page to read or to edit: it picks the title (text or
 * field), where the status buttons go, and nothing else; the content of each section follows what it is passed.
 *
 * **It is controlled and holds no data.** It owns no state: the page owns the fields, the cards, the comments and the status.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

export type AVPageMode = 'view' | 'edit';

export interface AVPageTitle {
  /** The reference ("VCP-1234"), shown above the title when reading. */
  reference?: string;
  /** The title. */
  value: string;
  /** Editing: the title changed. With `mode="edit"` and no `onChange`, the field is read-only. */
  onChange?: (value: string) => void;
  /** The field's label. Default "Title". */
  label?: string;
  placeholder?: string;
  /** What is wrong with the title (a required field left empty). */
  error?: string;
  /** Editing: the title cannot be changed (the field is greyed). */
  disabled?: boolean;
  /** Reading a part of a multipart set: "Multipart Child of VCP-4321" beside the reference. */
  parent?: DescriptionCardTitleParent;
}

/** The four description blocks, by what each holds. Leave one out and it is not drawn. */
export type AVPageDescription = Partial<Record<'problem' | 'solution' | 'deliverable' | 'desired-outcome', Omit<DescriptionSectionProps, 'type'>>>;

const DESCRIPTION_ORDER = ['problem', 'solution', 'deliverable', 'desired-outcome'] as const;

/** Editing: the bar at the bottom right. */
export interface AVPageActions {
  /** Discard was pressed. Leave it out and there is no Discard. */
  onDiscard?: () => void;
  /** Default "Discard". */
  discardLabel?: string;
  /**
   * Discard asks first, as Figma's flow draws it ("Are you sure you want to discard this Added Value? This action cannot be undone…", Cancel and Confirm), and
   * `onDiscard` fires only on Confirm. Off by default: without it Discard fires at once, as before. What happens after (back to My Values, a toast) is the page's.
   */
  confirmDiscard?: boolean;
  /** The status buttons (Save as Draft, Submit…): `StatusProgression`'s props. */
  progression?: StatusProgressionProps;
}

/**
 * The page's header. `title` is the reference to read ("VCP-123"), or words for a page being created ("Added Value Creation", with `type="new"`). Reading, the status
 * buttons (`role` plus `status`, or a `step` on the domain's `chain`) and the ⋮ menu (`menu`) sit on the right, the menu last; editing, neither is drawn.
 */
export interface AVPageHeader {
  /** The page's name: an AV's reference on `default`, words on `new`. */
  title: React.ReactNode;
  /** `default` is an existing AV (the title is its reference, `PageTitle` `sm`); `new` is a page being created (`md`). */
  type?: 'default' | 'new';
  /** Where back goes. Renders the arrow as a link. */
  backHref?: string;
  /** Back as a history action. Renders the arrow as a button. */
  onBack?: () => void;
  /** The back control's accessible name — say where it goes. */
  backLabel?: string;
  /** Show the status buttons and the menu. Default: when reading, not when editing. */
  showStatusActions?: boolean;
  /** Who is looking: it picks the moves and the menu's contents. */
  role?: AVProgressionRole;
  /** Where the AV is on the spine. Mutually exclusive with `step`. */
  status?: AVStatus;
  /** The `id` of the domain chain step the AV sits on. Needs `chain`. */
  step?: string;
  /** The domain's ordered middle. */
  chain?: readonly AVChainStep[];
  /** A status button was pressed, straight from `StatusProgression`. */
  onTransition?: (transition: AVTransition) => void;
  /**
   * The ⋮ menu's handlers (`onEdit`, `onDelete`, the moves between Draft, Pending and Backlog). Give it and the menu is drawn when reading; **what is in it comes from `role` and `status`**
   * (`DetailCardMenu` owns the mapping), so the page passes no list. Leave it out and there is no menu.
   */
  menu?: Omit<DetailCardMenuProps, 'role' | 'status'>;
  /** Anything else for the right-hand side, before the status buttons. */
  actions?: React.ReactNode;
}

export interface AVPageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** Reading or editing. Default `view`. */
  mode?: AVPageMode;
  /** The header: the back arrow, the page's name and (when reading) the status buttons and the ⋮ menu. */
  header: AVPageHeader;
  /**
   * A notice at the top of the left column, above the title, the width of the column: an Added Value that was rejected or sent back to the backlog says so,
   * and why. `Banner`'s props; `rejectedBanner()` and `backloggedBanner()` write the two the design draws, copy included.
   */
  banner?: BannerProps;
  title?: AVPageTitle;
  description?: AVPageDescription;
  multipart?: MultipartSectionProps;
  /** Reading: the Status History. Never drawn when editing, even if given. */
  history?: StatusHistoryProps;
  /** Reading: the comments, under the history. */
  comments?: CommentSectionProps;
  /** Editing: "Initiate to other Domains", at the foot of the left column. `disabled` for an Added Value handed off from another domain. */
  initiate?: InitiateToOtherDomainProps;
  /** The right column's detail card. */
  details?: DetailCardProps;
  /** Reading: the deliverables, under the detail card. */
  deliverables?: DeliverablesCardProps;
  /** Editing: Discard and the status buttons, at the bottom right. */
  actions?: AVPageActions;
}

/** The title band: `PageTitle`, with the status buttons and then the ⋮ menu on its right. */
function AVPageHeaderBand({
  title,
  type = 'default',
  backHref,
  onBack,
  backLabel,
  showStatusActions = true,
  role,
  status,
  step,
  chain,
  onTransition,
  menu,
  actions,
}: AVPageHeader) {
  const moves =
    showStatusActions && role && (status || (step && chain)) ? (
      status ? (
        <StatusProgression role={role} status={status} chain={chain} onTransition={onTransition} />
      ) : (
        <StatusProgression role={role} step={step!} chain={chain!} onTransition={onTransition} />
      )
    ) : null;
  /* The menu is a person's own options on this AV: an admin's, or a user's. Its contents follow the role and the status; a domain step counts as work in progress. */
  const options =
    showStatusActions && menu ? (
      <DetailCardMenu {...menu} role={role === 'admin' ? 'admin' : 'user'} status={status ?? 'In Progress'} />
    ) : null;
  return (
    <PageTitle
      size={type === 'new' ? 'md' : 'sm'}
      title={title}
      backHref={backHref}
      onBack={onBack}
      backLabel={backLabel}
      actions={
        actions || moves || options ? (
          <>
            {actions}
            {moves}
            {options}
          </>
        ) : undefined
      }
    />
  );
}

export function AVPage({
  className,
  mode = 'view',
  header,
  banner,
  title,
  description,
  multipart,
  history,
  comments,
  initiate,
  details,
  deliverables,
  actions,
  ...props
}: AVPageProps) {
  const editing = mode === 'edit';
  const [discarding, setDiscarding] = React.useState(false);
  return (
    <div className={cn('@container flex min-w-0 flex-col font-sans', className)} {...props}>
      {/* The status buttons are in the header to read, and in the bar at the bottom to edit. */}
      <AVPageHeaderBand {...header} showStatusActions={header.showStatusActions ?? !editing} />
      <div className="grid min-w-0 grid-cols-1 items-start gap-4 px-8 pb-8 @4xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          {banner && <Banner {...banner} />}
          {title && (
            <DescriptionCardTitle
              reference={title.reference}
              title={title.value}
              editing={editing}
              onChange={title.onChange}
              label={title.label}
              placeholder={title.placeholder}
              error={title.error}
              disabled={title.disabled}
              parent={title.parent}
            />
          )}
          {DESCRIPTION_ORDER.map((type) => description?.[type] && <DescriptionSection key={type} type={type} {...description[type]} />)}
          {multipart && <MultipartSection {...multipart} />}
          {!editing && history && <StatusHistory {...history} />}
          {/* Comments are not a card, so they get room above them: 32 from the Status History, not the cards' 16. */}
          {!editing && comments && <CommentSection className="mt-4" {...comments} />}
          {editing && initiate && <InitiateToOtherDomain {...initiate} />}
        </div>
        {(details || (!editing && deliverables)) && (
          <div className="flex min-w-0 flex-col gap-4">
            {details && <DetailCard {...details} />}
            {!editing && deliverables && <DeliverablesCard {...deliverables} />}
          </div>
        )}
      </div>
      {editing && actions && (actions.onDiscard || actions.progression) && (
        <div className="flex flex-wrap items-center justify-end gap-3 px-8 pb-8">
          {actions.onDiscard && (
            <Button variant="critical-tertiary" size="md" onClick={() => (actions.confirmDiscard ? setDiscarding(true) : actions.onDiscard?.())}>
              {actions.discardLabel ?? 'Discard'}
            </Button>
          )}
          {actions.progression && <StatusProgression {...actions.progression} />}
        </div>
      )}
      {actions?.confirmDiscard && (
        <ConfirmModal
          open={discarding}
          {...confirmations.discardAV()}
          onClose={() => setDiscarding(false)}
          onConfirm={() => {
            setDiscarding(false);
            actions.onDiscard?.();
          }}
        />
      )}
    </div>
  );
}
AVPage.displayName = 'AVPage';

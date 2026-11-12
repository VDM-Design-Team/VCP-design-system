import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Input } from '../../atoms/input';
import { DescriptionSection, type DescriptionSectionProps } from '../../components/description-section';
import { DuplicateToOtherDomain, type DuplicateToOtherDomainProps } from '../../components/duplicate-to-other-domain';
import { Field } from '../../components/field';
import { StatusHistory, type StatusHistoryProps } from '../../components/status-history';
import { StatusProgression, type StatusProgressionProps } from '../../components/status-progression';
import { AVHeader, type AVHeaderProps } from '../av-header';
import { CommentSection, type CommentSectionProps } from '../comment-section';
import { DeliverablesCard, type DeliverablesCardProps } from '../deliverables-card';
import { DetailCard, type DetailCardProps } from '../detail-card';
import { MultipartSection, type MultipartSectionProps } from '../multipart-section';

/**
 * AVPage — the main content of an Added Value's page, to read or to edit: the header, then two columns. It goes inside `AppShell`, which draws the sidebar,
 * the top bar and the footer. Built to Figma's `AV Page: Viewing AVs` and `AV Page: Editing AVs`.
 *
 * - **Left column, top to bottom:** the title (the reference and title to read, a **Title** field to edit), the four description blocks (**Problems**,
 *   **Solutions**, **Acceptance Criteria / Deliverables**, **Desired Outcome**), the **Multipart** card, then, reading, **Status History** and **Comments**, or, editing, **Duplicate to other Domains**.
 *   **There is no Status History when editing**: it is for reading only, so it is left out of an editing page even if `history` is passed.
 * - **Right column:** the **Detail card**, and (reading) the **Deliverables card**.
 * - **The status buttons** are in the header when reading (`AVHeader`), and in a bar at the bottom right when editing, with **Discard** (red text) beside them.
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
  /** The status buttons (Save as Draft, Submit…): `StatusProgression`'s props. */
  progression?: StatusProgressionProps;
}

export interface AVPageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** Reading or editing. Default `view`. */
  mode?: AVPageMode;
  /** The header: the back arrow, the page's name and (when reading) the status buttons. `AVHeader`'s props. */
  header: AVHeaderProps;
  title?: AVPageTitle;
  description?: AVPageDescription;
  multipart?: MultipartSectionProps;
  /** Reading: the Status History. Never drawn when editing, even if given. */
  history?: StatusHistoryProps;
  /** Reading: the comments, under the history. */
  comments?: CommentSectionProps;
  /** Editing: "Duplicate to other Domains", at the foot of the left column. */
  duplicate?: DuplicateToOtherDomainProps;
  /** The right column's detail card. */
  details?: DetailCardProps;
  /** Reading: the deliverables, under the detail card. */
  deliverables?: DeliverablesCardProps;
  /** Editing: Discard and the status buttons, at the bottom right. */
  actions?: AVPageActions;
}

export function AVPage({
  className,
  mode = 'view',
  header,
  title,
  description,
  multipart,
  history,
  comments,
  duplicate,
  details,
  deliverables,
  actions,
  ...props
}: AVPageProps) {
  const editing = mode === 'edit';
  const titleId = React.useId();
  return (
    <div className={cn('@container flex min-w-0 flex-col font-sans', className)} {...props}>
      {/* The status buttons are in the header to read, and in the bar at the bottom to edit. */}
      <AVHeader {...header} showStatusActions={header.showStatusActions ?? !editing} />
      <div className="grid min-w-0 grid-cols-1 items-start gap-4 px-8 pb-8 @4xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          {title &&
            (editing ? (
              <div className="rounded-md bg-surface-elevated p-4">
                <Field label={title.label ?? 'Title'} error={title.error}>
                  <Input
                    fullWidth
                    value={title.value}
                    placeholder={title.placeholder ?? 'Type in the title'}
                    readOnly={!title.onChange}
                    onChange={(event) => title.onChange?.(event.target.value)}
                  />
                </Field>
              </div>
            ) : (
              <section aria-labelledby={titleId} className="rounded-md bg-surface-elevated p-4">
                {title.reference && <p className="text-body-md-regular text-text-secondary">{title.reference}</p>}
                <h2 id={titleId} className="text-body-md-semibold text-text-primary">
                  {title.value}
                </h2>
              </section>
            ))}
          {DESCRIPTION_ORDER.map((type) => description?.[type] && <DescriptionSection key={type} type={type} {...description[type]} />)}
          {multipart && <MultipartSection {...multipart} />}
          {!editing && history && <StatusHistory {...history} />}
          {!editing && comments && <CommentSection {...comments} />}
          {editing && duplicate && <DuplicateToOtherDomain {...duplicate} />}
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
            <Button variant="critical-tertiary" size="md" onClick={actions.onDiscard}>
              {actions.discardLabel ?? 'Discard'}
            </Button>
          )}
          {actions.progression && <StatusProgression {...actions.progression} />}
        </div>
      )}
    </div>
  );
}
AVPage.displayName = 'AVPage';

import * as React from 'react';
import { Button } from '../../atoms/button';
import { Modal, ModalCancel, ModalConfirm } from '../../components/modal';
import {
  HandoffForm,
  HANDOFF_EVIDENCE_ERROR,
  OVERDUE_REASONS,
  blankHandoffEntry,
  handoffHasEvidence,
  handoffLinksValid,
  type HandoffAttachment,
  type HandoffEntry,
  type OverdueReasonOption,
} from '../handoff-form';

export { OVERDUE_REASONS };
export type { OverdueReasonOption };

/**
 * HandoffAVModal — what an assignee fills in to hand an Added Value on: the
 * date, the links that show the work, and anything attached. When the value is
 * late it also has to say **why**.
 *
 * Read off the Figma `Handoff_AV_Modal` (`5342:78539`, audit batch 4,
 * 11 September 2026), both of its variants.
 *
 * **The form is `HandoffForm`**, the same one `BulkActionHandoffModal` draws for
 * each of several Added Values, so what a handoff asks for is decided in one
 * place: a **Handoff Date**, chosen from the calendar, is **required**; a late
 * value (`overdueDays`: the banner, the reason and the notes) must say **why**;
 * there must be **something to review, at least one demo link or one
 * attachment** (decided 13 Nov 2026); notes are optional, and a link that is
 * typed must be a valid `https://` address. This dialog **asks on submit**: an incomplete handoff is
 * refused with the reason under the field, and focus goes to the first one.
 *
 * **The footer is the domain's.** Design and Governance hand off; Development
 * can hand off *and publish*, which is a third button and a different weight
 * on the other two. That is `_Handoff_AV_Modal_Buttons` in the design, and it
 * is the only thing the domain changes here. The answer is `ModalConfirm`
 * (40 high); Cancel is `ModalCancel`.
 *
 * Uncontrolled, like `ReportProblemModal`: the draft lives here and leaves once
 * through `onHandoff`, because a handoff is composed and sent in one go. A
 * caller that needs the values as they change should compose `HandoffForm`.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */

/** Which footer the dialog draws. The design gives these two their own set. */
export type HandoffDomain = 'design-governance' | 'development';

export interface HandoffDraft {
  date: string;
  links: string[];
  attachments: File[];
  /** The ids (the names, when none was given) of the files already on the value that were removed here. */
  removedAttachments: string[];
  /** Only present when the dialog was overdue. */
  overdueReason?: string;
  notes?: string;
}

export interface HandoffAVModalProps {
  open: boolean;
  onClose: () => void;
  /** The handoff, once. `publish` is true only from Development's third button. */
  onHandoff: (draft: HandoffDraft, options: { publish: boolean }) => void;
  /** Which footer to draw. */
  domain?: HandoffDomain;
  /**
   * How many days late the value is. Pass it to get the design's overdue
   * variant — the banner, the required reason, and the notes field.
   */
  overdueDays?: number;
  /** Files already attached to the value: each a card that previews on click and can be removed. */
  attachments?: readonly HandoffAttachment[];
  /** Prefills the date (ISO `yyyy-mm-dd`). The caller owns what "today" means. It starts blank when left out: a handoff date is chosen, not assumed. */
  defaultDate?: string;
  loading?: boolean;
}

export function HandoffAVModal({
  open,
  onClose,
  onHandoff,
  domain = 'design-governance',
  overdueDays,
  attachments = [],
  defaultDate = '',
  loading,
}: HandoffAVModalProps) {
  const formId = React.useId();
  const isOverdue = overdueDays != null;
  const [entry, setEntry] = React.useState<HandoffEntry>(() => blankHandoffEntry(defaultDate));
  const [errors, setErrors] = React.useState<{ date?: string; overdueReason?: string; links?: boolean; evidence?: string }>({});
  /* A fresh form every time it opens: a handoff abandoned half-filled should not come back on the next one. */
  const [session, setSession] = React.useState(0);
  /* `publish` is decided by which button was pressed, and read by the one submit handler the form has. */
  const publishRef = React.useRef(false);

  React.useEffect(() => {
    if (open) return;
    setEntry(blankHandoffEntry(defaultDate));
    setErrors({});
    setSession((n) => n + 1);
  }, [open, defaultDate]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    /* Asked on submit: a date, a reason when late, a link that is typed must be an address, and there is a link or a file to review. */
    const next: typeof errors = {};
    if (!entry.date) next.date = 'Select a handoff date.';
    if (isOverdue && !entry.overdueReason) next.overdueReason = 'Please select a reason before completing the AV';
    if (!handoffLinksValid(entry)) next.links = true;
    /* A link that is typed wrong is already being asked about; "add a link" on top of it would be noise. */
    else if (!handoffHasEvidence(entry, attachments.length)) next.evidence = HANDOFF_EVIDENCE_ERROR;
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onHandoff(
      {
        date: entry.date,
        links: entry.links.filter((link) => link.trim() !== ''),
        attachments: entry.files,
        removedAttachments: entry.removed,
        ...(isOverdue ? { overdueReason: entry.overdueReason, notes: entry.notes } : {}),
      },
      { publish: publishRef.current },
    );
  };

  /* A fixed error says what is wrong until it is put right, then goes. */
  const change = (next: HandoffEntry) => {
    setEntry(next);
    setErrors((now) => ({
      date: next.date ? undefined : now.date,
      overdueReason: next.overdueReason ? undefined : now.overdueReason,
      links: now.links && !handoffLinksValid(next) ? true : undefined,
      evidence: now.evidence && !handoffHasEvidence(next, attachments.length) ? now.evidence : undefined,
    }));
  };

  const handoffButton =
    domain === 'development' ? (
      <Button
        type="submit"
        form={formId}
        variant="secondary"
        loading={loading && !publishRef.current}
        onClick={() => {
          publishRef.current = false;
        }}
      >
        Handoff
      </Button>
    ) : (
      <ModalConfirm
        type="submit"
        form={formId}
        loading={loading}
        onClick={() => {
          publishRef.current = false;
        }}
      >
        Handoff
      </ModalConfirm>
    );

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={loading}
      title="Handoff Added Value"
      size="md"
      showClose={false}
      footer={
        domain === 'development' ? (
          <>
            {/* A step down in weight so the one primary is Handoff & Publish: a plain text `Button` at the footer's size. */}
            <Button variant="tertiary" size="md" type="button" disabled={loading} onClick={onClose}>
              Cancel
            </Button>
            {handoffButton}
            <ModalConfirm
              type="submit"
              form={formId}
              loading={loading && publishRef.current}
              onClick={() => {
                publishRef.current = true;
              }}
            >
              Handoff &amp; Publish
            </ModalConfirm>
          </>
        ) : (
          <>
            <ModalCancel disabled={loading} />
            {handoffButton}
          </>
        )
      }
    >
      <form id={formId} noValidate onSubmit={submit}>
        <HandoffForm key={session} overdueDays={overdueDays} attachments={attachments} defaultDate={defaultDate} errors={errors} onChange={change} />
      </form>
    </Modal>
  );
}
HandoffAVModal.displayName = 'HandoffAVModal';

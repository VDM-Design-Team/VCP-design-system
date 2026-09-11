import * as React from 'react';
import { Modal } from '../../components/modal';
import { RejectionReason, HANDOFF_REJECTION_REASONS } from '../../components/rejection-reason';
import { FileAttachment } from '../../components/file-attachment';
import { Button } from '../../atoms/button';
import { Checkbox } from '../../atoms/checkbox';

/**
 * ReviewAVModal — what an initiator or admin reads before accepting or
 * rejecting handed-off work, and the rejection dialog that opens on top of it.
 *
 * Read off the Figma `Review_AV_Modal` (`6100:15103`, audit batch 4,
 * 11 September 2026), all four variants.
 *
 * **The body is read-only.** Everything above the checkbox is what was handed
 * off — the estimate, the completion date, the links, the attachments — shown
 * so the reviewer can judge it, not edit it. A field with nothing in it shows
 * an em dash rather than an empty row, because a missing value and a blank one
 * look identical otherwise.
 *
 * **The domain has exactly one choice**, and it is a different choice in each:
 * Design asks whether to copy the value to Development, Development asks
 * whether a Cypress test script is required. One checkbox, one prop, the label
 * from the domain.
 *
 * **Rejecting opens a second dialog on top of this one.** That is the design's
 * `Rejection Modal=Show` variant, and it is a real nested `Modal`: this one
 * goes inert behind it and is dimmed by the inner backdrop. `Modal` only
 * learned to nest on 11 September — see docs/modal.md — so this is the first
 * pattern that needs it.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export type ReviewDomain = 'design' | 'development';

/** The one extra choice each domain asks for, in the design's own wording. */
const DOMAIN_OPTION_LABEL: Record<ReviewDomain, string> = {
  design: 'Copy to Dev',
  development: 'Require Cypress Test Script',
};

export interface ReviewAVModalProps {
  open: boolean;
  onClose: () => void;
  /** Accepted, carrying the domain's one choice. */
  onAccept: (options: { domainOption: boolean }) => void;
  /** Rejected, with the reason chosen in the nested dialog. */
  onReject: (rejection: { reason: string; detail?: string }) => void;
  /** Which domain is reviewing. It decides the one checkbox. */
  domain?: ReviewDomain;
  /** The AV's name, in the title. */
  avName?: string;
  /** What was estimated. Shown as an em dash when absent. */
  estimate?: string;
  completionDate?: string;
  links?: readonly string[];
  attachments?: ReadonlyArray<{ name: string; size?: string; thumb?: string }>;
  /** The domain's one choice. Controlled. */
  domainOption?: boolean;
  onDomainOptionChange?: (value: boolean) => void;
  loading?: boolean;
}

/** A label over its value. The value is text, never an input — this is a read. */
function ReviewField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-label-sm text-text-secondary">{label}</span>
      {children}
    </div>
  );
}

/** What a field with nothing in it shows. */
const EMPTY = <span className="text-body-md text-text-primary">–</span>;

export function ReviewAVModal({
  open,
  onClose,
  onAccept,
  onReject,
  domain = 'design',
  avName = 'AV Name',
  estimate,
  completionDate,
  links = [],
  attachments = [],
  domainOption = false,
  onDomainOptionChange,
  loading,
}: ReviewAVModalProps) {
  const [rejecting, setRejecting] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [detail, setDetail] = React.useState('');

  /* The rejection dialog starts empty every time it opens, and closing the
     review closes it too rather than leaving it to reappear. */
  React.useEffect(() => {
    if (open) return;
    setRejecting(false);
    setReason('');
    setDetail('');
  }, [open]);

  const chosen = HANDOFF_REJECTION_REASONS.find((option) => option.value === reason);

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={`Review Task: ${avName}`}
        size="md"
        showClose={false}
        footer={
          <>
            <Button variant="danger" size="sm" onClick={() => setRejecting(true)}>
              Reject
            </Button>
            <Button size="sm" loading={loading} onClick={() => onAccept({ domainOption })}>
              Accept
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <ReviewField label="Original Added Value Estimate">
            {estimate ? <span className="text-body-md text-text-primary">{estimate}</span> : EMPTY}
          </ReviewField>

          <ReviewField label="Completion Date">
            {completionDate ? (
              <span className="text-body-md text-text-primary">{completionDate}</span>
            ) : (
              EMPTY
            )}
          </ReviewField>

          <ReviewField label="Links">
            {links.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {links.map((link) => (
                  <li key={link}>
                    {/* A real link: the reviewer is meant to open it. */}
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-body-md text-text-link-default underline underline-offset-4 hover:text-text-link-hover"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              EMPTY
            )}
          </ReviewField>

          <ReviewField label="Attachments">
            {attachments.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {attachments.map((file) => (
                  <FileAttachment
                    key={file.name}
                    name={file.name}
                    size={file.size}
                    thumb={file.thumb}
                    kind="image"
                  />
                ))}
              </div>
            ) : (
              /* The design's own wording, not an em dash: an empty attachment
                 list is a fact about the handoff, not a missing value. */
              <span className="text-body-md text-text-tertiary">No attachments yet.</span>
            )}
          </ReviewField>

          <Checkbox
            checked={domainOption}
            onChange={onDomainOptionChange}
            label={DOMAIN_OPTION_LABEL[domain]}
            className="w-full rounded-md border border-stroke-default p-4"
          />
        </div>
      </Modal>

      {/* The design's `Rejection Modal=Show`. A real nested dialog: the review
          above goes inert and is dimmed by this one's backdrop. */}
      <Modal
        open={open && rejecting}
        onClose={() => setRejecting(false)}
        title="Rejection Reason"
        size="sm"
        showClose={false}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setRejecting(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              /* The design fades it until a reason is chosen. */
              disabled={!reason}
              loading={loading}
              onClick={() =>
                onReject({ reason, ...(chosen?.freeText && detail ? { detail } : {}) })
              }
            >
              Reject
            </Button>
          </>
        }
      >
        <RejectionReason
          reasons={HANDOFF_REJECTION_REASONS}
          label="Rejection Reason"
          value={reason}
          onChange={setReason}
          detail={detail}
          onDetailChange={setDetail}
        />
      </Modal>
    </>
  );
}
ReviewAVModal.displayName = 'ReviewAVModal';

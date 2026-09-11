import * as React from 'react';
import { Modal } from '../../components/modal';
import { Banner } from '../../components/banner';
import { Field } from '../../components/field';
import { Dropzone } from '../../components/dropzone';
import { FileAttachment } from '../../components/file-attachment';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { Input } from '../../atoms/input';
import { Select } from '../../atoms/select';

/**
 * HandoffAVModal — what an assignee fills in to hand an Added Value on: the
 * date, the links that show the work, and anything attached. When the value is
 * late it also has to say **why**.
 *
 * Read off the Figma `Handoff_AV_Modal` (`5342:78539`, audit batch 4,
 * 11 September 2026), both of its variants.
 *
 * **`overdueDays` is what switches the dialog.** Pass it and the design's
 * second variant appears: a warning banner naming the delay, a required
 * overdue reason, and a notes field. Leave it out and none of that renders.
 * The reason is **required when overdue** — the design draws the error state
 * for exactly that, so this validates on submit rather than letting a late
 * handoff through unexplained.
 *
 * **The footer is the domain's.** Design and Governance hand off; Development
 * can hand off *and publish*, which is a third button and a different weight
 * on the other two. That is `_Handoff_AV_Modal_Buttons` in the design, and it
 * is the only thing the domain changes here.
 *
 * Uncontrolled, like `ReportProblemModal`: the draft lives here and leaves once
 * through `onHandoff`, because a handoff is composed and sent in one go. A
 * caller that needs the values as they change should compose `Modal` itself.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */

/** Which footer the dialog draws. The design gives these two their own set. */
export type HandoffDomain = 'design-governance' | 'development';

export interface OverdueReasonOption {
  value: string;
  /** The bold half of the design's "Label: description" line. */
  label: string;
  description: string;
}

/**
 * The six reasons a value can be late, straight from the Figma dropdown. Owned
 * here for the same reason `RejectionReason` owns its sets: they are drawn in
 * the design file, not configured per domain.
 */
export const OVERDUE_REASONS: readonly OverdueReasonOption[] = [
  { value: 'dependencies', label: 'Dependencies', description: 'Waiting on others (team or external)' },
  { value: 'scope-changes', label: 'Scope Changes', description: 'Requirements unclear or changed' },
  {
    value: 'resourcing',
    label: 'Resourcing',
    description: 'Not enough time, people, or availability (incl. leave)',
  },
  { value: 'prioritization', label: 'Prioritization', description: 'Deprioritized due to other work' },
  {
    value: 'process-info-gaps',
    label: 'Process / Info Gaps',
    description: 'Missing information, approvals, or internal blockers',
  },
  {
    value: 'technical-issues',
    label: 'Technical Issues',
    description: 'Bugs, systems, or technical constraints',
  },
];

export interface HandoffDraft {
  date: string;
  links: string[];
  attachments: File[];
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
  /** Files already attached to the value. */
  attachments?: Array<{ name: string; size?: string; thumb?: string }>;
  /** Prefills the date field. The caller owns what "today" means. */
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

  const [date, setDate] = React.useState(defaultDate);
  const [links, setLinks] = React.useState<string[]>(['']);
  const [files, setFiles] = React.useState<File[]>([]);
  const [overdueReason, setOverdueReason] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [reasonError, setReasonError] = React.useState<string>();
  /* `publish` is decided by which button was pressed, and read by the one
     submit handler the form has. */
  const publishRef = React.useRef(false);

  /* A fresh dialog every time it opens: a handoff abandoned half-filled should
     not come back on the next one. */
  React.useEffect(() => {
    if (open) return;
    setDate(defaultDate);
    setLinks(['']);
    setFiles([]);
    setOverdueReason('');
    setNotes('');
    setReasonError(undefined);
  }, [open, defaultDate]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    /* The design draws an error state on this field and nothing else, which is
       the whole validation rule: a late value has to say why. */
    if (isOverdue && !overdueReason) {
      setReasonError('Please select a reason before completing the AV');
      return;
    }
    onHandoff(
      {
        date,
        links: links.filter((link) => link.trim() !== ''),
        attachments: files,
        ...(isOverdue ? { overdueReason, notes } : {}),
      },
      { publish: publishRef.current },
    );
  };

  const handoffButton = (
    <Button
      size="sm"
      type="submit"
      form={formId}
      variant={domain === 'development' ? 'secondary' : 'primary'}
      loading={loading && !publishRef.current}
      onClick={() => {
        publishRef.current = false;
      }}
    >
      Handoff
    </Button>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Handoff Added Value"
      size="md"
      showClose={false}
      footer={
        domain === 'development' ? (
          <>
            <Button variant="tertiary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            {handoffButton}
            <Button
              size="sm"
              type="submit"
              form={formId}
              loading={loading && publishRef.current}
              onClick={() => {
                publishRef.current = true;
              }}
            >
              Handoff &amp; Publish
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            {handoffButton}
          </>
        )
      }
    >
      <form id={formId} className="flex flex-col gap-6" onSubmit={submit}>
        {isOverdue && (
          /* `live="off"`: the banner is present when the dialog opens rather
             than arriving, so announcing it would interrupt the name. */
          <Banner tone="warning">
            This value is <strong>Overdue</strong> by{' '}
            <strong>
              {overdueDays} {overdueDays === 1 ? 'day' : 'days'}
            </strong>
            .
          </Banner>
        )}

        <Field label="Handoff Date">
          <Input
            fullWidth
            value={date}
            onChange={(event) => setDate(event.target.value)}
            leadingIcon={<Icon name="calendar-blank" size="sm" />}
            placeholder="DD-MM-YYYY"
          />
        </Field>

        {isOverdue && (
          <>
            <Field label="Overdue Reason" error={reasonError}>
              <Select
                fullWidth
                options={OVERDUE_REASONS.map((reason) => ({
                  value: reason.value,
                  label: `${reason.label}: ${reason.description}`,
                }))}
                value={overdueReason}
                onChange={(value) => {
                  setOverdueReason(value);
                  setReasonError(undefined);
                }}
                placeholder="Select a reason"
                invalid={Boolean(reasonError)}
              />
            </Field>

            <Field label="Additional Notes (optional)">
              <Input fullWidth value={notes} onChange={(event) => setNotes(event.target.value)} />
            </Field>
          </>
        )}

        <Field label="Demo Links">
          {/* Repeatable, so the label names the group and each row names its
              own position — "Demo link 2" rather than three identical boxes. */}
          <div className="flex flex-col items-start gap-2">
            {links.map((link, index) => (
              <Input
                key={index}
                fullWidth
                value={link}
                aria-label={`Demo link ${index + 1}`}
                onChange={(event) =>
                  setLinks((current) =>
                    current.map((value, i) => (i === index ? event.target.value : value)),
                  )
                }
              />
            ))}
            <Button
              type="button"
              size="sm"
              iconLeft={<Icon name="plus" size="sm" />}
              onClick={() => setLinks((current) => [...current, ''])}
            >
              Add Another Link
            </Button>
          </div>
        </Field>

        <Field label="Attachments">
          <div className="flex flex-col gap-3">
            {attachments.length > 0 && (
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
            )}
            <Dropzone
              label="Attach Files"
              hint="PNG, JPG, GIF, DOCX, CSV and PDF file up to 10MB"
              onFiles={(picked) => setFiles((current) => [...current, ...picked])}
            />
          </div>
        </Field>
      </form>
    </Modal>
  );
}
HandoffAVModal.displayName = 'HandoffAVModal';

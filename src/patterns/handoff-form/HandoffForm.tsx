import * as React from 'react';
import { cn } from '../../lib/cn';
import { useAttachmentFiles, type AttachmentItem } from '../../lib/attachment-files';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';
import { Input } from '../../atoms/input';
import { Select } from '../../atoms/select';
import { Attachments } from '../../components/attachments';
import { Banner } from '../../components/banner';
import { DateField } from '../../components/date-field';
import { isValidLinkUrl, LINK_URL_ERROR } from '../../components/deliverable-link-form';
import { Field } from '../../components/field';

/**
 * HandoffForm — **the one handoff form**, for one Added Value: the **Handoff Date**, the **Demo Links**, the **Attachments** and, when the value is late, the banner, the **Overdue Reason** and
 * **Additional Notes**. `HandoffAVModal` (one Added Value) and `BulkActionHandoffModal` (several, a page each) both draw it, so what a handoff asks for is decided in one place. Built to Figma's
 * `Handoff_AV_Modal` (`5342:78539`) and `Bulk_Action_Handoff_Popup`.
 *
 * - **A date is required**, chosen from the calendar (`DateField`); **a late value must say why** (`overdueDays` is what switches the overdue variant on: the warning banner, the required reason and the notes).
 *   **A handoff needs something to review: at least one demo link or one attachment** (decided 13 Nov 2026; the live product asks for a link, this accepts a file too, so work without a URL can be handed off).
 *   A file already on the value counts while it is not removed. Notes are optional. A link that is typed must be a valid `https://` address; one left empty is simply dropped.
 * - **It keeps its own entry** and reports it as it changes (`onChange`), so a page that steps between several keeps every one it has mounted. `isHandoffComplete` is the one rule for "can this be handed off".
 *   Whether to wait (a disabled Handoff) or to ask on submit (`errors`) is the dialog's.
 * - **Attachments are the shared piece** (`Attachments`): the files already on the value and the ones just picked, each removable (a removal here is staged: it comes back in `removed` and the page applies it with the handoff), previewable on click, and a ✕ never drops focus.
 * - **Focus never drops** in the links either: removing a link moves focus to the next link's box (else the previous one's), and an error moves it to the first field that has one.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class.
 */

export interface OverdueReasonOption {
  value: string;
  /** The bold half of the design's "Label: description" line. */
  label: string;
  description: string;
}

/**
 * The six reasons a value can be late, straight from the Figma dropdown. Owned here for the same reason `RejectionReason` owns its sets: they are drawn in the design file, not configured per domain.
 */
export const OVERDUE_REASONS: readonly OverdueReasonOption[] = [
  { value: 'dependencies', label: 'Dependencies', description: 'Waiting on others (team or external)' },
  { value: 'scope-changes', label: 'Scope Changes', description: 'Requirements unclear or changed' },
  { value: 'resourcing', label: 'Resourcing', description: 'Not enough time, people, or availability (incl. leave)' },
  { value: 'prioritization', label: 'Prioritization', description: 'Deprioritized due to other work' },
  { value: 'process-info-gaps', label: 'Process / Info Gaps', description: 'Missing information, approvals, or internal blockers' },
  { value: 'technical-issues', label: 'Technical Issues', description: 'Bugs, systems, or technical constraints' },
];

/** A file already on the Added Value. `id` defaults to the name. */
export type HandoffAttachment = Omit<AttachmentItem, 'id'> & { id?: string };

/** What the form holds, and reports. */
export interface HandoffEntry {
  /** ISO `yyyy-mm-dd`, or `''` while none is chosen. */
  date: string;
  /** One box each; the first may be empty. Empty ones are for the page to drop. */
  links: string[];
  /** The files just picked. */
  files: File[];
  /** The ids of the files already on the value that were removed here. */
  removed: string[];
  overdueReason: string;
  notes: string;
}

export const blankHandoffEntry = (defaultDate = ''): HandoffEntry => ({ date: defaultDate, links: [''], files: [], removed: [], overdueReason: '', notes: '' });

/** A link may be left empty, but one that is typed must be a valid `https://` address. */
export const handoffLinksValid = (entry: Pick<HandoffEntry, 'links'>) => entry.links.every((link) => link.trim() === '' || isValidLinkUrl(link));

/**
 * Something to review: at least one demo link (a valid address) or one attachment. `attached` is how many files are already on the Added Value; the ones removed here no longer count, the ones just picked do.
 */
export const handoffHasEvidence = (entry: Pick<HandoffEntry, 'links' | 'files' | 'removed'>, attached = 0) =>
  entry.links.some((link) => link.trim() !== '' && isValidLinkUrl(link)) || attached - entry.removed.length + entry.files.length > 0;

/** What the form says when a handoff has neither a link nor a file. */
export const HANDOFF_EVIDENCE_ERROR = 'Add a demo link or attach a file.';

/**
 * The one rule for "can this be handed off": a date, and (when late) why, every link typed valid, and something to review (`handoffHasEvidence`). Notes are optional.
 * `attached` is how many files are already on the Added Value (the form's `attachments`).
 */
export const isHandoffComplete = (overdue: boolean, entry: HandoffEntry, attached = 0) =>
  entry.date !== '' && (!overdue || entry.overdueReason !== '') && handoffLinksValid(entry) && handoffHasEvidence(entry, attached);

export interface HandoffFormProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'> {
  /** How many days late it is. Given, the form is the overdue variant: the banner, the required reason and the notes. */
  overdueDays?: number;
  /** Files already on the Added Value. */
  attachments?: readonly HandoffAttachment[];
  /** Prefills the date (ISO). It starts blank when left out: a handoff date is chosen, not assumed. */
  defaultDate?: string;
  /** The entry, whenever it changes. */
  onChange?: (entry: HandoffEntry) => void;
  /**
   * What to say under a field, for a dialog that asks on submit. Focus goes to the first that has one. `links: true` shows every link that is not a valid address and focuses the first.
   * `evidence` is the message for a handoff with neither a link nor a file (`HANDOFF_EVIDENCE_ERROR`): it shows under Demo Links and focus goes to the first link box.
   */
  errors?: { date?: string; overdueReason?: string; links?: boolean; evidence?: string };
}

export const HandoffForm = React.forwardRef<HTMLDivElement, HandoffFormProps>(function HandoffForm(
  { className, overdueDays, attachments = [], defaultDate = '', onChange, errors, ...props },
  ref,
) {
  const overdue = overdueDays != null;
  const idBase = React.useId();
  const picked = useAttachmentFiles();
  const [date, setDate] = React.useState(defaultDate);
  const [links, setLinks] = React.useState<string[]>(['']);
  const [removed, setRemoved] = React.useState<string[]>([]);
  const [overdueReason, setOverdueReason] = React.useState('');
  const [notes, setNotes] = React.useState('');
  /* Which link boxes have been left (blurred), so a half-typed address is not shouted at while it is typed. */
  const [touched, setTouched] = React.useState<Record<number, boolean>>({});

  const entry = React.useMemo<HandoffEntry>(() => ({ date, links, files: picked.files, removed, overdueReason, notes }), [date, links, picked.files, removed, overdueReason, notes]);
  const report = React.useRef(onChange);
  report.current = onChange;
  React.useEffect(() => {
    report.current?.(entry);
  }, [entry]);

  /* Focus: an error goes to the first field that has one; a removed link hands it to its neighbour. */
  const dateRef = React.useRef<HTMLInputElement>(null);
  const reasonRef = React.useRef<HTMLSelectElement>(null);
  const linkRefs = React.useRef<Array<HTMLInputElement | null>>([]);
  React.useEffect(() => {
    if (errors?.date) dateRef.current?.focus();
    else if (errors?.overdueReason) reasonRef.current?.focus();
    else if (errors?.links) {
      setTouched(Object.fromEntries(links.map((_, i) => [i, true])));
      linkRefs.current[links.findIndex((link) => link.trim() !== '' && !isValidLinkUrl(link))]?.focus();
    } else if (errors?.evidence) linkRefs.current[0]?.focus();
    /* Only when the errors change: typing must not pull focus back. */
  }, [errors?.date, errors?.overdueReason, errors?.links, errors?.evidence]); // eslint-disable-line
  const focusLink = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (focusLink.current === null) return;
    linkRefs.current[Math.min(focusLink.current, links.length - 1)]?.focus();
    focusLink.current = null;
  }, [links]);

  const existing = attachments.map((file): AttachmentItem => ({ ...file, id: file.id ?? file.name })).filter((file) => !removed.includes(file.id));
  const items = [...existing, ...picked.items];

  return (
    <div ref={ref} className={cn('flex flex-col gap-6 font-sans', className)} {...props}>
      {overdue && (
        <Banner tone="warning">
          This value is <strong>Overdue</strong> by{' '}
          <strong>
            {overdueDays} {overdueDays === 1 ? 'day' : 'days'}
          </strong>
          .
        </Banner>
      )}

      <Field label="Handoff Date" required error={errors?.date}>
        {(control) => <DateField {...control} ref={dateRef} value={date || undefined} onChange={(iso) => setDate(iso)} placeholder="Select a date" />}
      </Field>

      {overdue && (
        <>
          <Field label="Overdue Reason" required error={errors?.overdueReason}>
            <Select
              ref={reasonRef}
              fullWidth
              options={OVERDUE_REASONS.map((reason) => ({ value: reason.value, label: `${reason.label}: ${reason.description}` }))}
              value={overdueReason}
              onChange={setOverdueReason}
              placeholder="Select a reason"
              invalid={Boolean(errors?.overdueReason)}
            />
          </Field>
          <Field label="Additional Notes (optional)">
            <Input fullWidth value={notes} onChange={(event) => setNotes(event.target.value)} />
          </Field>
        </>
      )}

      {/* The rule is said before it is broken (a dialog that waits shows no error at all), and turns into the error for one that asks on submit. */}
      <Field label="Demo Links" helper="A handoff needs at least one demo link or one attachment." error={errors?.evidence}>
        {/* Repeatable, so the label names the group and each row names its own position: "Demo link 2", not three identical boxes. */}
        <div className="flex flex-col items-start gap-2">
          {links.map((link, index) => {
            const bad = touched[index] && link.trim() !== '' && !isValidLinkUrl(link);
            return (
              <div key={index} className="flex w-full flex-col gap-1">
                <div className="flex w-full items-center gap-2">
                  <Input
                    ref={(el) => {
                      linkRefs.current[index] = el;
                    }}
                    fullWidth
                    value={link}
                    aria-label={`Demo link ${index + 1}`}
                    placeholder="Paste Link Here"
                    invalid={bad}
                    aria-describedby={bad ? `${idBase}-link-${index}` : undefined}
                    onBlur={() => setTouched((now) => ({ ...now, [index]: true }))}
                    onChange={(event) => setLinks((now) => now.map((value, i) => (i === index ? event.target.value : value)))}
                  />
                  {/* The first box is cleared, not removed: there is always one to type in. */}
                  {links.length > 1 && (
                    <IconButton
                      icon="minus-circle"
                      label={`Remove demo link ${index + 1}`}
                      onClick={() => {
                        /* The box that had focus is going: its neighbour takes it (the next, which slides into this place, else the one before). */
                        focusLink.current = index;
                        setLinks((now) => now.filter((_, i) => i !== index));
                        setTouched((now) => Object.fromEntries(Object.entries(now).filter(([key]) => Number(key) !== index).map(([key, value]) => [Number(key) > index ? Number(key) - 1 : key, value])));
                      }}
                    />
                  )}
                </div>
                {bad && (
                  <p id={`${idBase}-link-${index}`} role="alert" className="m-0 text-caption-md-medium text-accent-critical-outline-content-default">
                    {LINK_URL_ERROR}
                  </p>
                )}
              </div>
            );
          })}
          <Button
            type="button"
            size="sm"
            iconLeft={<Icon name="plus" size="sm" />}
            onClick={() => {
              focusLink.current = links.length;
              setLinks((now) => [...now, '']);
            }}
          >
            Add Another Link
          </Button>
        </div>
      </Field>

      <Field label="Attachments">
        <Attachments
          items={items}
          label="Attached files"
          onFiles={picked.add}
          onRemove={(item) => (existing.some((file) => file.id === item.id) ? setRemoved((now) => [...now, item.id]) : picked.remove(item.id))}
        />
      </Field>
    </div>
  );
});
HandoffForm.displayName = 'HandoffForm';

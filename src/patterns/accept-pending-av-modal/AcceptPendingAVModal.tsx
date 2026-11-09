import * as React from 'react';
import { cn } from '../../lib/cn';
import { Modal, ModalCancel, ModalConfirm } from '../../components/modal';
import { Button } from '../../atoms/button';
import { Checkbox } from '../../atoms/checkbox';
import { Icon } from '../../atoms/icon';
import { Input } from '../../atoms/input';

/**
 * AcceptPendingAVModal — the confirmation an admin answers to accept a pending
 * Added Value, and the one decision that comes with it: whether the value is
 * **multipart**.
 *
 * Read off the Figma `Accept_Added_Value_Modal` (`5939:149041`, audit batch 4,
 * 11 September 2026). The node carries a designer's note — "Used by Admins to
 * accept a pending AV" — which is why the doc says admin and this does not
 * pretend to be a general accept dialog.
 *
 * **It is a benign confirmation, unlike the delete one**, and the design draws
 * that difference: Cancel here is the brand-outlined `secondary`, not the grey
 * `neutral` that sits beside a destructive answer. Nothing is lost by closing
 * it, so a backdrop click closes it too.
 *
 * **Multipart is the whole point of the dialog.** Accepting is otherwise a
 * yes/no, and the checkbox is the only thing the admin actually decides, so it
 * is a card rather than a line: the title, what it does, and a target big
 * enough to hit.
 *
 * **Naming the parts.** Given `parts` (one per problem set), ticking multipart
 * shows "Rename Individual parts": per part, its label, a **Preview** of the
 * set, and an optional title (Figma `1666:263661`). A blank title is the
 * page's default, "Part (X/X) Parent Title"; the titles travel with the answer.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
/** One part a multipart value would be split into: a problem set. */
export interface AcceptMultipartPart {
  /** What the design calls it: "Problem Set 1". */
  label: string;
  /** The set's text, shown under **Preview**. Without it there is no Preview. */
  preview?: React.ReactNode;
}

export interface AcceptPendingAVModalProps {
  open: boolean;
  /** Escape, Cancel, or a backdrop click. Nothing is destroyed by closing. */
  onClose: () => void;
  /**
   * Accepted, carrying the decision. With `parts` and multipart ticked,
   * `titles` holds one title per part, trimmed, in order; `''` means "use the
   * default". The dialog does not close itself.
   */
  onConfirm: (options: { multipart: boolean; titles?: string[] }) => void;
  /** Whether the value is split into parts. Controlled. */
  multipart?: boolean;
  onMultipartChange?: (multipart: boolean) => void;
  /**
   * Hides the multipart card, for a domain where splitting makes no sense.
   * The design's own boolean — it draws the dialog both ways.
   */
  showMultipart?: boolean;
  /**
   * The parts a multipart value would become, one per problem set. Ticking
   * multipart then shows "Rename Individual parts" with a title field for
   * each. Leave it out and the dialog is the checkbox alone.
   */
  parts?: readonly AcceptMultipartPart[];
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Spins the confirm button while the accept is in flight. */
  loading?: boolean;
}

export function AcceptPendingAVModal({
  open,
  onClose,
  onConfirm,
  multipart = false,
  onMultipartChange,
  showMultipart = true,
  parts,
  title = 'Are you sure you want to accept this task?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading,
}: AcceptPendingAVModalProps) {
  const id = React.useId();
  const descriptionId = `${id}-multipart-description`;
  const naming = showMultipart && multipart && !!parts?.length;
  /* The titles typed, and which previews are open. Fresh each time it opens. */
  const [titles, setTitles] = React.useState<string[]>([]);
  const [previews, setPreviews] = React.useState<boolean[]>([]);
  React.useEffect(() => {
    if (open) {
      setTitles([]);
      /* The design draws the first preview open. */
      setPreviews((parts ?? []).map((_, i) => i === 0));
    }
  }, [open, parts]);
  const confirm = () =>
    onConfirm(naming ? { multipart, titles: (parts ?? []).map((_, i) => (titles[i] ?? '').trim()) } : { multipart });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="md"
      /* No close button in the design: the two answers are the way out, and
         Escape as always. It stays dismissible because nothing is lost. */
      showClose={false}
      footer={
        <>
          <ModalCancel>{cancelLabel}</ModalCancel>
          <ModalConfirm loading={loading} onClick={confirm}>
            {confirmLabel}
          </ModalConfirm>
        </>
      }
    >
      {showMultipart && (
        <Checkbox
          size="md"
          checked={multipart}
          onChange={onMultipartChange}
          /* The card is the label, so the whole thing is a target. The
             announced name is the title alone — reading the explanation as
             part of the name would bury it. */
          aria-label="Multipart Value"
          aria-describedby={descriptionId}
          className={cn(
            'w-full items-start rounded-md border p-4',
            multipart
              ? 'border-stroke-focused bg-surface-brand-faint'
              : 'border-stroke-default bg-surface-elevated',
          )}
          label={
            <span className="flex flex-col gap-1">
              <span className="text-body-sm-medium text-text-primary">Multipart Value</span>
              <span id={descriptionId} className="text-body-sm-medium text-text-tertiary">
                Split this value into parts based on its sets, while keeping the original as the
                parent for overall progress tracking.
              </span>
            </span>
          }
        />
      )}
      {naming && (
        <div className="mt-6 flex flex-col gap-4">
          <p className="text-body-sm-medium text-text-tertiary">Rename Individual parts</p>
          {(parts ?? []).map((part, i) => {
            const inputId = `${id}-part-${i}`;
            const previewId = `${id}-preview-${i}`;
            const showing = !!previews[i];
            return (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor={inputId} className="text-body-sm-semibold text-text-primary">
                    {part.label}
                  </label>
                  {part.preview != null && (
                    <Button
                      variant="tertiary"
                      size="sm"
                      aria-expanded={showing}
                      aria-controls={previewId}
                      iconRight={<Icon name={showing ? 'caret-up' : 'caret-down'} aria-hidden="true" />}
                      onClick={() => setPreviews((p) => p.map((v, j) => (j === i ? !v : v)))}
                    >
                      Preview<span className="sr-only"> {part.label}</span>
                    </Button>
                  )}
                </div>
                {part.preview != null && showing && (
                  <div
                    id={previewId}
                    className="line-clamp-2 rounded-md border border-stroke-default bg-surface-neutral-subtle px-3 py-2 text-body-sm-regular text-text-secondary"
                  >
                    {part.preview}
                  </div>
                )}
                <Input
                  id={inputId}
                  fullWidth
                  value={titles[i] ?? ''}
                  placeholder="Enter a title, or leave blank for “Part (X/X) Parent Title”."
                  onChange={(event) => {
                    const value = event.target.value;
                    setTitles((t) => {
                      const next = [...t];
                      next[i] = value;
                      return next;
                    });
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
AcceptPendingAVModal.displayName = 'AcceptPendingAVModal';

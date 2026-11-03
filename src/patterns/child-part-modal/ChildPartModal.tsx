import * as React from 'react';
import { Button } from '../../atoms/button';
import { Input } from '../../atoms/input';
import { Banner } from '../../components/banner';
import { Field } from '../../components/field';
import { Modal } from '../../components/modal';

/**
 * ChildPartModal — asks for the title of a new part before it is added to a multipart Added Value: "Add a New Child Part to Multipart AV",
 * one **Title** field, **Cancel** and **Confirm**. Built to Figma's `Multipart_Child_Part_Modal` (both variants).
 *
 * - **A blank title is allowed**: the placeholder says so ("Enter a title, or leave blank for “Part (X/X) Parent Title”."), and `onConfirm` gets
 *   an empty string. **Working out the default title is the page's**, because it knows the part count and the parent's title.
 * - **A completed Added Value changes status when a part is added.** Pass `statusChange` ({ from: "Completed", to: "In Progress" }) and a warning
 *   banner, "Status will change", says so above the field — Figma's taller variant.
 * - **It keeps its own draft**, cleared each time it opens. Enter in the field confirms. It does nothing itself: the page adds the part and closes
 *   the dialog (`open` is the page's).
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface ChildPartModalProps {
  open: boolean;
  onClose: () => void;
  /** Confirm. Gets the typed title, trimmed — empty means "use the default". */
  onConfirm: (title: string) => void;
  /** When adding a part changes the Added Value's status. Shows the "Status will change" warning. */
  statusChange?: { from: string; to: string };
  /** Confirm is in flight: the button spins and the field locks. */
  confirming?: boolean;
  /** What only the server knows, shown under the field. */
  error?: string;
}

export function ChildPartModal({ open, onClose, onConfirm, statusChange, confirming, error }: ChildPartModalProps) {
  const formId = React.useId();
  const [title, setTitle] = React.useState('');

  /* A fresh dialog every time it opens. */
  React.useEffect(() => {
    if (open) setTitle('');
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a New Child Part to Multipart AV"
      size="md"
      showClose={false}
      footer={
        <>
          <Button variant="secondary" size="sm" type="button" disabled={confirming} onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" type="submit" form={formId} loading={confirming}>
            Confirm
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm(title.trim());
        }}
      >
        {statusChange && (
          <Banner tone="warning" title="Status will change" live="off">
            The status of this AV is {statusChange.from}. If a new child part is added, the AV will be returned to {statusChange.to}.
          </Banner>
        )}
        <Field label="Title" error={error}>
          <Input
            fullWidth
            autoComplete="off"
            placeholder="Enter a title, or leave blank for “Part (X/X) Parent Title”."
            value={title}
            disabled={confirming}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
      </form>
    </Modal>
  );
}
ChildPartModal.displayName = 'ChildPartModal';

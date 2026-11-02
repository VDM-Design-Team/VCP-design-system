import * as React from 'react';
import { Modal } from '../../components/modal';
import { Field } from '../../components/field';
import { Button } from '../../atoms/button';
import { Input } from '../../atoms/input';

/**
 * TagManagementModal — the three dialogs behind Tag Management's cards. Built
 * to Figma's `Tag_Management_Modal` (`7592:109639`):
 *
 * - **`tag`** — "Add a new Tag": one "Tag Name" field and Submit.
 * - **`domain`** — "Add a new Domain": the same, for a domain.
 * - **`delete-domain`** — "Are you sure you want to delete this domain?", with
 *   Cancel and a red Confirm.
 *
 * The first two are one form with a different noun, so `type` picks the copy
 * and nothing else. The third is a different dialog — a question, not a form —
 * so it is `role="alertdialog"`, has no close ✕, and ignores a backdrop click:
 * a stray click must not delete a domain. Escape and Cancel still close it.
 *
 * There is no general "confirm delete" modal in the system:
 * `ConfirmDeleteAVModal` is an alert layout built around an Added Value's
 * title. This one is the plain dialog Figma draws, on `Modal` directly.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type TagManagementModalType = 'tag' | 'domain' | 'delete-domain';

export interface TagManagementModalProps {
  open: boolean;
  type: TagManagementModalType;
  /** Asked to close: Escape, Cancel, the ✕ and (add forms only) a backdrop click. */
  onClose: () => void;
  /** `tag` / `domain`: the trimmed name, once. You own `open`. */
  onSubmit?: (name: string) => void;
  /** `delete-domain`: the user answered yes. You own `open`. */
  onConfirm?: () => void;
  /** Spins the Submit / Confirm button while the request is in flight. */
  loading?: boolean;
}

const NOUN = { tag: 'Tag', domain: 'Domain' } as const;

export function TagManagementModal({
  open,
  type,
  onClose,
  onSubmit,
  onConfirm,
  loading,
}: TagManagementModalProps) {
  const formId = React.useId();
  const [name, setName] = React.useState('');

  /* A fresh form every time it opens. */
  React.useEffect(() => {
    if (!open) setName('');
  }, [open]);

  if (type === 'delete-domain') {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Are you sure you want to delete this domain?"
        role="alertdialog"
        size="md"
        dismissible={false}
        showClose={false}
        footer={
          <>
            <Button variant="tertiary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" type="button" loading={loading} onClick={onConfirm}>
              Confirm
            </Button>
          </>
        }
      />
    );
  }

  const noun = NOUN[type];
  const trimmed = name.trim();

  return (
    <Modal open={open} onClose={onClose} title={`Add a new ${noun}`} size="md">
      <form
        id={formId}
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (trimmed) onSubmit?.(trimmed);
        }}
      >
        <Field label={`${noun} Name`}>
          <Input fullWidth value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <div className="flex justify-end">
          <Button size="sm" type="submit" loading={loading} disabled={!trimmed}>
            Submit
          </Button>
        </div>
      </form>
    </Modal>
  );
}
TagManagementModal.displayName = 'TagManagementModal';

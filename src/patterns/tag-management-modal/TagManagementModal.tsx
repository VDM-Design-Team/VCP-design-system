import * as React from 'react';
import { Modal } from '../../components/modal';
import { ConfirmDeleteModal } from '../confirm-delete-modal';
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
 *   the domain's name, Cancel and a red Delete. It is `ConfirmDeleteModal`, the
 *   system's one delete confirmation.
 *
 * The first two are one form with a different noun, so `type` picks the copy
 * and nothing else (`mode="edit"` reuses it to rename — see `mode`). The third
 * is a different dialog — a question, not a form — so it hands over to
 * `ConfirmDeleteModal`: an alertdialog with the domain's name, a grey Cancel and
 * a red Delete, no close ✕, and no backdrop dismissal, so a stray click cannot
 * delete a domain.
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
  /**
   * `edit` renames an existing tag or domain: "Rename Tag", the field starts
   * as `initialName`, and the button says Save. **Not in the Figma** — the
   * pencil's dialog isn't drawn — so it is the add dialog, reused.
   */
  mode?: 'add' | 'edit';
  /** The current name: what `mode="edit"` starts the field as, and what `delete-domain` shows so nobody deletes the wrong one. */
  initialName?: string;
  /**
   * The word for what is being added or renamed, when "Tag" or "Domain" is not it: "Role", "Project". It is used in the title ("Add a new Role",
   * "Rename Role") and the field's label ("Role Name"). Left out, the `type`'s own word.
   */
  noun?: string;
}

const NOUN = { tag: 'Tag', domain: 'Domain' } as const;

export function TagManagementModal({
  open,
  type,
  onClose,
  onSubmit,
  onConfirm,
  loading,
  mode = 'add',
  initialName = '',
  noun: nounProp,
}: TagManagementModalProps) {
  const formId = React.useId();
  const [name, setName] = React.useState('');

  /* A fresh form every time it opens — empty to add, the current name to edit. */
  React.useEffect(() => {
    setName(open && mode === 'edit' ? initialName : '');
  }, [open, mode, initialName]);

  if (type === 'delete-domain') {
    return (
      <ConfirmDeleteModal
        open={open}
        onClose={onClose}
        onConfirm={() => onConfirm?.()}
        itemLabel="Domain"
        itemName={initialName}
        title="Are you sure you want to delete this domain?"
        description="This action cannot be undone. The domain will be permanently removed."
        loading={loading}
      />
    );
  }

  const noun = nounProp ?? NOUN[type];
  const trimmed = name.trim();
  const editing = mode === 'edit';

  return (
    <Modal open={open} onClose={onClose} busy={loading} title={editing ? `Rename ${noun}` : `Add a new ${noun}`} size="md">
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
          <Button size="sm" type="submit" loading={loading} disabled={!trimmed || (editing && trimmed === initialName.trim())}>
            {editing ? 'Save' : 'Submit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
TagManagementModal.displayName = 'TagManagementModal';

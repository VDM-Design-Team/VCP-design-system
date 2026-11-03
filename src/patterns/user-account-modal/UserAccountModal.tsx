import * as React from 'react';
import { Avatar } from '../../atoms/avatar';
import { Button } from '../../atoms/button';
import { Checkbox } from '../../atoms/checkbox';
import { Divider } from '../../atoms/divider';
import { Input } from '../../atoms/input';
import { Select, type SelectOption } from '../../atoms/select';
import { Stepper } from '../../atoms/stepper';
import { DomainAccessTable, type DomainAccessRow } from '../../components/domain-access-table';
import { Field } from '../../components/field';
import { Modal } from '../../components/modal';

/**
 * UserAccountModal — adds a user, or edits one, from the Accounts page. Built to Figma's `Accounts_Page_User_Modal`
 * (`Type=Existing User`, "Edit User", and the empty "Add New User").
 *
 * One dialog, two modes (`mode`):
 *
 * - **`new`** — the title reads "User", the fields start empty, and there is no Capacity Points.
 * - **`edit`** — the title is the user's name, the fields start filled, and **Capacity Points** appears with its own
 *   **Save** beside it (Figma draws it so: the points save on their own, apart from Submit — `onSaveCapacity`).
 *
 * Both have the same body: a photo with **Upload**, **Status**, **Name**, **Email**, **Proficiency**, then the
 * "Domain Access & Admin Rights" table (`DomainAccessTable`), and **Submit**.
 *
 * - **Upload** opens the browser's file picker and hands the file to `onUploadAvatar`; the chosen image shows at once.
 *   There is no crop or edit, and no way to remove a photo yet (a question for design).
 * - **The two selects read regular weight** (`emphasis="regular"`), like the Name and Email inputs beside them — Figma draws all four
 *   the same, and a form of mixed weights looks uneven.
 * - **Status and Proficiency are lists the page passes in** (`statusOptions`, `proficiencyOptions`): what they are is the
 *   product's, not this dialog's.
 * - **It keeps its own draft**, reset each time it opens from `initial` and `domains`. Submit hands the whole draft to
 *   `onSubmit` — it saves nothing itself. Name and Email are required, and Email must look like one: Submit says what is
 *   wrong under the field and does not go through. `errors` adds what only the server knows ("That email is already
 *   in use").
 *
 * **Two optional extensions make it the Settings Users tab's dialog too** (Figma's "Create New User" / "View User"):
 *
 * - **`roles`** swaps the Domain Access table for a **Roles** checklist (`draft.roles`, the ticked values). Pass `roles` and the table
 *   goes; pass `domains` and the checklist goes. Roles and Proficiency overlap in Figma's design (a question for design).
 * - **The photo's buttons follow Figma on both pages**: **Upload** while there is no photo, **Change** and **Remove** once there is one (a
 *   chosen image counts at once). **Remove** clears the picture and calls `onRemoveAvatar`, so the page can delete it.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

export interface UserAccountDraft {
  status: string;
  name: string;
  email: string;
  proficiency: string;
  /** Edit mode only; `null` while none is set. */
  capacityPoints: number | null;
  /** What the user can do in each domain. Empty when the dialog has `roles` instead. */
  access: DomainAccessRow[];
  /** The ticked roles' values. Empty when the dialog has `domains` instead. */
  roles: string[];
}

export interface UserRoleOption {
  value: string;
  label: string;
}

export type UserAccountField = 'status' | 'name' | 'email' | 'proficiency';

export interface UserAccountModalProps {
  open: boolean;
  onClose: () => void;
  /** `new` ("Add New User") or `edit` (an existing user). */
  mode?: 'new' | 'edit';
  /** The starting values, for `edit`. The modal keeps its own draft, reset each time it opens. */
  initial?: Partial<Omit<UserAccountDraft, 'access'>> & { avatarSrc?: string };
  /** The domains, with what the user can do in each: the Domain Access & Admin Rights table. */
  domains?: readonly DomainAccessRow[];
  /** The roles a user can hold: a Roles checklist instead of the domain table. Which are ticked is `initial.roles`. */
  roles?: readonly UserRoleOption[];
  statusOptions: ReadonlyArray<string | SelectOption>;
  proficiencyOptions: ReadonlyArray<string | SelectOption>;
  /** Submit, once Name and Email are valid. Gets the whole draft; saves nothing itself. */
  onSubmit: (draft: UserAccountDraft) => void;
  /** Edit only: the Save beside Capacity Points, which saves the points alone. */
  onSaveCapacity?: (points: number | null) => void;
  /** A photo was chosen. There is no crop. */
  onUploadAvatar?: (file: File) => void;
  /** Remove was pressed: the page deletes the image. Once there is a photo the buttons are **Change** and **Remove**; with none, **Upload**. */
  onRemoveAvatar?: () => void;
  /** Submit is in flight: the button spins and the dialog's fields lock. */
  submitting?: boolean;
  /** What only the server knows, per field — shown under it. */
  errors?: Partial<Record<UserAccountField, string>>;
  /** The title. Defaults to the user's name (edit) or "User" (new). */
  title?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const blank = (initial: UserAccountModalProps['initial']): Omit<UserAccountDraft, 'access'> => ({
  roles: initial?.roles ?? [],
  status: initial?.status ?? '',
  name: initial?.name ?? '',
  email: initial?.email ?? '',
  proficiency: initial?.proficiency ?? '',
  capacityPoints: initial?.capacityPoints ?? null,
});

export function UserAccountModal({
  open,
  onClose,
  mode = 'new',
  initial,
  domains = [],
  roles,
  statusOptions,
  proficiencyOptions,
  onSubmit,
  onSaveCapacity,
  onUploadAvatar,
  onRemoveAvatar,
  submitting,
  errors,
  title,
}: UserAccountModalProps) {
  const [draft, setDraft] = React.useState<UserAccountDraft>(() => ({ ...blank(initial), access: [...domains] }));
  const [photo, setPhoto] = React.useState<string | undefined>(undefined);
  const [removed, setRemoved] = React.useState(false);
  const [invalid, setInvalid] = React.useState<Partial<Record<'name' | 'email', string>>>({});
  const fileInput = React.useRef<HTMLInputElement>(null);
  const photoButton = React.useRef<HTMLButtonElement>(null);
  const nameInput = React.useRef<HTMLInputElement>(null);
  const emailInput = React.useRef<HTMLInputElement>(null);
  const helpId = React.useId();

  /* Each time it opens, start again from what it was given. */
  React.useEffect(() => {
    if (!open) return;
    setDraft({ ...blank(initial), access: [...domains] });
    setPhoto(undefined);
    setRemoved(false);
    setInvalid({});
    /* On open only: a new `initial` object on every render must not wipe what is being typed. */
  }, [open]); // eslint-disable-line

  /* A chosen photo is shown from a local URL; let go of it when it is replaced or the dialog goes. */
  React.useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo);
  }, [photo]);

  const set = <K extends keyof UserAccountDraft>(key: K, value: UserAccountDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    /* Fixing a field clears what was said about it. */
    if (key === 'name' || key === 'email') setInvalid((i) => ({ ...i, [key]: undefined }));
  };
  const setAccess = (id: DomainAccessRow['id'], patch: Partial<DomainAccessRow>) =>
    setDraft((d) => ({ ...d, access: d.access.map((row) => (row.id === id ? { ...row, ...patch } : row)) }));

  const submit = () => {
    const next: typeof invalid = {};
    if (!draft.name.trim()) next.name = 'Enter a name.';
    if (!draft.email.trim()) next.email = 'Enter an email address.';
    else if (!EMAIL.test(draft.email.trim())) next.email = 'Enter a valid email address, like name@company.com.';
    setInvalid(next);
    /* Not through: hand focus to the first field that needs fixing. */
    if (next.name) return nameInput.current?.focus();
    if (next.email) return emailInput.current?.focus();
    onSubmit({ ...draft, name: draft.name.trim(), email: draft.email.trim() });
  };

  const setRole = (value: string, on: boolean) =>
    setDraft((d) => ({ ...d, roles: on ? [...d.roles, value] : d.roles.filter((role) => role !== value) }));

  const shownPhoto = removed ? photo : (photo ?? initial?.avatarSrc);
  const message = (field: UserAccountField) => errors?.[field] ?? invalid[field as 'name' | 'email'];
  const locked = Boolean(submitting);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title ?? (mode === 'edit' ? initial?.name || 'User' : 'User')}
      size="lg"
      footer={
        <Button size="sm" type="button" loading={submitting} onClick={submit}>
          Submit
        </Button>
      }
    >
      <form
        noValidate
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="flex items-center gap-4">
          {/* The name is a field right here, so the photo is decoration. */}
          <Avatar size="lg" className="size-12" name={draft.name} src={shownPhoto} />
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setPhoto(URL.createObjectURL(file));
              setRemoved(false);
              onUploadAvatar?.(file);
              /* So choosing the same file again still fires. */
              event.target.value = '';
            }}
          />
          <Button
            ref={photoButton}
            variant="secondary"
            size="sm"
            type="button"
            disabled={locked}
            aria-label={shownPhoto ? 'Change profile photo' : 'Upload profile photo'}
            onClick={() => fileInput.current?.click()}
          >
            {shownPhoto ? 'Change' : 'Upload'}
          </Button>
          {shownPhoto && (
            <Button
              variant="secondary"
              size="sm"
              type="button"
              disabled={locked}
              aria-label="Remove profile photo"
              onClick={() => {
                setPhoto(undefined);
                setRemoved(true);
                onRemoveAvatar?.();
                /* The button that had focus is gone: Change is what took its place. */
                photoButton.current?.focus();
              }}
            >
              Remove
            </Button>
          )}
        </div>

        <Field label="Status" error={message('status')}>
          <Select
            fullWidth
            emphasis="regular"
            placeholder="Select status"
            options={statusOptions}
            value={draft.status}
            disabled={locked}
            onChange={(status) => set('status', status)}
          />
        </Field>
        <Field label="Name" error={message('name')}>
          <Input
            ref={nameInput}
            fullWidth
            autoComplete="off"
            value={draft.name}
            disabled={locked}
            onChange={(event) => set('name', event.target.value)}
          />
        </Field>
        <Field label="Email" error={message('email')}>
          <Input
            ref={emailInput}
            fullWidth
            type="email"
            autoComplete="off"
            value={draft.email}
            disabled={locked}
            onChange={(event) => set('email', event.target.value)}
          />
        </Field>
        <Field label="Proficiency" error={message('proficiency')}>
          <Select
            fullWidth
            emphasis="regular"
            placeholder="Select proficiency"
            options={proficiencyOptions}
            value={draft.proficiency}
            disabled={locked}
            onChange={(proficiency) => set('proficiency', proficiency)}
          />
        </Field>

        {mode === 'edit' && (
          <div className="flex flex-col gap-1.5">
            <span className="text-body-sm-semibold text-text-primary">
              Capacity Points
            </span>
            <div className="flex items-center gap-2">
              <Stepper
                variant="up-down"
                label="Capacity Points"
                placeholder="Set points"
                value={draft.capacityPoints}
                max={9999}
                disabled={locked}
                onChange={(points) => set('capacityPoints', points)}
                onClear={() => set('capacityPoints', null)}
              />
              <Button
                size="sm"
                type="button"
                disabled={locked}
                aria-describedby={helpId}
                onClick={() => onSaveCapacity?.(draft.capacityPoints)}
              >
                Save
              </Button>
            </div>
            <p id={helpId} className="m-0 text-caption-md-regular text-text-tertiary">
              Points allocated for this user in the current domain.
            </p>
          </div>
        )}

        {roles && (
          <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
            <legend className="mb-3 p-0 text-body-sm-semibold text-text-primary">Roles</legend>
            {roles.map((role) => (
              <Checkbox
                key={role.value}
                label={role.label}
                checked={draft.roles.includes(role.value)}
                disabled={locked}
                onChange={(on) => setRole(role.value, on)}
              />
            ))}
          </fieldset>
        )}

        {!roles && <Divider />}

        {!roles && (
          <section aria-labelledby="domain-access-heading" className="flex flex-col gap-2">
            <h3 id="domain-access-heading" className="m-0 text-body-lg-medium text-text-primary">
              Domain Access &amp; Admin Rights
            </h3>
            <DomainAccessTable
              rows={draft.access}
              disabled={locked}
              onAccessChange={(id, access) => setAccess(id, { access })}
              onAdminChange={(id, admin) => setAccess(id, { admin })}
            />
          </section>
        )}
      </form>
    </Modal>
  );
}

import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Field } from '../../components/field';
import { PasswordField } from '../../components/password-field';
import { PasswordStrength } from '../../components/password-strength';
import { MIN_PASSWORD_LENGTH, scorePassword, type PasswordVerdict } from '../../lib/password-strength';

export type { PasswordVerdict };

/**
 * ChangePasswordForm — the Password tab of Settings: your current password, the new one, the new one again, and Set Password. Built to
 * Figma's `Settings_Password` (the `_Password_Item_*` items).
 *
 * - **Old Password**, **New Password** and **Confirm Password** are each a `PasswordField` — dots, with an eye to show what you typed.
 * - **New Password says its one rule under the field**, "At least 8 characters" (`MIN_PASSWORD_LENGTH`), so it is known before Set Password.
 * - **Under New Password, a `PasswordStrength` meter** says how strong it is while you type, scored by VCP's `scorePassword` unless the page
 *   passes its own `getStrength`; `getStrength={null}` leaves the meter out. The meter is advice, not a gate.
 * - **Set Password** hands the old and new passwords to `onSubmit`. It changes nothing itself.
 *
 * **Validation, with Figma's own words** (its Error variants): each field is required — "Old password is required", "New password is required",
 * "Password confirmation is required". Confirming a password that is not the new one ("Passwords do not match") is an addition. Set Password then says
 * what is wrong under the field, moves focus to the first problem and does not call `onSubmit`; fixing a field clears what was said about it.
 * `errors` carries what only the server knows ("Old password is incorrect"). `saving` spins the button and locks the fields.
 *
 * It keeps its own draft. After a successful change, clear it by giving the form a new `key`.
 *
 * The fields' `autocomplete` is `current-password` for the old one and `new-password` for the other two, so a password manager fills and saves
 * them correctly.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the token in `tokens/`
 * first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

export interface ChangePasswordValues {
  oldPassword: string;
  newPassword: string;
}

export type ChangePasswordField = 'oldPassword' | 'newPassword' | 'confirmPassword';

export interface ChangePasswordFormProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'children' | 'onSubmit'> {
  /** Set Password, once the three fields are filled and the new one is confirmed. Gets the old and new passwords; changes nothing itself. */
  onSubmit: (values: ChangePasswordValues) => void;
  /** Scores the new password as it is typed, 300ms after the last keystroke. Defaults to VCP's `scorePassword`; `null` leaves the meter out. */
  getStrength?: ((password: string) => PasswordVerdict) | null;
  /** Set Password is in flight: the button spins and the fields lock. */
  saving?: boolean;
  /** What only the server knows, per field. */
  errors?: Partial<Record<ChangePasswordField, string>>;
}

export function ChangePasswordForm({ className, onSubmit, getStrength = scorePassword, saving, errors, ...props }: ChangePasswordFormProps) {
  const [draft, setDraft] = React.useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [invalid, setInvalid] = React.useState<Partial<Record<ChangePasswordField, string>>>({});
  const refs = {
    oldPassword: React.useRef<HTMLInputElement>(null),
    newPassword: React.useRef<HTMLInputElement>(null),
    confirmPassword: React.useRef<HTMLInputElement>(null),
  };
  const meterId = React.useId();

  const set = (key: ChangePasswordField, value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
    /* Fixing a field clears what was said about it. */
    setInvalid((i) => ({ ...i, [key]: undefined }));
  };

  const submit = () => {
    const next: typeof invalid = {};
    if (!draft.oldPassword) next.oldPassword = 'Old password is required';
    if (!draft.newPassword) next.newPassword = 'New password is required';
    else if (draft.newPassword.length < MIN_PASSWORD_LENGTH) next.newPassword = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    if (!draft.confirmPassword) next.confirmPassword = 'Password confirmation is required';
    else if (draft.newPassword && draft.confirmPassword !== draft.newPassword) next.confirmPassword = 'Passwords do not match';
    setInvalid(next);
    /* Not through: hand focus to the first field that needs fixing. */
    const first = (['oldPassword', 'newPassword', 'confirmPassword'] as const).find((key) => next[key]);
    if (first) return refs[first].current?.focus();
    onSubmit({ oldPassword: draft.oldPassword, newPassword: draft.newPassword });
  };

  /* Scored a beat after typing stops, so the meter does not flicker through every keystroke; emptied at once. */
  const [scored, setScored] = React.useState<{ password: string; verdict: PasswordVerdict }>();
  React.useEffect(() => {
    if (!getStrength || !draft.newPassword) return setScored(undefined);
    const timer = setTimeout(() => setScored({ password: draft.newPassword, verdict: getStrength(draft.newPassword) }), 300);
    return () => clearTimeout(timer);
  }, [draft.newPassword, getStrength]);
  const verdict = draft.newPassword ? scored?.verdict : undefined;
  /* What is wrong with a field: the server's word first, then the form's. Its edge turns critical with it. */
  const problem = (key: ChangePasswordField) => errors?.[key] ?? invalid[key];

  return (
    <form
      noValidate
      className={cn('flex flex-col gap-4 rounded-md bg-surface-elevated p-4 font-sans', className)}
      {...props}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="flex max-w-lg flex-col gap-4">
        <Field label="Old Password" error={problem('oldPassword')}>
          <PasswordField
            ref={refs.oldPassword}
            fullWidth
            autoComplete="current-password"
            placeholder="Enter your current password"
            value={draft.oldPassword}
            invalid={Boolean(problem('oldPassword'))}
            disabled={saving}
            onChange={(event) => set('oldPassword', event.target.value)}
          />
        </Field>

        <div className="flex flex-col gap-2">
          <Field
            label="New Password"
            helper={`At least ${MIN_PASSWORD_LENGTH} characters`}
            error={problem('newPassword')}
          >
            {(control) => (
              <PasswordField
                ref={refs.newPassword}
                fullWidth
                autoComplete="new-password"
                placeholder="Enter a strong password"
                value={draft.newPassword}
                invalid={Boolean(problem('newPassword'))}
                disabled={saving}
                onChange={(event) => set('newPassword', event.target.value)}
                {...control}
                /* So focusing the field reads out how strong it is — the meter is not announced on its own. */
                aria-describedby={[control['aria-describedby'], verdict ? meterId : undefined].filter(Boolean).join(' ') || undefined}
              />
            )}
          </Field>
          {verdict && <PasswordStrength id={meterId} strength={verdict.strength} message={verdict.message} />}
        </div>

        <Field label="Confirm Password" error={problem('confirmPassword')}>
          <PasswordField
            ref={refs.confirmPassword}
            fullWidth
            autoComplete="new-password"
            placeholder="Confirm your new password"
            value={draft.confirmPassword}
            invalid={Boolean(problem('confirmPassword'))}
            disabled={saving}
            onChange={(event) => set('confirmPassword', event.target.value)}
          />
        </Field>
      </div>

      <div>
        <Button size="sm" type="submit" loading={saving}>
          Set Password
        </Button>
      </div>
    </form>
  );
}
ChangePasswordForm.displayName = 'ChangePasswordForm';

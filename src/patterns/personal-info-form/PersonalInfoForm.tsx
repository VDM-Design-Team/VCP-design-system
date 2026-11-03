import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Input } from '../../atoms/input';
import { ConnectionCard } from '../../components/connection-card';
import { Field } from '../../components/field';

/**
 * PersonalInfoForm — the Personal Info tab of Settings: your name and email, and — for a domain that works in Jira — the Jira
 * account that is linked to you. Built to Figma's `Settings_Personal_Info` (`Domain=Design` and `Domain=Development`).
 *
 * - **Name** and **Email** are the two fields every domain has, then **Save**.
 * - **Jira** (`jira`) is the Development domain's extra: a read-only **Jira Account ID** ("Auto populated after Jira connection") and a
 *   `ConnectionCard` to link the account. Give it `jira` and the section shows; leave it out for Design. *Which* domains have it is the
 *   page's knowledge, not this form's.
 *
 * **It keeps its own draft** (from `initial`) and hands the whole of it to `onSave` — it saves nothing itself. Name and Email are
 * required and Email must look like one: Save says what is wrong under the field, moves focus to the first problem and does not go
 * through; fixing a field clears what was said. `errors` carries what only the server knows. `saving` spins Save and locks the fields.
 *
 * The Jira card only reports its press (`jira.onConnect`): what connecting does — a redirect, a popup — is the page's.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the token in
 * `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

export interface PersonalInfoValues {
  name: string;
  email: string;
}

export interface PersonalInfoJira {
  /** The linked account's id, once there is one. Read-only: it is filled in by the connection. */
  accountId?: string;
  /** The service's mark for the card. */
  logo: React.ReactNode;
  /** Where the link stands: "Not connected". */
  status: React.ReactNode;
  /** The card's button: "Connect", "Disconnect". */
  actionLabel?: string;
  /** The card's button was pressed. */
  onConnect?: () => void;
  /** The connection is in flight. */
  connecting?: boolean;
}

export interface PersonalInfoFormProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'children' | 'onSubmit'> {
  /** What the fields start as. */
  initial?: Partial<PersonalInfoValues>;
  /** Save, once Name and Email are valid. Gets the whole draft; saves nothing itself. */
  onSave: (values: PersonalInfoValues) => void;
  /** The Jira section — Development only. Left out, there is none. */
  jira?: PersonalInfoJira;
  /** Save is in flight: it spins and the fields lock. */
  saving?: boolean;
  /** What only the server knows, per field. */
  errors?: Partial<Record<keyof PersonalInfoValues, string>>;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function PersonalInfoForm({
  className,
  initial,
  onSave,
  jira,
  saving,
  errors,
  ...props
}: PersonalInfoFormProps) {
  const [draft, setDraft] = React.useState<PersonalInfoValues>({ name: initial?.name ?? '', email: initial?.email ?? '' });
  const [invalid, setInvalid] = React.useState<Partial<Record<keyof PersonalInfoValues, string>>>({});
  const nameInput = React.useRef<HTMLInputElement>(null);
  const emailInput = React.useRef<HTMLInputElement>(null);

  const set = (key: keyof PersonalInfoValues, value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
    /* Fixing a field clears what was said about it. */
    setInvalid((i) => ({ ...i, [key]: undefined }));
  };

  const submit = () => {
    const next: typeof invalid = {};
    if (!draft.name.trim()) next.name = 'Enter your name.';
    if (!draft.email.trim()) next.email = 'Enter your email address.';
    else if (!EMAIL.test(draft.email.trim())) next.email = 'Enter a valid email address, like name@company.com.';
    setInvalid(next);
    /* Not through: hand focus to the first field that needs fixing. */
    if (next.name) return nameInput.current?.focus();
    if (next.email) return emailInput.current?.focus();
    onSave({ name: draft.name.trim(), email: draft.email.trim() });
  };

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
        <Field label="Name" error={errors?.name ?? invalid.name}>
          <Input
            ref={nameInput}
            fullWidth
            autoComplete="name"
            value={draft.name}
            disabled={saving}
            onChange={(event) => set('name', event.target.value)}
          />
        </Field>
        <Field label="Email" error={errors?.email ?? invalid.email}>
          <Input
            ref={emailInput}
            fullWidth
            type="email"
            autoComplete="email"
            value={draft.email}
            disabled={saving}
            onChange={(event) => set('email', event.target.value)}
          />
        </Field>

        {jira && (
          <>
            <Field label="Jira Account ID" helper="Auto populated after Jira connection">
              <Input fullWidth disabled placeholder="e.g. 712020:abc123..." value={jira.accountId ?? ''} readOnly />
            </Field>
            <ConnectionCard
              name="Jira"
              logo={jira.logo}
              status={jira.status}
              actionLabel={jira.actionLabel}
              onAction={jira.onConnect}
              loading={jira.connecting}
              disabled={saving}
            />
          </>
        )}
      </div>

      <div>
        <Button size="sm" type="submit" loading={saving}>
          Save
        </Button>
      </div>
    </form>
  );
}
PersonalInfoForm.displayName = 'PersonalInfoForm';

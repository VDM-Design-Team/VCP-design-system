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
 * - **Jira** (`jira`) is the Development domain's extra: a **Jira Account ID** and a `ConnectionCard` to link the account. Give it
 *   `jira` and the section shows; leave it out for Design. *Which* domains have it is the page's knowledge, not this form's.
 *   **The id is filled in by the connection only** (decided with design, 6 Nov 2026): it is never typed. Figma draws two states for it:
 *   **before** the account is linked it is greyed out with the note "Auto populated after Jira connection"; **after**, a plain
 *   read-only field holding the id, with no note. It shows `jira.accountId` as it is, so a connection that lands later fills it in.
 *
 * **It keeps its own draft** and hands the whole of it to `onSave` — it saves nothing itself. The draft **follows `initial` until the
 * person edits a field**, so a profile that loads after the form is on screen still fills it in, and typing is never overwritten.
 * Name and Email are required ("Name is required", as Figma's Error variant words it) and Email must look like one, with the same
 * words as `UserAccountModal`: Save says what is wrong under the field, moves focus to the first problem and does not go through;
 * fixing a field clears what was said. `errors` carries what only the server knows. `saving` spins Save and locks the fields.
 * **`emailReadOnly`** is an email this person cannot change here (a single sign-on's, or one an admin owns): it is read-only, not
 * disabled, so it can still be reached with the keyboard, selected and copied. It sits on a grey fill to show it is not editable,
 * and it is not validated, since it is not the person's to fix.
 *
 * Figma draws no tooltips on this tab.
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
  /** The linked account's id, once there is one. Filled in by the connection only: the field is read-only. */
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
  /** What the fields hold. The draft follows it until the person edits a field, so it may arrive after the form is on screen. */
  initial?: Partial<PersonalInfoValues>;
  /** Save, once Name and Email are valid. Gets the whole draft; saves nothing itself. */
  onSave: (values: PersonalInfoValues) => void;
  /** The Jira section — Development only. Left out, there is none. */
  jira?: PersonalInfoJira;
  /** Save is in flight: it spins and the fields lock. */
  saving?: boolean;
  /** The email cannot be changed here (a single sign-on's, or one an admin owns). Read-only: still reachable, selectable and copyable. Not validated. */
  emailReadOnly?: boolean;
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
  emailReadOnly,
  errors,
  ...props
}: PersonalInfoFormProps) {
  const [draft, setDraft] = React.useState<PersonalInfoValues>({ name: initial?.name ?? '', email: initial?.email ?? '' });
  /* The draft follows `initial` until the person edits a field: a profile that loads late fills the form, and typing is never overwritten. */
  const [edited, setEdited] = React.useState(false);
  React.useEffect(() => {
    if (!edited) setDraft({ name: initial?.name ?? '', email: initial?.email ?? '' });
    /* Only when what was given changes; `edited` is read, not followed. */
  }, [initial?.name, initial?.email]); // eslint-disable-line
  /* Filled in by the connection only, so it is shown as given: an id that arrives later appears. */
  const jiraId = jira?.accountId ?? '';
  const [invalid, setInvalid] = React.useState<Partial<Record<keyof PersonalInfoValues, string>>>({});
  const nameInput = React.useRef<HTMLInputElement>(null);
  const emailInput = React.useRef<HTMLInputElement>(null);

  const set = (key: keyof PersonalInfoValues, value: string) => {
    setEdited(true);
    setDraft((d) => ({ ...d, [key]: value }));
    /* Fixing a field clears what was said about it. */
    setInvalid((i) => ({ ...i, [key]: undefined }));
  };

  const submit = () => {
    const next: typeof invalid = {};
    if (!draft.name.trim()) next.name = 'Name is required';
    /* A read-only email is not the person's to fix here, so it is not checked. The words are `UserAccountModal`'s. */
    if (!emailReadOnly) {
      if (!draft.email.trim()) next.email = 'Enter an email address.';
      else if (!EMAIL.test(draft.email.trim())) next.email = 'Enter a valid email address, like name@company.com.';
    }
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
            readOnly={emailReadOnly}
            /* Not editable, and looks it: a grey fill, with the edge and the text at full strength so it still reads and clears contrast. */
            className={emailReadOnly ? 'bg-surface-neutral-subtle' : undefined}
            onChange={(event) => set('email', event.target.value)}
          />
        </Field>

        {jira && (
          <>
            {/* Figma's two states. Not linked yet: greyed out with its note. Linked: a plain read-only field holding the id. */}
            <Field label="Jira Account ID" helper={jiraId ? undefined : 'Auto populated after Jira connection'}>
              <Input fullWidth value={jiraId} disabled={saving || !jiraId} readOnly />
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

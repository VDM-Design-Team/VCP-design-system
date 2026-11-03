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
 *   Figma draws two states for the id: **before** the account is linked it is greyed out with the note "Auto populated after Jira
 *   connection" and an example in its placeholder; **after**, a normal white field holding the id, with no note. Is the id ever typed by
 *   hand? Figma does not say, so it is a prop: `accountIdEditable` (off by default — the connection fills it, and the field is
 *   read-only) turns it into an ordinary input whose value `onSave` hands back as `jiraAccountId`.
 *
 * **It keeps its own draft** (from `initial`) and hands the whole of it to `onSave` — it saves nothing itself. Name and Email are
 * required ("Name is required", as Figma's Error variant words it) and Email must look like one: Save says what is wrong under the
 * field, moves focus to the first problem and does not go through; fixing a field clears what was said. `errors` carries what only the
 * server knows. `saving` spins Save and locks the fields. **`emailDisabled`** is Figma's disabled Email: shown, but not editable (an
 * email an admin or a single sign-on owns).
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
  /** Only when the Jira id is editable (`jira.accountIdEditable`). */
  jiraAccountId?: string;
}

export interface PersonalInfoJira {
  /** The linked account's id, once there is one. Filled in by the connection, so by default the field is read-only. */
  accountId?: string;
  /**
   * The id can be typed by hand as well as filled in by the connection. Off by default: the field is read-only (greyed out and
   * labelled "Auto populated after Jira connection" until there is an id, then plain and read-only). On, it is an ordinary
   * input, and `onSave` gets its value as `jiraAccountId`.
   */
  accountIdEditable?: boolean;
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
  /** The email is shown but cannot be changed here — Figma's disabled Email. */
  emailDisabled?: boolean;
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
  emailDisabled,
  errors,
  ...props
}: PersonalInfoFormProps) {
  const [draft, setDraft] = React.useState<PersonalInfoValues>({ name: initial?.name ?? '', email: initial?.email ?? '' });
  const [jiraId, setJiraId] = React.useState(jira?.accountId ?? '');
  /* A connection that lands later fills the id in; a person's own typing is not overwritten while it is being edited. */
  React.useEffect(() => {
    if (!jira?.accountIdEditable) setJiraId(jira?.accountId ?? '');
  }, [jira?.accountId, jira?.accountIdEditable]);
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
    if (!draft.name.trim()) next.name = 'Name is required';
    /* A disabled email is not the person's to fix here, so it is not checked. */
    if (!emailDisabled) {
      if (!draft.email.trim()) next.email = 'Email is required';
      else if (!EMAIL.test(draft.email.trim())) next.email = 'Enter a valid email address, like name@company.com.';
    }
    setInvalid(next);
    /* Not through: hand focus to the first field that needs fixing. */
    if (next.name) return nameInput.current?.focus();
    if (next.email) return emailInput.current?.focus();
    onSave({
      name: draft.name.trim(),
      email: draft.email.trim(),
      ...(jira?.accountIdEditable ? { jiraAccountId: jiraId.trim() } : {}),
    });
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
            disabled={saving || emailDisabled}
            onChange={(event) => set('email', event.target.value)}
          />
        </Field>

        {jira && (
          <>
            {/* Figma's two states. Empty and filled by the connection: greyed out with its note. Filled: a plain field. */}
            <Field
              label="Jira Account ID"
              helper={jira.accountIdEditable || jiraId ? undefined : 'Auto populated after Jira connection'}
            >
              <Input
                fullWidth
                placeholder="e.g. 712020:abc123..."
                value={jiraId}
                disabled={saving || (!jira.accountIdEditable && !jiraId)}
                readOnly={!jira.accountIdEditable}
                onChange={(event) => setJiraId(event.target.value)}
              />
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

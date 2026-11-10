# PersonalInfoForm *(pattern)*

The Personal Info tab of Settings: your name and email, and — for a domain that works in Jira — the Jira account that is linked to you. Built to
Figma's `Settings_Personal_Info` (`Domain=Design` and `Domain=Development`).

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Input` | atom |
| `ConnectionCard` | component |
| `Field` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `PersonalInfoForm` | The Personal Info tab of Settings |
| `ChangePasswordForm` | The Password tab |
| `UserAccountModal` | An admin editing someone else's account |

## What it shows

- **Name** and **Email** — the two fields every domain has — then **Save**.
- **Jira** (`jira`), the Development domain's extra: a **Jira Account ID** and a `ConnectionCard` to link the account. Give it `jira` and the section
  shows; leave it out for Design. **Which domains have it is the page's knowledge, not the form's.**

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `initial` | `{ name, email }` | — | What the fields hold. The draft **follows it until the person edits a field**, so it may arrive after the form is on screen |
| `onSave` | `(values) => void` | required | Valid, it gets the whole draft (trimmed). **Saves nothing itself** |
| `jira` | `PersonalInfoJira` | — | `{ accountId?, logo, status, actionLabel?, onConnect?, connecting? }`. Left out, there is no Jira section |
| `saving` | `boolean` | — | Save spins and every field (and the Jira button) locks |
| `emailReadOnly` | `boolean` | — | An email this person cannot change here (a single sign-on's, or one an admin owns). **Read-only, not disabled**: still reachable with the keyboard, selectable and copyable, on a grey fill. It is then not validated |
| `errors` | `{ name?, email? }` | — | What only the server knows, shown under the field |

## The draft and the validation

It **keeps its own draft** and hands the whole of it to `onSave`. **The draft follows `initial` until the person edits a field**: a profile that
loads after the form is on screen still fills it in, and once something has been typed a later `initial` does not overwrite it. (To throw a draft away
and start again, remount the form with a new `key`.)

Name and Email are required and Email must look like one: Save then says what is wrong under the field, **moves focus to the first problem** and does
not call `onSave`; fixing a field clears what was said about it. Name's message is Figma's own ("Name is required", its Error variant). **An editable
Email shows its errors with the same words as `UserAccountModal`**: "Enter an email address." and "Enter a valid email address, like
name@company.com." A read-only Email is not checked, since it is not the person's to fix.

**No tooltips.** Figma draws none on this tab.

## Jira

**The Jira Account ID is filled in by the connection only** (decided with design, 6 Nov 2026). It is never typed, so it has no placeholder and
`onSave` does not send it. Figma draws **two states**: **before** the account is linked it is greyed out (disabled) with the note "Auto populated
after Jira connection"; **after**, a plain read-only field holding the id, with no note. The field shows `jira.accountId` as given, so a connection
that lands while the form is open fills it in.

The **card only reports its press** (`jira.onConnect`): what connecting does — a redirect, a popup, a request — is the page's, and so are the words
for each state (`jira.status`, `jira.actionLabel`).

## Tokens

None of its own: `Field`, `Input` and `Button` `sm`, on a `surface.elevated` card (`radius.md`, `space.16`), the fields 32rem wide as Figma's 512. The
Jira note ("Auto populated after Jira connection") is `Field`'s helper under the field; Figma sets it on the label's line, right-aligned.

## Accessibility

- A real `<form>`; every field has a visible label; an error sits under its field, is announced (`aria-invalid`, `role="alert"`) and takes focus.
- `autocomplete` is `name` and `email`, so a browser can fill them.
- **A read-only Email stays in the tab order** and can be selected and copied; a disabled one could not. Its grey fill keeps the full-strength edge and text, so it still clears contrast.
- Before it is linked the Jira Account ID is disabled, so it is skipped by the keyboard but read by a screen reader with its note; after, it is read-only but focusable, so the id can be selected and copied.

## Don't

- **Don't save inside it.** It hands the draft to `onSave`.
- **Don't connect inside it.** The card reports a press; the page connects.
- **Don't decide here which domains get Jira.** Pass `jira` or don't.
- **Don't let the Jira Account ID be typed.** Connecting is the only way in.
- **Don't disable a locked Email.** Use `emailReadOnly`, so it can still be read, reached and copied.

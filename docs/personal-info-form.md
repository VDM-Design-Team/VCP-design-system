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
- **Jira** (`jira`), the Development domain's extra: a read-only **Jira Account ID** ("Auto populated after Jira connection") and a `ConnectionCard` to link the
  account. Give it `jira` and the section shows; leave it out for Design. **Which domains have it is the page's knowledge, not the form's.**

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `initial` | `{ name, email }` | — | What the fields start as. The form keeps its own draft |
| `onSave` | `(values) => void` | required | Valid, it gets the whole draft (trimmed). **Saves nothing itself** |
| `jira` | `PersonalInfoJira` | — | `{ accountId?, logo, status, actionLabel?, onConnect?, connecting? }`. Left out, there is no Jira section |
| `saving` | `boolean` | — | Save spins and every field (and the Jira button) locks |
| `errors` | `{ name?, email? }` | — | What only the server knows, shown under the field |

## The draft and the validation

It **keeps its own draft** and hands the whole of it to `onSave`. Name and Email are required and Email must look like one: Save then says what is wrong
under the field, **moves focus to the first problem** and does not call `onSave`; fixing a field clears what was said about it. (Figma draws no error
states; this is an addition.)

## Jira

The **Jira Account ID** is filled in by the connection, so it is a disabled, read-only field with its placeholder ("e.g. 712020:abc123...") until
there is one. The **card only reports its press** (`jira.onConnect`): what connecting does — a redirect, a popup, a request — is the page's, and so are the
words for each state (`jira.status`, `jira.actionLabel`).

## Tokens

None of its own: `Field`, `Input` and `Button` `sm`, on a `surface.elevated` card (`radius.md`, `space.16`), the fields 32rem wide as Figma's 512. The
Jira note ("Auto populated after Jira connection") is `Field`'s helper under the field; Figma sets it on the label's line, right-aligned.

## Accessibility

- A real `<form>`; every field has a visible label; an error sits under its field, is announced (`aria-invalid`, `role="alert"`) and takes focus.
- `autocomplete` is `name` and `email`, so a browser can fill them.
- The Jira Account ID is disabled, so it is skipped by the keyboard but read by a screen reader with its helper.

## Don't

- **Don't save inside it.** It hands the draft to `onSave`.
- **Don't connect inside it.** The card reports a press; the page connects.
- **Don't decide here which domains get Jira.** Pass `jira` or don't.

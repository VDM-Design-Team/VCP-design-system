---
bump: minor
---
### `PersonalInfoForm` and `ConnectionCard` — the Personal Info tab of Settings (November 2026)

New component **`ConnectionCard`**, built to Figma's `_Personal_Info_Item_Jira_Connect`: a brand logo tile, the service's name, a one-line status and one action button. Generic on purpose — the status, the button's words and what the press does are the caller's, so "Not connected / Connect", "Connected as … / Disconnect" and "Connecting…" are all the same card. It only reports the press.

New pattern **`PersonalInfoForm`**, built to Figma's `Settings_Personal_Info`: Name and Email with Save, and — when given `jira` — a Jira Account ID and a `ConnectionCard` to link the account (the Development domain's extra). It saves and connects nothing itself.

- **The draft follows `initial` until the person edits a field**, so a profile that loads late still fills the form, and typing is never overwritten. `onSave` gets the whole draft.
- **Name and Email are required**; Save says what is wrong under the field and moves focus to it. Name's words are Figma's ("Name is required"); Email's are `UserAccountModal`'s. `errors` carries what only the server knows.
- **`emailReadOnly`** is an email the person cannot change here (a single sign-on's, or an admin's): read-only rather than disabled, so it can still be reached, selected and copied.
- **The Jira Account ID is filled in by the connection only**: greyed with its note before the link, a plain read-only field after. It is never typed and has no placeholder.
- `saving` spins Save and locks the fields.

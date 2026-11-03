---
bump: minor
---
### `PersonalInfoForm` — the Personal Info tab of Settings (November 2026)

New pattern, built to Figma's `Settings_Personal_Info`: Name and Email with Save, and — when given `jira` — a read-only Jira Account ID and a `ConnectionCard` to link the account (the Development domain's extra). It keeps its own draft and hands it to `onSave`; Name and Email are required and Save says what is wrong and moves focus; `errors` carries what only the server knows; `saving` spins Save and locks the fields; `emailDisabled` is Figma's disabled Email. The error words are Figma's ("Name is required"). It saves and connects nothing itself.

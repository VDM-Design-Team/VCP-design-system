---
bump: minor
---
### `AddManualModal` — the dialog behind Add Manual (November 2026)

New pattern **`AddManualModal`**: what Settings › Manuals' **Add Manual** opens. Figma draws the button and not the dialog; decided 10 Nov 2026, it asks for **a name and one or more files**, picked with the shared `Attachments`. Submit checks both ("Give the manual a name.", "Add at least one file.") and hands over `{ name, files }`; the page uploads them, with `submitting` and `errors` for what only the server knows. Each opening starts empty.

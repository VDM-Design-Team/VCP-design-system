# AnnouncementModal *(pattern)*

Writes an announcement, or edits one, from the Announcements tab. Built to Figma's "Create Announcement" dialog.

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Icon` | atom |
| `IconButton` | atom |
| `Input` | atom |
| `Select` | atom |
| `Textarea` | atom |
| `Field` | component |
| `Modal` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `AnnouncementModal` | Creating or editing an announcement |
| `Modal` | Any other dialog |
| `AnnouncementsTable` | What opens it (**New Announcement**, a row's **Edit**) |

## Two modes

| | `mode="new"` | `mode="edit"` |
|---|---|---|
| Title | "Create Announcement" | "Edit Announcement" |
| Button | **Create** | **Save** |
| Fields | Empty, one blank feature line | Filled from `initial` |

## The fields

| Field | Notes |
|---|---|
| **Title** * | Required |
| **Version** * | Required, semantic versioning ("v1.0.0"; the "v" is optional). `latestVersion` shows under it: "Latest version: v1.18.1" |
| **Description** | A multi-line `Textarea` |
| **Changelog Document URL** | Optional; when given it must be an `http(s)` address |
| **Announcement Type** * | A list the page passes in (`typeOptions`) |
| **Features** | One line each, a delete beside each, **Add Features** beneath. Blank lines are dropped on submit |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` / `onClose` | `boolean` / `() => void` | required | You own `open`; Escape and Cancel ask to close |
| `mode` | `new \| edit` | `new` | |
| `initial` | `Partial<AnnouncementDraft>` | — | The starting values. The dialog keeps its own draft |
| `latestVersion` | `string` | — | Shown under Version |
| `typeOptions` | `Array<string \| { value, label }>` | required | **The page passes these in**: the types are the product's |
| `onSubmit` | `(draft) => void` | required | Valid, it gets the whole draft (trimmed). Saves nothing itself |
| `submitting` | `boolean` | — | The button spins and every field locks |
| `errors` | `Partial<Record<'title' \| 'version' \| 'description' \| 'changelogUrl' \| 'type', string>>` | — | What only the server knows |

## The draft

Reset each time it opens, from `initial`. Create hands the whole draft to `onSubmit`; the page closes the dialog and shows a toast.
A missing Title, Version or Type, a non-semantic version, or a URL that is not `http(s)` is said under the field and focus goes to the first;
nothing is submitted. **Figma draws none of these messages; the words are ours.**

## Features

**Add Features** adds a line and focuses it. Removing a line moves focus to the next one, else the one before, else **Add Features** —
focus never falls to the page. Each input is named "Feature 1", "Feature 2"…; each delete "Remove feature 1"…

## Tokens

`Modal` (`md`); fields as `Field`; the Latest version text is `text.link.default` (the blue that clears 4.5:1 as small text in both themes); the delete glyphs are `accent.critical.outline.content` (the
plain `IconButton`, as `AccountsTable`'s delete). **Add Features** is the `secondary` `Button` with a plus.

**Differences from Figma, on purpose.** Figma centres the title and draws no ✕; this is `Modal`'s own header (left title, ✕). The placeholder
"Use semantic versioning…" is kept, and the rule is also said in the error. The footer is **Cancel** (`secondary`) beside **Create** / **Save** (`primary`); Figma draws Cancel as plain text.

## Accessibility

- A `dialog` named by its title; focus is trapped, Escape closes, focus returns to what opened it (`Modal`'s).
- Required fields carry the required marker and "(required)" for screen readers (`Field`'s).
- Errors sit under their field and are announced; focus goes to the first.
- The trash buttons are named for their line; the inputs have names too.

## Don't

- **Don't close it on submit inside the dialog.** The page owns `open`: close it, then toast.
- **Don't hard-code the types.** Pass `typeOptions`.
- **Don't validate the version on the server only.** The dialog checks the format first; the server still decides if it already exists.

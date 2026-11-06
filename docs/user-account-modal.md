# UserAccountModal *(pattern)*

Adds a user, or edits one, from the Accounts page. Built to Figma's `Accounts_Page_User_Modal` (`Type=Existing User` — "Edit User" — and
the empty "Add New User").

## Composed of

| Piece | Tier |
|---|---|
| `Avatar` | atom |
| `Button` | atom |
| `Divider` | atom |
| `Input` | atom |
| `Select` | atom |
| `Stepper` | atom |
| `DomainAccessTable` | component |
| `Field` | component |
| `Modal` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `UserAccountModal` | Adding or editing a user's account and their per-domain access |
| `Modal` | Any other dialog |

## Two modes

| | `mode="new"` (Add New User) | `mode="edit"` (Edit User) |
|---|---|---|
| Title | "User" | The user's name |
| Fields | Empty | Filled from `initial` |
| Capacity Points | Not shown | Shown, with its own **Save** |

Both share the body: a photo with **Upload**, **Status**, **Name**, **Email**, **Proficiency**, the "Domain Access & Admin Rights" table and
**Submit**.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` / `onClose` | `boolean` / `() => void` | required | You own `open`; the dialog asks to close on Escape and the ✕ |
| `mode` | `new \| edit` | `new` | |
| `initial` | `{ status, name, email, proficiency, capacityPoints, avatarSrc }` | — | The starting values. The dialog keeps its own draft |
| `domains` | `DomainAccessRow[]` | required | The domains and what the user can do in each |
| `statusOptions` / `proficiencyOptions` | `Array<string \| { value, label }>` | required | **The page passes these in**: what they are is the product's |
| `onSubmit` | `(draft) => void` | required | Valid, it gets the whole draft — the fields (trimmed) and every domain's access. Saves nothing itself |
| `onSaveCapacity` | `(points: number \| null) => void` | — | Edit only: the Save beside Capacity Points, which saves **the points alone** |
| `onUploadAvatar` | `(file: File) => void` | — | A photo was chosen |
| `submitting` | `boolean` | — | The button spins and every field locks |
| `errors` | `Partial<Record<'status' \| 'name' \| 'email' \| 'proficiency', string>>` | — | What only the server knows, shown under the field |
| `title` | `string` | name / "User" | |

## The draft

The dialog **keeps its own draft and resets it every time it opens**, from `initial` and `domains`: close it, reopen it, and nothing typed last time
survives. (A new `initial` object on a re-render does not wipe what is being typed — the reset is on opening only.)

**Validation.** Name and Email are required, and Email must look like one. Submit then says what is wrong under the field, moves focus to the
first problem, and does not call `onSubmit`; fixing a field clears what was said about it. Status and Proficiency are not required here.
Anything only the server can know ("already in use") comes in through `errors`.

## Upload

**Upload** opens the browser's file picker (images only) and hands the chosen `File` to `onUploadAvatar`; the image shows in the dialog at once.
There is **no crop or edit**, and **no way to remove a photo** yet — both are open questions for design. With no photo and no name the avatar is
the blank silhouette.

## Capacity Points

Edit only. A `Stepper` with its own **Save** beside it and the line "Points allocated for this user in the current domain." Figma draws the
points as saving **apart from Submit**, so `onSaveCapacity` is a separate call; why they are separate is a question for design.

## Tokens

None of its own: the fields are `Input`, `Select` and `Stepper`; the section heading is `body-lg-medium` in `text.primary` (20.17:1 light /
14.63:1 dark); the helper is `caption-md-regular` in `text.tertiary` (7.58:1 / 9.85:1). The dialog is `Modal` at its `lg` size (Figma's 628).

The two selects are `emphasis="regular"`, like the inputs beside them: Figma draws all four fields regular.

**Differences from Figma, on purpose.** The photo is 48 (the system's largest avatar is 36, stretched here); Capacity Points' Stepper and Save are
both 40 high (Figma's Save is a 36 small button).

## Accessibility

- `Modal`'s: a named dialog (the title), focus trapped and returned, Escape closes.
- Every field has a visible label; an error sits under its field and is announced (`aria-invalid`, `role="alert"`).
- **Upload** is named "Upload profile photo" (it contains its visible word); the file input behind it is hidden from assistive tech.
- The access table's boxes are named for their row and column ("Design access").

## Don't

- **Don't fetch or save inside it.** It hands the draft to `onSubmit` and the points to `onSaveCapacity`.
- **Don't hard-code the status or proficiency lists in the page's markup** — pass them in, so the product can change them.
- **Don't encode access rules here.** The table applies none; the page decides what a combination of ticks means.

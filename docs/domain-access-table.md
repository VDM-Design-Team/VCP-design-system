# DomainAccessTable

Which domains a user can get into, and whether they are an admin there: a row per domain, a checkbox for **Access** and one for
**Admin**, and the **Role** the two add up to. Built to Figma's `_Accounts_User_Modal_Domain_Access_Table` (the "Domain Access &
Admin Rights" section of the Accounts page's user modal).

## Composed of

| Piece | Tier |
|---|---|
| `Checkbox` | atom |
| `Tag` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DomainAccessTable` | Setting a user's per-domain access and admin rights |
| `DataTable` | A table of records to read, sort and page |
| `Checkbox` | A single yes/no |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `rows` | `DomainAccessRow[]` | required | `id`, `domain`, `access`, `admin` |
| `onAccessChange` | `(id, access: boolean) => void` | — | A tick of the Access box |
| `onAdminChange` | `(id, admin: boolean) => void` | — | A tick of the Admin box |
| `disabled` | `boolean` | — | Locks every box — while a save is in flight |
| `caption` | `string` | `Domain access and admin rights` | The table's accessible name |

It is **controlled and saves nothing**: the rows are the caller's, and a tick is only reported.

## The two boxes are independent

**Both are always available, in any combination.** This table applies no rule between them: an admin without access is the
caller's to allow or refuse. (Whether the system should allow it is a design question — raise it with design.)

## Role is derived, once

`domainRole` is the one place two ticks become a role:

| Access | Admin | Role | Tag |
|---|---|---|---|
| | | **No Access** | neutral |
| ✓ | | **User** | green |
| any | ✓ | **Admin** | green (a placeholder, see below) |

Admin wins over User. The role is a `Tag`, so it is words as well as a colour.

**Admin's colour is a placeholder.** Figma draws only User (green) and No Access (grey); Admin is green too until design says
otherwise.

## Tokens

The table is `Checkbox`es and `Tag`s on the page's surface: header cells `body-sm-semibold`, domain names `body-sm-regular`, both
`text.primary` (20.17:1 light / 14.63:1 dark); rows divided by `stroke.default`. The role `Tag` is `sm` (24 high, 12 type), `success` or
`neutral` tonal. No new tokens.

## Accessibility

- A real `<table>`, named by `caption`, with column headers (`scope="col"`) and each domain a row header (`scope="row"`).
- Each box is named for its row and column — "Design access", "Design admin" — so six identical "Access" boxes never meet a screen
  reader. Each `Checkbox` keeps its own 40 target.
- Role is text ("User", "Admin", "No Access"), never colour alone.

## Don't

- **Don't derive the role at the call site.** `domainRole` is the rule.
- **Don't encode access rules in it** (admin needs access, and so on): it applies none. The page decides.

# AccountStatusTag *(component)*

A user account's status as a tag: **Approved** (green), **Pending** (yellow) or **Inactive** (grey). A `Tag` plus the status mapping.

**It is the one owner of account statuses**: which there are, what each is called and which colour it wears (decided with design, 6 Nov 2026).
It is to accounts what `StatusTag` is to Added Values.

## Composed of

| Piece | Tier |
|---|---|
| `Tag` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `AccountStatusTag` | A user account's status: the Users table, anywhere an account is listed |
| `ACCOUNT_STATUS_OPTIONS` | The Status list in the user dialog (`UserAccountModal`'s `statusOptions`) |
| `StatusTag` | An Added Value's status |
| `Tag` / `Badge` | Generic classification with no VCP meaning |

## The statuses

| `status` | Reads | Colour |
|---|---|---|
| `approved` | Approved | green (`success`) |
| `pending` | Pending | yellow (`warning`) |
| `inactive` | Inactive | grey (`neutral`) |

**There is no red account status.** An account that is switched off is Inactive.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `status` | `AccountStatus \| string` | required | Matched whatever its case ("Approved", "approved"). One that is not known reads as given, in grey |
| `size` | `Tag`'s | `sm` | As the Users table draws it |
| `className`, `ref`, rest | | | On the `<span>` |

Also exported: `ACCOUNT_STATUSES` (the three, in order), `ACCOUNT_STATUS_OPTIONS` (`{ value, label }` for a select) and `accountStatusLabel(status)`.

## Tokens

`Tag`'s own, by tone: `accent.success.*`, `accent.warning.*` and `neutral.*`. No new tokens. Dark comes for free.

## Accessibility

- Plain text in a `<span>`: it takes no focus and fires no events.
- The status is written out in the tag, never colour alone.

## Don't

- **Don't pick an account status's colour at a call site.** Pass the status; the mapping lives here.
- **Don't add a red status.** Decided with design: Approved, Pending and Inactive only.
- **Don't write the Status list by hand in a page.** Use `ACCOUNT_STATUS_OPTIONS`, so the dialog and the table agree.
- **Don't use it for an Added Value.** That is `StatusTag`.

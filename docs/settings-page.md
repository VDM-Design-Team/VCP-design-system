# SettingsPage *(pattern)*

The main content of the Settings page: the page title, a row of tabs, and the tab that is showing. It goes inside `AppShell`, which draws the
sidebar, the top bar and the footer; this is what sits between them.

Built to Figma's Settings pages (`Page_Template` → `Main Section`, user `80:3962` and admin `806:102049` in Pages & Flows).

## Composed of

| Piece | Tier |
|---|---|
| `PageTitle` | component |
| `Tabs` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `SettingsPage` | The Settings page, for a user or an admin |
| `Tabs` on its own | Sibling sections of one record, under a heading that is not Settings |
| `PageTitle` on its own | A page with no tabs |

## One layout, two tab lists

The user's and the admin's Settings are the same page with different tabs, so one piece draws both and **`audience`** picks which:

| `audience` | Tabs, in order |
|---|---|
| `user` (default) | Personal Info · Password · Changelog |
| `admin` | Personal Info · Users · Admin Panel · Announcements · Manuals · Password |

`SETTINGS_TABS` exports both lists. Changing `audience` on a mounted page swaps the bar; if the tab that was showing is not the new audience's
(the admin's Users, after the page becomes the user's), the first tab shows instead of nothing. The `SwitchAudience` story flips between the two.

## Controlled and slot-based

It owns the title, the tab bar, which tab is showing and the ids that tie each tab to its panel. It fetches nothing and holds no data: the page
passes each tab's body in `panels`, keyed by tab.

```tsx
<SettingsPage
  audience={isAdmin ? 'admin' : 'user'}
  backHref="/dashboard"
  backLabel="Back to the dashboard"
  panels={{
    'personal-info': <PersonalInfoForm initial={profile} onSave={saveProfile} />,
    password: <ChangePasswordForm onSubmit={changePassword} />,
    users: <UsersTable rows={users} … />,
  }}
/>
```

**A tab shows only when the page gives it a panel**, in the audience's own order. A page that has not built Announcements leaves it out, and the bar
never shows a tab that opens nothing.

The bodies draw their own cards (`PersonalInfoForm`, `ChangePasswordForm`, `UsersTable`, `ManualsTable`), so `SettingsPage` draws none. It gives them
the content area: 32 in from the sides (as `PageTitle`) and 24 below the tabs.

## The Development domain's Jira card

For a domain that works in Jira, Personal Info also shows a **Jira Account ID** and a card to link the account (Figma's "Dev" variant). That belongs to the
body, not to this page: pass `jira` to `PersonalInfoForm` in the `personal-info` panel, and the tab grows the section. `SettingsPage` does not know which
domains have it, and nothing in its layout changes. See the `DevelopmentDomain` story and `docs/personal-info-form.md`.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `audience` | `'user' \| 'admin'` | `user` | Picks the tab list |
| `panels` | `Partial<Record<SettingsTabKey, ReactNode>>` | required | The body of each tab. No panel, no tab |
| `tab` | `SettingsTabKey` | — | Controlled: the tab that is showing |
| `defaultTab` | `SettingsTabKey` | first tab | Uncontrolled starting tab |
| `onTabChange` | `(tab) => void` | — | A tab was picked, by click or arrow key |
| `title` | `ReactNode` | `Settings` | The page's `h1` |
| `backHref` / `onBack` | `string` / `() => void` | — | The back arrow, as a link or as history. Neither: no arrow |
| `backLabel` | `string` | `Back` | Say where it goes |
| `actions` | `ReactNode` | — | On the right of the title |

`SettingsTabKey` is `personal-info`, `password`, `changelog`, `users`, `admin-panel`, `announcements` or `manuals`.

## Differences from Figma, on purpose

- The admin's frame has the placeholder title "Page Title"; both audiences say **Settings**, as the user's frame does, with the back arrow.
- Figma insets the user's content 24 and the admin's 32 from the sidebar. Both use **32**, which is what `PageTitle` above it uses, so the title, the tabs and the card line up.
- The admin has no Changelog tab; the Announcements tab carries it (View Changelog).

## Accessibility

- The tabs are one tab stop; arrow keys move between them (`Tabs`). Every tab points at a real panel (`aria-controls`), and each panel is named by its tab. Inactive panels are `hidden` and empty; only the showing tab's body is mounted.
- The page has one `h1`, from `PageTitle`.
- A tab panel is focusable, so a keyboard user can scroll its body; its focus ring is the system's. Checked with the keyboard.
- The back arrow is a link when it can be (`backHref`), named for where it goes.

## Don't

- Don't draw a card around the panels: the bodies bring their own, and two cards stack their padding.
- Don't pass every tab's data to `panels` just to hide it. Leave a tab out and it leaves the bar.
- Don't re-derive which tabs an audience has at the call site; read `SETTINGS_TABS`.
- Don't put the footer, sidebar or top bar in here; they are `AppShell`'s.

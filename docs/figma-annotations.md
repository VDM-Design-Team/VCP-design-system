# Figma annotations — AV Page Details Card

Harvested 2026-09-01 from the [VCP Design Library, "AV Page Details Card" page](https://www.figma.com/design/k0XgoZM8Q23EP4489CqwIc/VCP-Design-Library?node-id=2960-9969).
These are the designer annotation pins attached to components in Figma. The components
they describe are **VCP patterns** — they carry domain vocabulary (roles, domains, the
Added Value lifecycle), so when they are built they belong in `src/patterns/`, and each
note below belongs in that pattern's Storybook description and `docs/<name>.md`.

Every annotation is quoted verbatim; nothing here is invented.

## AV Options dropdown

[`AV_Options_Dropdown` → Admin (Draft) variant](https://www.figma.com/design/k0XgoZM8Q23EP4489CqwIc/VCP-Design-Library?node-id=7769-93058)

> Admin's Options
>
> Exception: During Draft, Initiators (regardless of role) have access to Backlog

The menu's options depend on both role and AV status (User/Admin × Default, Draft,
Pending, Backlog) — the annotation records the one exception to the role rule.

## Start Date (Dev)

[`_Detail_Card_Item_Start_Date_Dev` → editing state](https://www.figma.com/design/k0XgoZM8Q23EP4489CqwIc/VCP-Design-Library?node-id=5587-26469)

> Only available for Dev domain

The editable start-date field only appears for Added Values in the Development domain.

## UI Changes

[`_Detail_Card_Item_UI_Changes`](https://www.figma.com/design/k0XgoZM8Q23EP4489CqwIc/VCP-Design-Library?node-id=6762-11302)

- Annotation pin on the no-selection variant: **"Default"** — the unanswered state is
  the starting state; the user must actively choose.
- The info icon's tooltip carries the behavioural contract:

  > Where should this be initiated? Marking UI changes auto-selects Initiate in Design
  > domain (BESA) and opens a linked Added Value for design. see this guide.

- Banner copy per selection (UI copy, kept here because it encodes the same rule):
  - **New UI** — "Creates new screens or components. Initiate to Design Domain (BESA)
    is auto-selected."
  - **Modify** — "Changes in existing interface. Initiate to Design Domain (BESA) is
    auto-selected."
  - **No UI** — "This Added Value has no UI changes."

## Edit Viewers dropdown

[`_Detail_Card_Edit_Viewers_Dropdown` → Filled Search variant, on the viewers-count header](https://www.figma.com/design/k0XgoZM8Q23EP4489CqwIc/VCP-Design-Library?node-id=7441-85392)

> Order of the viewers is order they were added

## Observations that are not annotations

- **Naming drift:** the component named `Value_Points` renders the title
  **"Capacity Points"** — the Figma name and the visible label disagree; one of them
  should change.
- No other component on the page carries an annotation pin. The remaining component
  descriptions in the file are inherited Material 3 library boilerplate, not
  VCP-authored notes.

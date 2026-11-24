---
bump: major
---
### `AVHeader` is removed: an Added Value's page is `PageTitle` `size="sm"` (November 2026)

`AVHeader` and `PageTitle` drew the same band twice. Figma's `Page_Title` has a type for an Added Value's page (`Viewing AV Page Title`: the back arrow, the reference at 14 regular in `text.primary`, the status buttons and the ⋮ menu), and `AVHeader` was the older, separate `AV_Header` (inset 16 where the pages' `Page_Title` is inset 32). They are one component now: **`PageTitle` `size="sm"`** is that title (14 regular in `text.primary`, where `sm` used to be 14 medium in `text.secondary`: nothing passed it), with the status buttons and then the ⋮ menu in `actions`. `AVPage` builds it from its `header` prop, which keeps `AVHeader`'s fields (`title`, `type`, `backHref`, `onBack`, `backLabel`, `showStatusActions`, `role`, `status`, `step`, `chain`, `onTransition`, `actions`) and gains **`menu`**: the ⋮ menu's handlers (`DetailCardMenu`), drawn on the right of the status buttons when reading, with its contents decided by `role` and `status`.

Migration: `AVHeader` and `AVHeaderProps` no longer exist. Replace `<AVHeader title role status chain onTransition backHref|onBack backLabel />` with `<PageTitle size="sm" title backHref|onBack backLabel actions={<StatusProgression role status chain onTransition />} />` (and `type="new"` with `size="md"` and no actions). A page using `AVPage` changes nothing but the type name: `header: AVPageHeader` instead of `AVHeaderProps`, and passes `menu: { onEdit, onDelete, … }` to get the ⋮ menu. The back arrow is `PageTitle`'s neutral grey, not `AVHeader`'s near-black with a blue hover.

`DetailCardMenu`'s button is now 36 (it was 32), the same height as the small status buttons it sits beside in the page title; a touch screen still gets 40.

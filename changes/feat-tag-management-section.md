---
bump: minor
---
### New `TagManagement` (pattern): the Admin Panel tab of Settings (November 2026)

The grid of Tag Management lists (Domains, Global Tags, Domain Tags, Roles, Status, Assignee Types, Projects) as `DomainCard`s, and the dialogs behind them: **Add New** opens "Add a new Tag" (or Domain), a row's pencil renames it, a row's bin asks before deleting. Built to Figma's `Tag_Management` and its three states.

The page passes the lists (which ones a person sees is the page's choice) and answers `onAdd`, `onRename`, `onDelete` and `onReorder`, which only ask. A callback may return a promise: the dialog's button spins, the dialog closes on success and **stays open if it rejects**. After a delete, focus goes to the card's Add New. A tag's delete uses the system's `ConfirmDeleteModal` with "Tag"; a domain's is `TagManagementModal`'s own. Composed of `DomainCard`, `TagManagementModal` and `ConfirmDeleteModal`.

On purpose, against Figma: it draws only the domain's delete question, so a tag's is the same confirmation worded for a tag; and the rename dialog (not drawn) is the add form, reused.

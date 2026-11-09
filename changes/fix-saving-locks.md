---
bump: minor
---
### Saving: a dialog can't close mid-save, and a loading button keeps focus (November 2026)

**`Modal` takes `busy`.** While it is set, nothing closes the dialog: Escape is used up, a backdrop click does nothing (and doesn't blur the focused button), and the ✕ and `ModalCancel` are disabled. It turns on by itself while the footer's `ModalConfirm` (or `actions.confirm`) is `loading`. `ConfirmDeleteModal`, `ConfirmDeleteAVModal`, `HandoffAVModal`, `ReportProblemModal`, `ReviewAVModal` and `TagManagementModal`, whose saving buttons are plain `Button`s, pass it themselves and lock their own Cancel. Before, Cancel locked but Escape, ✕ and the backdrop still closed a dialog halfway through a save. `busy={false}` opts out.

**`Button` and `IconButton` keep focus while `loading`.** A loading button is now `aria-disabled` rather than `disabled`. It looks the same and ignores presses (click, Enter, Space, and a form's implicit submit), but focus stays on it instead of dropping to the page. A button that is both `disabled` and `loading` is still `disabled`. Decided 6 Nov 2026 (#320).

Visible change: none at rest. While saving, Escape and backdrop clicks no longer close dialogs, and focus stays on the saving button. Code that checked a loading button's `disabled` property should check `aria-disabled` (or `aria-busy`).

---
bump: patch
---
### `Modal`: tabbing through a long form no longer scrolls the dialog itself (November 2026)

In a dialog whose body scrolls and holds checkboxes, radios or switches (their real inputs are hidden with `sr-only`, i.e. absolutely positioned), tabbing down to one that had scrolled out of view scrolled the **dialog panel** instead of the body: the footer (Submit) rode up to the top of the dialog and the form was cut off. The body is now the containing block for those inputs (`relative`), so they scroll with it and focus scrolls the body. A `TallBodyWithCheckboxes` story fails without the fix.

---
bump: minor
---
### `DetailCard` — assignee availability (November 2026)

In the Development domain the Assignee form can now check people against the AV's dates. Give a person in `options.people` an `availability` (`available`, `busy` or `unavailable`) and, when busy or unavailable, `until`; the form then uses `AssigneeSelectionDropdown`: an unknown-availability notice until a start date, due date or cycle is set, then people grouped Available, Busy and Unavailable. A busy person shows an amber warning and can still be added; an unavailable one shows a red error and cannot. Chips already added that turn busy or unavailable after a date change take an amber or red edge and a note under them naming the person, and still hug their content.

An initiated AV (one with `duplicates`) dims the Assignee **+** with a tooltip saying why; the new `lockAssignees` prop overrides that. Nothing changes for a card whose people carry no `availability`. Open question for `creativedesignlead`: whether Design should be checked too.

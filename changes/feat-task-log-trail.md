---
bump: minor
---
### `TaskLogTrail` — the Task Log Trail page's list (November 2026)

New pattern **`TaskLogTrail`**, built to Figma's `Task_Log_Trail`: ID, Task (at least 40 characters wide, wrapping to three lines before it is cut), Change ("In Progress → Design Review (Status)" with `StatusTag`s, or the **Initial Creation** / **Handoff** event tags, and the field in brackets: **Status** or **Workflow**), Source (`SourceTag`, the text inside it is the only thing that changes), Changed At and Changed By, with pagination; controlled, with loading and empty states. The filters above it are pieced together in the page from the system's own fields — there is no filters pattern.

`DateField` now treats an empty string as no date, as `undefined` is: opening the calendar on an empty field used to throw.

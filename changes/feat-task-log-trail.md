---
bump: minor
---
### `TaskLogTrail` — the Task Log Trail page's list (November 2026)

New pattern **`TaskLogTrail`**, built to Figma's `Task_Log_Trail`: ID, Task (**shown in full**: at least 40 characters wide, it wraps and nothing cuts it), Change ("In Progress → Design Review (Status)": **the new value is the coloured one** (a `StatusTag`, the owner of the status mapping) and **the old value is a quiet grey tag**, as `StatusHistory` draws it, with **Initial Creation** and **Handoff** standing in on the grey side when there was no value; the field in brackets is **Status, Workflow, Assignee, Start Date or Due Date**), Source (`SourceTag`, VCP only: the text inside it is the only thing that changes), Changed At and Changed By, with pagination; controlled, with loading and empty states. The filters above it are the system's **`FilterBar`** (search, the period, one **Reset**) with a select beside it for which field changed; there is no Source filter.

`DateField` now treats an empty string as no date, as `undefined` is: opening the calendar on an empty field used to throw.

**Changed At** takes an ISO date and time and shows it as "10/06/2026 14:37" (dd/mm/yyyy, or the person's locale's order, then 24-hour) through the system's one date-and-time formatter (`useDateFormat().dateTime`), in a `<time>`.

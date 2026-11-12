# Changelog

## 0.4.0 — 2026-11-12

### `DomainBudgetSummary`: a too-narrow card no longer widens the page (November 2026)

The card scrolls sideways when it is narrower than 512, but its visually hidden "of 90" text (`sr-only`, absolutely positioned) was not clipped by that scroll, so on a phone the whole page scrolled sideways by about 76px. The card is now the containing block (`relative`), which keeps the hidden text inside it. The `Narrow` stories of `DomainBudgetSummary` and `CyclePerformance` put the card in a fixed 560 / 384 wide box; those boxes now give way on a screen narrower than that (`max-w-full`), so the stories no longer scroll the page.

### `TableEmpty` — one empty-table look, and `DataTable` uses it (November 2026)

New **`TableEmpty`**: what every table says when it has no rows. A table passes its plural `noun` and its `icon`; the words ("No accounts yet.", "No accounts match “zzz”."), the magnifying-glass icon when filtered, a hint and **Reset** (`onReset`) come from here, so tables cannot drift apart. A table whose Figma draws other words can pass `title`. **Reset** is optional: without `onReset` it is not drawn.

`EmptyState`'s text sits closer: 4 between the title and its line (was 10), and the icon tile and the action stand 16 off the text.

`DataTable` shows a generic `TableEmpty` ("Nothing here yet.", with the icon tile) when a page sets no `empty`, instead of bare text. `AccountsTable`, `UsersTable`, `ContactsTable`, `ManualsTable` and `HolidayTable` use it: their wording is unchanged, `HolidayTable` gains the icon tile and a hint under its filtered message, and `ManualsTable` and `HolidayTable` keep Figma's words through `title`.

### `DueDateTag` and `AVTable` — due dates read dd/mm/yyyy (November 2026)

A due date in the Added Value table could read "October 1, 2025" while every other date read 01/10/2025, because the tag took ready-made text and each page formatted its own.

- **`DueDateTag` takes `date`** (ISO `yyyy-mm-dd`) and shows it through the system's one formatter: dd/mm/yyyy, or the person's locale (`DateFormatProvider`), inside a `<time>`. `children` is still accepted for text that is not a date ("-").
- **`AVTable` rows take `due.date`** (ISO). `due.label` still works, for text that is not a date.
- `DetailCard` and `MultipartRow` pass the date the same way; they read as before.

Callers that pass a formatted date as `children` or `due.label` keep working, but should switch to `date`.

### `AddManualModal` — the dialog behind Add Manual (November 2026)

New pattern **`AddManualModal`**: what Settings › Manuals' **Add Manual** opens. Figma draws the button and not the dialog; decided 10 Nov 2026, it asks for **a name and one or more files**, picked with the shared `Attachments`. Submit checks both ("Give the manual a name.", "Add at least one file.") and hands over `{ name, files }`; the page uploads them, with `submitting` and `errors` for what only the server knows. Each opening starts empty.

### `NotificationItem` — `discarded`: the Added Value was thrown away (November 2026)

A fourteenth kind, "**John discarded** *Title*." For an Added Value that was discarded (AV · 02): the notification someone already had stays, says it was discarded, and no longer opens it. The component makes sure of that last part: a `discarded` row is never a link or a button, whatever `href` or `onSelect` it is given. Decided 10 Nov 2026.

### `Button` — `danger-tertiary`: a destructive answer as red text (November 2026)

A new variant for a destructive action that sits quietly beside others, as Figma's AV edit page draws Discard beside Save as Draft and Submit: red text (`accent.critical.outline.content`, the hover step at rest, as Figma has it), no fill. It asks first, like `danger`.

### Holiday Registry: `HolidayModal`, `HolidayTypeTag`, and a range mode for `DateField` (November 2026)

New **`HolidayModal`** (Figma's `Holiday_Registry_Modal`): add or edit a holiday — name, Recurring Yearly (a switch with an ⓘ), a period picked on a two-month calendar and applied, and the type — checked when Add or Save is pressed. New **`HolidayTypeTag`**: Public (globe), Team (group), Individual (person).

`DateField` gains `mode="range"` (with `rangeEnd` and `onRangeChange`; its days read as every date does, so there is no `formatDate` prop): two clicks on a two-month calendar, then **Apply** or **Clear**; nothing reaches the page until Apply. `DatePicker` gains `onApply` / `applyLabel`: a primary Apply beside Clear.

**Table and row:** new **`HolidayTable`** (Figma's `_Holiday_Registry_Table` and `Holiday_Registry_Row`): the filter row (type, period, applies to) with Add Holiday and Import from Hubstaff for an admin, the rows (name with its Hubstaff-duplicate flag, date with its day count, type, applies to, all day, recurring, added by, source, and edit / delete for an admin), the empty state and the pagination. New **`HolidaySourceBadge`** (Manual Entry, Google Calendar, In Hubstaff). The Period filter is the existing `DateField` in month mode with the sprints passed in as `presets`: `DateField` gains `onClear` (the picker's own Clear, for a filter) and, in month mode, reports a named period's start and end through `onRangeChange` and reads it after its month. `DatePicker` in month mode shows range presets (a named stretch beside the months); day mode still hides them.

`DataTable` columns gain `minWidth` (a floor in CSS length). `DatePicker`'s preset column is as wide as its longest name (it was a fixed 140), still centred.

**Review fixes (6 Nov).** The Date column carries the **status** too: given `today` (ISO), each row wears **Upcoming** (info), **Today** (success) or **Past** (neutral) beside the date and its day-count pill, as Figma's Date Status badge. The table has **two empty messages**: "No holidays have been added yet." and, when a filter is on and nothing matches, "No holidays match your filters." with a **Reset** (`onResetFilters`). Dates use `useDateFormat()` (a locale is respected). Edit and delete are 40 (the touch minimum), and the delete is the new **`IconButton` `critical-tonal`** variant (`accent.critical.tonal`, with its own hover, pressed and disabled), so nobody recolours it by hand. `HolidayModal`'s answer is `ModalConfirm` (so nothing closes the dialog while it saves), its form id is `useId`, and its ⓘ is `InfoHint`. A delete is confirmed with `ConfirmDeleteModal` until the "(Future)" dialog is designed (the `OnThePage` story does). `fix-field-error-border.md` is gone (released in 0.3.0).

**Review additions (10 Nov).** `HolidayModal` can now set what the table's two columns show. **All Day** is a switch, on to start; off, it asks **From** and **To** (both required; for a one-day holiday To must be after From), and turning it back on drops the times. **Applies to** follows the type: a Team holiday picks teams (new prop `teams`), an Individual one picks people (new prop `people`), and it is required; a Public holiday is everyone's and has no field; changing the type clears what was picked. `HolidayDraft` gains `appliesTo: string[]` (`[]` for Public), `allDay: boolean` and, when it is not all day, `from` and `to` as 24-hour "HH:mm". A failed Add or Save puts focus on the first field that failed, in the order they are drawn.

`HolidayTable`'s row buttons say whose holiday it is ("Edit Annual leave, Jordan Lee", "Delete Founders Day, Jordan Lee and 2 others"; a public holiday's name is enough), so two people's entries with the same name are told apart. Narrower than its columns (about 1120 of room), the table scrolls inside its own wrapper and the page does not. Pressing **Reset** moves focus to the first filter, since the button then goes.

**Fixed:** `DatePicker`'s **Clear** and **Apply** no longer submit a form the picker sits in; they are `type="button"`. In `HolidayModal` that submit re-checked the form before the date had landed, so "Select a date" and the red edge stayed after a date was applied; Clear in any `DateField` inside a form used to submit that form. In a `Field`, `DateField` now takes the label's `aria-labelledby` too, as every other control does, so it is named by its label and never by its placeholder.

### `FilterBar` — labelled fields in Figma's order, under the search (November 2026)

Decided 10 Nov 2026: every list's filters follow Figma's Manage table. The search sits at the left with Reset and Filters (now the filled button) at the right; the fields go under them, each with its label above, in Figma's order: Priority, Tags, Status, Date, then Cycle and the people. A filled people field holds just the name, since its label says which. The period field is labelled and named "Date" (Figma's word); `period.label` changes it.

Migration: nothing to change at call sites. A test that finds the period by the name "Period" now finds "Date"; a test that reads "Assignee: Amy Lee" in the field now reads "Amy Lee".

### `CycleSummary` — the Carried Over dot is amber, as Figma draws it (November 2026)

The dot beside Carried Over was brown; Figma draws it amber (yellow-500). It now takes `accent.yellow.medium`, the amber the budget card's bar uses. (Figma names the variable `accent/warning/outline/border`, but the system's token of that name is yellow-700 in light, nearly brown.) Decided 10 Nov 2026.

### `Attachments` — one piece for the cards, the drop area and the viewer (November 2026)

New component **`Attachments`**: a set of attached files as `FileAttachment` cards, the `Dropzone` and the `AttachmentViewer`, together. The attachments dialog, the handoff forms and the deliverables card each assembled these by hand, with their own copies of the glyph and object-URL logic. It holds no files (`items` in, `onFiles`, `onRemove` and `onDownload` out) and **never drops focus**: a removed card's ✕ goes with it, so focus moves to the next card's ✕, else the previous one's, else the drop area.

New `lib/attachment-files`: **`fileKind(file)`** picks a card's glyph by type and, when the browser gives none (it often does not, for a `.csv` or `.docx`), by extension; **`useAttachmentFiles()`** keeps the files just picked as cards, makes an image's address when it is picked and lets it go when its card goes, so a card never shows the previous file's picture.

`DeliverablesCard` now uses it. No props change.

### `SearchSelect` — a ✕ to clear one pick; `FilterBar`'s people fields have it (November 2026)

A one-pick `SearchSelect` can be `clearable`: with a value, a ✕ before the caret empties the field and gives focus back to it, as Figma's Manage filters draw it ("Filter by Assignee and Clear"). `FilterBar` turns it on for its one-person fields (Assignee, Initiator), so a filter by person can be undone without Reset Filters.

### `AVTable` — the Items select and the "1-50 of 1,250" range (November 2026)

`AVTable` passes `itemCount`, `pageSize`, `pageSizeOptions` and `onPageSizeChange` to its `Pagination`, so a list can draw Figma's full pagination (Manage): how many items a page shows, and which of them you're looking at. Leave them out and it is the Small version, as before.

### `AvatarGroup` — a person's domain in the tooltip (November 2026)

A person in the stack can carry a `domain`. With it, the hover tooltip and the stack's label read as Figma's Manage table draws them, "Jack Morgan (Development) — Assignee", and the `+N` chip lists the people it hides one to a line. Without a domain nothing changes ("Ali Rahman (Assignee)").

### One date-and-time formatter: "10/06/2026 14:37" (November 2026)

`src/lib/format-date.ts` gains `formatDateTime` and `formatTime` (exported from the package) and `useDateFormat()` gains `dateTime(iso)` and `time(iso)`: anything that shows a time now has one way to write it, the date as every date reads (dd/mm/yyyy, or the person's locale's order) and then a **24-hour** time, whatever the locale. An ISO date-time with **no zone** reads as written and is never converted; one **with a zone** is an instant, shown in the provider's `timeZone` (new on `DateFormatProvider`) or the person's own; a date with no time is just the date; anything else comes back as given. Nothing existing changes: `format`, `range` and `placeholder` read as before.

### `SearchSelect` is 32 / 36 / 40 tall, as `Select` (November 2026)

The trigger inside the field was 24 / 26 / 32 high with 4 of padding and a 1 border either side, so `sm` measured 34 and `md` 42 (only `compact` was right, at 36). The trigger is now 22 / 26 / 30, so the field is exactly 32 / 36 / 40, level with `Select` and `Input` beside it. A field with tags still grows past its minimum.

### Five dashboard cards draw their header with `CardHeader` (November 2026)

`TeamCapacity`, `UserCapacity`, `CycleBurndown`, `CyclePerformance` and `ValueCards` each hand-drew the card's head (the `h2`, the ⓘ and the filters). They now use `CardHeader`, the one version `InCaseYouMissedIt` and `DomainBudgetSummary` already use, so every card's title, 16 info icon (40 press area), truncation and wrapping filters read the same. No props change. Small differences that come with sharing one header: the filters sit 12 apart (was 8) and the title and filters wrap with the same gaps as the other cards; titles that were not truncating (`CyclePerformance`, `ValueCards`) now truncate with "…" when too long.

### One announcement record, and one owner for its type (November 2026)

New `Announcement` (`src/lib/announcement.ts`): `id`, `title`, `version` ("v1.18.1"), `kind`, `date` (ISO), `description?`, `changelogUrl?`, `features`. The Announcements table, overview, dialog and the System Changelog all take their fields from it, so a page passes one object to all of them and the names agree. It also exports `VERSION_PATTERN` and `formatVersion` ("1.18.1" and "V1.18.1" both become "v1.18.1").

`CHANGELOG_KINDS` (`src/lib/changelog-kinds.ts`), the one owner of an announcement kind's glyph, colour and words, now also holds each kind's **Type word** (Experimental, Update, Feature) and **tag tone** (success, warning, info, the glyph's own hue), and `CHANGELOG_KIND_ORDER` gives the order lists show them. The table's Type tag and the dialog's Type list read these instead of mapping types themselves.

**Renamed to match the record** (both shipped in the System Changelog, days ago): `ChangelogItem` and `ChangelogRelease` take `description` (was `message`) and `changelogUrl` (was `href`). `ChangelogRelease` is now derived from `Announcement`.

### `ValueCards` and `ChartLegend` — now in the package (November 2026)

Both shipped with stories and docs but weren't exported, so an app couldn't import them: `import { ValueCards, ChartLegend } from '@vdm-design-team/vcp-design-system'` now works. Nothing else changes.

### `Sidebar` — the domain switcher's list is as wide as the switcher (November 2026)

Opening the domain switcher at the top of the rail showed a list that ran across the whole screen. It now opens under the switcher at the switcher's own width, as the design draws it. Nothing to change at call sites.

### `MoveToBacklogModal` opens with the cursor in Feedback (November 2026)

The dialog opened with focus on itself, so the one field had to be reached with Tab. It now opens with the cursor in **Feedback**: type the reason and press Enter.

### `DomainBudgetSummary` — the super admin's note (November 2026)

A new prop, `note`: the super admin's note on the domain's budget for the quarter (what `BudgetTable`'s Optional Notes
holds), shown under the bar as "**Note:** …" (decided 9 Nov 2026: the admin sees it). `noteLabel` changes the word.

### `DomainBudgetSummary` / `BudgetTable` / `ProgressBar` — budget bars and copy as Figma draws them (November 2026)

Decided 10 Nov 2026: follow Figma's colours on each surface. Wording: a budget is per **quarter**, and "quarter" and
"cycle" (a planning fortnight) are different things, so the budget never says "cycle", even where Figma's tooltips do.

- **`BudgetTable`**: two fills only, as Figma's table draws: brand blue, or bright red when over budget. No amber at 75%.
- **`DomainBudgetSummary`**: Figma's fills: brand blue under 75%, its bright yellow (`accent.yellow.medium`) at 75–99%, its
  bright red at 100% and over.
- **`ProgressBar`** gains a tone, `alert` (`accent.critical.outline.border`, Figma's bright red): 3.09:1 on the light track,
  2.17:1 on the dark one, so only beside a written value.
- **Both tooltips** say **quarter** where they said "cycle": Allocated is "Total development points assigned for the
  selected quarter. Unused points do not roll over." and Remaining is "Remaining = Allocated - Consumed points for the
  quarter. Negative values indicate overspend." (Figma's say "cycle" there: a Figma wording fix.) Consumed is unchanged.

### `CardHeader` — one title for every dashboard card (November 2026)

New component: the head of a dashboard card, with its title (the card's `h2`), an optional info icon (`InfoHint`, 4 from the title) and an optional slot for controls on the right (a filter, a period picker) that wraps under the title in a narrow card. The cards had each drawn this by hand with slightly different gaps and heading wiring.

`InCaseYouMissedIt` and `DomainBudgetSummary` use it now (no visual change beyond aligning their spacing to the one version); the other cards adopt it as their PRs land: `TeamCapacity`, `UserCapacity` and `CycleBurndown`, `CyclePerformance` and `ValueCards`.

`DomainBudgetSummary`'s Go to Current Quarter button, quarter picker and year picker are one height, 36: the pickers were small (32) beside a small button (36), so its row had two heights. They use the `compact` (36) select size from the header-foundations change.

### `ValueCards` — the dashboard's status counts (November 2026)

New pattern, read off the Figma `Value_Cards`: a titled card holding a `StatCard` for each status, with an optional "whose" filter beside the title (Figma lists All, Initiated, Assigned and Team). Figma draws six (Completed, In Review, Overdue, In Progress, Pending, Draft), and the stories show those six: Completed `success`, In Review and In Progress `brand`, Overdue `critical`, Pending `yellow`, Draft `neutral`. Which statuses a role sees is the page's: pass the items, it does no counting.

It reflows with its card's own width (a container query): six cards are one row from 71rem (six 176 cards and five gaps of 16, a 1440 window less the 256 rail), then three by two, two by three and one column; four or fewer are four across, two by two, then one column. Loading shows placeholders, and with no items it says so.

### `Sidebar` / `Icon` — a super admin's Domain Budget (November 2026)

A super admin's rail gets **Domain Budget** (`domain-budget`), between Domains and Contact List, as Figma's super admin
rail draws it: where every domain's points for a quarter are set. Its glyph is new to the set: Phosphor's `wallet`
(and `wallet-fill`).

### `DashboardHeader` and `DashboardFilters` — the top of a dashboard (November 2026)

New patterns, read off the Figma dashboards (development admin, super admin).

`DashboardHeader`: the page's title, an optional Cycle / Quarter view switch beside it and the role's filters on its right, as one pattern. One header for every role: the switch is data (`views`, `view`, `onViewChange`) and the filters are a slot, so the role is what you put in. The stories compose the development admin (Cycle and Quarter), development user, super admin and design user headers; `docs/dashboard-header.md` has the role table.

`DashboardFilters`: the filters (data-driven: cycle, year, team; the cycle is searchable), then Reset ("Reset", as `FilterBar` calls it) and an Export button (one button, or a menu with `exportOptions`) together at the end, every control 36 high, the selects hugging their longest option.

The super admin's domain and month filters are exported as `SuperAdminFilters` (`size="compact"` is 36) so the header can hold them, and `SuperAdminMetrics` takes `filters={false}` to draw only its cards (its own filters, 40 high above the cards, remain the default).

Reset sits next to Export at the end of the row and reads "Reset" (Figma draws "Reset Filters" first in the row), to be consistent with `FilterBar`; the docs record it as a difference from the design.

### A 36 high `compact` size, and a `PageTitle` that holds a view switch and a row of filters (November 2026)

A page header with a view switch and a row of filters needs every control at one height. 36 is the height a small `Button` and a medium `SegmentedControl` already have, so `Select`, `Input`, `SearchSelect` and `DateField` gain `size="compact"` (36), between small (32) and medium (40); small and medium are unchanged. `DateField` also takes `edge`, as `Input` does.

`PageTitle` gains `beside` (a slot beside the title, for a view switch; the left group wraps so the switch drops under the title in a narrow page). Its `actions` slot now wraps, is capped to the band's width and shares a centre line with a one-line title (it sat 5 above the middle of 36 high controls); with a `subtitle` the actions stay at the top as before.

### `NotificationInbox` — rows grouped by day (November 2026)

A new prop, `groups`: the rows under a heading per day ("Today", "Yesterday", "3 November"), each day its own list named
by its heading, so a screen reader can move by day (decided 9 Nov 2026: the inbox groups by day, the popover stays a
flat list). `groupHeadingLevel` sets the headings' level (2 by default). An empty group is left out.

### `AvatarGroup`: no `+1`; the Added Value table shows at most three slots (November 2026)

The `+N` chip now only appears when it hides two or more people. When `max` would leave exactly one person out, that person is drawn instead of a `+1` (a chip that hides one person it could have shown in the same space). This applies to every `AvatarGroup`; a stack with one hidden person now shows one more face.

`AVTable`'s Members column uses `max={2}`, so a row has at most three slots: three members are all shown, four are two faces and a `+2` ("EC, AR, +2"). It showed up to three faces and then a chip.

### `TopBar` — the bell's place takes a `NotificationPopover` (November 2026)

A new prop, `notificationPopover`: pass a `NotificationPopover` and it takes the bell's place in the bar (it brings its
own bell as its trigger), so the bell opens the latest notifications. Without it, `notifications` and
`onNotifications` draw the plain bell as before.

### `NotificationItem` — "reacted to your comment" (November 2026)

A new `kind`, `reacted`: "**John reacted to your comment on** *Title*." The comment's author is told when someone
reacts to their comment or reply (decided 9 Nov 2026; not when they react to their own). Pass the comment as
`preview`, with its `reactions`, so the row shows what was reacted to.

Its "Who gets it" table also says who hears of a new comment: the initiator(s), assignee(s), anyone @mentioned, and
anyone who has commented on it before (decided 9 Nov 2026).

### `EmojiReactionPicker` — "+N" expands the row, three names in the tooltip, focus stays (November 2026)

- **"+N" is a button now** (decided 9 Nov 2026): it shows every pill in the row, and "Show less" folds them again.
  Named "Show N more reactions", with `aria-expanded`; the same button both ways, so focus stays on it.
- **Who reacted names up to three people, then "and N others"** ("You, Marvin Ode, Ali and 2 others"), Figma's copy.
  It named two before.
- **Focus no longer drops** when you take back the last reaction on a pill: it moves to the pill that took its place,
  or to Add reaction.

### `AvatarGroup` hover tooltips; the Added Value table's Members column uses them (November 2026)

`AvatarGroup` gains `tooltips`: each avatar says who it is when the pointer rests on it (the name, and the new optional `role` on a person: "Ali Rahman (Assignee)"), and the `+N` chip lists the people it hides, separated by commas. It is for the pointer only: the stack stays one labelled image with no extra tab stops, and its label now reads each person's role after the name ("Members: Ali Rahman (Assignee), Eve Chen and 2 others") so a keyboard or screen-reader user gets the same information. `AVTable`'s Members column turns `tooltips` on; give a member a `role` to show it. Without `tooltips` nothing changes.

### `Sidebar` — a user's rail has the Holiday Registry (November 2026)

Users read the Holiday Registry but have no Planning group, so their rail now has it as a top-level row, after
Task Log Trail, with the `calendar-dots` glyph. Its key is the Planning sub-row's, `planning/holiday-registry`,
so one page and one route serve every role. Figma's user rail drew the entry twice and no Planning group; this is
the resolved version (decided 9 Nov 2026).

### `PlanningTable` — move a row anywhere, and without dragging (November 2026)

Planning review: AVs need to move between Cycles and back to the Backlog, and by keyboard as well as by mouse.

- **`moves="anywhere"`**: any row drags onto any other section, another Cycle or the Backlog. The default,
  `to-cycle`, keeps today's behaviour (a Backlog row onto a Cycle).
- **`acceptsRows: false`** on a section takes no rows (a Cycle that has ended): no drop target, no menu choice.
- **`canMove(row, from)`** keeps a row where it is (no button, no drag), e.g. a Completed one.
- **A "Move … to…" button** on every movable row when `onMoveRow` is given: a menu of the sections the row may go to,
  calling `onMoveRow` as a drop does. It is the way to move a row without dragging (WCAG 2.5.7).
- **Focus follows the row**: after a move from its menu, focus goes to the row's button in its new section.

The table gains a narrow last column for the button when `onMoveRow` is given.

### `DetailCard` — read-only fields while editing (November 2026)

New `readOnly` prop (a list of fields). In the editing and new cards, those dropdowns and dates show their value but can't be opened or changed, using each control's disabled state. Figma's multipart part edit page (`1404:132644`) needs it: a part's Projects, AV Category, Type and Urgency come from its parent.

### `AcceptPendingAVModal` — naming the parts of a multipart value (November 2026)

New `parts` prop (`{ label, preview? }[]`, one per problem set). With multipart ticked, the dialog shows **Rename Individual parts**: each part's label, a **Preview** of its set and an optional title ("Enter a title, or leave blank for “Part (X/X) Parent Title”."), as Figma's "Accepting AV with Multipart + Custom Titles" (`1666:263661`) draws it. `onConfirm` now also hands back `titles` (one per part, trimmed, `''` for the default). Without `parts` the dialog is unchanged. With fewer than two parts, **Multipart Value** is disabled and says why ("It needs at least two problem sets to split.").

### Planning filters and the Gantt toolbar use the lighter filter edge (November 2026)

`PlanningFilters`' selects and the Gantt chart's toolbar filters (cycle, projects, users, view) now use `edge="neutral"`, the lighter resting edge `FilterBar` has had since the filter-edge change, so every row of filters reads the same. Fields in a form or dialog keep the full `stroke.strong` edge. This is the deliberate exception documented in `docs/filter-bar.md` (about 2.6:1 on white against the usual 3:1).

### Dates in the details card and every cycle read dd/mm/yyyy (November 2026)

Every date reads **dd/mm/yyyy** (decided 6 November), or the person's locale under `DateFormatProvider`. Two places still wrote dates in words:

- **`DetailCard`** wrote Start Date, Due Date, Deployment Date, Date Initiated and Date Accepted as "November 5, 2026". They now read "05/11/2026". Its cycle picker showed the raw ISO dates ("2025-09-20 - 2026-10-02"); it now reads like the tag.
- **Cycles** read "C18 (Sep 20, 2025 - Oct 02, 2026)" in `CycleTag`, `MoveAVToCycleModal`, `FilterBar`'s cycle field and `GanttChart`'s cycle picker. They now read "C18 (20/09/2025 - 02/10/2026)", all from one formatter: `formatDateRange` (new, in the date helpers) and `useDateFormat().range`. `formatCycleRange` stays and takes an optional locale.

### `StatusProgression` / `AVHeader` — Accept and Reject on a Backlog AV (November 2026)

An admin can now decide a backlogged Added Value from its page: `Backlog` offers the admin an outline **Reject** and **Accept**, as Figma's admin Backlog page draws them (`1094:97734`), the same pair `Review` uses. Other roles still get no moves on `Backlog`, and moving it back to Pending or Draft stays in `DetailCardMenu`. `avTransitions({ role: 'admin', status: 'Backlog' })` returns the two.

### `CycleBurndown` uses `InfoHint` (November 2026)

`CycleBurndown`'s title info icon is now `InfoHint` (a 16 glyph, 4 from the title, a 40 press area, the tooltip opening below), the same as the other cards, instead of a hand-made 20 button.

### Capacity cards use `InfoHint` (November 2026)

`TeamCapacity` and `UserCapacity` draw their title's info icon with `InfoHint` (a 16 glyph, 4 from the title, a 40 press area, the tooltip opening below), the same as `InCaseYouMissedIt`, instead of a hand-made 20 button.

### `InfoHint` — one info icon for every card (November 2026)

New component: the small "i" beside a card's title or a stat's label, with its explanation in a tooltip. A 16 glyph in `text.tertiary`, a real button named "About {label}", the `Tooltip` opening below it, and a **40 press area** around the glyph (a `::after`), so the touch minimum holds without a bigger icon.

It replaces the control `InCaseYouMissedIt`, `StatCard` and `DomainBudgetSummary` each drew by hand, in two sizes (16 beside a card title, 20 beside a label). One size is the precedent now: 16. Visible changes: `StatCard` and `DomainBudgetSummary`'s icons go from 20 to 16, and every hint's pointer target is 40 (it was 16 in `InCaseYouMissedIt` and `StatCard`). `InCaseYouMissedIt`'s hint is unchanged to look at.

### `edge` on `Input`, `Select` and `SearchSelect`; `FilterBar` uses the neutral edge (November 2026)

`Input`, `Select` and `SearchSelect` gain `edge`: `strong` (the default, `stroke.strong`, unchanged) or `neutral` (`neutral.outline.border.default`, lighter). `FilterBar`'s search, selects and period button use `neutral`, so a row of filters is quieter beside a table. It is about 2.6:1 on white, below the 3:1 every other field edge holds, so it is a deliberate exception documented in `docs/filter-bar.md`: the fields are also identified by their icons and placeholders, and error, warning and focus edges are unchanged.

### `TableCard` spacing and a rounded `bare` table (November 2026)

A `bare` table (inside a `TableCard`) draws no border or fill but now keeps `radius.md` (8) corners, so its header band and hovered rows are rounded rather than square against the card's padding.

`TableCard` padding is now 24 all round (was 16); so is the gap between its filters, table and pagination (was 16). Every table drawn in a `TableCard` gets the roomier card.

`MyValuesStats` padding is now 24 all round (was 16), to match the table card beside it on My Values.

### `CapacityBar` — 2 between segments (November 2026)

The segments of a `CapacityBar` (so `TeamCapacity` and `UserCapacity`) sit 2 apart, up from 1, the same gap as the bars in `BarChart`, so each segment reads as its own and not only as a change of colour. The segments still share the bar's width by value.

### Charts — formatters, choosing, a custom tooltip, legend toggles and keyboard reading (November 2026)

The options most chart libraries offer, on `BarChart` and `LineChart` (and passed through by `CyclePerformance`, `SprintMetrics` and `CycleBurndown`):
- **`formatValue(value, series)`** and **`formatTick(value)`**: how a number reads on a bar, in the tooltip, the table and the announcement, and on the value axis.
- **`onSelectDatum(datum, series?)`**: a group or point was chosen, by a click (with the series of the bar it landed on) or by Enter.
- **`renderTooltip({ datum, index, series })`**: replaces what the tooltip says, keeping the card and its position.
- **`toggleSeries`** (with `defaultHiddenSeries`, `onToggleSeries`): each legend entry becomes a button that shows or hides its series; the axis follows what is drawn, and the last visible series cannot be hidden.
- **Keyboard reading on the bar chart**, as the line chart has: one tab stop, the arrow keys move from group to group, Home and End jump, Escape clears, the tooltip follows and the group is announced.

New `ChartLegend` (the series key, with optional show/hide buttons: `aria-pressed`, a 40 press area) and the shared `useChartCursor` and `useHiddenSeries` in `src/lib/chart-scale.ts`. The names avoid the DOM's own (`onSelect`, `onToggle`, `hidden`).

### `LineChart` and `CycleBurndown` — line charts you can feed data (November 2026)

New, built to Figma's `Cycle_Burndown`, drawn in SVG with no chart library. `LineChart`: pass `data` (one entry per point: a `label` and a `values` map of series to numbers, `null` or missing to break a line) and `series`; the axis (0 up to a readable top), the lines, a dot at every point, the hover tooltip (a heading such as "Date: 06.20.2025" over each line's colour and value) and the legend follow. Points are evenly spaced in the order given, so a burndown over working days has no gap for the weekend. It redraws as its card narrows and thins its axis labels so none collide.

Lines differ by more than colour (Committed is dashed, Available dotted). The plot is one keyboard stop: the arrow keys read each point, with a tooltip and a polite announcement; the data is also in a visually hidden table. Loading and empty states.

`CycleBurndown` is the card: title with an optional hint, the chart with all four lines (Completed, Committed, Overdue, Available), a row of totals (`stats`: label, value, tone) and the legend at the bottom. No filters of its own: the page's global filters decide the `data`. The `FromAnApiResponse` story and `docs/cycle-burndown.md` show the whole mapping from a raw API response.

Differences from Figma, on purpose: line colours are the series tokens, lines are not all solid, the legend is at the bottom as on every chart, and the totals use token colours.

The axis text is 12, not Figma's 10: one readable size across a chart, with the hover card and legend.

### Saving: a dialog can't close mid-save, and a loading button keeps focus (November 2026)

**`Modal` takes `busy`.** While it is set, nothing closes the dialog: Escape is used up, a backdrop click does nothing (and doesn't blur the focused button), and the ✕ and `ModalCancel` are disabled. It turns on by itself while the footer's `ModalConfirm` (or `actions.confirm`) is `loading`. `ConfirmDeleteModal`, `ConfirmDeleteAVModal`, `HandoffAVModal`, `ReportProblemModal`, `ReviewAVModal` and `TagManagementModal`, whose saving buttons are plain `Button`s, pass it themselves and lock their own Cancel. Before, Cancel locked but Escape, ✕ and the backdrop still closed a dialog halfway through a save. `busy={false}` opts out.

**`Button` and `IconButton` keep focus while `loading`.** A loading button is now `aria-disabled` rather than `disabled`. It looks the same and ignores presses (click, Enter, Space, and a form's implicit submit), but focus stays on it instead of dropping to the page. A button that is both `disabled` and `loading` is still `disabled`. Decided 6 Nov 2026 (#320).

Visible change: none at rest. While saving, Escape and backdrop clicks no longer close dialogs, and focus stays on the saving button. Code that checked a loading button's `disabled` property should check `aria-disabled` (or `aria-busy`).

### `BarChart`, `CyclePerformance` and `SprintMetrics` — bar charts you can feed data (November 2026)

New, built to Figma's `Cycle_Performance` and `Sprint_Metrics`, and drawn in SVG with no chart library: pass `data` (a label and a values map per category) and `series`, and the axis (0 up to a readable top: 157 gives 175), the bars, the hover tooltip and the legend follow. They measure their own width and redraw as the card narrows: bars narrow, drop a number that will not fit, and category labels thin out so none overlap. Loading and empty states. The picture is hidden from assistive tech and the same numbers are in a visually hidden table.

`CyclePerformance` adds data-driven filters (`{ key, label, value, options, onChange }`, each a small `Select`); `SprintMetrics` is the number-over-bar, dashed-grid look with Capacity and Commitment as the system's Available and Committed series.

`CHART_SERIES` gains `svgFill`, `svgStroke` and `svgContent` for SVG shapes, and `src/lib/chart-scale.ts` (`niceTicks`, `useElementWidth`) is the shared axis arithmetic for the line chart that follows.

Differences from Figma, on purpose: fills are the series tokens (Figma's are not variables, with white numbers under 4.5:1) and Sprint Metrics' orange Overdue is the system's red.

Bars sit 2 apart within a group so each reads as its own. The legend is always under the chart (Sprint Metrics' Figma draws it above; the system keeps every legend at the bottom), so `BarChart`'s `legend` is `bottom` or `none`.

The text in the plot (axis numbers, category labels, the numbers on and over bars) is 12, not Figma's 10: one readable size across a chart, with the hover card and legend. A bar now needs about 24 to hold its number.

### `CapacityBar`, `TeamCapacity` and `UserCapacity` — how a team's capacity is spent (November 2026)

New, built to Figma's `Team_Capacity` and `User_Capacity` and driven by data: pass `segments` (a series and a value each) and the bar, the total and the legend follow; pass `members` and each person gets a row. They fill the width they are given, reflow with their card, and have loading and empty states.

New `src/lib/chart-series.ts` (`CHART_SERIES`, `CHART_SERIES_ORDER`, `seriesIn`, exported from the package): the five series every chart draws — Completed, Committed, Overdue, Available, Leave — and the one place that says what each looks like, so a legend, a bar and (soon) a line chart agree and "Overdue" is the same red everywhere. Each is a filled-surface token with its content colour, measured at 4.5:1 or more in both themes.

Differences from Figma, on purpose: the fills are tokens (Figma's are not variables, and white numbers on them fall short of 4.5:1), and every number is one colour per theme; Available is the brand blue and Committed the step darker (`surface.brand.stronger`), Leave is amber, and Overdue is red on every chart.

### `StatCard` — 4 between the label and the value (November 2026)

The default (Value_Card) card had no gap between its label and its value; it now has `space.4`, the same as the label-over-figure pairs in `CycleSummary` and `MyValuesStats`. The card is still exactly 100 high and its content still centred. The superadmin card and the group items (12) are unchanged.

### `ConfirmDeleteAVModal` — footer buttons are `ModalCancel` and `ModalConfirm` (November 2026)

As `ConfirmDeleteModal`: the dialog uses `Modal`'s `tone="critical"` and its footer, with `ModalCancel` (grey) and `ModalConfirm` (red) instead of two plain `Button`s in the body. Same behaviour; the buttons sit in the system footer, 12 apart (were 16).

### `ConfirmDeleteModal` — footer buttons are `ModalCancel` and `ModalConfirm` (November 2026)

The dialog now uses `Modal`'s `tone="critical"` and its footer, with `ModalCancel` (grey) and `ModalConfirm` (red) instead of two plain `Button`s inside the body. Same dialog, same behaviour (alertdialog, no ✕, no backdrop dismissal); the buttons sit in the system's footer, 12 apart (they were 16), and follow the tone.

### `TagManagementModal` — the domain delete is `ConfirmDeleteModal` (November 2026)

`type="delete-domain"` now hands over to `ConfirmDeleteModal`, the system's one delete confirmation: the question, the consequence, the domain's name (new: pass it as `initialName`), a grey Cancel and a red **Delete** (it said "Confirm"). It was a plain critical `Modal` before. Without `initialName` the name field is empty.

### `ContactsTable` — drawn by `TableCard` (November 2026)

The table and its pagination now sit in a `TableCard` and the table inside is `bare`, instead of the pattern drawing its own card. It looks the same; the card is now the one every table shares.

### `HolidayTable` — drawn by `TableCard` (November 2026)

The filters (and the admin's Add Holiday / Import buttons) above the table, the table and the pagination now share one `TableCard`, and the table inside is `bare`. Before, the filter row floated above a table with its own border.

### `UsersTable` — drawn by `TableCard` (November 2026)

The search box above, the table and the pagination now sit in a `TableCard` and the table inside is `bare`, instead of the pattern drawing its own card. It looks the same; the card is now the one every table shares.

### `AccountsTable` — drawn by `TableCard` (November 2026)

The search box above, the table and the pagination below now sit in a `TableCard` and the table inside is `bare`, instead of the pattern drawing its own card. It looks the same; the card is now the one every table shares.

### `TableCard` — a table's filters, table and pagination in one card (November 2026)

New `TableCard`: filters above the table, the table, then pagination, in one `surface.elevated` card — the rule for where a table's filters go. `DataTable` gains `bare` (no border or fill, for use inside the card). `AVTable` gains `filters`: given, it draws a `TableCard`; without it nothing changes.

### Dialog footer buttons: `ModalCancel`, `ModalConfirm`, and `md` (November 2026)

New **`ModalCancel`** and **`ModalConfirm`** for a dialog's footer. They take their colour from the dialog's `tone` (`secondary` + `primary`; grey `neutral` + red `danger` in the `critical` tone) and are `md` (40 high), so a hand-built footer no longer has to remember either. The `actions` row is these two buttons. The footers of the accept, reject, move-to-cycle and user dialogs use them; the report, handoff and review dialogs' own buttons are `md` too, and the review dialog's red Reject now has a grey Cancel. Before, the `actions` row and the dialogs drew 36-high (`sm`) buttons while `ConfirmDeleteAVModal` and the Modal stories drew 40, so a delete dialog looked different from the rest. See `docs/modal.md`.

Visible change: dialog footer buttons are 40 high instead of 36.

### `MoveToBacklogModal` (November 2026)

New **`MoveToBacklogModal`** (Figma's `Move_Backlog_Modal`): the optional Feedback field with Cancel and Move to Backlog, reporting the feedback once through `onMove`.

### Multipart in the AV table: `MultipartTableTag`, `MultipartParentChip`, `AVTable` rows (November 2026)

New **`MultipartTableTag`** (a child's "1/3" or a parent's progress ring, with the tooltip from Figma's `_Multipart_Table_Tag`; focusable, and its words are read out), new **`MultipartParentChip`** ("Parent: VCP-4321 ↗", which opens the parent in a new tab), and `AVTable` rows take `multipart`, in **Figma's two-column title cell** (`_AV_Table_Item_AV_Title_Multipart`): the reference with the **28 tag under it** (14 type, 20 glyphs, its tooltip above), a rule, and the title with the details starting under it. A parent gets a brand edge at the row's **far left** (before the checkbox when the table is selectable); a child gets its tag and the Parent chip (`parentHref` opens it in a new tab, `onOpenParent` asks, and with neither it is plain text, not a button that does nothing). Rows without `multipart` are unchanged. New icon `arrow-up-right`.

`DataTable` gains **`rowEdge`**: a 6 brand edge at a row's far left, drawn over its first cell (so it takes no room and, with `selectable`, sits before the checkbox). The metadata in a title cell hugs its content and never shrinks (the table scrolls instead), and the parent's glyph is VCP's own `arrows-split-source` (new in-house icon, no fill version).

### Multipart: `MultipartSection`, `MultipartRow`, `ChildPartModal` (November 2026)

New **`MultipartRow`** (a part: number — green when completed —, title, assignee, "10 CP", due date, status), new **`MultipartSection`** (the AV page's card: a Multipart heading, "33% (1/3 parts completed)", a progress bar worked out from the parts, the rows, and **Add Part** when editing; its rows share one grid, so the points, dates and status tags line up in columns — and stack when the section is narrow), and new **`ChildPartModal`** ("Add a New Child Part to Multipart AV": a Title that may be left blank, with a "Status will change" warning for a completed AV). Built to Figma's `Multipart_Section`, rows and `Multipart_Child_Part_Modal`. Each only asks: opening a part, adding one and working out the default title are the page's.

Hovering a row shows an edit button after its title (a 24 tonal pencil; also shown on focus and on touch screens) — `MultipartRow.onEditTitle`, `MultipartSection.onEditPartTitle` — and `ChildPartModal` gains `mode="edit"` ("Edit Child Part Title", **Save**, `initialTitle`) for renaming; a blank title means "use the default" in both modes.

Review changes: a long part title shows in full on hover and focus (`TruncatedText`, or a tooltip on the title button), the progress bar is named "Multipart progress" so the summary is said once, `dueDate` is ISO shown dd/mm/yyyy (or the person's locale), "a part is done" is one helper (`isPartCompleted`), and the info glyph is `InfoHint` with design's text. `ChildPartModal`'s footer is `ModalCancel` and `ModalConfirm` (40 high), like every other dialog's.

### `SystemChangelog` and `ChangelogItem` — the admin's list of releases (November 2026)

New atom **`ChangelogItem`** (a release card: the kind's glyph, title and version, "Posted on …", message, Features/Updates bullets) and new pattern **`SystemChangelog`** (a "System Changelog" title over a card per release, with loading and empty states), built to Figma's `Admin System Changelog`.

- **Dates** are ISO and shown through `useDateFormat` (dd/mm/yyyy, or the person's locale) inside a `<time>`. Versions read as given ("v1.18.1").
- **Kinds:** a card's `kind` (`experimental`, `update`, `feature`) draws its glyph and names it for screen readers. The glyph, colour and words now have one owner, `CHANGELOG_KINDS` (`src/lib/changelog-kinds.ts`), which `ChangeLogModal` reads too. `ChangeLogModal` looks and behaves as before.
- **Links:** a card's `href` makes its title a link to the release's changelog document, opening in a new tab.
- **Many releases** are paged with the existing `Pagination` under the cards (`page`, `pageCount`, `onPageChange`), controlled like the tables.
- The title's id is `useId`, so two changelogs on a page each name their own.

### `ManualsTable` — the Settings Manuals tab's list (November 2026)

New pattern, built to Figma's `Manuals_Table`: Name (sortable), Uploaded by, Attachments (a count: "None", "1 file", "3 files"), Date Added, pagination, and Figma's "No items." empty state. **A manual's name opens it**: give a row an `href` and the name is a link, in a new tab. It is drawn by `TableCard` and controlled like `AccountsTable`; loading shows placeholder rows.

### `UsersTable`, `AccountStatusTag` and the Settings user dialog (November 2026)

New pattern **`UsersTable`**, built to Figma's `Settings_Users`: search, Name / Status / Date Added (sortable), **View** on each row, **+ New User** in the Actions header, pagination. Controlled like `AccountsTable`. Its empty table is an `EmptyState`, with the words searched when a search is active. **+ New User** stays while the table loads.

New component **`AccountStatusTag`**, the one owner of account statuses: **Approved** (green), **Pending** (yellow) and **Inactive** (grey), with no red status. `UsersTable` draws it, and `ACCOUNT_STATUS_OPTIONS` is the user dialog's Status list, so tables and dialogs agree.

`UserAccountModal` becomes the one user dialog for Accounts and Settings:

- `roles` swaps Proficiency and the Domain Access table for a Roles checklist (`draft.roles`, `initial.roles`). `domains` and `proficiencyOptions` are now optional.
- The photo's buttons are **Upload** with no photo, **Change** + **Remove** once there is one (a freshly chosen image counts). **Remove takes effect on Submit**: the draft carries `avatarRemoved: true`, so Cancel undoes it.
- `draft.roles` and `draft.avatarRemoved` are optional, so existing typed callers are unchanged.

`DataTableColumn` gains `action`: a control in the header in place of the visible label (the label stays as the hidden name). An `action` column sits at the end: right-aligned, with room above and below the header control.

### `PersonalInfoForm` and `ConnectionCard` — the Personal Info tab of Settings (November 2026)

New component **`ConnectionCard`**, built to Figma's `_Personal_Info_Item_Jira_Connect`: a brand logo tile, the service's name, a one-line status and one action button. Generic on purpose — the status, the button's words and what the press does are the caller's, so "Not connected / Connect", "Connected as … / Disconnect" and "Connecting…" are all the same card. It only reports the press.

New pattern **`PersonalInfoForm`**, built to Figma's `Settings_Personal_Info`: Name and Email with Save, and — when given `jira` — a Jira Account ID and a `ConnectionCard` to link the account (the Development domain's extra). It saves and connects nothing itself.

- **The draft follows `initial` until the person edits a field**, so a profile that loads late still fills the form, and typing is never overwritten. `onSave` gets the whole draft.
- **Name and Email are required**; Save says what is wrong under the field and moves focus to it. Name's words are Figma's ("Name is required"); Email's are `UserAccountModal`'s. `errors` carries what only the server knows.
- **`emailReadOnly`** is an email the person cannot change here (a single sign-on's, or an admin's): read-only rather than disabled, so it can still be reached, selected and copied.
- **The Jira Account ID is filled in by the connection only**: greyed with its note before the link, a plain read-only field after. It is never typed and has no placeholder.
- `saving` spins Save and locks the fields.

### `MyValuesStats` — the strip across the top of My Values (November 2026)

New, built to Figma's `My_AVs_Stats`: the person's avatar and name, their Total AVs and Completed figures, and a segmented status breakdown whose segments are as wide as their counts (never narrower than 100). A segment with a count is filled in its tone; one with none is an empty outline. It owns one mapping — a tone to its colour — and takes the statuses, labels, counts and totals as data. Too narrow, it wraps the breakdown onto its own line first, and scrolls sideways once that cannot get any narrower.

With every count at 0 the segments share the strip equally, so the empty outlines span the width instead of bunching on the left. Draft's grey is `stroke.strong` (Figma's slate-500 in light, a quiet mid grey in dark). Each segment has the light 2px line down its left, beside its count and name.

### `CycleSummary` — how a cycle went (November 2026)

New, built to Figma's `Cycle_Summary`: points committed, completed and carried over (each with its coloured dot), and a half-ring `DonutChart` gauge of the completion rate. The gauge's band colour — green at 90% and above, amber 70–89%, red below, grey with "-%" when there is no rate — is owned by the card (`completionBand`). It reflows by its own width with a container query: four across, two by two, stacked. The completion rate is the caller's.

The completion band is picked from the rate **as shown** (rounded first): 89.5 reads "90%" and is green, 69.5 reads "70%" and is amber. The gauge is named "Completion" and valued by its number, so a screen reader no longer hears the percentage twice; with no rate it says "No rate yet" instead of announcing 0.

## 0.3.0 — 2026-11-06

### `GanttChart`: a cut name can be read, and "1 pt" (November 2026)

A user's name in the row's expand button was cut with "…" ("John Mason S…") with no way to read the rest. When it is cut, it now says the whole name on hover and focus (the system tooltip, off while the name fits). Points also read "1 pt" instead of "1 pts" in the bars, the row summary and a bar's accessible name.

### `StatusHistory`: the count can no longer disagree with the entries (November 2026)

The "(3)" after the title was a separate `count` prop, so it could say a different number from the log under it (the dark story read "(2)" over one entry). With `entries` given the count is now the entries' — `count` is ignored — and `count` stays for a log whose entries are in `children`. The stories pass a wrong `count` on purpose to show it.

### `FilterBar`: a filled user field says which person it filters (November 2026)

Once filled ("Amy Lee", "2 selected") a user field gave no hint whether it was the Assignee or the Initiator. It now reads **"Assignee: Amy Lee"** (or "Assignee: 2 selected"). New `SearchSelect` prop `valuePrefix` does it (drawn only; the trigger's accessible name is still its label and then its value, so it is not read twice); `FilterBar` passes each user entry's `label`. The placeholder is unchanged.

### `DomainBudgetSummary`: over budget the label says the real percentage (November 2026)

At 170 of 120 the bar's label said "100%". The bar still stops at full, but the number beside it is now the real figure: **142%** (new `budgetUsagePercent`, not capped; with no allocation there is no percentage). It is passed as the bar's `valueLabel`, so a screen reader hears 142% as well. The `OverBudget` story asserts it.

### `RemoveButton`: `plain` is not offered on a filled brand surface (November 2026)

The bare red ✕ on the brand blue is about 1.3:1, well under the 3:1 a graphic needs (WCAG 1.4.11). `plain` is for plain surfaces only; on a filled brand surface use `tonal` (the ✕ on its own disc, 3.91 light / 3.47 dark). The `Surfaces` story no longer draws `plain` on brand, `ContrastHolds` now measures that surface in both themes (tonal passes; the bare ✕ is asserted not to), and the docs say so.

### One date format everywhere: dd/mm/yyyy, or the person's locale (November 2026)

Dates read two or three ways: `DateField`, `InlineDateEdit` and the Planning table showed the raw ISO string ("2026-03-04"), the detail card's fields month-first ("10-01-2025"), and the filter bar dd/mm/yyyy. They all read **dd/mm/yyyy** now, from one place (`src/lib/format-date.ts`), by splitting the string so no time zone can move the day. Wrap the app in `<DateFormatProvider locale="en-US">` to read in the person's locale instead (order, separators and the detail card's placeholder follow it); `useDateFormat()` gives a component the same formatter. `formatDate`, `formatDayMonthYear` and `datePlaceholder` are exported. `InlineDateEdit`'s `format` still overrides.

Visible change: any story or page that showed an ISO date now shows dd/mm/yyyy.

### `DescriptionSection`: where focus goes after a card is removed (November 2026)

Removing a card only reports it, so the page owns focus afterwards; left alone it fell to the page. `docs/description-section.md` now says where it goes — the next card's field, or the section's Add button when it was the last — and a new `RemovingACard` story shows it and asserts `document.activeElement`. No change to the component.

### `Chip`: the focus ring on the edit and ✕ buttons is no longer clipped (November 2026)

With `actions="hover"` the edit and ✕ buttons sit in a box that clips its overflow (so it can be zero-wide until the chip is hovered or focused), and their focus ring was drawn outside the button, so it showed only at the corners. The ring is now drawn inside the button. The `ActionsOnHover` story asserts it.

### `DetailCard`: focus no longer drops when adding, editing or removing a person (November 2026)

Opening the add form disabled the + that had focus, so focus fell to the page. Now focus goes into the form's "Select user" field; Cancel or Add puts it back on the +; Cancel or Save on an edit puts it on that chip's pencil; removing a chip moves it to the next chip's pencil, or to the + when it was the last. The chips' pencil and ✕ are named for the person ("Edit Jane Doe", "Remove Jane Doe"). `EditingPeople` asserts it.

### `NotificationItem`: focus no longer drops in the reply flow (November 2026)

In the reply flow the control that had focus went with its view and focus fell to the page. Now: after **Reply** (sent) focus goes to "Show Reply"; after **Cancel** a new reply, to "Reply"; after **Save** or **Cancel** an edit, to "Edit"; after **Delete**, to "Reply". The stories assert it. "Show Reply" / "Hide Reply" also no longer wrap onto two lines.

### `DataTable`: a text-only table that scrolls sideways is reachable by keyboard (November 2026)

A table wider than its container scrolls sideways; when it had no control in it (no link, button or sortable header) there was nothing to tab to and the hidden columns could not be reached from the keyboard — the accessibility check for a scrollable region failed it. The scroller now takes a tab stop, named by the `caption`, but only while it actually scrolls and has no control inside, so tables with controls or that fit add no stop. `HorizontalScrollTextOnly` holds it.

### `DescriptionCardTitle` — the card that names an Added Value (November 2026)

New atom, built to Figma's `Description_Card_Title`: the card at the top of an AV page's left column with the AV's reference ("VCP-1234") over its title. It is the page's second header: `AVHeader` above it is the ID row and holds the `<h1>`, and this card's title is the `<h2>` beneath it (`headingLevel` 3 for a deeper spot). A long title wraps and is never cut. Found building the AV pages of the clickable prototype, where the title had no component.

### `Toast` — `announce: false`, and toasts on a blocked Submit (November 2026)

`toast()` takes a new option, `announce: false`. It shows a toast without
reading it out: the toast goes into a plain stack after the two live regions,
with no role and no `aria-live`. It is for a toast that repeats a message
already announced somewhere else, so a screen reader user hears it once.
`announce` defaults to `true`, so every existing toast behaves as before.

The one case in VCP is a blocked Submit on an Added Value. The product chose
the Figma behaviour (5 November 2026): a "Missing Input" toast for each missing
field, and the "Unavailable Assignee" toast, on top of the error under each
field. `docs/toast.md` now allows those toasts and says on what terms. The
field error stays the message and the one announcement, and the toasts are
raised with `announce: false`. The story **Blocked submit is said once** tests
it.

### `Modal`: tabbing through a long form no longer scrolls the dialog itself (November 2026)

In a dialog whose body scrolls and holds checkboxes, radios or switches (their real inputs are hidden with `sr-only`, i.e. absolutely positioned), tabbing down to one that had scrolled out of view scrolled the **dialog panel** instead of the body: the footer (Submit) rode up to the top of the dialog and the form was cut off. The body is now the containing block for those inputs (`relative`), so they scroll with it and focus scrolls the body. A `TallBodyWithCheckboxes` story fails without the fix.

### `Sidebar` — the Archive and Planning sub-rows go somewhere (November 2026)

The built-in rails' sub-rows (Archive → Completed / Rejected / Backlogs, Planning → Planning List / Gantt Chart / Holiday Registry) had no key and no destination, so pressing one did nothing and no page could mark one as current; an app had to rebuild the whole rail with `items` to route them. Each now has a key — `archive/completed`, `planning/gantt-chart`, … — that `onNavigate` reports and `active` matches, like a top-level row's. The current page's group starts open in the expanded rail (not as a flyout in the collapsed one). New type `SidebarNavSubItem`: an `items` override's sub-row may carry a `key` the same way; a sub-row's own `href`, `onNavigate` or `selected` still wins. Found building the Gantt Chart screen of the clickable prototype. New story: `SubRowNavigation`.

### `ContactsTable` — the Contact List page (November 2026)

New pattern, built to Figma's `Contact_List`: Email, Subject and Message columns (a long message wraps and is shown whole), a delete button on every row (the plain glyph-only `IconButton`, named for the row) and `Pagination` beneath. Controlled: the caller pages, and `onDelete` only asks — the page confirms (`ConfirmDeleteModal`) and toasts. `loading` shows placeholder rows; an empty table says so.

Its empty table is an `EmptyState` (“No messages yet.”).

Focus after a delete is the page's job and is documented (docs/contacts-table.md): the `OnThePage` story moves it to the next message's Delete button, the previous one's for the last row, or the empty message when none is left (`DeletingTheLastMessage`), and asserts it.

### `UserLabel` — the description sits 2 below the name at `md` (November 2026)

At the default size the description (the email under a name) is 2 below the name, where it was pulled up 6 so the two lines touched. `sm` is unchanged. Only the Accounts table uses it.

### `AccountsTable` — the Accounts page's list of users (November 2026)

New pattern, built to Figma's `Accounts_Page_Content`: a search box, a sortable Name column (avatar, name, email), the domains as neutral tags, a sortable Date Added (already formatted), an edit and a delete button on every row (the plain glyph-only `IconButton`; named for the person), and `Pagination` beneath. Controlled: the caller filters, sorts and pages, and `onEdit` / `onDelete` only ask — the page opens the user dialog, confirms the delete (`ConfirmDeleteModal`) and toasts. `loading` shows placeholder rows; an empty table says so in an `EmptyState`, with the words searched.

Focus after a delete is the page's job and is documented (docs/accounts-table.md, docs/confirm-delete-modal.md): the `OnThePage` story moves it to the next row's Delete button, the previous one's for the last row, or the search box when the table is empty, and asserts it. The search placeholder and the empty hint say "domain" (the column the table has), and the story shows the Items select.

The Domains cell keeps 16 above and below its tags, so when they wrap onto several lines (a narrow column, many domains) the row grows to fit instead of the tags touching the row's edges; the `Default` story holds it (Sarah is in six domains).

### `ConfirmDeleteModal` — confirm deleting anything (November 2026)

New pattern: the same alert layout as `ConfirmDeleteAVModal` (a warning glyph, the question, the consequence, the item's name in a read-only field; not dismissible by the backdrop; `alertdialog`), with the word for the thing configurable (`itemLabel`, `itemName`) so a user, a contact or a domain can use it. It asks and reports; it deletes nothing. `ConfirmDeleteAVModal` is unchanged.

## 0.2.0 — 2026-11-05

### `Dropzone` checks the files it takes (November 2026)

`Dropzone` now checks **every** file against `accept` and a new `maxSize`, dropped ones too (before, `accept` only filtered the browse dialog and a dropped file of any type or size went straight to `onFiles`). `accept` defaults to PNG, JPG, GIF, DOCX, CSV and PDF and `maxSize` to 10MB, as the default hint already said (`*` takes anything). A file that fails is turned away: the zone says why in its error state ("photo.heic is not a file type we take", "huge.png is 11 MB; the limit is 10 MB") until the next selection, and the new `onReject` gets the same list. Only the files that pass reach `onFiles`. A caller's own `error` still wins.

Behaviour change to know about: a caller that relied on dropped files of any type reaching `onFiles` must now pass `accept="*"`. The accepted types and the limit are as the team understands them and are to be confirmed with design.

### A `Field` error turns the control's edge red too (November 2026)

`Input`, `Select`, `Textarea`, `SearchSelect` and `DateField` now draw the critical border when they are `aria-invalid`, which is what a `Field` with an `error` puts on its control. Before, only passing `invalid` to the control did, so a `Field` with just an `error` showed the red message and left the edge alone. The red message and the red edge now always arrive together. Passing `invalid` still works on its own.

### A cut name says the whole of it: `TruncatedText` (November 2026)

New **`TruncatedText`** (and `useIsTruncated`): one line cut with "…" that shows the system `Tooltip` with the full text on hover and focus when — and only when — it has been cut, and is a tab stop only then. `AVTable` and `PlanningTable` use it for the title in their first column, replacing the browser's `title` attribute (slow, unstyled, shown even for text that fits, and no use from the keyboard). `Tooltip` gains `disabled`. Any table with a name that can truncate should do the same (docs/data-table.md).

### `TypeTag`'s glyph is 20 × 20 (November 2026)

The caret in a `TypeTag` (the Type column of the AV and Planning tables) is now 20 × 20 (`Icon` `md`), the system's standard for the glyph in a `md` `Tag`. It was 24 × 24, which sat a size too big in the tag.

### `Popover`, `Menu`, `Tooltip`, `SearchSelect` — nothing is cut off at an edge any more (November 2026)

Fix, found by putting each one next to shadcn's in the same tight spot: four floating pieces could be cut off by the container around them or by the screen.

- **`Popover`** floats above the page by default: `strategy` now defaults to `fixed`, so a panel that scrolls, a table or a dialog no longer clips it. While the page scrolls it moves with its trigger and keeps the side it opened on. `strategy="absolute"` keeps the old placement, for the one case `fixed` gets wrong: an ancestor with a CSS `transform` (none of the system's containers has one). This covers everything built on it: `Menu`, `DateField`, `InlineDateEdit`, `EmojiReactionPicker` and `NotificationPopover`.
- **`Menu`** no longer has its last row's list cut off by `DataTable`, and takes Popover's `strategy` as a new prop.
- **`Tooltip`** stays on screen. When its `placement` has no room (a toolbar along the top of the page) it opens on the opposite side, and it slides along the edge so a long tooltip at the right of the screen is not cut off. The side it took is on the positioner as `data-side`.
- **`SearchSelect`**'s list floats above the page and opens above the field when there is no room below, so a field at the foot of the screen or of a dialog shows its whole list. The side is chosen as it opens and kept while you filter; when neither side has room for all of it, the list gets shorter and scrolls.

No visual change where there was room already. Each fix has a story that fails without it: `FloatsOutOfAScrollingPanel`, `FloatsOutOfATable`, `StaysOnScreen`, `OpensAboveNearTheBottom`.

### `Modal` — the caption is medium weight and has room beneath it (November 2026)

The `description` caption under the title is now `caption-md-medium` (weight 500, was regular), and **the header has 16 of padding below it when a caption is shown** (8 under a title alone, as before), so the content no longer sits close against the caption.

### `PasswordStrength` — Fair is brown, as Figma draws it (November 2026)

Fix: Fair was the bright `caution` yellow (`accent.yellow.medium`), on the reading that Figma painted a bright yellow, at 1.28:1 against the light track. Figma's `_Password_Item_Strength` draws Fair brown, so it is now the `warning` tone (`accent.warning.filled.surface`): 4.00:1 light, 5.42:1 dark, above the 3:1 a meaningful graphic should reach. The other four levels are unchanged. No API change.

### `DateField` — no Clear button that did nothing (November 2026)

Fix: a date field's calendar showed `DatePicker`'s footer **Clear** button, but nothing was wired to it, so pressing it left the date as it was and the calendar open. It showed in every `DateField`: the Add Required Details dialog's dates, and since #258 the super admin dashboard's month filter, where Figma's month selector draws no Clear. The field now turns it off (`clearable={false}`), in day and month mode. A form whose date is optional offers its own way to clear it, as the docs already said. No API change.

### `surface.track` — the dark track shows on a card: slate-700 (November 2026)

Fix: in dark, the grey track behind `ProgressBar` and `DonutChart` was slate-800, the same colour as a card (`surface.elevated`), so on a card it disappeared. A partly filled bar or ring lost its remainder and read as a loose stripe or arc. An empty gauge, such as the Cycle Summary's before it has a rate, drew nothing but "-%". It is now slate-700, one step up: **1.41:1** on a dark card and 1.72:1 on the canvas, a little more than the light track's 1.23:1 on white. Light is unchanged.

The cost: against the lighter track, three dark fills drop under 3:1, critical (2.72:1), info (2.75:1) and pending (2.91:1). Each still clears 3.84:1 against the card around the meter, and every meter announces its value, so the colour is never the only signal. The others stay above 3:1: brand 4.48, success 3.22, warning and caution 5.42. `docs/progress-bar.md`, `docs/donut-chart.md` and `docs/password-strength.md` carry the new figures. Figma's dark `surface/track` variable wants the same value.

No API change.

### `ChangePasswordForm` — the Password tab of Settings (November 2026)

New pattern, built to Figma's `Settings_Password`: Old, New and Confirm Password (each a `PasswordField` with a show/hide eye), a `PasswordStrength` meter under the new one (the page scores it with `getStrength`; the field is described by the meter), and Set Password. Each field is required, in Figma's own words ("Old password is required"…); a confirmation that does not match is an addition. Set Password says what is wrong, moves focus and does not go through; `errors` carries server messages; `saving` locks the fields. It changes nothing itself.

The strength score is VCP's own, `scorePassword` in `src/lib/password-strength.ts` (length, character kinds, common passwords; 0–4), and the form uses it by default, debounced 300ms; `getStrength={null}` removes the meter. A new password under 8 characters is refused ("Password must be at least 8 characters"), and New Password says so beforehand, under the field ("At least 8 characters"); strength is never required. A field with an error turns its edge critical. `scorePassword` and `MIN_PASSWORD_LENGTH` are exported, so a page uses the same rule. `PasswordField`'s eye is grey (`neutral.outline` content) rather than brand blue.

### `PasswordField` — a password input with a show/hide eye (November 2026)

New, built to Figma's `_Password_Show_Hide_Icon`: an `Input` with an eye at its end (`Input`'s new `trailingAction`) that shows what was typed. The eye is a real button named "Show password" with `aria-pressed`, with a 40 press area; the field is `type="password"` until it is pressed. `visible` / `onVisibleChange` control it from outside.

### `Input` — `trailingAction` (November 2026)

A slot for a **control** at the field's end — a show/hide toggle, a clear button — where `trailingIcon` is only decoration. It takes a real, focusable `IconButton` the caller names and is not hidden from assistive tech. Nothing changes for an `Input` that does not use it.

### `accent.pending` tokens; `PasswordStrength` component; `ProgressBar` tones and props (November 2026)

**New tokens: `accent.pending.*`** — an orange status family with the same shape as
`accent.warning` (`filled` / `outline` / `tonal` × `surface` / `content` / `border` ×
`default` / `hover` / `pressed` / `disabled`), light and dark, built from GDL's core
orange scale. The name is the one GDL's contract reserves for CAF's "pending", so
`npm run check:contract` recognises it.

**New component: `PasswordStrength`** — a labelled five-step meter (`very-weak` →
`strong`) for the password being typed, ported from the Settings "New Password"
item and built on `ProgressBar`. The caller scores the password and may pass a
one-line `message`.

**`ProgressBar`** grows additive pieces so it can carry this: `tone="info"`,
`tone="pending"` and `tone="caution"` (the bright `accent.pending.outline.border`
and `accent.yellow.medium` — **2.27:1 and 1.28:1 on the light track**,
documented as only for use beside a written value), a `valueLabel` that paints and announces words in
place of the percentage, `role="meter"`, and a `labelSize` (`sm` 12px default, `md` 14px). Existing bars are unchanged.

### `UserAccountModal` — add or edit a user (November 2026)

New pattern, built to Figma's `Accounts_Page_User_Modal`: one dialog in two modes. `new` ("User", empty, no Capacity Points) and `edit` (the user's name as the title, filled, with Capacity Points and its own Save). Both have a photo with Upload (opens the file picker, no crop or remove), Status, Name, Email and Proficiency (the lists are passed in), the Domain Access & Admin Rights table (`DomainAccessTable`) and Submit. It keeps its own draft, reset each time it opens; Name and Email are required and Submit says what is wrong and moves focus; `errors` carries what only the server knows. It saves nothing itself.

### `DomainAccessTable` — per-domain access and admin rights (November 2026)

New, built to Figma's `_Accounts_User_Modal_Domain_Access_Table`: a row per domain with an Access checkbox, an Admin checkbox and the Role they add up to (`domainRole`: Admin if ticked, else User if Access, else No Access), shown as a `Tag`. Both boxes are always available, and **Admin implies Access**: ticking Admin also ticks Access, and un-ticking Access also un-ticks Admin, so a row never reads Admin for a domain the person cannot get into. Controlled; one click can report both boxes, so callers update their rows functionally. Admin's tag is blue (`brand`), User's green, No Access grey.

### `emphasis` on the value fields — filters read regular (November 2026)

`Input`, `Select`, `SearchSelect` and `DateField` take `emphasis: 'regular' | 'medium'`: the weight of a *chosen* value (the placeholder is regular either way). Each keeps the weight it had by default — `Input` regular, `Select` and `SearchSelect` medium — so nothing changes unless it is set. **A filter passes `emphasis="regular"`**, so a row of filters sits quietly while a chosen value in a form stays medium. `DateField`'s chosen date is now medium by default (it was regular, via `Input`) so it reads like the selects beside it in a form; its existing day-mode fields, such as the Add Required Details dialog's, change look. `PlanningFilters`' status and priority use `regular`.

### `DateField` — `mode="month"` (November 2026)

`DateField` takes `mode: 'day' | 'month'` (`DatePicker`'s own prop; `day` by default, so every existing field is unchanged). In month mode the field reads "September 2026", the calendar opens on the month grid, and `onChange` reports the first of the chosen month; `estimated` is ignored. For a month with no day — a reporting period — where Figma draws a month selector. New helper `formatMonth`.

### `SuperAdminMetrics` — the super admin dashboard's numbers (November 2026)

New pattern, built to Figma's `SuperAdmin_Dashboard_Metrics`: a domain `Select` and a month `DateField` (both regular weight, as filters are), four single `StatCard`s (Values Created, Values Completed, Overdue Value Rate, Active / Total Users) and two `StatCardGroup`s (Avg. Time, Review), each figure with its tooltip. It owns no arithmetic: counts read `0`, a rate or average that cannot be worked out is `null` and reads `--`, as Figma's empty state does. `loading` shows a placeholder per figure. The users card is a fixed narrow one (the least important figure). It reflows by its own width.

### `Stepper` — commit after a pause, and only numbers (November 2026)

New opt-in `commitDelay` (ms): what is typed commits after that long without a keystroke, without leaving the field, so anything derived from the value follows while it is typed. Off by default; a stepper still commits on blur or Enter unless it is set. Also, only a number can now be typed: digits, a leading minus when `min` is below zero, a point when the steps are fractional; anything else is dropped as it is typed.

### `Stepper` — an empty state (November 2026)

`value` can now be `null`: a number not chosen yet, shown as `placeholder` ("Set Budget") in italic `text.tertiary`. Nudging up gives an empty field its minimum; the down caret is disabled. New `onClear` is called when a field is committed empty, so a caller can take a value back to `null`. Without `onClear` an empty commit restores the number as before, so existing steppers are unchanged.

### `Stepper` — hold a button to keep stepping (November 2026)

Pressing and holding a nudge button (the minus and plus, or the up and down carets) now keeps stepping: once as the press lands, then repeatedly after a short pause, until it is released or the value reaches the end. A single click is still one step, and keyboard use is unchanged. No API change.

### `BudgetTable` — edit every domain's quarterly budget (November 2026)

New pattern, built to Figma's `Domain Budget Edit` page: one row per domain with an allocation field (`Stepper` `up-down`, with its empty "Set Budget" state), the points consumed against it as a bar, Remaining (derived, red when negative) and an optional note that grows when focused. Remaining and the bar follow the allocation: at once for a nudge, after a brief pause (`commitDelay`, 600 ms) for typing. The bar's status is `DomainBudgetSummary`'s `budgetStatus`, so the two never disagree. It is controlled and saves nothing: Save Changes, its loading state and the "Changes Saved" toast are the page's. A `loading` state keeps the headers and shows placeholder rows. The stories show the page around it: quarter and year (a 40-high segmented control and select), Save Changes, the success toast, an error toast for a save that fails (the table keeps what was typed), and the browser's leave-page prompt for unsaved changes.

### `DomainBudgetSummary` — a domain's budget for one quarter (November 2026)

New, built to Figma's `Domain_Budget_Admin_View`: Allocated, Consumed and Remaining points (each with an info tooltip; Remaining is derived and turns red when negative), the quarter's tag and dates (current, past or upcoming), quarter and year pickers with a "Go to Current Quarter" button when another quarter is being viewed, and a usage bar. The bar's status is owned by the card (`budgetStatus`): under 75% brand blue, 75–99% warning, 100% and over critical. It reflows by its own width with a container query. Controlled: the caller supplies the quarter, year, dates and days left.

**`ProgressBar` — `labelPlacement`.** New `labelPlacement` (`above` by default, or `below`) puts the label row under the bar, as Figma draws Domain Budget's. Nothing changes for existing bars.

Below 560 wide the card stops reflowing and scrolls sideways as a whole, rather than squeezing its figures.

### `AppShell` — a Playground story with controls for every piece (November 2026)

Storybook's Templates → AppShell → Playground lets you assemble a shell from the Controls panel instead of picking a fixed story: the rail's user type, width, open groups and domain switcher; the top bar's left side, bell, mode switch and account chip; `PageTitle` (size, subtitle, back, actions) or `AVHeader` (type, role, status or domain step, status buttons) or no title band; the page's content; the footer; and light or dark. Every control sets a prop or preset its piece already has, so no component API changed. The existing AppShell stories are unchanged.

### `DonutChart` — the segmented gauge's numeral is the dashboard figure (November 2026)

The centre numeral of a `segmented` gauge (the Cycle Summary's) is now `heading-xl-bold` in Poppins, the same 32 bold as a `StatCard` value, instead of the ring-scaled 40 semibold in Inter. It sits on the type ramp so the gauge reads with the figures beside it. Round-capped rings are unchanged.

### `StatCard` — narrower, and a yellow for Pending (November 2026)

The default card's minimum width was 16.5rem (264), widened from Figma's own 175 "so the card stays readable", and a row of cards wrapped early because of it. It is now 11rem (176): Figma's six-across dashboard row fits at 1187 before any card drops onto the next row. A wrapping flex container still lets cards fall to the next row when they run out of room.

**`StatCard` — a yellow for Pending.** New accent `yellow` (`accent.yellow.medium`, an existing token) for a figure that is more cosmetic than urgent; it is brighter than `warning`'s brown and close to Figma's Pending stripe. The dashboard's Pending uses it.

This follows the November change that moved `accent.warning.outline.border.default` from yellow-500 to yellow-700 for contrast. Figma's Pending stripe is still drawn with the old yellow, so `warning` would now render brown. A stripe is purely decorative, and the card's label carries the meaning, so a brighter yellow here costs nothing in contrast terms. A dedicated decorative stripe token is a possible follow-up.

### `InCaseYouMissedIt` and `InCaseYouMissedItCard` — the dashboard's "waiting" strip (November 2026)

New, built to Figma's `InCaseYouMissedIt` and `_ICYM_Card`.

- **`InCaseYouMissedItCard`** (component) — one waiting Added Value: who and when, its title, and a tag and message for Overdue, Due Soon, Awaiting Review or Pending (the type vocabulary lives here; pass `days` and the sentence is written for you). The face opens it; a tonal red ✕ in the corner dismisses it (shown on hover and focus, always on touch).
- **`InCaseYouMissedIt`** (pattern) — a titled card over a row of those cards that scrolls sideways, with an arrow at each edge on hover. It owns no state: the caller removes and remembers a dismissed card. Empty renders nothing.
- **Icon:** `clock-user` (and its fill).

### `DomainItem`, `DomainCard`, `TagManagementModal` — Tag Management (November 2026)

New, built to Figma's Tag Management page.

- **`DomainItem`** (component) — a row with edit and delete; a locked built-in with a "Default" `Tag`; a draggable row with a grip that also moves with ↑ / ↓.
- **`DomainCard`** (pattern) — a titled card with "Add New" and a column of rows. Draggable rows reorder by pointer or keyboard, among themselves only, with a live-region announcement.
- **`TagManagementModal`** (pattern) — add a tag, add a domain, confirm deleting a domain.

**`Modal`** — new `actions` prop (the standard Cancel + answer row; `secondary` + `primary`) and `tone="critical"` (swaps to a grey `neutral` Cancel and a red `danger` answer, and defaults to `alertdialog`, no ✕, no backdrop dismissal). `footer` is unchanged and wins when set.

**`TagManagementModal`** — `mode="edit"` + `initialName` rename a tag or domain (not drawn in Figma; the add dialog, reused).

**`IconButton`** — new `critical` variant: textual like `tertiary` but red — only the glyph colour changes on hover and press (`accent.critical.outline.content`). The quiet destructive control, for a row's bin; `danger` stays the loud filled one.

### `NotificationItem` — reactions and the reply flow under a comment (October 2026)

Under a comment preview, as Figma's `Notification_Popover_Comment_Reply` draws it: "Reply" (or "Show Reply" / "Hide Reply" once there is a reply) with the emoji reactions beside it, a composer with @-mentions for a new reply (`MentionInput`), and one reply card with Edit and Delete. The reply and the reactions are the caller's data, passed in (`reply`, `reactions`, `members`, `currentUser`) with callbacks (`onReply`, `onEditReply`, `onDeleteReply`, `onToggleReaction`, `onSelectEmoji`). A click on the comment does not open the item; the reply controls respond as controls of their own. `previewActions` stays, below the reply row.

### `DetailCardMenu` — the ⋮ menu at the head of an Added Value page (October 2026)

New component, to Figma's `Detail_Card_Menu` and `AV_Options_Dropdown`: a 32 outlined ⋮ button that opens a `Menu` of Edit and Delete, with the moves between Draft, Pending and Backlog that the role (`user` or `admin`) and the status allow. The component owns which actions appear (a table in `docs/detail-card-menu.md`), so no page decides it again; it only reports each action.

### `DetailCard` — the facts about one Added Value (October 2026)

New pattern, to Figma's `Detail_Card` and `_Detail_Card_Item_*` rows. `type` picks which of the four cards it is (`viewing`, `duplicate` for an AV initiated to another domain, `editing`, `new`), each a fixed list of fields; `domain` trims it (Design has no Cycle, Development has every field). Values go in as `value` and out through `onChange`; the dropdowns' choices come as `options`; `errors` marks a field invalid. Reading uses `Chip`, `Tag`, `StatusTag`, `UrgencyTag`, `TypeTag`, `DueDateTag` (its due-soon colour computed from the date) and `CycleTag`; editing uses `SearchSelect`, `Input` and a `DatePicker` in a `Popover`. The viewers pill is a placeholder until Edit Viewers is built. UI Changes and Estimated Duration are not built.

`UrgencyTag` and `TypeTag` gain `variant` (`textual`, `tonal`, `outline`) and `size`, and `TypeTag` gains `info` (the ⓘ); `CycleTag` gains `size`; a `Menu` item can set `icon: false` to drop the warning glyph a `danger` item gets. `DetailCardMenu` is a square outlined button and its list has no icons. `DetailCard` draws every tag large, capacity points as a `Badge`, urgency tonal and type outlined with the ⓘ, and adds, edits and removes people in the card (a form under the chips, a pencil and ✕ on each chip).

### `DescriptionCard`, `DescriptionSection`, `StatusHistory`, `DuplicateToOtherDomain` — the cards from the AV page (October 2026)

**`DescriptionCard`** (component): one numbered entry in an AV's description, a coloured number
block and the paragraph beside it. Four types: `problem`, `solution`, `deliverable`,
`desired-outcome`. Reading, or `editing`: the paragraph becomes a text field that grows with what is
typed, with an `error` (the critical border and a message under the card) and an optional remove button inside the card's right edge, which appears on hover and while the card has focus (always on a touch screen).

**`DescriptionSection`** (component): the frame around a block of the description, with four fixed types (`problem`, `solution`, `deliverable`, `desired-outcome`) that fix the title, the cards' colour and which controls exist (desired outcome has no add and no files). It numbers its cards and gives each its type and a remove name. A round add button, the cards as an ordered list, and the attached files with a paperclip to attach more. The cards are its children and the files its `attachments`; pass `onAdd` and `onAttach` for an editor and neither for a view. Every section folds: a caret button at the right of the header hides the cards and files (hidden, not unmounted), with a short slide.

**`StatusHistory`** (component): the collapsible bar that holds the status log, a clock,
"Status History (n)" and a caret. A disclosure wired as one (heading, button with
`aria-expanded` / `aria-controls`, labelled region); controlled or uncontrolled. Open, it shows `entries`: who
changed the status, from which to which (a neutral `Tag`, then a `StatusTag`), and when.

**`DuplicateToOtherDomain`** (component): the "Duplicate to other Domains" card, a `fieldset`
with one `Checkbox` per domain, "Initiate to {name} assignment". The domains are passed in and
never include the current one; controlled or uncontrolled. `onChange` reports which option just
changed as well as the whole set, because ticking one usually opens a section.

**`RemoveButton`** (atom): the small critical ✕ that takes an item out of a list. `tonal` is the glyph on a filled disc, used by `DescriptionCard` and `FileAttachment` (whose remove button now uses it) so the two match; `plain` is the bare glyph. Icon only, with a required name and a 40 target.

No new tokens. `DescriptionCard`'s `deliverable` type uses `accent.info` and `desired-outcome` uses
`surface.neutral.stronger` as stand-ins: the design's cyan is on no ramp and the darkest slate has no
surface token.

### `GanttChart` — new pattern; `GanttTooltip` — new component; `Tooltip` `followPointer`; `SearchSelect` `inline`; `Icon` `link-simple-horizontal` (October 2026)

**`GanttChart`** is the Gantt pattern: each Added Value a bar from start to due date,
against people down the side and time across the top, in three views (one cycle by the
day, a month by the day, a year by the cycle). It takes flat `tasks`, `users` (with their
WIP, planned and availability figures), `projects` and `cycles`, and lays them out as the
page design does: one row per user or, with projects selected, a header per project with
the people who have tasks in it. It has a Today column, a legend built from `LegendItem`,
a `GanttTooltip` on every bar, open and closed rows (a closed row draws a summary bar, an
open one packs tasks onto shared lines), and the view, period and filters as controlled
props. The filters are the new `SearchSelect` (`multiple`, avatars for users) and Reset
Filters is the filter bar's own button. Status colours are the accessible `filled` tones,
with `accent.blue.medium` standing in for Pre-Delivered until a cyan token exists.

Beyond the design, for approval: the period bar's middle is a quick pick (the filter bar's
cycle field in Cycle view, a list of years in Year view, a month calendar in Month view);
a Today button returns to today and scrolls its column into view; the month/cycle and day
headings stay at the top of the screen as the page scrolls; a person's figures slide open
and shut (not under reduced motion). No phone layout: VCP has no mobile version yet. A blue line under the headings marks where the
Added Values are. A `loading` state keeps the header, Today column and legend and swaps the
rows for `Skeleton` placeholders, announced as busy.

**`GanttTooltip`** is the card a Gantt bar shows on hover or focus: the work item's title
with a link glyph, then label/value lines (Status, Initiator, Est. Due Date). It is `Tooltip`
with the content filled in, so hover and focus, `aria-describedby` and Escape come from
`Tooltip`; the title truncates so every card is one width and the lines are a description list.

**`Tooltip`** gains `followPointer`: the bubble opens under the pointer, kept inside the
viewport, for a trigger far wider than the bubble. `GanttTooltip` uses it. Off by default;
nothing changes for existing tooltips.

**`SearchSelect`** gains `inline`: the button drawn as plain text in a bar, without the
bordered field (the panel is unchanged), for a picker inside another control's toolbar. Off
by default; nothing changes for existing fields.

**`Icon`** gains the Phosphor `link-simple-horizontal` glyph (regular and fill), which the
card's title row uses.

No new tokens.

### `FilterBar` — user fields (October 2026)

`FilterBar` takes `users`: one `SearchSelect` per entry (Assignee, Initiator…) after tags, with avatars and a search box in the panel, like Figma's user menu. An entry can be `multiple` (checkbox rows; the field shows a name or a count), and its options can carry a photo (`src`) or the "Unassigned" glyph (`unassigned`).

### `FilterBar` — the filter row above a list (October 2026)

New pattern, to Figma's `_Filter_Bar`: a search field, then period (a range calendar in a popover), status (`SearchSelect` with Clear all / Apply), priority (`Select`) and tags (`SearchSelect` with search, and removable tags), then Reset and a Filters button that shows or hides the fields. Every filter is controlled by the page. It is three columns from `md` up, with the buttons pinned top right and the fields wrapping between, and stacks as Figma's Mobile below. `children` adds more fields to the row.

`DatePickerPreset` and `DatePickerMode` are now exported from `DatePicker`.

The search box and every field are fluid between a minimum and a maximum width instead of fixed, so they stretch with the page; the minimums are measured so nothing is cut off, and a page with period, status, priority and tags fits one row at 1440 with the expanded sidebar. A page chooses which filters show by which props it passes (a draft page leaves `status` out), and the bar closes up around the rest.

`FilterBar` also takes `cycle`: a one-pick searchable field whose rows read **C33** (May 25, 2026 - Jun 08, 2026), as in the AV details card, while the field says just the code so it stays narrow. It is built on `SearchSelect`'s new `shortLabel`.

When the filters are folded away, the search box widens (up to 32rem) to use the room the fields leave.

## 0.1.0 — 2026-11-03

### Package — three more components importable, no stories in the tarball (November 2026)

- **`InlineEdit` / `InlineDateEdit`, `RejectionReason` and `StatusProgression` are now exported** from `@vdm-design-team/vcp-design-system`, with their props types and the constants that go with them (`PENDING_REJECTION_REASONS`, `HANDOFF_REJECTION_REASONS`, `avTransitions`). They were already inside `PlanningTable`, the two rejection modals and `AVHeader`, and each has its own docs page, but an app couldn't import them on their own.
- **The package no longer ships stories, the story-test helpers or the team's process docs** (`handoff`, `workflow`, `inventory` and the two Figma audit notes). The component docs an app's AI agent reads from `node_modules/…/docs/` are all still there.

### `IconButton`, `RichTextToolbar` — the name is heard once (November 2026)

Fix: an `IconButton` with no `Tooltip` carried its label twice, as `aria-label` and as `title`. A `title` the name
didn't come from is the description, so a screen reader heard "Add deliverable, button, Add deliverable".
`RichTextToolbar`'s buttons did the same. Now the `title` alone names the button and is still its hover hint;
under a `Tooltip` the name stays `aria-label`, with no `title`, as before. The story check
`vcp-description-repeats-name` now also fails a `title` that repeats an `aria-label`: it found this in 153 stories.

Nothing changes on screen, and the props are the same. A test that finds a bare `IconButton` by its `aria-label`
attribute (`[aria-label="…"]`, `getByLabelText`) finds it by role and name instead:
`getByRole('button', { name: '…' })`.

### `MoveAVToCycleModal` — focus follows the assignee rows, and an unavailable assignee is said once (November 2026)

Fix: removing an assignee row took the focused ⊖ with it and left the focus on the page itself. It now goes to the row
that took its place (its ⊖, or its assignee when only one row is left); "Add assignee" now goes to the new row's
assignee, ready to fill in.

Fix: an unavailable assignee showed two red messages for one problem, the person's field's own and a second under
the group. Only the field's stays; Confirm moves focus to that field, so a screen reader hears it.

### Say it once: nothing on a screen reader repeats its own name (November 2026)

Fix: in ten places a screen reader heard the same words twice, as an element's name and again as its
description. A new story check (`vcp-description-repeats-name`, run with axe on every story) now fails that,
and these are fixed:

- **Tooltips that only showed the trigger's name** no longer describe it too (`describe={false}`):
  `EmojiReactionPicker`'s "Add reaction", `NotificationItem`'s "Mark as read" / "Mark as unread",
  `Sidebar`'s rows when collapsed, `InlineEdit`'s "Edit" pen (in `DataTable` and `PlanningTable`),
  `DomainLabel`'s "Added by …" (also in `DeliverableLink` and `DeliverablesCard`).
- **Hints that were in a name *and* a description**: a `RadioGroup` option with a `hint`, and `Dropzone`'s
  file types or error (also in `DeliverablesCard` and `HandoffAVModal`). Each control is now named by its own
  words and described by the hint, so "Starter, Up to 3 seats" is heard once, not "Starter Up to 3 seats, Up
  to 3 seats".

`Tooltip` marks a trigger it does not describe with `data-tooltip`, and `IconButton` drops its native `title` under
either mark, so the pen never gets the browser's own bubble on top of ours.

Nothing changes on screen. No API change.

### `PlanningTable` — the initiator said once, and an empty cell reads "Not set" (November 2026)

Fix: the initiator avatar is named "Initiator: Marvin Reed" and its tooltip described it again as "Marvin Reed",
so a screen reader heard the name twice; the tooltip now shows without describing (`describe={false}`). An empty
Start Date, Due Date or Points cell put "Not set" in an `aria-label` on a plain `span`, which ARIA does not allow
and most screen readers skip, reading "dash"; the hyphen is now hidden from them and "Not set" is the cell's text.

### `accent.warning.outline.border` — a step darker in light: yellow-700 (November 2026)

The warning edge and glyph colour was yellow-500, **1.91:1** on white: too faint for the edge of a field
(`SearchSelect`'s `warning`, the busy assignee), which needs 3:1. It is now yellow-700, **4.93:1** on white,
4.71:1 on the canvas and 4.59:1 on the warning tint; hover and pressed move with it (800, 900), and disabled
stays at 300. The dark theme is unchanged.

Everything drawn in it darkens a little in light: `SearchSelect`'s warning border, `Banner`'s warning edge
and glyph, `Tag`'s warning outline, `Toast`'s warning glyph and bar, `StatCard`'s warning stripe and the busy
`AssigneeStatus` dot. The figures in `docs/banner.md`, `docs/toast.md` and `docs/stat-card.md` follow. Figma's
`accent/warning/outline/border` variables want the same values.

### `PlanningFilters` — the row above the Planning list (November 2026)

New pattern, built to Figma's `_Planning_Filters`: a search box, status and priority filters (`SearchSelect`), Reset and the View Cycle button. Only what the Planning page needs; the library's larger filter bar (tags, period, users, Filters toggle, mobile) is a separate piece. The bar holds no state — `value` in, `onChange` out.

### `MoveAVToCycleModal` and `DateField` — the dialog a Backlog drop opens (November 2026)

New, built to Figma's `Add_Required_Details_Planning_List` and the Assignee Availability flows. Named for the action, like `HandoffAVModal`; first called `AddRequiredDetailsModal` (and still titled "Add Required Details" on screen), so search for either.

- **`MoveAVToCycleModal`** (pattern) — repeatable assignee rows (person with availability, role, points), Start and Due Date, Cycle (a `SearchSelect`, written as `CycleTag` writes it: "C36 (Mar 02, 2026 - Mar 23, 2026)", the code bold in the rows), Capacity Points. With `estimate`, the dates the system calculates fill in "(est.)" and a date a person sets is never overwritten. Confirm will not go through with an unavailable assignee (`onInvalid`).
- **`DateField`** (component) — a read-only field with a calendar glyph and a `DatePicker` in a fixed-position `Popover`; `estimated` reads "(est.)".

Stacked on the Planning table PR (it uses `Popover`'s `strategy="fixed"`).

### `AssigneeWithStatus`, `Tooltip`, `AssigneeSelectionDropdown`, `SearchSelect` — said once, dates with words, Escape noted (November 2026)

Follow-ups to the assignee availability pieces.

- **`AssigneeWithStatus`** — the sentence ("John Doe (Assignee, Busy)") is the avatar's name, and the tooltip
  used to add it again as a description, so a screen reader heard it twice. The tooltip still shows it; it no
  longer describes. **`Tooltip`** gains `describe` (default `true`) for this: off, the bubble shows but is not
  wired to the trigger with `aria-describedby`.
- **`AssigneeSelectionDropdown`** — new `freeFromText` (default "Free from"). A busy or unavailable row's date
  pill shows only the date; a screen reader now hears what it is ("Cy Park, Free from May 17").
- **`SearchSelect`** — a behaviour change that came with `collapsibleGroups` and was not noted: **Escape closes
  the panel from anything inside it** (Clear all, Apply, a group heading), putting focus back on the trigger. It
  used to do nothing there. With `confirm`, Escape discards the draft, as a click away does.

### `CommentSection`, `CommentReply`, `CommentComposer` — focus is never dropped, and nothing typed is lost (November 2026)

Fix: closing a reply or edit box (sent, saved or cancelled) and deleting a comment used to leave the
focus on the page itself, so a keyboard or screen-reader user started again from the top. A closed box
now hands the focus back to the Reply or Edit that opened it, and a deleted comment's focus goes to the
comment that took its place (the next, else the one before, else the one it replied to, else the
new-comment box). Each comment's `<article>` takes the focus with a ring when it is put there.

Fix: a send that settled cleared the whole box, including anything typed while it was in flight. It now
clears what was sent and keeps the rest, with the caret at its end. `CommentActions`' Edit, Delete and
Reply carry `data-action` so the comment can find them. No API change.

### `PlanningTable` — the Planning list (November 2026)

New pattern, built to Figma's Planning Page: Added Values in collapsible Cycle and Backlog sections (caret, title, dates, Total Capacity and Capacity Remaining), ten columns, `DataTable` specialised as `AVTable` is. Start Date, Points and Due Date edit in place (`InlineEdit`, `InlineDateEdit`); the assignee shows their availability dot and tooltip (`AssigneeWithStatus`). Points edit from a dropdown (the capacity scale); empty dates and points read "-"; a date flagged `animated` plays the design's sweep-and-flash (1.6s, three loops) once, as a signal for this session's auto-calculation: it stops on the third loop or on hover, is reported through `onAnimationDismiss`, and never replays on load, sort, filter or refresh. Not included: the filter row, tracked separately.

`DataTable` columns can `fit` (hug their content) or `grow` (take the rest and truncate): the responsive pattern for every VCP table, applied to `AVTable` and `PlanningTable`. `Popover` gains `strategy="fixed"` (used by `InlineDateEdit`, so a date picker is not clipped by a scrolling table). `Tooltip` gains `wide`. `DataTable` gains `rowProps` (extra attributes for a row's `<tr>`) and `ColumnHint` an `icon` prop (the ƒ-in-a-ring for formula columns); both additive. `TypeTag` gains a hover tooltip (`tooltip`, on by default) and exports `AV_TYPE_MEANING` and `TYPE_COLUMN_HINT`; `UrgencyTag` and `StatusTag` export their column hints; `AVTable`'s Urgency, Type and Status headers now default to that copy. Sorting is a handler (`onSortChange`) — the table never reorders rows itself. Backlog rows can be dragged onto a Cycle (`onMoveRow`; the table moves nothing).

Stacked on the assignee availability PR (it uses `AssigneeWithStatus`).

### `DeliverablesCard`, `UserMenu`, `NotificationPopover` — the Light and dark stories render whole (November 2026)

Stories only. Each Light and dark story cleared the meta's decorators with `decorators: []`, which
doesn't remove them, so the meta's frame still wrapped both themes:

- **DeliverablesCard:** both themes were squeezed into one 26rem card's width, so the link titles
  vanished and the drop area wrapped a word per line. Each theme now gets its own half (stacked on a
  narrow screen) with the card at its page width.
- **UserMenu:** both themes were squeezed into the 288×256 frame and the open menus hung off the dark
  panel. The story now spans the page, as in the top bar.
- **NotificationPopover:** the themes were stacked, so the lower bell had no room below it on most
  screens and its panel opened upward over the upper one. They now sit side by side, so both panels
  open downward; a canvas narrower than both scrolls sideways.

The meta decorators now skip those stories (`layout: 'fullscreen'` in DeliverablesCard and UserMenu;
`frame: 'none'` in NotificationPopover, where every story is fullscreen).

### `DeliverableLink` — Edit Link uses `note-pencil` (November 2026)

`DeliverableLink` arrived just before the one-glyph-for-Edit rule and still drew "Edit Link" with the
bare pen (`pencil-simple`). It now uses `note-pencil`, the pen over a square, like every other Edit.
`docs/icon.md` lists the pieces that use it today, rather than one that hasn't landed yet.

### Assignee availability — `AssigneeStatus`, `AssigneeWithStatus`, `AssigneeSelectionDropdown`; `SearchSelect` collapsible groups (November 2026)

Built to Figma's Assignee Availability page and flow.

- **`AssigneeStatus`** (atom) — the green / amber / red dot, at the table (10) and menu (12) sizes. Owns the status → colour mapping and the status words.
- **`AssigneeWithStatus`** (component) — an avatar with the dot on its corner and a tooltip, "John Doe (Assignee, Busy)", which also names the avatar for a screen reader.
- **`AssigneeSelectionDropdown`** (component) — assignees grouped under collapsible Available / Busy / Unavailable headings with a date `Badge` on busy and unavailable rows; unavailable people cannot be picked; an unknown state for when the dates are not set yet; a warning (busy) or error (unavailable) on the field after the pick.
- **`SearchSelect`** — new `collapsibleGroups`, `defaultCollapsedGroups`, `renderGroupHeading`, `panelNotice` and `warning` props. Additive: nothing changes without them.

### `DetailRow`, `CommentActions` — one glyph for Edit: `note-pencil` (November 2026)

Edit was drawn two ways: the pen over a square (`note-pencil`) in `Chip`, `InlineEdit` and the
Figma library, and a bare pen (`pencil-simple`) in `DetailRow` and `CommentActions`. Both now use
`note-pencil`, and the stories and examples follow.

**Why.** One action drawn two ways invites the question of whether the controls differ, and the pen
over a square holds up as "edit" at 16 and 20 px where a bare pen can read as draw or annotate.
`docs/icon.md` now records the rule. `pencil-simple` stays in the set, and an exception can be made
for a good reason (say why in the code comment).

### `NotificationItem` — one full stop, and the Light and dark story reads (November 2026)

Fix: a subject that already ends in its own punctuation no longer gets a second full stop. A title "Is this ready?" read "… Is this ready?. A few seconds ago"; it now reads "… Is this ready? A few seconds ago". The same holds for a status at the end of the sentence.

Stories: *Light and dark* and *Markers clear 3:1* were squeezed into the 384px column every NotificationItem story sits in (a story's `decorators: []` adds to the meta's instead of replacing it), so the two halves of Light and dark overlapped. The column now steps aside for full-screen stories, and Light and dark stacks its halves below 1024px. No API change.

### `Stepper`, `Chip`, `CopyText`, `Tooltip`, `Pagination` move to atoms (October 2026)

Each is one self-contained element a designer would name as one thing on a canvas, and each imports nothing from the system but `Icon`, so by the composition rule they are atoms. They move from `src/components/<name>` to `src/atoms/<name>`, and their Storybook titles become `Atoms/<Name>`. Nothing about how they look or behave changes. `CopyText` is now exported from the package root (it was not before).

Migration: import them from the package root as before (`import { Chip } from '@vcp/design-system'`). Inside this repo, change `components/<name>` to `atoms/<name>` in relative imports (`../../components/tooltip` → `../../atoms/tooltip`, `../tooltip` → `../../atoms/tooltip`). Branches that import these from `components/` need the same one-line change.

### `Dropzone` moves to atoms; its edge is a 1 dashed stroke (October 2026)

`Dropzone` imports nothing but `Icon`, so by the composition rule it is an atom: it moves from `src/components/dropzone` to `src/atoms/dropzone` (Storybook title `Atoms/Dropzone`). The dashed edge is now drawn in SVG, 1 thick with 6-long dashes and 4 between (it was a 2 CSS dashed border, whose dash cannot be set), in the same state colours.

Migration: import it from the package root as before (`import { Dropzone } from '@vcp/design-system'`); inside this repo, change `../../components/dropzone` to `../../atoms/dropzone`. The props and behaviour are unchanged.

### `NotificationItem` — "Show more" shows its whole focus ring (November 2026)

Fix: on a long comment preview, the keyboard focus ring around "Show more" / "Show less" was cut off at the top and bottom by the preview card, which clips its overflow, so only its two sides showed, like brackets. The ring is now drawn inside the button, so it shows whole. No API change.

### `SearchSelect` — a pick keeps its name with server search; the label focuses (November 2026)

Fix: with `onSearch`, a pick that dropped out of the current `options` (the search moved on, or the panel reopened and the page reset its list) showed its raw value in the field and its tag, "carl" for Carl Baker. The field now remembers every option it has been given, so the name and the tag's tone stay. For a value set before any search, include its option in the first `options`.

Clicking a `Field` label now focuses SearchSelect without opening the panel, as it does a native `Select` (the label used to pass its click on to the button and open it).

Stories: a visible *Sizes, full width and loading* story shows `size`, `fullWidth` and `loading`, which were only in hidden tests; *Rows* is wide enough for its switcher to read in full; *Light and dark* fills the page side by side instead of overflowing the 240px frame. The docs no longer call server search a future option. No API change.

### `Tag`'s filled brand ✕ shows its pressed fill (November 2026)

Fix: since the dark `action.primary` pressed fill now gets lighter, a filled brand tag's ✕ takes `action.primary.surface.pressed` when pressed, like every other filled tone, instead of holding its hover fill. The Button story *Filled text contrast, both themes* now fills the page, so its dark half no longer stops short under the buttons. No API change.

### `DomainLabel` — the domain pill (October 2026)

New component, to Figma's `_Domain_Label`: the small pill that says which domain something came from, a glyph and two letters ("DS", "DV", "GV", "CN", "PT", "QA"), with an optional "Added by {domain}" tooltip. It owns the domain → glyph, code and name mapping. `FileAttachment`'s corner badge now draws through it (unchanged to look at).

### `DeliverableLinkForm`, `DeliverableLink`, `DeliverablesCard` — what an Added Value delivers (October 2026)

New, to Figma's `Deliverables_Card`. **`DeliverableLinkForm`** (component) takes links: a URL and a title, "+ Add another link", Cancel and Add or Save, checked when pressed ("Please enter a link title", "Please enter a valid URL starting with https://"). **`DeliverableLink`** (component) is one added link: its domain label and a hyperlink, with a pencil and a bin on hover that turn it into the form in place. **`DeliverablesCard`** (pattern) is the card: `domain` picks Links (Design) or Video Links and Links (Development), both with Attachments (`FileAttachment`s and a `Dropzone`); `mode` is `view` or `edit`.

### `AttachmentViewer` — open an attached file full screen (October 2026)

New component: a full-screen gallery for attached files, built on `Modal`. Header with the file's glyph, name and "2 of 4", download and close; previous and next arrows; a strip of thumbnails; an image can be zoomed (− + reset, with the percentage; the keys `+ - 0`), a PDF shows in the browser's own viewer, a video plays, and anything else says there is no preview and offers the download. `DeliverablesCard` opens it from a file card, in view or edit. **`Modal` gains `size="full"`** (the whole viewport, no corners). Icons gain `video-camera` (Video Links) and `arrows-clockwise` (reset zoom).

### `NotificationItem` stories — the hover tests no longer time out in a full `npm test` (November 2026)

Stories only; the component is unchanged. `DotMakesWayForMarkRead` and `DotStaysWithoutMarkRead` move the browser's real pointer, because the unread dot is driven by CSS `:hover`. They moved it with Playwright's `hover()`, which first waits for its target to be visible, stable and unobstructed. That is a dozen or more round trips between Vitest and the page, and in a full `npm test` (several pages at once) they could take the test's whole 15 seconds, so one of the two timed out now and then. Each move is now a single DevTools `Input.dispatchMouseEvent`, and the stories check in the page that the row is, or is not, hovered before they read the dot. The pointer now parks in the screen's bottom-right corner between tests. It used to finish at the top-left, which under Vitest is on the story's row.

### `action.primary` (dark) — hover and pressed get lighter, not darker (November 2026)

In dark, the primary action's label is near-black, but its fill got darker on hover and press, so the label fell to 3.26:1 hovered and 2.23:1 pressed, under the 4.5:1 text rule. The dark `action.primary.surface` states now step lighter, as every dark `accent.*.filled` fill already does: hover `vcp-blue.300` (was `.500`), pressed `vcp-blue.200` (was `.600`), and selected follows hover to `vcp-blue.300`. The label now reads 8.73:1 hovered and 13.69:1 pressed. Everything on these tokens changes with it in dark: primary `Button` and `IconButton`, a checked `Checkbox` and a switched-on `Toggle` when hovered or pressed, the selected `RadioGroup` ring when hovered, and `Field`'s "+" button. Their hover fills and rings also now clear 3:1 against the page (were 2.37:1 on `surface.base`). Light is unchanged. No API change.

### `Tag`'s ✕ keeps its contrast on hover; `CheckboxMark` is tested against `Checkbox` (November 2026)

Fix: on a tag of any tone but neutral, the ✕ dimmed to 70% on hover, which took eight of the 48 style and tone pairs under the 3:1 a control needs (down to 2.74:1, on light tonal warning). Hover and pressed now take the tag's own hover and pressed tokens, which only move away from the background, and a filled tag shows its tone's hover fill behind the ✕. A new *Removable everywhere* story shows the removable tag at every size and in every style and tone in both themes, and its test checks the ✕ at 3:1 at rest, hovered and pressed on all of them. `docs/tag.md` now says to move focus when a tag is removed.

`CheckboxMark`'s story now shows both themes, and its test compares every mark with a real `Checkbox` in the same state, so the two cannot drift apart unnoticed. No API change.

### `MentionInput` — Redo from the keyboard, Textarea's box (November 2026)

Fix: Redo works from the keyboard: Shift+Cmd+Z on a Mac, Ctrl+Y or Shift+Ctrl+Z elsewhere. It did nothing before, because the browser only sends its redo on to a field whose own redo list has something in it, and this field keeps its own. Undo and Redo are now taken from the keys directly; Undo from the Edit menu still works.

The field now has Textarea's box: 12px padding at the sides and 10px at the top and bottom (was 16px all round) and Textarea's rounder corner. Its placeholder fades when disabled, as Textarea's does. A mention tag at the end of a line moves down whole instead of breaking in two. The Light and dark story uses the full width (stacked on a phone), and the other stories fit a phone screen.

### `NotificationItem` — copy, two new kinds, a larger mark-read target (October 2026)

Follow-up to the review fixes in #209, covering what it left for design review. The copy is past tense (`accepted`, `handed off … Ready for Review`), and every sentence ends in a full stop with the time shown capitalised after it ("A few seconds ago"). Two kinds are added, `pending` ("submitted … for approval. Pending") and `completed` ("accepted & completed"), making thirteen, with `pending` listed before `accepted`. The mark-read / mark-unread button has a 40 click area (the 20 icon is unchanged and the text and icon stay where they were), and is named "Mark as read: *Title*" so it is not a repeat of the tooltip. `docs/notification-item.md` records who gets each notification, whether it raises the red dot, and the status it follows. In Storybook the `status` control picks from the shared and domain statuses.

A click on the comment preview does **not** open the item (the comment is content to read and select; only "Show more" / "Show less" and the caller's `previewActions` respond there). This reverses the click-through added in #209, per design.

### `NotificationInbox` — no "Mark all as read" without a handler (October 2026)

Fix: "Mark all as read" was always drawn, so a page that did not pass `onMarkAllRead` showed a button that did nothing when pressed, and a screen reader announced it as a working control. It is now drawn only when `onMarkAllRead` is given, as it already was in `NotificationPopover`. "Show unread only" is unchanged. No API change.

### `Tag` can be removable; `CheckboxMark` (October 2026)

`Tag` gains `onRemove` and `removeLabel`: a ✕ button after the label, for a value picked into a field (also an AV's tags in edit mode). The ✕ is the only interactive part; a Tag without `onRemove` is unchanged. A tag that toggles or opens something is still a `Chip`. The ✕ is 20, the largest that fits inside the 24 tall small tag, so it is under the 40 touch minimum, the exception `TagEditor` already makes; its left margin cancels the tag's gap (`-ml-1` on `xs` / `sm`, `-ml-1.5` on `md` / `lg`).

`Checkbox` gains a `CheckboxMark` export: the box and tick with no input behind it, for rows that are themselves the control. Same box, tokens and tick as `Checkbox`.

### `NotificationItem` — review fixes: the unread dot, `moved` without a status, clicks on the comment (October 2026)

Fixes from the PR #175 review, which reached `main` in PR #176 before they were made:

- **The unread dot only makes way for the mark-read button.** It used to vanish whenever any button in the row had focus (the row itself, "Show more") and on hover even with no `onToggleRead`, leaving nothing in its place. It now goes only on hover or on the mark-read button's own focus, and only when that button exists. The row is now a named group (`group/notification`), so an outer `group` cannot trigger it.
- **`moved` needs its `status`.** The props are now a union on `kind`, so `kind="moved"` without `status` is a type error. At runtime a missing status ends the sentence at the title, and "[Status]" never shows. `status` stays `string | undefined` on `moved`, so a row built from data (`status={event.status}`) still type-checks. `NotificationItemProps` is now a type alias, not an interface, so an `interface … extends NotificationItemProps` no longer compiles. Nothing in the system does that.
- **A click on the comment preview opens the item.** The preview sat above the row's target, so a click on the comment's text did nothing. It now lets clicks through to the row. "Show more" and `previewActions` still take the pointer and keep their place in the tab order.
- Stories: `Static` and `MarkReadTooltip` now test something real. New stories cover each fix: `MovedWithoutStatus`, `CommentOpensTheItem`, `DotMakesWayForMarkRead` and `DotStaysWithoutMarkRead`. The docs' accessible name now matches the real one, and the docs no longer name the unmerged `NotificationInbox`. The note on the tooltip's left placement now gives a reason that still holds.

### `NotificationPopover` / `Popover` — on a short screen, the header and inbox link stay (October 2026)

Fix: on a screen too short for the notification panel above or below the bell, the whole panel scrolled, with its list scrolling inside it, and "View notifications inbox" was pushed out of view. Now the header and the inbox link stay in view and only the list gives way and scrolls. `Popover` makes this possible: while it has shortened a panel, it remembers the panel's full height, so content that shrinks to fit (instead of scrolling) no longer makes it flicker between the two heights. Every other popover behaves as before.

Also: the `LightAndDark` story stacks the two themes so their open panels no longer overlap, `MarkAllRead` shows its rows marked read, and the `NotificationPopover` changelog entry gives the panel's real width (528, not 500). No API change.

### `DropdownStepper` — a disabled control looks disabled (October 2026)

Fix: with `disabled` set, only the text and arrows turned grey. The control kept its enabled white fill and `stroke.strong` border and a normal cursor, so next to a disabled `Stepper`, `Input` or `Select` it looked like the only enabled one. It now takes the Input family's disabled look, the same as `Stepper`: `surface.neutral.subtle` fill, `stroke.subtle` border, a not-allowed cursor. The look follows the `disabled` prop only. An arrow that dies at the end of the list still leaves the control looking enabled. No API change.

### `Popover` — a panel with no room on either side scrolls instead of flickering (October 2026)

Fix: when a popover's panel was too tall for the space both above and below its trigger, it flickered between its full height and its shortened, scrolling height on every frame, about 130 times a second, and never settled. It now settles on the roomier side at the shortened height and scrolls inside. While it scrolls, the panel is in the tab order and shows the standard focus ring, so a keyboard user can reach it, see it, and scroll it with the arrow keys even when nothing inside it is focusable. Everything built on `Popover` gets the fix: `Menu`, `UserMenu`, `EmojiReactionPicker`. No API change.

### `Modal` / `Popover` — Escape closes the open popup first, then the dialog (October 2026)

Fix: with a `Popover` or a `Menu` open inside a dialog, Escape closed the whole dialog. Now the first Escape closes only the popup and the dialog stays open; the next Escape closes the dialog. A dialog over a dialog still closes the inner one first.

The rule any popup follows to get the same: when your popup is open and Escape closes it, call `event.preventDefault()`, and the dialog skips that Escape. `Popover` (and so `Menu`) and `InlineEdit` do. See "Escape and the popups inside" in `docs/modal.md`. No API change.

### Package — `@vdm-design-team/vcp-design-system`, installable by a Next.js app (October 2026)

A Next.js (App Router) app that runs its own Tailwind v4, shadcn/ui included, can now install the system from GitHub Packages and import its components and theme.

- **The package is renamed `@vdm-design-team/vcp-design-system`** (was `@vcp/design-system`). GitHub Packages only publishes a package under its owner's scope, so the old name could never have been published. The new one sits beside GDL's `@vdm-design-team/gdl`.
- **`npm run build` produces the package**: ESM for the `.` and `./tokens` entries, with type declarations. The `./theme.css`, `./tokens.css` and `./tokens.json` paths are unchanged.
- **Every component is a client component.** `dist/index.js` starts with `"use client"`, so Server Components can import and render them. Helpers exported alongside, such as `cn`, can only be called in client code. `./tokens` has no directive, so server code can read token values.
- **`theme.css` no longer imports Tailwind.** The app's own `@import "tailwindcss"` comes first and `theme.css` follows it. `theme.css` now registers the component bundle as a Tailwind source itself, so the app needs no `@source` line.
- `playwright` moves to `devDependencies`. Only the story tests use it, so apps no longer install it.

Migration: install `@vdm-design-team/vcp-design-system` in place of `@vcp/design-system`, with `@vdm-design-team:registry=https://npm.pkg.github.com` in the app's `.npmrc`. Change every `'@vcp/design-system'` import, and its `/theme.css`, `/tokens.css`, `/tokens` and `/tokens.json` subpaths, to `'@vdm-design-team/vcp-design-system'`. In the app's root CSS, put `@import "tailwindcss";` above the theme import and delete the `@source "../node_modules/@vcp/design-system/dist";` line.

### `LegendItem` — new atom; `DonutChart` — `segmented` (October 2026)

`LegendItem` is one entry in a chart legend — a colour swatch and its word — in
two sizes (`md`: 12 swatch + 12 caption for dashboard charts; `sm`: 8 dot + 10
caption for the Gantt chart) on `ProgressBar`'s tones, so a legend can't drift
from its chart. The swatch is `aria-hidden`; the label is the item.

`DonutChart` gains `segmented`: flat ends and a gap between the filled arc and
the remainder (a quarter of `thickness`) instead of a round-capped fill over a
full track — the flat Cycle Summary gauge. Existing rings are unchanged.

`DonutChart` also gains `fillClassName` for a one-off token colour, and
`size="icon"` (a 20 box around a 16 ring, no numeral — the table-row glyph) and an empty `label` (`null`) to draw the ring alone at any size. `LegendItem`
gets `swatchClassName`, and its gap now scales with
the swatch (4 on `sm`, 6 on `md`). No new tokens.

### `DropdownStepper` — new component (October 2026)

One choice from an ordered list — previous / next arrows around a `Menu`
dropdown — ported from Figma's `_Dropdown_with_Stepper`. Controlled or
uncontrolled, `wrap` for cycles, disabled options skipped by the arrows, `sm`/`md`
= 32/40, a polite live region for every change. Composed of `Icon` and `Menu`; no
new tokens.

`invalid` and an optional `error` caption are included: critical border, and a
`role="alert"` caption tied to the dropdown with `aria-describedby`.

### `Stepper` — `up-down` variant and an error state (October 2026)

New `variant` prop: `plus-minus` (default, unchanged) or `up-down`, the number-input
layout from Figma's `_Number_Input_Step` — the value left-aligned like an
`Input` with one up/down caret pair stacked at the end. Same props and behaviour
(draft-based typing, clamping, disabled-at-the-ends); the carets leave the tab
order and Arrow Up/Down covers the keyboard. No new tokens.

Also fixes `Stepper`'s shell greying out as if disabled whenever a nudge button
disabled at `min`/`max`; the disabled treatment now follows the `<input>` only.

`invalid` and an optional `error` caption are new: critical border, `aria-invalid`,
and a `role="alert"` caption tied to the input with `aria-describedby`. `className`
and `ref` now land on an outer wrapper that holds the field and its caption.

### `CommentComposer`, `CommentSection` — the box to write a comment, and a whole comment list (October 2026)

Two new pieces, restructuring the comment set into the right tiers. **`CommentComposer`** (a component) is the box a comment is written in: an optional avatar, the `MentionInput` field and the send button with an optional Cancel. It is also the reply box and the edit box under a comment, so there is one box to learn. Its `onSubmit` may be async: the button shows its spinner, the box clears when the promise resolves and keeps what was typed if it rejects. **`CommentSection`** (a pattern) is the piece to reach for: the title with the sort switch, the new-comment box, and every comment with its replies. Give it the comments as data (a tree) and say what to do on add, reply, edit, delete and react; it holds which threads are open and which box is showing, shows Edit and Delete only on the current user's own comments, and draws the thread lines. `CommentReply` now uses `CommentComposer` for its reply and edit boxes (their `onSubmit` handlers may be async too), and the unreleased `NewComment` pattern is removed, replaced by these two. `Popover` and everything built on it now opens on the side that has room (see `feat-popover-flip`).

### `Popover` — it opens on the side that has room (October 2026)

`Popover` used to open exactly where `placement` and `align` said, even off the screen. They are now what the panel prefers: it is measured as it opens (and when the window or the panel is resized), and if the preferred side is cut off and the other has more room it opens there: above instead of below, or the other way round. A left-flush panel that would run off the right edge turns right-flush. If neither side has room the panel keeps the roomier one and scrolls inside it. It does not re-measure on page scroll, so an open panel never jumps. Everything built on `Popover` gets this: `Menu`, `UserMenu`, `EmojiReactionPicker`, the filter bar's period field. Nothing changes where there is room. No API change.

### `CommentReply`, `CommentReplyThread` — a posted comment and its thread (October 2026)

Two new components, read off the Figma `Comment_Reply` and `Comment_Reply_Thread`. `CommentReply` is one posted comment: the author and time, the text (the `MentionInput` segments, with mentions drawn as `MentionTag`), the `CommentActions` row, and the two boxes you open from it: **replying** (Reply and Cancel under the actions) and **editing** (the box takes the comment's place, filled with it, Save and Cancel). Both boxes open focused, their send button is dim while empty, and `replying` and `editing` are controlled by the caller. `CommentReplyThread` is a comment with its replies as `children` (a `CommentReply`, or a `CommentReplyThread` for a sub-thread), with the thread line drawn: it runs from the avatar into the replies, each reply takes a corner off it, and the line stops at the last one's. The replies are a labelled list that the toggle controls. No new tokens, and no change to the pieces they compose.

### `EmojiReactionPicker` — the "Add reaction" tooltip no longer shows twice (October 2026)

Hovering the add-reaction button showed its tooltip, and then moving down onto the open palette brought the tooltip back a second time before it went away. The tooltip wrapped the whole `Popover`, so the palette, a child of that wrapper, counted as hovering the button. The tooltip now wraps the button alone, which also puts `aria-describedby` on the button itself. No API change, and no change to how the palette opens, closes or returns focus.

### `CommentActions`, `CommentFormActions`, `CommentSortChip` — the comment controls (October 2026)

Three new components for the comments, read off the Figma `_Comment_Control`, `_Comment_Controls` and `_Comment_Filter_chip` sets. `CommentActions` is the row under a posted comment: show or hide replies, Edit, Delete, Reply (or Cancel Reply), Copy Link and a slot for the reactions (`EmojiReactionPicker`). An action shows when it is given a handler, so someone else's comment simply gets no `onEdit` or `onDelete`. Copy Link copies, and only once that has worked turns its glyph into the design's green check and says "Link copied" to a live region; if the clipboard refuses it shows a warning and says so, and with no `link` it claims nothing. `subject` gives each button a name with context ("Reply to Amy Lee's comment"); the replies toggle changes its words, so it does not also carry `aria-expanded`. `CommentFormActions` is the Add Comment, Reply or Save button and its Cancel, as one arrangement of the system's small `Button`, with the dim and loading states. Its one choice is `variant` (`comment`, `reply` or `save`), which fixes the words and whether there is a Cancel; the words are not props. Neither button submits a surrounding form unless you set `type="submit"` on the send button (Cancel is always `type="button"`), and both are 40 tall on a coarse pointer. Cancel is the outlined `secondary` button, as in the system's modals, and the gap between the two is 8. `CommentSortChip` is the "Newest First" / "Oldest First" switch, built on `Chip` (its rounded pill, not the frame's rectangle). No new tokens, and no change to `Button`, `Icon` or `EmojiReactionPicker`.

### `Tag` — two more sizes, `xs` and `lg`, and GDL's updated spacing (October 2026)

`Tag` gains `size="xs"` (20 tall, 10 type) and `size="lg"` (32 tall, 16 type), the smallest and largest sizes of the General Design Library `Tag`. The sizes take the system's usual `xs | sm | md | lg` names in order, so nothing is renamed: GDL's "Medium" is `sm` here and its "Large" is `md`.

GDL also updated the spacing, and the existing sizes follow it. Side padding is 6 on `xs` and `sm` (it was 8 on `sm`) and 8 on `md` and `lg`; the gap between a glyph and the label is 4 on `xs` and `sm` and 6 on `md` and `lg` (it was 8 on `md`). So every `sm` tag is 4px narrower, and a `md` tag with a glyph (`TypeTag`, `UrgencyTag`) is 2px narrower per glyph. Heights and type are unchanged. `docs/tag.md` has the full table, with the icon size for each. Components that pass `size` through, like `DueDateTag`, accept the new values too.

### `SourceTag`, `CycleTag` — the Figma `Source_Tag` and `Cycle_Tag` (October 2026)

Two new components, both a `Tag` wearing one fixed look. `SourceTag` shows where an Added Value came from: the source's name (`source`) in the info tonal fill with the info outline border, as the design draws it. `CycleTag` shows its cycle: `code`, `start` and `end` (ISO dates), written "C18 (Sep 20, 2025 - Oct 02, 2026)", outlined with the lighter `stroke.default` border, at `Tag`'s 28 tall size. The dates are formatted from the string, with no `Date` or time zone. `formatCycleRange` is exported for anything that lists cycles. No new tokens, and no change to `Tag`.

### Tokens — GDL 1.0.0: the pink and teal ramps no longer ship (October 2026)

VCP now builds on `@vdm-design-team/gdl` 1.0.0, still pinned exactly.
GDL 1.0.0 keeps its placeholder brand-slot ramps, `color.primary.*` (pink)
and `color.secondary.*` (teal), to itself, the same way GDL's Figma library
already hides them from publishing.

- `dist/` loses their 22 variables (`--color-primary-{50…950}` and
  `--color-secondary-{50…950}`) and the utilities built on them
  (`bg-primary-500`, `text-secondary-*`, …).
- Nothing in VCP used them, and no semantic token pointed at them. Every
  other token, variable and utility is unchanged.
- They only arrived with VCP's move onto GDL 0.1.0, which hasn't been
  released yet, so no released version of VCP ever shipped them.

Also from GDL 1.0.0: `npm run check:contract` now fails a semantic token that
points at `{color.primary.*}` or `{color.secondary.*}`. Use `vcp-blue` instead.

### `UserLabel` — a person, named in place (October 2026)

New component, to Figma's `Profile_Image_Name_Label`: an avatar, a name and, under it, an optional description ("John" / "Assignee", the `description` prop, named as `Chip`'s second line is), in Figma's two sizes (`md`, a 32 avatar with body type; `sm`, a 24 avatar with caption type). It is display only: a person you can press or remove is a `Chip`. The avatar beside the visible name is decoration, so there is one announcement.

The description line is pulled up directly under the name so the two sit close, matching the Assignee chip.

### `Chip` — the Initiator and Assignee chips, as options (October 2026)

Figma's `_User_Chip_Initiator` and `_User_Chip_Assignee` are `Chip` with more options, not a second component. New, all opt-in: `size="md"` (36 tall), `tone="brand"` (text in `text.brand.strong`), `variant="outline"` (the editing look: a brand border and no fill), `description` (the "Assignee" line under a name), `onEdit` and `editLabel` (a pencil button beside the ✕), `actions="hover"` (the edit and remove buttons appear while the pointer is over the chip or focus is inside it, and are always shown on a touch screen), and `disabled`. Every default leaves a chip exactly as it was; the `Initiator` and `Assignee` stories draw the two recipes.

In an `outline` chip the edit and remove buttons are tonal round buttons (brand and critical) with 2 between them; the divider before a count is `stroke.default`; a role line (`description`) is `text.tertiary`, directly under the name; and the right padding is 12 at rest and 6 once the buttons show, animated with them so nothing jumps. `Avatar` gains `tone="brand"` (initials on `surface.brand.subtle`), used by the people chips.

### `UserMenu` — the signed-in person and their account menu; `TopBar` renders it (October 2026)

New component, to Figma's `User_Menu`: the user's avatar, name and a caret, opening the system's `Menu` of account links. The trigger is `TopBar`'s existing reviewed user chip, moved into a shared piece; the menu holds Settings and Logout by default, and the rest is yours (`items`, `onSelect(key)`), so what Logout does and which links an admin sees stay with the app. The trigger hugs its content in height, and its caret turns up while the menu is open.

`TopBar` takes `userMenuItems` and `onUserMenuSelect`: with either the user chip becomes a `UserMenu`. `onUserMenu` still works as before for an app that opens its own menu, and is ignored when `userMenuItems` is given.

### `Select` — the field reads like `SearchSelect`'s; a new `error` prop (October 2026)

The placeholder is now `text.subtle` in regular weight and a chosen value is `text.primary` in medium, matching `SearchSelect`'s field (the grey is CSS only, via `:has(option[value=""]:checked)`). The native options get explicit surface and text tokens so the popup follows the theme where the browser allows. New optional `error` prop puts a message under the select in the critical colour and announces it with the select; inside a `Field`, keep using the `Field`'s `error`.

The open list stays the browser's, on purpose: `docs/select.md` records why, and points at `SearchSelect` (with `searchable={false}`) for the styled panel. Nothing breaks: the element is still a plain `<select>`, and the DOM is unchanged unless `error` is set.

### `SearchSelect` — rebuilt as the one searchable select (October 2026)

`SearchSelect` is now the system's single dropdown for picking from a list that is too long or too rich for `Select`: a field that shows the value and a panel with an optional search box over the rows, in the look of Figma's Edit Viewers dropdown. **Search lives in the panel, never in the field**; the reasons are recorded in `docs/search-select.md` so they are not reversed by accident.

- **One or several.** A pick closes the panel and the picked row carries a trailing check; with `multiple` a pick toggles, the panel stays open and each row leads with a checkbox. The field shows the name, "3 selected", or with `display="tags"` a removable tag per pick. Tags stay on one line: the ones that fit show and a "+N" stands for the rest; "+N" opens the field out so every tag shows and can be removed in place, and it folds back on a click away, Escape, Tab out or "Show less" (never because a tag was removed). Long labels are cut with "…" and keep their ✕. In a disabled field the tags get an outline so they do not blend into the fill.
- **Rows** can sit under group headings (`group`) and be disabled, and say what they are with `rows`: plain `text` (the default), `avatar` (initials or a photo, and an "Unassigned" glyph), `icon` (a glyph and text) or `tag` (each row a `Tag` in the option's `tone`). `renderOption` draws a row's content when no preset fits; the checkbox, states and ARIA stay the component's.
- **`shortLabel`** on an option is what the field, tags and announcements say when the row's `label` is too long for them (search still matches the full label).
- **`error`** puts a message under the field in the critical colour and announces it with the field.
- **The panel grows to fit its longest row**, at least the field's width and at most 24rem, so a narrow field does not cut its options off.
- **The panel** is `Menu`'s dropdown (surface, edge, radius, shadow, padding, item rows); a click inside it that lands on nothing does nothing.
- **`confirm`** (multiple) drafts the ticks behind a Clear all / Apply footer, as Figma's status menu.
- **`size`** (`sm` / `md`), **`fullWidth`** (off by default, as `Input` and `Select`) **`loading`** (a spinner for the caret and "Loading…" for the rows) and **`onSearch`** for a list searched on the server (the component stops filtering and hands the page the text).
- **`searchable={false}`** drops the search box for a short list; the trigger is then the select-only combobox.

Migration: the old `SearchSelect` was a text input that searched in the field. Its `placeholder` now labels the field (the search box takes `searchPlaceholder`); `renderOption` now receives `(option, { selected, active })` and draws only a row's content; the `avatars` prop and the option's `avatar` field are gone (avatars used to be on by default): pass `rows="avatar"` for a list of people, with `src` or `unassigned` on the option; `onChange` receives a `string` for a single pick and a `string[]` with `multiple` (the old `string & string[]` hybrid is gone). Nothing in this repository imported it.

Builds on the removable `Tag` (`onRemove`) and `CheckboxMark`, which are in their own PR (#210).

### `Tooltip` — the bubble floats above the page (October 2026)

The bubble is now drawn in a portal, `position: fixed` from the trigger's coordinates, instead of as an absolutely-positioned child of the trigger. It can no longer widen a scrolling container it sits in (a tooltip on a button at a row's right edge made the notification popover's list scroll sideways), and no container that clips or scrolls can cut it off. It goes into the nearest `.dark` ancestor when there is one, so a themed wrapper still themes it, and follows the trigger on scroll and resize while open. Placement is unchanged: the same four sides, the same gap, no flipping. The API is unchanged.

### `MentionInput` — a text field with @-mentions (October 2026)

New component: a text field where typing `@` opens a list of members, more letters filter it, and choosing one turns the text into a tag, as in comments. Plain text and tags only; a paste is plain text. The value is segments (text, or a mention with its `id` and `label`), with `mentionedIds` and `plainText` helpers, and a tag in the DOM is the markup TipTap's mention extension writes. The list is a combobox listbox, drawn like `Menu`: ↑ ↓ move, Enter or Tab choose, Escape closes. It opens under the `@` being typed (above it when the screen cuts the bottom off, and never past the screen's edges), not under the whole field. Input-method (IME) and some mobile keyboards are not promised.

The field is plain text only (`contenteditable="plaintext-only"`), has its own undo and redo (a chosen mention is one step), ignores Enter and the arrows while an IME is composing, treats an `@` followed by a space as text, and draws its list in a portal so a scrolling parent cannot cut it off; the highlighted option scrolls into view.

MentionInput is an atom (`src/atoms/mention-input`): it composes nothing, so it sits beside `Textarea`, and its disabled look is Textarea's. `Field` now gives its label an id and passes it to the control as `aria-labelledby` (never over an existing name), and clicking the label focuses a custom control such as MentionInput.

### `NotificationInbox` — the full notifications page (October 2026)

New pattern, to Figma's `Notification_Inbox_Content`: "Mark all as read", "Show unread only", the rows and the pager. The rows are `NotificationItem`, the same component the popover uses (Figma draws a separate inbox row, but it is the same thing in a wider list). Controls and pager are right-aligned; "Mark all as read" is always shown, and the pager is the large one with the Items select (`pageSize`, `pageSizeOptions`, `onPageSizeChange`). It reports the switch and page changes and leaves the filtering and paging to the caller.

### `NotificationPopover` — the bell and the panel that opens from it (October 2026)

New pattern, to Figma's `Notification_Popover`: the `NotificationBell` that opens a 528-wide panel with the All / Mentions filter, the "Unread only" switch, an overflow menu with "Mark all as read", the list of `NotificationItem`s (passed as children), and a "View notifications inbox" link. It reports filter and unread-only changes and leaves the filtering to the caller. Also exports `NotificationBell` and `NotificationItem` from the package index.

Also adds the `dots-three-outline-vertical` and `dots-three-outline-vertical-fill` glyphs, which the popover's overflow menu button uses (filled).

### `NotificationItem` — one row in a list of notifications (October 2026)

New component, to Figma's `Notification_Item`: the actor's avatar, a sentence for each of the design's eleven kinds of event (commented, mention, moved, accepted, updated, rejected, rejected with feedback, assigned, backlog, handoff, viewer) with the design's bold and regular runs and the time, and a trailing check: the unread dot on an unread row, which dissolves into an outlined check-circle (mark as read) on hover and focus, and, on a read row, nothing at rest and a filled check-circle (mark as unread) that dissolves in on hover and focus. The whole row is the target (`href` or `onSelect`). An optional comment preview shows three lines in a bordered card with "Show more", with no bottom padding on the text while the button follows. The reply and emoji controls under a preview are not built; `previewActions` is where they go.

The mark-read button has the design's tooltip after a half-second hover ("Mark as read" / "Mark as unread").

### `NotificationBell` — the bell and its unread dot, as a piece of its own (October 2026)

New component: the notification bell, an `IconButton` with the design's red dot (10 on a 20 glyph, in `accent.critical.filled.surface.default`, with a halo that pulses three times, 1.5s each, when the count changes, then stops; reduced motion removes it). The count is in the button's name ("Notifications, 3 unread"); the dot is decoration. It passes every prop to its button, so it works as a `Menu` or `Popover` trigger. `TopBar` now uses it instead of drawing the bell inline: nothing changes visually or in `TopBar`'s props.

### Status tones — `danger` is now `critical`, matching the token family and Figma (October 2026)

The severity tone was called `danger` in the props but `accent.critical` in the tokens and `Critical` in Figma. The props now say `critical`. It changes on the components that colour by severity: `Badge`, `Tag`, `StatusTag` and `DueDateTag` (through the shared classification tones), `Toast` and `useToast`, `Banner`, `ProgressBar`, `DonutChart`, `DatePicker` markers and `Timeline`.

The **destructive-action** names are unchanged: `Button` and `IconButton` `variant="danger"`, `Menu` item `tone: 'danger'` and the status-progression Reject variant all mean "this action destroys something", which is not the same word as a severity, and they stay `danger`.

Migration: replace `danger` with `critical` wherever it is a tone, type or marker on the components above: `tone="danger"` becomes `tone="critical"` on `Badge`, `Tag`, `Banner`, `ProgressBar` and `DonutChart`; `toast({ tone: 'danger' })` becomes `toast({ tone: 'critical' })`; `markers={{ '2026-09-22': 'danger' }}` becomes `'critical'`; the `Timeline` item `tone: 'danger'` becomes `'critical'`; and the exported types `ToastTone`, `BannerTone`, `TimelineTone`, `ClassificationTone` and `DatePickerMarker` now list `'critical'` in place of `'danger'`. Leave `Button`, `IconButton` and `Menu` alone.

### Tokens — VCP builds on GDL, the parent design system (October 2026)

VCP's shared scales now come from `@vdm-design-team/gdl` 0.1.0, the same way
the VCP Figma library subscribes to the GDL library.
`tokens/` keeps only what is VCP's own:

- the `vcp-blue` ramp and `brand.navy`
- the UI face (`font.family.sans` → Poppins) and the emoji stack
- radius, shadow and border-width names
- the semantic colours

The rest comes from GDL: the colour families, spacing, Inter and the
weights, and the 47-style type ramp. The build uses GDL's formats.
`npm run check:contract` (in `npm test` and CI) checks the semantic colours
against GDL's contract.

Every utility and variable components use is unchanged, except one value:

- **`color.green.800` is `#016630`.** It was `#008236`, a copy of `green.700`.
- It feeds `accent.green.strong` and `accent.success.{filled.surface,outline.content}.hover`
  in light mode.
- In dark mode it feeds `accent.green.faint`, `accent.success.tonal.surface.hover`,
  and the success tonal and outline disabled content.
- Every pair gains contrast:
  - The `green` tone in Avatar and TagEditor (dark): 4.50:1 → 6.49:1.
  - Banner and Toast success hover (dark): 4.10:1 → 5.91:1. It now passes AA.

New from GDL, all additive:

- **Colour ramps:** `color.orange.*`, plus GDL's brand-slot ramps
  `color.primary.*` (pink) and `color.secondary.*` (teal). VCP doesn't use
  the brand-slot ramps; keep using `vcp-blue`.
- **Shape:** px-named `radius.{0…64,full}`, `shadow.elevation.{1…7}` (light
  and dark), `stroke-width.*`.
- **Spacing:** `space.{0,44,80,128,256}`.
- **Type:** the `font-inter`, `font-poppins`, `font-gotham-pro`, `font-montserrat`
  and `font-gotham-rounded` families, `font.weight.light`, and `font.size.*`.
- **Desktop type:** `dist/typography.desktop.css`, desktop type sizes behind
  `data-type-scale="desktop"`. Opt-in, and not wired into the ramp.

Two changes to build output that nothing in VCP reads:

- `dist/tokens.css` no longer repeats the dark theme as `--dark-*` variables
  in `:root`. The dark theme is `dist/tokens.dark.css`, unchanged.
- `type.body-md-regular` and `type.label-md-medium` lose their `$description`
  in `tokens.json` and `tokens.ts`.

Contributors: `npm install` now needs a GitHub token with `read:packages`,
once per machine (see the README).

### `ReviewAVModal` — 14px labels and values, and a 20px checkbox (October 2026)

The field labels are 14 regular in `text.tertiary` (they were 12 medium in `text.secondary`) and the values under them are 14 medium in `text.primary` (they were 14 regular). The domain option checkbox is the 20px size.

### `TopBar` / `Toggle` — a switch for the left side, the divider, the bell, and a sun and moon switch (October 2026)

`TopBar` gains `showLeftSide` (default `true`): `false` leaves the left side empty (no action, no logo), for screens like the AV editor that show nothing there. A vertical divider now sits between the bell and the mode and user group. The bell is neutral instead of brand blue, with a 10px dot (it was 8) in `accent.critical.filled.surface.default`. A halo pulses behind it three times, 1.5s each, when the unread count changes, then stops; reduced motion removes it. `Toggle` gains `knobIcons`, a glyph in the knob for each state, and the mode switch uses it for the sun (light) and moon (dark). Adds the `sun`, `sun-fill`, `moon` and `moon-fill` glyphs.

The user chip had 4px of padding all round, and its caret drew 7px from the right edge while the avatar sat 4px from the left. The chip now has 8px left and right (4 top and bottom), and the caret's box is pulled 3px into the padding, so both sides measure 8. The mode switch and the user chip are now one group with an 8px gap between them (the bar's other gaps are 16).

### `Sidebar` — the bottom row keeps a gap above it (October 2026)

Design review: "Report a problem" is pinned to the bottom of the rail, but in a rail with no
room to spare it sat straight under the last nav item and read as one of them. It now keeps
at least 32 above it (`mt-8`); a rail with room to spare is unchanged. The Every User Type
and Both Widths stories are sized to their rails' content instead of the window, so a short
preview no longer pushes items out past the rail's border. No API change.

### `Sidebar` — the domain selector is Figma's dropdown, built on `Menu` (October 2026)

The domain switcher was a native `Select`, bordered like a form field. It is now Figma's `_Domain_Selection_Dropdown`: a filled trigger with an up-down caret and a `neutral.outline.border` stroke (default, hover, pressed and disabled states). The caret follows the border's colour. The trigger opens the system's `Menu` at the trigger's width, and is 40px tall, the minimum target.

`Menu` gains a `selected` flag on its items, which renders `role="menuitemradio"` with `aria-checked` and a check icon, so the current choice is announced and shown without relying on colour. The Sidebar passes the current domain, so the open list marks it. It is additive: items that do not set it are unchanged.

The props (`showDomainSelector`, `domain`, `domains`, `onDomainChange`) are unchanged. The trigger's accessible name is now "Domain: <current>. Change domain".

### `font.family.emoji` — emoji take a colour emoji font (October 2026)

**New** (minor): the core token `font.family.emoji` (utility `font-emoji`) —
`Apple Color Emoji`, `Segoe UI Emoji`, `Noto Color Emoji`, `Twemoji Mozilla`, then
`sans-serif`. It names the colour emoji fonts first, so a platform's text-style fallback
cannot claim an emoji's code point before them.

`EmojiReactionPicker` uses it on the palette cells and on the pills' emoji. Why: in
Chromatic (which renders on Linux) the picker's 😄 😅 😂 😮 😊 rendered as monochrome
outline faces while the rest rendered in colour (design review of build 41 on #124).
macOS and Windows already chose a colour font, so it never showed locally. No API change.

### `FileAttachment` and `Dropzone` — the attachments elements, to the design (October 2026)

Follow-up to #126; built to Figma's attachments elements.

**`FileAttachment`**
- **New `domain` prop** — the corner badge for an AV handed over from another domain, with
  its glyph and code: Design DS, Development DV, Governance GV, Content CN, Partners PT,
  QA QA. The mapping is owned by the component. `domainLabel` / `domainIcon` stay for a code
  outside the six. New icon: `file-magnifying-glass`, with its `-fill` partner (every glyph ships both weights).
- The remove button sits **2 in from the top-right corner** (was flush).
- **Fixed:** a short name was pushed to the card's right edge; it now stays centred under the glyph.
- A remove-only card (`onRemove`, no `onClick`) takes the hover fill, as edit mode draws it.

**`Dropzone`**
- **2 dashed `stroke.strong` border** (was 1 dashed `stroke.strong`) on `surface.neutral.faint`
  (was `surface.elevated`); **24 padding, 8 gap**; a **32 `paperclip`** in `text.subtle` (was a 24 cloud).
- **Copy:** the label defaults to **"Upload a file"** (was "Choose files") and the hint to
  "PNG, JPG, GIF, DOCX, CSV and PDF file up to 10MB"; line one is 14 regular `text.primary`
  with an underlined link-blue verb, the hint `caption-md-regular`.
- **States:** drag-over is `stroke.focused` on `surface.brand.subtle` (was `brand.base`), and a
  drag **within 16 of the zone** counts; error keeps the **regular fill** with a critical
  stroke (was a red-tinted fill and a warning glyph).
- `HandoffAVModal` takes the new copy by dropping its "Attach Files" override.

Migration: callers that relied on "Choose files" or the 1 `stroke.strong` border pass `label` or
restyle; nothing else.

**`Dropzone` border, a deliberate exception:** the resting dashed border is `stroke.strong`, not the design's `stroke.default` (1.42:1), so a control's boundary clears 3:1. The weight, fill and states are the design's.

### `Menu` — opening with a pointer no longer highlights the first item (October 2026)

Opening a `Menu` moves focus to its first item, and the item highlight rode plain `:focus`,
so the first item looked hovered the moment a mouse opened the menu. The highlight now rides
`:hover` and `:focus-visible`: a pointer-opened menu is clean; a keyboard-opened one (or any
arrow-key move) still highlights the focused item, with the focus ring on top. Danger items
likewise. Focus still moves into the list on open; only how it is drawn changes. No API change.

### `Icon` — nine sizes, and a fill for every glyph (October 2026)

- **Sizes:** `size` takes 10, 12, 16, 20, 24, 28, 32, 40 or 48 — the sizes Figma draws every icon at — instead of only
  `sm` / `md` / `lg`. Those three still work as 16 / 20 / 24 (default stays `md`, 20). Exports `ICON_SIZES`, `IconSize`.
  The glyph already sits centred with a margin from the edges (Phosphor's own 256 artboard), at every size.
- **Regular and fill:** every glyph now ships both. 83 `-fill` glyphs added from Phosphor, plus `check-square` (it had
  only a fill), `caret-triple-up-fill` (built like the regular) and `smiley-plus-fill` (Figma, node 3605:1853). Still without
  a fill: the in-house `assigned-value` and `rectangle-stack`, which Figma doesn't draw filled. `rectangle-group-fill` comes from Figma
  (node 3129:61076).
- **Figma's own glyphs override Phosphor's** for `user`, `user-check`, `user-plus`, `user-minus`, `user-sound`, `users`,
  `users-three` and `fire` (Regular and Fill). Same names, redrawn shapes; `user-plus`, `user-minus` and `user-sound` are new.

### `PageTitle` — back arrow and title (October 2026)

- The arrow and the title share a centre line (the title sat above the arrow).
- **The back arrow is neutral** (`neutral.outline.content`, with hover and pressed) instead of the action blue, and **hugs its
  20 × 20 glyph** — no padding either side — with 8 to the title. A `::after` keeps the pointer target 40 × 40. The band with a back
  arrow is now 74, not 88. `onBack` renders a plain `button`, no longer an `IconButton`.
- **New `size` prop** — `md` (default) is the title at 18 semibold, `sm` at 14 medium; both `text.secondary` (was 20
  semibold `text.primary`). The title is smaller than before by default.

### `DataTable` cells — copy, inline edit, column hints, always left-aligned (October 2026)

- **`InlineEdit` is reworked to Figma's buttons** (`_Planning_Table_Icon_Button`): cancel on the left, confirm on the right, 24 tonal discs, the pen a
  `note-pencil` with an "Edit" tooltip. **New `InlineDateEdit`**: a date with a calendar button that opens a `DatePicker` in a popover; picking a
  day commits it, no confirm. The Inline Editing story now shows all three kinds: type, choose, calendar.
- **`InlineEdit`: clicking outside an editing cell cancels it; the pen and the calendar button are drawn on hover or keyboard focus only (they stayed
  drawn after a mouse click closed the editor); the control sits 6 from the cancel and confirm buttons, and the two buttons are 4 apart.**
- **`IconButton` gains `variant="tonal"` and `size="xs"` (24, 16 glyph).** New tokens `neutral.tonal.surface.{hover,pressed,disabled}` and
  `neutral.tonal.content.{hover,pressed,disabled}`, from Figma's `colors/neutral/tonal/*`.
- **New `CopyText`**: a non-link value that underlines on hover and, on click, copies itself and shows "Copied" for 800ms
  (Figma `_AV_Table_ID`, `7247:39763`). **New `InlineEdit`**: a value with a pen that swaps to a caller-supplied control with confirm and
  cancel buttons, Enter/Escape and focus handling.
- **Header order: label, hint, then the sort arrows** ("Supplier ⓘ ⇅"). The sort button is now the label alone, with an overlay that makes
  the arrows clickable too, and the hint raised above it; still one tab stop per control.
- **`ColumnHint`** is exported from `DataTable` — the header info glyph with a tooltip, formerly private to `AVTable` (which now uses it).
- **Breaking:** `DataTableColumn.align` is removed. Cell values and headers are always left-aligned. Migration: delete `align: 'right'`;
  nothing in the repo used it outside the DataTable story.
- New stories: Actions Column (a `Menu` on a `dots-three` — horizontal — button), Column Tooltips, Copyable Column, Inline Editing; and a
  "How developers customise it" section in `docs/data-table.md`.
- **Known limit:** a `Menu` in a row is clipped by the table's scroll container (no portal); the story uses `className="overflow-visible"`.

### `Banner` — aligned with Figma (October 2026)

Read off the General Design Library's `Banner` (`3494:1336`), design review.

- **Title 16 semibold** (`title-sm-semibold`; was 14 medium); body stays 14 regular. **Padding 16 all round** (was 14 / 12), **8** between the icon
  and the text (was 12), 2 between title and message (was 4).
- **Icons are `fill`, 20 × 20**, and the tones follow Figma's shapes: **warning is the exclamation in a circle** (`warning-circle-fill`, was
  the triangle), **danger/critical is the exclamation in a triangle** (`warning-fill`, was the cross-circle), info is `info-fill`, success keeps
  `check-circle-fill`. New icons: `info-fill`, `warning-circle-fill`.
- **The glyph is the tone's `outline.border.default`** (Figma's bright colour; was the dark text colour) and is **vertically centred on the title line**
  (`mt-0.5`: 20 glyph on a 24 line). It is below 3:1 on the tint (1.78–3.12:1 light, 1.98–2.95:1 dark): a recorded exception, see `docs/banner.md`.
- **The stroke is Figma's `outline.border.default`** (was `outline.content.default`): red-500, yellow-500, blue-500, green-500. It is cosmetic, and
  no longer clears 3:1 on the page; `docs/banner.md` has the figures.
- **New `showIcon` prop** (default `true`): the tone glyph is optional. Off, the tone word is announced from visually hidden text, so assistive tech keeps it.
- **Storybook:** the Default story has *icon*, *action button* and *dismiss button* controls, so both optional elements can be added or removed live.
  The component API is unchanged — they are still optional (`actionLabel` + `onAction`, `onDismiss` + `dismissLabel`).

### `StatCard` — the super admin card's stripe is 8 (October 2026)

The super admin dashboard's single cards now draw the same 8 left stripe as the Value_Card (was 12). `StatCardGroup` is unchanged: it has no stripe. No API change.

### `stroke.strong` is the control boundary; `stroke.field` is removed (October 2026)

`stroke.field` was a token too specific to earn its place — named for a component, with `stroke.strong` sitting unused beside it. Making `strong` the control-boundary
colour keeps the variables streamlined and meets WCAG AA (1.4.11) for a control's boundary.

- **`stroke.strong` now holds the control-boundary colour:** slate-500 in light (was slate-400), slate-400 in dark (was slate-500) — the values `stroke.field` held. It clears
  WCAG 1.4.11's 3:1 in both themes (4.76:1 / 4.55:1 on white / canvas in light; 5.71:1 / 6.96:1 in dark). Nothing used the old `strong`.
- **Breaking: `stroke.field` is removed.** Migration: `border-stroke-field` → `border-stroke-strong` (Input, Select, Textarea, Checkbox, RadioGroup, Dropzone,
  SearchSelect, Stepper — all migrated here, so **nothing changes visually**). Figma's `stroke/strong` was set to match.
- `stroke.default` stays the decorative everyday border (1.48:1). `scripts/import-figma-tokens.mjs` now pins `stroke.strong` instead of adding `stroke.field`.
- `docs/color-tokens.md` documents the roles.

### `Avatar` and `AvatarGroup` — four sizes, and the stack's order (October 2026)

Design review of build 20 (#121).

- **`Avatar` has four sizes**, each with its own type: `xs` 16 / 10 (`caption-sm-medium`),
  `sm` 24 / 12 (`caption-md-medium`), `md` 32 / 12 (`caption-md-medium`) and
  `lg` 36 / 14 (`label-sm-medium`). **Two things change for existing callers:** `md`
  text goes from 14 to 12, and `lg` goes from 40 to 36. `xs` is new. Nobody in the
  repo uses `lg` today; the `TopBar` and `AVTable` avatars are `md`, so their initials
  get smaller.
- **No size is 40 any more**, so none meets the 40 minimum target on its own. An avatar
  wrapped in a control needs padding on the control (documented in `docs/avatar.md`).
- **`AvatarGroup` takes the same four sizes** (its `+N` chip and overlap follow), and
  **the leftmost person is now on top** with each one after them behind (it was the
  reverse). Set with `z-index`; the markup and reading order are unchanged.

Migration: none required for `sm`/`md` callers beyond the smaller `md` text.

### `AVHeader` — a brand hover on the back arrow, and 32 padding at the sides (October 2026)

Design review of build 8 (#122).

- **The back arrow hovers to `text.brand.medium`** (was `action.tertiary.content.hover`, a
  navy too close to its near-black resting colour to read as a change). Both the link and
  the `IconButton` forms.
- **The header's side padding is 32** (`px-8`, was 16), matching `PageTitle` and the page
  body, so the title sits on the same left edge as the content below it. Top (32) and
  bottom (16) are unchanged.

### `RadioGroup` — 8px between the radio and its label (October 2026)

The gap was 10. It is 8 now, matching `Checkbox` and `Toggle`, so every control-to-label gap in the system is the same.

### `SegmentedControl` — five sizes, strokes (October 2026)

- **Sizes** follow Figma's `Segmented_Control`: `xs` / `sm` / `md` / `lg` / `xl` = 28 / 32 / 36 / 40 / 48 high, track padding exactly 4 (the stroke is an inset ring and takes no room), segments fill
  20 / 24 / 28 / 32 / 40 with 6 / 8 / 12 / 12 / 16 either side, type 12 / 14 / 14 / 14 / 16 medium. **`xl` is the default.**
- **Strokes:** the track and the selected segment each draw a 1px `stroke.default`; the selected segment keeps its `shadow.card`,
  the lightest elevation.
- **No gap between segments** (was 2px) — Figma's item spacing is 0.
- **`Field`'s error message** (the caption under an invalid control, e.g. a failed save) is now `accent.critical.outline.content.default`,
  the colour of the invalid border, instead of `.tonal.content.default`. The required marker is unchanged.
- **Breaking:** `size` was `sm | md` (default `md`). Migration: old `sm` (32 segment) is now `lg`; old `md` (40 segment, the default)
  is now `xl`. Callers that pass no `size` get `xl`, a little taller than before (48 vs 46).

### `Accordion` — even padding on the open content (October 2026)

The expanded panel's content now has 12 above and 12 below (`py-3`), the header row's own padding, so the paragraph sits as far from the header as from the card's bottom edge. It was 14 below with nothing above. The sides are unchanged: 14 on the right, 40 on the left. No API change.

### `Checkbox` / `AcceptPendingAVModal` — a 20px checkbox, and the multipart card's type (October 2026)

`Checkbox` gains `size`: `sm` (16, the default and unchanged) and `md` (20, with a 14 glyph and a 10px padding that keeps the 40 target). The Accept Pending AV modal's multipart card uses `md`, and both its title and its explanation are now 14 medium (`body-sm-medium`), in `text.primary` and `text.tertiary`. They were 12 medium.

The multipart card no longer overrides the checkbox's gap: box to label is 8, the same as every checkbox and toggle.

### `Carousel` — neutral arrows (October 2026)

The left and right arrows are `neutral.outline.content` (default, hover, pressed, disabled) instead of the action blue. No API change.

### Breaking: `StatusPill` → `StatusTag`, `DueDatePill` → `DueDateTag` (October 2026)

Both have been built on `Tag` (the rounded rectangle) since #134 — design called them tags, not pills — but kept their old names
so that change stayed visual-only. The names now match what they are. **No behaviour, prop or token changes.**

- **Migration:** rename the imports and types. `StatusPill` → `StatusTag`, `StatusPillProps` → `StatusTagProps`, `DueDatePill` →
  `DueDateTag`, `DueDatePillProps` → `DueDateTagProps`; the import paths `components/status-pill` and `components/due-date-pill` become
  `components/status-tag` and `components/due-date-tag`. Everything else exported (`AVStatus`, `DueDateProximity`, `dueDateTone`, …) keeps its name.
- Also renamed: the Storybook titles (`Components/Display/StatusTag`, `…/DueDateTag`), `docs/status-tag.md`, `docs/due-date-tag.md`, and every
  mention in the docs, `CLAUDE.md` and the plugin's project notes. Earlier changelog entries and `docs/figma-audit.md` keep the old names — they
  describe how things were. No caller in the repo outside `AVTable`, `AVHeader`, `StatusProgression` and the stories used them.

### `RichTextToolbar` — the floating selection toolbar, to the design (October 2026)

Rebuilt from the design's toolbar markup, on tokens, with our toolbar accessibility kept.

- **A floating card, not a strip:** `surface.elevated`, `stroke.subtle`, `shadow.menu`, 8 corners, 6 padding, 4 between controls. The editor places it over
  the selection (a new **Floating On Selection** story shows how); the component does no positioning. Pressing a button no longer collapses the selection
  (`mousedown` is swallowed).
- **32 buttons with 16 line icons** (were 28, with the letters B I U S): `text-b`, `text-italic`, `text-underline`, `text-strikethrough`. Glyphs `neutral.outline.content`; hover
  `surface.neutral.subtle`, press `surface.neutral.medium`; 24-high dividers.
- **Three groups, the design's order:** text styles · numbered list, bulleted list · link, **unlink**, **block quote**, **code block**, undo, redo.
- **Breaking:** the `file` command is removed (VCP has no such function); `quote`, `code` and `unlink` are added. `image` stays, **opt-in**: the default set is the twelve,
  and the comment editor adds it. `ol` now comes before `ul`; undo and
  redo are in the last group. Migration: drop any `file` handling (`image` is now opt-in via `commands`); add `quote`, `code`, `unlink` to the `onCommand` switch.
- **The glyphs are `neutral.outline.content`** (default, hover, pressed, disabled) instead of `text.secondary`; the hover moves from the brand tint (`surface.brand.base`) to neutral `surface.neutral.subtle`, with a new `surface.neutral.medium` press fill. 7.58:1 at rest in light, 9.85:1 in dark; the lowest is 4.34:1 (dark, pressed).
- **Insert image sits left of undo and redo** (undo/redo stay the rightmost pair), and **new `useSelectionToolbar` hook**: shows the toolbar over a finished selection and hides it
  the moment there is none — on any click, key or programmatic change (it listens to `selectionchange`), not only clicks inside the editor.
- **`commands` prop** — the editor declares which commands to show (`DEFAULT_RICH_TEXT_COMMANDS`, `ALL_RICH_TEXT_COMMANDS` exported); `[...DEFAULT_RICH_TEXT_COMMANDS, 'image']` for comments. Order and groups
  are fixed; empty groups drop their divider.
- **`open` prop and motion:** the toolbar dissolves in with a 4px drop and fades out before leaving the DOM (150ms; none under reduced motion). The card is an inner layer so the editor's
  positioning is not animated.
- **Undo and redo** are disabled by the editor through `disabledCommands` (`{ undo: !canUndo, redo: !canRedo }`); the Default story demonstrates a live history.
- **Keyboard:** the arrows now skip disabled buttons (they used to land on one and strand the tab stop). Dividers are `role="separator"`.
- New icons (each with its fill): `text-b`, `text-italic`, `text-underline`, `text-strikethrough`, `link-break`, `quotes`.

### `Tooltip` — a light card, as Figma draws it (October 2026)

The bubble was a dark inverted surface (`surface.neutral.stronger` + `text.inverted.primary`) — the original export's look, carried over when the component was rebuilt on tokens. Figma
draws a light bubble, and our own figma-audit note ("dark-on-light per the design … consistent with what we ship") had it backwards. It is now `surface.elevated` with `text.primary`, a
1px `stroke.default` edge, the menu shadow and 12 / 8 of padding (sides / top and bottom; was 10 / 6) — the `Popover` / `Menu` / `Toast` family. It flips with the theme like them (white in light, `#1e293b` in
dark): 20.17:1 / 14.63:1. Every tooltip in the system changes (column hints, the StatCard hint, the sidebar, the emoji picker). No API change.

### `TagEditor` — flagged: no Figma source (October 2026)

Docs and Storybook only. `TagEditor` was ported from the original export and has no Figma source; checked against the *Tag Management* page, it matches no part of it (that page is cards of rows
with Add New / edit / delete buttons plus add and delete modals — no tone swatches, coloured tags or inline form). Flagged in `docs/tag-editor.md`, the Storybook description,
`docs/inventory.md` and `docs/figma-audit.md`. No code change; nothing in the repo imports it.

### `Toast` — the Figma design: a neutral card, tone in the icon and timer bar (October 2026)

The tinted card is gone. A Toast is a white `surface.elevated` card with a `stroke.subtle` border, 16 padding, the `md` radius and 8 gaps (all the Banner's), and it hugs its content up to `max-w-sm`. The tone shows only in the filled glyph and the solid timer bar (the accent's `outline.border.default`): `info-fill`, `check-circle-fill`, `warning-circle-fill` for warning and `warning-fill` for critical. Title is 14 semibold `text.primary`, the message is 14 medium `text.secondary`. The action is the standard small secondary Button, top-aligned just left of the close control, which is a neutral round icon button. Adds the `info-fill` and `warning-circle-fill` glyphs.

Also: `ToastViewport` packs the stack against the edge it is anchored to (flush right for the right positions, centred for the centred ones). A short toast no longer sits at the left of the 384px column, and toasts of mixed widths line up.

Also: a toast with only a title (or only a message) centres its row, so the glyph, text, action and X share a midline. With both a title and a message the controls stay on the first line.

Also: a blank `title`, message or `actionLabel` (absent, `false` or an empty string) renders nothing, so clearing a control in Storybook no longer leaves an empty description box. No new props.

### `Modal` — focus-ring room, scroll clearance, one header gap, no empty parts (October 2026)

Fix: the last field's focus ring was clipped at the bottom of the body. The body now keeps 4px of bottom padding with a footer, and the footer's top padding is 4px shorter, so the visible gap stays 20.

Fix: on long, scrolling content the body ran hard against the subtitle. Part of the header-to-body gap now lives in the header, so it stays put while the content scrolls.

Change: the gap between the header and the body is one fixed 12, whether or not there is a subtitle and whatever the body opens with. It was 20, and briefly depended on the body's first element. Split as the header's 8 plus the body's own 4.

Change: an optional part that is empty renders nothing. A blank `description` or `footer` (absent, `false` or an empty string) leaves no empty caption or action row holding space, and a blank `title` no empty heading. No API change: there are no new props.

### Changelog entries are one file per PR (October 2026)

Each PR now adds its changelog entry as its own file in `changes/`, instead of
editing this file, so a merge no longer makes every other open PR conflict
here. `npm run changelog` folds the files into this file at release and sets
the version from their `bump` (`patch`, `minor` or `major`). `npm test` and CI
fail a PR that changes `src/` or `tokens/` without an entry, or that edits
`CHANGELOG.md` directly. The format is in `changes/README.md`. No change to
the components or tokens.

### `Sidebar` / `Logo` — the rail's logo keeps its size and sits on the glyph axis (October 2026)

Design review of the collapsed rail:

- **The diamond is the same size collapsed and expanded.** It was 24 wide collapsed but
  20 inside the expanded lockup; it is now 20 in both.
- **It is centred on the nav glyphs** (x = 32) instead of on the 76 rail (x = 38), and
  sits in the same place in both states — the wordmark appears beside it. The expanded
  lockup moves 2 left (inset 22, was Figma's 24) so the diamond doesn't shift.
- **`Logo collapsed` is the lockup's own diamond, in the lockup's frame height** (was a
  separate export in a tight box): at the same `size`, mark and lockup draw an identical
  diamond. A standalone `Logo collapsed` at a given `size` is therefore about 5% smaller
  than before (the frame now includes the lockup's bottom margin). No API change.

### `SidebarItem` — the collapsed caret is a chevron again (October 2026)

Design review: in the collapsed rail, a row with sub-items (Archive, Planning) shows the
**chevron** (`caret-down`, 12) beside its glyph, like the expanded row's caret — not the
filled triangle (`caret-down-fill`) #141 introduced. Same size and place; it still does not
flip when the flyout opens. No API change. `caret-down-fill` stays in the icon set (the
`DatePicker` heading uses it).

### `Badge` — type sizes per size, and a large size (October 2026)

Each size now has its own type size, and there is a third size.

- **Type:** `sm` 10 (`caption-sm-medium`), `md` 12 (`caption-md-medium`) and the new
  `lg` 14 (`label-sm-medium`). All three were 14 before, so **every existing `sm` and
  `md` Badge now renders smaller text** — in product code, the version Badge in
  `ChangeLogModal`. (`StatusPill`, `DueDatePill` and the AV table's labels are `Tag`s
  since the tags-not-badges change and are unaffected.) Heights are unchanged (24 / 28).
- **New `size="lg"`:** 32 tall, 12 either side (`px-3`), 14 type. Fixed height, pill shape,
  same styles and tones as the others.

Migration: none required; a caller that wanted the old 14 type on an `md` Badge can use `lg`.

### Status, due dates and tables are tags, not badges (October 2026)

Design review of the `Tag` / `Badge` split (Chromatic build 27 on #117): a status, a
due date and a table cell are tags — the rounded-rectangle — not the pill.

- **`StatusPill` and `DueDatePill` are now built on `Tag`** (they composed `Badge`).
  They keep their names, props and tone mappings; only the shape changes, from the
  pill to `Tag`'s rounded-rectangle, and their `size` prop is now `Tag`'s.
- **`AVTable`'s domain label is a `Tag`**, and the `DataTable` story's status cells are
  `Tag`s.
- **`Tag`'s `sm` size is 12 type** (`caption-md-medium`; was 14). `md` is unchanged at 14.
  That also shrinks `StatusPill`/`DueDatePill` at `sm`.

`Badge` is unchanged here and is still the pill, used where something is a badge
(for example the version in `ChangeLogModal`).

### AV table glyphs match Figma: the Urgent flame and the sort icons (5 October 2026)

**Changed, visually** (no API change):

- **`UrgencyTag`'s Urgent flame is Figma's own** — the new in-house glyph
  `fire-solid`, exported from the design file (Heroicons' mini `fire`, a solid
  flame with the inner tongue cut out). Phosphor's flames don't read the same
  at 20, so this is a named exception to Phosphor-only, listed in
  `docs/icon.md`. All four urgency glyphs are now Figma's 20 (were 24).
- **`DataTable`'s sort glyphs are Figma's `_AV_Table_Sort`**: `arrows-down-up`
  when unsorted, `sort-ascending` / `sort-descending` when sorted, 20 and
  `text.secondary` (were `caret-up-down` / `caret-up` / `caret-down` at 12,
  unsorted in `text.subtle`). `AVTable` inherits both.

### `SidebarItem` / `Sidebar` — a flyout for the collapsed rail, and regular sub-items (October 2026)

Design review of build 39 (#123); the flyout is Figma's `Menu_Dropdown` (`27:10048`).

- **Collapsed, a disclosure opens a flyout** to the row's right instead of expanding inline:
  211 wide, top aligned with the row, its left edge 8 inside the rail's right edge. Escape,
  a press outside, focus leaving, or choosing a row closes it. The row does not grow and the
  caret does not flip. Expanded sub-items still open inline.
- **The flyout looks like `Menu`** (design review of build 67): `stroke.default` edge, 4 of padding round the rows, rounded
  `radius.sm` rows in `label-sm-medium` `text.secondary` that darken to `text.primary` on the `surface.brand.faint` hover, and
  `shadow.menu`. The current row stays semibold `text.brand.medium`.
- **The collapsed caret is filled** (`caret-down-fill`, new icon).
- **Expanded sub-items are regular weight** (were medium); the current sub-item is told apart
  by colour and `aria-current`.

Migration: none; the collapsed flyout replaces the unconfirmed inline-list behaviour that
`docs/sidebar-item.md` flagged. No API change.

### `DatePicker` — design review of the variants (October 2026)

Follow-up to #133.

- **Dual view keeps its order:** the right calendar is always after the left, and nothing is disabled. Paging the left onto
  the right's month makes the right jump to the month after it; paging the right back onto the left's makes the left step back.
- **Quick picks follow the mode:** a single-date picker shows only Today; ranges only appear in range mode.
- **Overdue / Due Soon are filters** (`filter: true` on a preset): they do nothing to the calendar, only call `onSelect`. The list is centred vertically.
- **Quick picks look like a dropdown menu** on desktop (4 inset, square 40-high rows, brand tints, 140 wide) —
  Figma doesn't define the list, so this is a proposal to test. The touch row is unchanged.

- **Clear is on by default** (`clearable`, default `true`; `false` hides it — a toggle on Storybook's Default controls). It is outside the view swap, so it
  is the same button in the same place in the day and month views.
- **The month heading is a toggle, both ways.** "Sep 2026 ▾" opens the months; "2026 ▴" returns to the days. It
  is Figma's small textual button, 24 high, with a 12 filled caret; the label is `text.secondary`.
- **Carets follow `neutral.textual.content`** (default, hover, pressed) — the previous/next arrows and the heading's
  — not the action blue. New icons: `caret-down-fill`, `caret-up-fill`.
- **Type:** cells `label-sm-regular` (was 16px `body-md`, in the numeric face), today `label-sm-semibold`, range
  `label-sm-medium`, selected `label-sm-semibold`; the heading `label-sm-medium` `text.secondary` (was 16px
  `title-sm-semibold` `text.primary`). Today's month is semibold too.
- **A range has no seams:** the day grid is seven whole 36 columns centred in the calendar (260 ÷ 7 left 37.14 columns
  whose edges anti-aliased into lines), rows 35 apart.
- **Pointer cursor** on cells, quick picks, the heading and the arrows.
- **Dual view matches the design:** 685 × 329, a 118 quick-picks column, 8 above the footer.
- **Fixed:** in a `Popover` the calendar overflowed its container with doubled padding — the story now uses
  `width="auto"` and no panel padding.
- **Storybook:** the control-combination pages (*Day And Range*, *…With Button*, *Month*, *…With Button*, *Month
  Buttons*) are gone — the **Default** playground is live and covers them; the heading test now covers paging and
  the view swap.

Migration: callers that relied on the button being absent without `onClear` pass `clearable={false}`; no caller
imports `DatePicker` yet.

### `StatCard` — the value is 32, on the type ramp (October 2026)

The value was 36 — written out as a type-ramp exception because the ramp has no 36 step.
It is now **`heading-xl` (32)**: `heading-xl-bold` on the `default` card, `heading-xl-semibold`
on the `superadmin` card. Line height follows the ramp (1.2) instead of 44 / 36, so the value
row is a little shorter; card heights (100 / 150) are unchanged.

**Why it differs from Figma (which draws 36):** it matches the typography we already have
(an existing ramp step, not a one-off size), it is more consistent with the rest of the
system, and it helps once there are a lot of value cards in a row. See `docs/stat-card.md`.

The only remaining type exception on the card is the 24 medium `unit`. No API change.

### `DatePicker` — Figma's `Date_Picker_VCP` variants (5 October 2026)

**New** (minor): `mode` — `day` (default), `range` (two clicks, reported through
the new `onRangeChange(start, end?)`) and `month` (a year of months);
`dualView` for two calendars that page independently; `mobile` for the touch
layout (`h-10` days, full width, presets as a scrolling row); `presets` for
the quick picks Figma lists beside the calendar; `onClear`/`clearLabel` for
the footer button; `today` (stories pin it). In day and range mode the month
heading now opens the month grid. Storybook's first story has a control for
each Figma variant property.

**Changed, visually:** no panel border (Figma draws none); weekdays read
"Mon"…"Sun" in `text.tertiary`; days are `body-md` in `text.secondary`, today
semibold; the selected day is `surface.brand.strong` (was `action.primary`);
a range draws as one bar with rounded ends. The heading reads "Sep 2026" (the
full name is still announced). Neighbouring months' days show, greyed in
`text.subtle` — Figma's `text.disabled` there fails contrast. Day cells are
32 high (were 36). Every existing prop keeps its meaning; no caller imports
`DatePicker` yet.

### `Pagination` — built to Figma's `VCP_Pagination` (5 October 2026)

**New** (minor): **First** and **Last** buttons either end; an **ellipsis** for
long page counts, with the first and last page always shown ("1 2 3 4 … 25");
an **Items** per-page select (`pageSize`, `pageSizeOptions`,
`onPageSizeChange`); a **range readout**, "1-50 of 1,250" (`itemCount` +
`pageSize`); and `variant="compact"` for Figma's Tiny version without First and
Last. Closes #114.

**Changed, visually:** controls take Figma's `stroke.default` border and
`text.primary` labels (were `stroke.subtle`, `text.secondary`); the active page
is `surface.brand.strong` (was `action.primary`); the trailing "Page 3 of 12"
is gone — Figma doesn't draw it, and the range readout says more. The window
is no longer a fixed five numbers. The root is now a `<div>` around the
`<nav>`; `ref` points at it. Every existing caller (`AVTable`) keeps working
unchanged and now shows First and Last.

### `neutral.textual.content` — a token for content with no fill or border (5 October 2026)

**New token** (minor): `neutral.textual.content` (`default` / `hover` /
`pressed` / `disabled`), for `EmojiReactionPicker`'s quick-react and
add-reaction glyphs. `.default` is Figma's value; the other states mirror
`neutral.outline.content`, in light and dark. The dark values were missing at
first, which left these glyphs at 2.36:1 in dark mode; they are now 12.02:1.

### `SidebarItem` and `Sidebar` — the collapsed caret, and every rail open (2 October 2026)

**Collapsed, a disclosure's caret now sits beside its glyph, not on it.** Figma's
`_Sidebar_Item` (`Collapsed`) draws a 12 caret straight after the 24 glyph.
Collapsed rows also stop centring their glyph and start it at the same 8 inset
as Figma's rail, so every glyph shares one axis. Expanded rows are unchanged:
the caret stays at the far right.

**New: `Sidebar`'s `defaultOpen`** (minor) — the keys of the rows with sub-items
that start open. The Storybook "Fully Expanded" story uses it to show any user
type's rail with every section open.

### Breaking — `FileAttachment` rebuilt to Figma's card (2 October 2026)

**The tile now matches Figma's `_File_Attachment_Card` and its states.** Before,
the code drew a thumbnail well with a smaller name and a file size underneath;
Figma draws one bordered card with the glyph over the name, and nothing else.

- **One card**, glyph (32) centred over the name, name inside the border.
- **Name** in `body-sm-regular` (was `caption-md-medium`). A long name keeps
  its extension and shortens the stem instead: "2)-Curr… .pdf".
- **No file size**, and the `size` prop is gone.
- **Hover** fills the card `surface.brand.faint`; **pressed** fills it
  `surface.brand.subtle` and hides the ✕. These replace the border tints this
  PR first shipped, which were a best guess before Figma's states frame was read.
- **Remove** is Figma's red-tonal round button in the card's corner.
- **Domain badge** is Figma's neutral-tonal pill with a pen-nib glyph, and a
  new `domainIcon` prop for other domains' glyphs.

New tokens (minor): `neutral.tonal.surface.default` and
`neutral.tonal.content.default`, Figma's own variables for the badge. New
glyph: Phosphor `pen-nib`.

`HandoffAVModal` and `ReviewAVModal` pass their `attachments` straight into
FileAttachment, so their attachment items lose `size` too: the field would
otherwise be accepted and silently never shown.

Migration: delete `size="…"` from any `<FileAttachment>`, and `size` from
the items in either modal's `attachments`. Nothing else changes. 0.1.0 is
unreleased, so the version isn't bumped, per the convention above.

### Breaking — `StatCard`: one card per dashboard, and a group form (October 2026)

Rebuilt against Figma's `VCP Pages & Flows` dashboards (5 Oct 2026). There are
two cards, set by **`variant`**, and a grouped form:

- **`default`** — the admin and user dashboards' `Value_Card`: an 8 stripe,
  **left-aligned**, label over a 36 bold value, exactly 100 high and at least
  175 wide.
- **`superadmin`** — the super admin dashboard's metric card: a 12 stripe,
  **centred**, accent icon + label + info hint over a 36 semibold value and a
  24 unit, exactly 150 high.
- **New: `StatCardGroup`** — the super admin dashboard's grouped card: two or
  more values under one title, split by `Divider`s, centred.
- **New: a `brand` tone** for `accent` — the brand blue the Value_Card uses for
  In Progress.
- **New filled glyphs** for the super admin cards: `check-square-fill`,
  `calendar-x-fill`, `chat-dots-fill`, `thumbs-up-fill`, `x-circle-fill`.

**Breaking changes to `StatCard`** (major):

- **Removed: `delta`, `deltaTone` and `footer`.** Figma's cards have neither a
  change figure nor a line under the value.
- **The look changed.** Full container width; the stripe sits inside a 1px
  `stroke.default` outline (was `stroke.subtle`); no shadow. The icon is 24 in
  the `accent` tone, the label `label-sm-medium` `text.secondary` (was caption,
  tertiary), the tooltip glyph 20 (was 16). The value is 36 and `unit` 24, both
  `text.primary` Poppins (the value was 24 Inter) — written out as type-ramp
  exceptions, since the ramp has no 36 step and no `heading-lg-medium`.
- **Alignment follows the card, not a prop**: the Value_Card is left-aligned,
  the super admin card centred. The 24 Sep audit had centred every card.

Migration: drop `delta`, `deltaTone` and `footer`; pass `variant="superadmin"`
on the super admin dashboard; pass icons as `<Icon size="lg" />` (the old
`size="sm"` glyphs now sit small in the box).

### Breaking — 24 September 2026

**The type ramp gains a weight per size.** `tokens/semantic/type.json` goes
from 15 tokens (one weight each) to 47, named `{tier}-{size}-{weight}`
(`display-xl-bold`, `body-md-semibold`, …) instead of `{tier}-{size}`. See
`docs/type-tokens.md` for the full ramp and the old→new class table.

Every one of the ~115 files that referenced an old class (components,
stories, docs) was migrated to the new token carrying the **same rendered
size and weight** — this is a rename, not a restyle. Two exceptions, both
sub-pixel and disclosed in `docs/type-tokens.md`: `label-md` (13px) and
`label-sm` (11px) had no equivalent in the new ramp and round to the nearest
step (14px and 12px). `display-lg`/`display-md` had no consumers to migrate.

`src/lib/cn.ts`'s `TYPE_RAMP` (the list that keeps `tailwind-merge` from
filing these as colour utilities) and `scripts/lint-hardcoded-values.mjs`'s
drift check both updated to match — the check's own pattern for parsing that
list needed widening, since it assumed every old class name ended in exactly
two letters (`xl`, `lg`, `md`, `sm`), which no longer holds once class names
end in a weight (`bold`, `semibold`, `medium`, `regular`).

`Skeleton`'s `textStyle` prop is unaffected — its public keys
(`'body-md'`, `'label-lg'`, …) are unchanged; only its internal CSS-variable
lookup was repointed at the new matching token.

Free in practice while 0.1.0 is unreleased and nothing outside this repo
imports the package, which is why the version is not bumped.

### `IconButton` defaults to round, not square (21 September 2026)

Visual change to a shipped component. `IconButton` now defaults to
`shape="round"` (`rounded-pill`) across all five variants — a compose FAB, a
toolbar action, a dismiss are round the great majority of the time across VCP,
and the component previously defaulted to matching `Button`'s square corner
unconditionally, which meant every common-case caller had to fight the
default rather than the rare exception opting out of it.

**`shape="square"`** (`rounded-sm`, `Button`'s own corner) is the new explicit
exception, for a control that has to sit flush inside a square-cornered row
rather than stand alone. `DetailRow`'s inline edit affordance is the one
identified case and now opts into it explicitly.

No new tokens — both shapes reuse the existing `shape.radius.pill` and
`shape.radius.sm`. Minor bump: additive prop, but flagged for review because
it silently changes the rendered shape of every existing `IconButton` call
site that doesn't pass `shape="square"`, with no compile-time signal.

### `Tag`, and Badge's corner corrected to match GDL's actual shape (21 September 2026)

**A structural fix, not just a new atom.** `Badge` and `Tag` were conflated
from the start: this repo's `Badge` was built and measured against Figma's
`Tag` component by mistake (`docs/figma-audit.md`, 3 Sep 2026), so it shipped
`rounded-sm` — Tag's shape, not Badge's. They're separate components in the
General Design Library with separate shapes: `Badge` is fully rounded
(`shape.radius.pill`), `Tag` is a rounded-rectangle (`shape.radius.sm`). No
new radius tokens were needed — both values already existed, just applied to
the wrong component.

**New `Tag` atom** (`src/atoms/tag/`), the rounded-rectangle counterpart to
`Badge`. Same four styles as Badge now share — `textual`, `outline`, `tonal`,
`filled` — all VCP's own semantics; GDL's Tag primitive doesn't dictate them.
The style × tone colour matrix moved into `src/lib/classification-tones.ts`,
shared by both components rather than duplicated.

**`Badge` gains `textual` and `outline`** alongside its existing `tonal`
(default) and `filled`, for the rare case a badge needs one of Tag's other
styles.

**`TypeTag` and `UrgencyTag` now compose `Tag`** instead of each hand-rolling
an identical shell — they were byte-for-byte duplicated between the two files
before this. **Breaking, for anyone importing by path rather than through the
package root:** both move from `src/atoms/` to `src/components/`, since
composing another piece of the system is what the atom-composition rule
tracks, not the vocabulary they carry. `import { TypeTag } from
'@vcp/design-system'` is unaffected — the flat package export doesn't change
— but a deep import from `@vcp/design-system/atoms/type-tag` (or
`/urgency-tag`) needs to become `/components/type-tag` (or `/urgency-tag`).
Their Storybook location moves from `Atoms/` to `Components/Display/` to
match.

**`TagEditor`'s own `Tag`/`TagTone` types renamed** to `TagEditorTag`/
`TagEditorTagTone` to resolve the export collision with the new `Tag`
component — those were always TagEditor-local data shapes, not the shared
system piece, so the generic names were only safe while no real `Tag`
existed.

Minor bump for the new atom and the two additive variants; the tier move
above is the one part of this that can break an existing deep import.

### `Checkbox` — corner corrected to `radius.xs` (21 September 2026)

The box shipped `rounded-sm` (6px); Figma's variable is `radius-2`, which is
`shape.radius.xs` (4px) in this repo's own scale. One class, applies in every
state — checked and mixed included, since there was never a separate radius
rule for them. Visual correction, no API change.

### `AVTable` — the Added Value table (11 September 2026)

The list every VCP workspace is built around. `DataTable` specialised, exactly
as the generic table's own doc says the VCP tables should be: the `<table>`
semantics, the sorting contract and the selection contract stay where they are,
and this adds the nine columns and nothing else.

**It owns no mapping.** Every cell with a vocabulary defers to the piece that
owns it — `StatusPill`, `UrgencyTag`, `TypeTag`, `DueDatePill`. This pattern
decides which columns exist and in what order, and that is all, which is the
difference between a pattern and a second copy of the system.

**Three of the nine columns are optional**, and they are the design's own four
row variants: `selectable` adds the leading checkbox, `actions` the trailing
menu. Two booleans rather than a `variant` prop, because that is what Figma's
four variants actually are.

**The blocker was already cleared.** Issue #80 item 6 — the AV table's raw
colours — was the last item with a deadline. Scanning all 16,411 nodes in the
file found none of the four flagged values on the table page: the one that
appears is bound to a variable, and the 38 unbound survivors are on the
Notification and Component Suggestions pages, which are separate work.

#### `DataTable` — two changes

**Headers are `label-lg` sentence case**, not `label-sm` uppercase. The
uppercasing came from the original export and matched nothing: all nine
`_AV_Table_Header_Item` types are drawn `ORIGINAL` case at 14 medium. Visual
change to a shipped component; no consumers yet beyond stories.

**`DataTableColumn.hint`** renders after the label — a tooltip trigger, a
count, a badge. It sits *outside* the sort button, because a header that both
sorts and explains would otherwise nest one interactive element inside another:
invalid, and the inner one unreachable by keyboard.

#### A name/value trap, now written down

The repo's type ramp and Figma's share token names but not values: Figma's
`label-sm` is 14, this repo's is 11. Read a spec off the canvas **by value, not
by name**. Three components in this batch were built wrong first and corrected
after measuring in the browser. Recorded in `docs/figma-audit.md` batch 5 and
in `docs/data-table.md`.

Row height, cell padding and avatar size were measured against the canvas
rather than assumed: 81, 16 and 32, all exact.

Minor bump: one pattern added, one component gains an optional prop and a
visual correction.

### The AV tag vocabulary — `UrgencyTag`, `TypeTag`, `DueDatePill` (11 September 2026)

The three tags an Added Value wears beside its status, and the three mappings
they own. Built ahead of `AV_Table`, which needs all three, but none of them is
table-specific — the AV detail card and the multipart rows draw the same tags.

**Urgency and type are scales, and the glyph is the scale.** Both write their
word in one neutral and let the glyph carry the temperature: a rising caret
family for type (one, two, three strokes, heaviest first), a falling/level/
rising/flame set for urgency. That is the design's own decision and it is a
good one — four coloured words in a column read as four unrelated statuses,
whereas same-weight words with a rising glyph read as a ranking. It also means
colour is never the only cue, so both scales survive greyscale (WCAG 1.4.1).

**`TypeTag`'s vocabulary is closed; `StatusPill`'s is not.** Statuses have a
per-domain middle this repo does not own. Types do not — the design draws
exactly three and the numbering is the meaning, so a fourth is a compile error
at every call site rather than a silent fall-through.

**`DueDatePill` will not guess what "due soon" means.** `dueDateTone` does the
comparing, but `soonWithinDays` has no default and is not getting one: how many
days ahead counts as soon is a product rule that differs by domain, and a
design system that invents one has quietly made a product decision. Every call
site states its own rule out loud, which is the honest version of not knowing.
Open question for design, recorded in `docs/due-date-pill.md`.

**Two glyphs added to `Icon`**: `equals` and `fire`, both Phosphor regular.

**No new colour tokens.** Figma's tags reach for `neutral.textual.*` and
`neutral.tonal.*`, two of the four neutral families this repo does not model
yet. Both resolve to values already exported — `neutral.textual.content.default`
*is* slate-600, which is `neutral.outline.content.default`, and the neutral
due-date fill is one step of slate from `Badge`'s. Three further Figma
deviations are zero-pixel token-family corrections (a background token used as
a foreground, a control token used as decoration), listed in each doc. Modelling
the full neutral families belongs with issue #103, not here.

Minor bump: three additions, no existing API changed.

### `RejectPendingAVModal` — AV modals, 5 of 7 (11 September 2026)

Rejecting an Added Value that is still `Pending`, before anyone has worked on
it. One question: why. The reason list, its explanations and the free text for
`Other` are all `RejectionReason`, built for this dialog and for `Review`'s
handoff rejection.

**The design draws its validation**: with no reason chosen, Reject is faded —
disabled. So the dialog refuses by what it lets you press rather than by an
error after the fact. That differs from `HandoffAVModal`, which validates on
submit with a message, and deliberately: there the required field sits among
five others and a disabled button would leave the user hunting.

**Reject is `primary`, not `danger`.** Rejecting a pending value is a decision,
not a destruction — nothing is lost and the submitter is told why.
`ConfirmDeleteAVModal` is where the red button lives.

One wrinkle recorded in the audit: the design shows a **visible** label above
the select, and `RejectionReason` names its select with an `aria-label`. The
pattern renders the visible text and passes the same string from one constant.
The tidier fix is for `RejectionReason` to render a real `<label>`.

### `HandoffAVModal` — AV modals, 4 of 7 (11 September 2026)

What an assignee fills in to hand an Added Value on: the date, the links that
show the work, and anything attached. Both of the design's variants.

**`overdueDays` switches the dialog.** Pass it and the overdue variant appears
— a warning banner naming the delay, a *required* overdue reason, and a notes
field. The reason is the only validation the design draws, as an error state on
that one field, so the dialog refuses a late handoff that does not say why. The
six reasons are `OVERDUE_REASONS`, owned here for the same reason
`RejectionReason` owns its sets.

**The footer is the domain's.** Design and Governance hand off; Development can
hand off *and publish*, which is a third button, so the other two step down a
weight to keep one primary in the dialog. `onHandoff` receives `{ publish }` so
the caller never has to work out which button was pressed.

Three gaps it hit, all recorded in `docs/figma-audit.md` and none blocking: the
design's compact **"Attach Files" row** is a control the system lacks, so
`Dropzone` stands in; a native `<select>` **cannot bold half an option**, so the
overdue reasons are plain text; and **`DatePicker` inside a `Modal`** is
unsettled, because its `Popover` portals outside the focus trap — so the date is
the text field with a calendar glyph that the design actually draws.

### `Carousel`, and `ChangeLogModal` — the last of the seven AV modals (11 September 2026)

**`Carousel`** is a new component: one panel at a time, an arrow each side. It
is a component rather than an atom because the composition lint fails any atom
that imports another piece except `Icon`, and a carousel needs `IconButton`.

Two decisions worth knowing:

- **It does not render the dots.** `PaginationDots` is a separate atom and the
  caller places it, because a design does not always put the dots beside the
  content — the changelog dialog puts them *below its footer buttons*. That is
  also why `Carousel` is controlled: the arrows and the dots read one index
  rather than two that can drift.
- **It never moves on its own**, and there is no prop to make it. Every remedy
  for a self-advancing panel — pause on hover, pause on focus, a stop button —
  is machinery that exists only to undo the original decision.

It wraps at both ends rather than disabling an arrow at each.

**`ChangeLogModal`** is what a user sees when the product has something to tell
them about a release. Three kinds, and the glyph is the difference: a flask, a
megaphone, a rocket, each in the design's own variable. The kind is also
screen-reader-only text, because a colour and a shape are not a label. The
dialog is named by the heading it renders in its own body, using the
`aria-labelledby` route `Modal` gained earlier the same day — the design puts
the glyph above the title, so `Modal`'s header carries only the close button.

No new tokens. The design's 32px glyph is a `size-8` override, because `Icon`'s
ramp stops at 24 and a 32 step is a decision for the ramp, not for one dialog.

### `AcceptPendingAVModal` — AV modals, 3 of 7 (11 September 2026)

The confirmation an admin answers to accept a pending Added Value, and the one
decision that comes with it: whether the value is **multipart**. The Figma node
carries a designer's note, "Used by Admins to accept a pending AV", so the
pattern is scoped to admins rather than offered as a general accept dialog.

`onConfirm` is handed `{ multipart }` rather than leaving the caller to read
the decision back off its own state, so there is no window where the two
disagree. The multipart checkbox's label is the whole card, making the target
the block rather than the 20px box, and its announced name is the title alone
with the explanation wired as `aria-describedby`.

**It is the benign confirmation**, and the design draws that difference from
the delete one: `Modal`'s own header rather than the alert layout, a
brand-outlined `secondary` Cancel rather than the grey `neutral`, and a
backdrop click that closes it. `docs/figma-audit.md` records that as a
deliberate distinction rather than an inconsistency to normalise.

⚠️ **Five field molecules on the same Figma page are assembled into nothing.**
`_Accept_Modal_Fields` — Due Date, Worked out thoroughly, Pre-consultation,
Impact of the Added Value, Development Points — has **zero instances anywhere
in the file**. Not ported; it needs a design answer, and getting it wrong would
grow the dialog from one decision to six.

### `RejectionReason` — built once for the two modals that need it (11 September 2026)

A new component, and the third thing the AV-modal audit flagged. Rejecting an
Added Value means picking a named reason, reading what that reason covers, and
typing something extra when the reason is `Other`. **Two of the unbuilt modals
need it with different reason sets** — the pending rejection has five reasons,
the handoff rejection has six — and the shape is identical, so building it
inside either one would have built it twice.

Both sets are exported constants on the component, the way `Sidebar` owns its
nav vocabulary: they are drawn in the design file rather than configured per
domain, so there is one place for them. Each reason carries the design's own
explanation, which is what appears under the select once a reason is chosen —
data on the reason, not prose at the call site.

The explanation is wired to the select with `aria-describedby` rather than left
as loose text beside it, and the free-text box is named rather than relying on
its placeholder. No new tokens.

### A `neutral` button, and the `neutral.*` token family it needed (11 September 2026)

A minor addition, no breaking change. `Button` and `IconButton` gain a
**`neutral`** variant: outlined, but grey. It is the way *out* — the Cancel
beside a destructive answer — where `secondary`, outlined in the brand, reads
as a second call to action.

**`neutral.outline.*` is imported name-for-name** from the VCP file's own
Semantics collection, 12 tokens per theme, with the same `surface` / `content`
/ `border` × `default` / `hover` / `pressed` / `disabled` shape as
`action.secondary`, aliasing the **slate** ramp like every other grey here. The
family's other three treatments — `filled`, `textual`, `tonal` — stay
unimported until something needs them.

⚠️ **"Neutral" names two different things.** That semantic family is VCP's own.
The `colors/neutral/*` **ramp** is the *General Design Library*'s, and this
repo already carries it byte-identical as `color.neutral.*` — where it is
**unused**, because all 75 grey aliases point at `color.slate.*`. Reaching for
`color.neutral.*` will not match the greys around it. `docs/color-tokens.md`
warns about it, and reconciling the two libraries is issue #103.

Two things fell out of doing it, both recorded in `docs/figma-audit.md`:

- **`style-dictionary.config.mjs` had a hard-coded whitelist** of semantic
  families, so the light tokens generated nothing at all until `neutral` was
  added to it. The dark overrides have no such filter, so they built fine —
  which is exactly the kind of silent half-build worth knowing about before
  the next family is imported.
- **Figma's dark `neutral/outline/content` lost contrast on hover and press.**
  It went `slate/300 → 400 → 500`, which is *darker* on a dark surface: 9.85:1
  down to 5.71:1, then 3.07:1, below the 4.5:1 text needs. Its own border track
  goes the other way, so content was the one that was wrong. The repo mirrors it
  correctly as `300 → 200 → 100`, and **the VCP file's Dark mode was corrected to
  match** on the same day.

The light border is 2.56:1 against white, below the 3:1 WCAG 1.4.11 asks of a
UI boundary, and is accepted on the reasoning `Pagination` already documents:
the label identifies the control at 7.58:1 and the border is reinforcement.
`docs/button.md` says so, and says when that reasoning would stop holding.

### `Modal` can be named by a heading you render (11 September 2026)

A minor addition. Naming a dialog was `title` or `aria-label`; it is now
`title`, `aria-labelledby` or `aria-label`, and the type still refuses a
dialog with none of the three. `aria-labelledby` is for the **alert layout** —
a centred glyph, question and consequence, with no header band — where the
heading lives in the body and `Modal` has nothing of its own to point at.
Before this, such a dialog repeated its heading as an `aria-label`, which is
two copies of one string that can drift. `ConfirmDeleteAVModal` now points at
its own `<h2>`. No other component changed.

### The AV modals — batch 1 of 7 (11 September 2026)

The library has seven modal pages and **none of them was in
`docs/inventory.md`**; they are not in the Claude Design export either, so
nothing in this repo knew they existed. All seven are surveyed in
`docs/figma-audit.md` batch 4. Two are built here, as patterns:

- **`ConfirmDeleteAVModal`** — the confirmation before an Added Value is
  deleted. An *alert* layout: a centred warning glyph, the question, the
  consequence, and the AV's own title read-only so nobody deletes the wrong
  one. `role="alertdialog"`, not dismissible by a backdrop click, Escape still
  closes.
- **`ReportProblemModal`** — the form behind the sidebar's "Report a problem"
  row. `Modal`'s own header, three fields, one `onSubmit` carrying the whole
  report. Uncontrolled by design, and it clears itself when it closes.

Both ship the `play` stories the flows convention asks for. No new tokens.

Three things the audit found that the remaining five will keep hitting: the
design's Cancel is a **neutral outlined button** the system does not have; the
design **tints its form fields** with a 1.48:1 border where `Input` correctly
uses 4.76:1; and the **rejection-reason picker is shared** between two of the
unbuilt modals and should be built once. The delete confirmation's primary
button read **"Complete"** in the file, which was a copy error; it was
corrected to "Delete" in Figma on 11 September and the repo carries the label
as `confirmLabel` either way.

### Breaking — 11 September 2026

**`Card` is removed.**

Decided by the lead on the grounds that it was doing the same job as `Modal`.
The pieces count drops to 31 components.

- **`Card`, `CardProps` and `CardHeadingLevel` no longer exist**, and the
  barrel no longer exports them. `docs/card.md` is deleted.
- **There is no drop-in replacement, and that is the thing to know before
  upgrading.** `Modal` is not one: it portals to `document.body` behind a
  backdrop, traps focus, locks the page scroll and makes everything else
  inert, so it cannot sit inline in a page or be repeated down a column. A
  call site that used `Card` as a container now writes the surface itself.
  The shape `Card` rendered was:

  ```tsx
  <section className="rounded-md border border-stroke-default bg-surface-elevated">
    <header className="flex items-start justify-between gap-3 px-4 py-3.5">
      <h3 className="text-heading-sm text-text-primary">Title</h3>
    </header>
    <div className="px-4 pb-4">{children}</div>
  </section>
  ```

  `shadow.card` is a token, not the component, and is untouched.
- **`StatCard` is unaffected.** It never composed `Card`.
- Four story usages were ported to plain markup (`Banner`'s in-page story, and
  three in `AppShell`'s). Five docs that used `Card` as their comparison anchor
  — `accordion`, `stat-card`, `data-table`, `pagination`, `modal` — say what
  they mean directly instead, and `figma-audit` drops it from its list of
  pieces that draw raw markup.

Free in practice while 0.1.0 is unreleased and nothing outside this repo
imports the package, which is why the version is not bumped.

### Breaking — 9 September 2026

**`Final Completed` is gone. `Completed` is green and terminal again.**

Design ruled on 9 September (issue #80): the tag set has one `Completed`
tag, drawn success green, and there is no `Final Completed`. The 8 September
change that split them into two statuses and recoloured `Completed` to
warning is reverted (PR #74), and the model is the one that shipped on
7 September.

- **`AVStatus` loses `Final Completed`** and is ten values again. Pass
  `Completed` where you passed `Final Completed`.
- **`Completed` is success tonal**, `#dcfce7` / `#008236`, as the tag set
  draws it. Nothing else in the mapping moves.
- **`hasDeployStep` is gone; `pendingDeploy` is back.** Development's
  post-handoff gate is a property of the AV, not the domain: an admin hands
  an AV off into a `Completed` that still owes a `Deploy`. Pass
  `pendingDeploy` on `status="Completed"` for that AV and the admin gets the
  `Deploy` button; omit it and `Completed` is terminal. Every other domain's
  `Completed` is terminal.
- **`Completed` no longer offers "Move to Review."** `Review` is reached
  from the chain's handoff, and `Accept` on `Review` lands on `Completed`.

### `Toggle` — saving states, and the contract written down (10 September 2026)

A minor addition. `Toggle` takes the same parent-driven `status` prop
`SegmentedControl` got earlier today: a spinner in the knob while pending
(input `aria-busy`, further flips ignored without disabling the input), a
check on success, the critical ring and `aria-invalid` on error. The contract
is now one document, `docs/saving-states.md`, and one type, `SavingStatus` in
`src/lib/saving.ts`; `SegmentedControlStatus` is an alias of it. The parent's
half — the fake save the flow stories are built around — is one shared hook,
`useFakeSave` in `src/lib/story-saving.ts`, so `SegmentedControl`'s stories
shrank and `Toggle`'s four `play` stories (`FlipsOnClick`, `KeyboardSpace`,
`SaveSucceeds`, `SaveFails`) cost about twenty lines each. No new tokens.

### `SegmentedControl` — saving states (10 September 2026)

A minor addition, no breaking change. When choosing a segment saves something,
the parent drives a new `status` prop through `pending → success | error` and
the control shows it: a Phosphor `circle-notch` spinner in the selected
segment while pending (label muted, group `aria-busy`, further selection
ignored), a check on success, the `Input` error stroke and `aria-invalid` on
error. The control stays presentational — the parent times the return to
idle and keeps the previous value on error, so async use is controlled-only —
and the error message is `Field`'s, wired through `aria-describedby`. Four
`play` stories (`SelectsOnClick`, `KeyboardNavigation`, `SaveSucceeds`,
`SaveFails`) are the first interaction tests in the repo and run under
`npm test`. `Icon` gains `circle-notch`. No new tokens.

### Breaking — 7 September 2026

**`AVStatus` is now the spine only, and the status vocabulary is open.**

An AV's flow is a fixed spine wrapped around a per-domain middle: the flow
board's `Custom Statuses` section sits between `Accepted` and `Completed` and
holds one chain per domain. Design has two steps, Development has six, and
Content, Partners, Governance and Product bring their own — which a domain can
add to and rename (issue #68). Those names are data, so they cannot be a
compile-time union.

- **`AVStatus` drops from seventeen values to ten.** Removed as domain steps:
  `For Review`, `For QA`, `In QA`, `Ready for Deploy`, `Confirmed Prod`,
  `Design Review` — exactly the contents of `Status_Tag_Development_Only` and
  `Status_Tag_Design_Only`. Removed outright: **`Review No Action`**, which is
  not a state and never was (confirmed 7 Sep 2026); the Figma variant of that
  name is being renamed.
- **`Review` has two treatments, selected by the new `actionable` prop.** Tonal
  is the label style a user sees; filled is the button style for an admin or
  the AV's initiator. **`<StatusPill status="Review" />` is now tonal, not
  filled** — pass `actionable` for the old rendering. Every other status
  ignores the prop rather than inventing a filled variant the design has not
  drawn. **Migration:** `<StatusPill status="For QA" />` becomes
  `<StatusPill custom="For QA" />`, or `custom={step.label}` where the label
  comes from the domain.
- **Domain steps all share one treatment** — the info tonal, `#dbeafe` on
  `#1447e6`, 5.60:1 (design's call, 7 Sep 2026). Five statuses change colour:
  `For Review`, `For QA`, `Ready for Deploy` and `Design Review` were warning,
  `Confirmed Prod` was success. Note `Accepted`, `In Progress` and
  `Reopened` are also info tonal, so a domain step is not distinguishable from
  those three by colour — the text is the signal, as it always was.
- **`StatusPill`'s props are a discriminated union**: `status` (spine, typo is
  a compile error) xor `custom` (a domain label, any string). Exactly one is
  required.
- **`Accepted` → `In Progress` → the domain's chain.** `In Progress` is spine,
  so the handover out of the shared part of the flow lives in the component,
  and the first chain step returns to it.
- **`AVProgressionStatus` is gone**, and with it the `Extract<AVStatus, …>`
  guarantee added on 4 September that a lifecycle state with no tag is a
  compile error. Seven of its eleven members were domain steps; there is
  nothing left to extract from. There is no equivalent for an open vocabulary.
- **`AVWorkflow` is gone.** A workflow is now just a different `chain`, so the
  eight Figma sets (two workflows × four roles) become four. Six domains would
  otherwise have meant twenty-four.
- **`StatusProgression` takes its chain as a prop.** `<StatusProgression
  workflow="development" role="assignee" status="For QA" />` becomes
  `<StatusProgression role="assignee" chain={domain.steps} step="for-qa" />`.
  Spine positions keep `status`. `avTransitions(workflow, role, status)`
  becomes `avTransitions({ role, status })` or
  `avTransitions({ role, step, chain })`.
- **`AVTransition.to` is a `string`** — a spine status or a chain step's `id`,
  never a label. Ids survive renames; labels are what changes.
- **`AVHeader`** forwards `status` / `step` / `chain` instead of
  `workflow` / `status`.
- Removed the unused `rejectSoft` constant, dead since #58 and flagged in the
  handoff. Reintroduce it when the outlined-Reject variants in #60 are named.

### `StatusProgression` — issue #60's seven variants named (7 September 2026)

Design (Eve) named all seven placeholder Figma variants the audit found.
No breaking change — additive only.

- **`Review` is now modelled on the spine.** Initiator and admin get
  Reject/Accept; the assignee renders nothing (already handed off). Reject
  is `variant="secondary"` (outline) here, not `Pending`'s solid
  `variant="danger"` — the design draws these differently by lifecycle
  stage, not role.
- **`rejectSoft` reintroduced** (deleted 7 Sep in the spine/chain refactor,
  pending exactly this naming) — reused verbatim as the `Review` Reject.
- **New `pendingDeploy` prop, Development-only.** `Confirmed Prod` → Handoff
  lands on `Completed`, but Development's `Completed` can still owe a
  `Deploy` action (admin only) before the real terminal `Completed`. Both
  render identically on `StatusPill` — same tone, same text "Completed" —
  design was explicit this is a known, accepted exception to the "spine is
  universal" rule the same-day refactor established, not a pattern to
  extend to other domains.
- "Deploy" is not a status — the placeholder Figma variant of that name has
  been removed; it was always the button label for the above, never a
  distinct lifecycle position.
- The Dev/Admin variant that drew a lone "Handoff" under the name `Review`
  turned out not to be a separate thing — `Confirmed Prod` is the only
  status with a Handoff action.
- `docs/status-progression.md` updated: the "Not modelled" table is gone,
  replaced with how each of the seven resolved.

Initial system, seeded from the VCP Figma Variables export (Aug 2026).

- Core: 10 colour ramps (vcp-blue, slate, neutral, blue, green, red, yellow,
  pink-legacy, teal-legacy, monochrome), 14-step px spacing scale, Poppins/Inter.
- Semantic (light + dark): `surface.*`, `text.*`, `stroke.*`,
  `action.{primary,secondary,tertiary}`, `accent.{critical,success,warning,info,blue,green,red}`
  in filled/outline/tonal styles — 228 tokens per theme.
- Type ramp: display-xl … caption-sm as composite tokens → `text-*` utilities.
- Shape: radius sm/md/pill, shadows card/raised/menu/modal.
- Build targets: Tailwind v4 `@theme` CSS + `.dark` overrides, plain CSS vars,
  TypeScript, flat + nested JSON.
- Components: `Popover` / `Menu` (Overlays) — Menu is Popover plus a keyboard
  contract: focus moves into the list on open, arrows wrap, Home/End jump, Escape
  closes and restores focus to the trigger, dividers and disabled items are stepped
  over. No new tokens. `MenuItem.icon` is typed to `IconName`, so a glyph the system
  does not ship is a compile error. Danger items carry three signals, only one of
  which is colour — a forced glyph and a visually hidden "destructive action" in the
  accessible name do the rest. Positioning is deliberately simple: no flipping and no
  collision detection, documented rather than implied.
- Components: `Modal` (Overlays) — `role="dialog"`, `aria-modal`, focus into the
  panel, a real focus trap that wraps both ways, Escape restoring focus to whatever
  opened it, background marked `inert`, and a scroll lock that compensates for the
  scrollbar so the page does not shift. No new tokens. Escape closes even when
  `dismissible={false}` — that flag guards the accidental backdrop click, not the
  deliberate way out.
- Components: `Tooltip` (Overlays) — opens on keyboard focus, not hover alone, wired
  with `aria-describedby`, dismissible with Escape and hoverable across the gap
  (WCAG 1.4.13). No new tokens. Text is 10.35:1 light and 16.36:1 dark.
- Components: `Toast` / `Banner` (Feedback) — a Toast is an event, a Banner is a
  state. No new tokens; both reuse the tonal pairs `docs/badge.md` already proved.
  The live regions live on `ToastViewport` and are rendered empty from first paint,
  because a role arriving together with its content is not announced — polite for
  informational tones, assertive for errors. Auto-dismiss pauses on hover, on focus
  within, and while the tab is hidden, and a toast carrying an action never
  auto-dismisses at all (WCAG 2.2.1).
- Components: `Chip` (Display) — the interactive pill Badge's docs promised: toggleable
  filters (`aria-pressed`), removable tags, avatar and count anatomy. No new tokens;
  brand-tinted from `surface.brand.*`. The export nested a `<button>` inside a clickable
  `<span>`; rebuilt so every clickable region is a real button and no button ever
  contains another — with `onRemove` the pill becomes a passive wrapper around two
  sibling controls. 28 tall carries the same pointer-dense exemption as
  `IconButton size="sm"`.
- Components: `ProgressBar` (Feedback) — a determinate meter with real
  `aria-valuenow/min/max`, `tone` as consumption status (brand/success/warning/danger),
  `sm`/`md` sizes, optional visible label (wired via `aria-labelledby`) and value.
  **New token: `surface.track`** (slate-200 light / slate-800 dark) — no existing
  surface kept every fill ≥3:1 against the track in dark (the closest dropped the
  danger fill to 1.25:1); on the new token the floor is 3.84:1, measured per tone in
  docs/progress-bar.md. Minor bump; the token needs pushing into the Figma variables.
- Components: `EmptyState` (Display) — icon tile (`aria-hidden`), real heading with a
  movable `headingLevel`, description at a readable measure, one `action` slot. No new
  tokens. The docs carry the actual contract: name what is empty, why, and the way
  forward — an empty state without an action is a dead end and should be rare.
- Components: `DetailRow` (Display) — the 132 label column / value / optional edit
  affordance row for details panels. No new tokens. The export reached `Icon` and
  `IconButton` through a window-global registry; now ordinary imports, and the edit
  affordance is the system's `IconButton` named `Edit ${label}` / `Confirm ${label}` —
  which is why `label` is typed `string`. Label/value land on `label-md`/`body-md`
  because the export's 13px/400 is a ramp step that deliberately does not exist.
- Components: `Breadcrumb` (Navigation) — the landmark pattern in full:
  `<nav aria-label="Breadcrumb">` around a real `<ol>`, the current page as inert
  text with `aria-current="page"`, separators hidden. No new tokens. Crumbs render
  as real `<a>`s when given `href` (preferred — middle-click and copy-link work)
  and as buttons only for genuinely programmatic `onNavigate`.
- Components: `Pagination` (Navigation) — addressable page numbers with
  `aria-current="page"` on the active page and a spoken name on every control.
  No new tokens; the active page sits on `action.primary` at rest. Keeps the
  export's five-number window, clamped at the ends; deliberately no
  ellipsis variant until a data set actually needs one. 32-tall controls carry the
  pointer-dense exemption.
- Components: `PaginationDots` (Navigation) — position dots for carousels and
  onboarding. No new tokens. The export's `role="tablist"` is gone — nothing here
  owns panels; they are a named group of "Go to page N" buttons, or, with no
  `onChange`, a passive indicator with zero tab stops. Inactive dots moved from
  slate-300 to `surface.neutral.strong` so an unselected dot clears the 3:1
  UI-graphic bar (4.55:1 light at worst); the current dot is also 2.5× wider, so
  state never rides on hue alone.
- Components: `Accordion` (Navigation) — stacked disclosures wired to the APG
  pattern the export implied but skipped: heading → `button` with
  `aria-expanded`/`aria-controls` → labelled `region`. No new tokens. Controlled
  (`openKeys`/`onToggle`) or uncontrolled (`defaultOpenKeys`, `multiple`); closed
  panels are unmounted, so form state belongs outside. Native `onToggle` is
  intentionally shadowed by the accordion's own callback.
- Components: `DataTable` (Display) — the generic table the four VCP table patterns
  will specialise. No new tokens. The export drew a CSS grid of divs; rebuilt on a
  real `<table>` (`scope="col"`, an `sr-only` caption, `aria-sort`) because
  cell-by-cell navigation is the point of tabular markup. Two API changes from the
  export, both deliberate: `sort` gained a direction (`{ key, direction }` — the
  component asks and shows but never sorts `rows` itself), and **`onRowClick` is
  gone** for Card's reason — a whole-row target is invisible to keyboards; the
  row's action belongs in a cell as a real link. Selection composes `Checkbox`
  (named select-all, `indeterminate` while partial, `selectLabel` for per-row
  names); `width` takes CSS widths for `<col>`, and the container scrolls
  horizontally so the page never does.
- Components: `Logo` (Display) — the Value Chain Plus mark, full lockup or the
  diamond alone (`collapsed`), sm/md/lg on the Figma Small/Medium/Big variants.
  The export pointed at image files nobody ever had and CSS-inverted a PNG for
  dark; the vectors now come straight from the Figma "VCP logo" component set as
  inline SVG, themed by **two new tokens**: `text.logo` (a new core
  `color.brand.navy` → white in dark, exactly the Figma dark variant) and
  `text.logo-accent` (the brand blue, identical in both themes). Minor bump;
  both tokens join the Figma-variables debt with `surface.track`. This was the
  last component in the porting queue, and it unblocks the `TopBar` pattern.
- Components: `SearchSelect` (Forms) — the combobox Select's docs promised, for
  lists past the few dozen where the native popup stops scaling. Paid the custom
  tax in full: `role="combobox"` with `aria-activedescendant` over a real
  `listbox` (`aria-multiselectable` when `multiple`), arrows/Enter/Escape, focus
  never leaving the input, options picked on prevented mousedown so a click
  cannot blur mid-pick — the export was a bare input above a stack of buttons.
  Positioned inline rather than through `Popover`, which moves focus into its
  panel and a combobox must not. No new tokens.
- Components: `DatePicker` (Forms) — the calendar panel: named day buttons
  ("14 September 2026"), `IconButton` month nav with a polite live-region
  heading, range shading, `min`/`max`. **One tab stop**: the day grid roves,
  arrows move by day/week and page the view across month edges. The export's
  VCP `capacity`/`holidays` props became generic `markers` (toned dots — the
  caller owes a legend) and `flagged` (unavailable-but-selectable tint), per the
  Badge/Timeline rulings; its `toISOString()` round-trip — which shifted picked
  dates for anyone east of UTC — is replaced by local-time ISO handling. No new
  tokens.
- Components: `TagEditor` (Forms) — free-form labels: tag list, tone swatches,
  name field (composed `Input`), add button (composed `Button`). **Tones, not
  colours** — the export's raw-rgb `TAG_COLOURS` (one of them the ramp-less
  indigo) became the `accent.{blue,green,red,yellow}` faint/stronger pairs Avatar
  proved, plus a neutral; the dot rides `currentColor`. Swatches are a named
  group of `aria-pressed` buttons with the hue in each name. No new tokens.
- Components: `RichTextToolbar` (Forms) — the formatting strip, wired as a real
  APG toolbar: one tab stop with a roving tabindex, Arrow keys walk the buttons,
  Home/End jump. Only stateful commands carry `aria-pressed` (the export pressed
  undo). Active text moved to `text.brand.strong` — the letter glyphs are real
  13px text and the export-flavoured medium was 3.51:1 on the tint in dark. It
  owns no editor state; `CommentComposer` (pattern) will marry it to one. New
  glyphs `list-numbers` and `arrow-u-up-right` from Phosphor. No new tokens.
- Components: `FileAttachment` (Display) — one attached file as a tile: thumbnail
  or kind glyph, name, size, optional open and remove. The export mounted the ✕
  only while the pointer hovered — unreachable by keyboard; it is now always in
  the tab order, *revealed* by hover or focus, and a sibling of the openable
  button per the Chip never-nest-buttons rule. New glyphs `image` and
  `download-simple` from Phosphor. No new tokens.
- Components: `AttachmentPreview` (Display) — the opened attachment: header with
  name/size and the system's own `IconButton`s ("Download ${name}", "Close
  preview"), body showing the image or an honest "No inline preview" with
  download as the real path. An inline panel — `Modal` owns interruption. No new
  tokens.
- Components: `EmojiReactionPicker` (Display) — reaction pills + a "+" opening
  the palette in the system `Popover`. Pills are toggle buttons: `aria-pressed`
  for "you reacted", names like "3 reactions, 👍, you reacted", counts in the
  numeric face; state lives with the caller. No new tokens.
- Components: `Timeline` (Display) — events in order on a real `<ol>`; nodes are a
  ring + glyph in one tone. **Generic tones only** — the export's `kind` took VCP
  lifecycle names (`accepted`, `handoff`); that mapping belongs to the future
  activity pattern, per Badge's precedent, and two of its colours were raw
  literals with no ramp. Ring and glyph wear the darker `outline.content` step
  (mid borders measured down to 1.91:1); every tone now clears 3:1 both themes,
  measured in docs/timeline.md. No new tokens.
- Components: `DonutChart` (Display) — ProgressBar bent into a ring (or half-ring
  gauge): same `role="progressbar"`, same four tones on the same tokens, same
  `surface.track`. The export's built-in 75%/90% auto-escalation and its
  arbitrary-colour `tone` are gone — thresholds are domain knowledge and colours
  are tokens. Centre numeral in the numeric face, scaled with the ring. No new
  tokens.
- Components: `StatCard` (Display) — one number on a card. `deltaTone` becomes
  judgment (`positive`/`negative`/`neutral`) instead of the export's direction
  (`up` painted green — but costs up is bad news); the sign stays in the text so
  colour never carries direction alone. The label is deliberately not a heading
  and the tile deliberately does not compose `Card` (which renders one). Value in
  the numeric face at `heading-lg`. No new tokens.
- Components: `Select` (Forms) — a choice from a fixed list, on the **native**
  `<select>`: platform popup, keyboard model and mobile pickers for free. Wears
  Input's shell class for class (`stroke.field`, focus ring, invalid, disabled);
  the export's `small`/`large` renamed to `sm`/`md`; its data-URI caret replaced by
  the system's glyph, pointer-transparent. Placeholder is a disabled, hidden
  option, so it cannot be re-picked; `children` is the `<optgroup>` escape hatch.
  No new tokens.
- Components: `Stepper` (Forms) — nudge-a-number: minus, a typeable value in the
  numeric face, plus. Typing is draft-based — half-typed states pass through and
  the value commits clamped on blur/Enter (the export clamped every keystroke,
  which made "15" untypeable when the minimum was 10). Arrow Up/Down nudge; the
  buttons are named with the field's `label` folded in and disable at the ends.
  Minus/plus glyphs instead of the export's chevrons. No new tokens.
- Components: `Dropzone` (Forms) — click to browse or drag files on; hands over
  `File[]` and forgets. The export's `display:none` input was unreachable by
  keyboard; the input is now `sr-only`, so Tab + Enter work and the zone draws the
  shared `focus-within` ring. The dashed border moves to `stroke.field` (the
  export's `stroke.default` was 2.56:1 against the 3:1 a control boundary needs).
  New glyph `cloud-arrow-up` added to the icon set from Phosphor. No new tokens.
- **Restructure: the atomic tiers** (decided 3 Sep 2026). The two-tier
  components/patterns split becomes four tiers — `src/atoms/` (a single
  self-contained element: Button, Input, Badge, Logo…), `src/components/` (one
  unit assembled from atoms: Field, Chip, Menu, DataTable…), `src/patterns/`
  (2+ components forming a page section: TopBar, the planning tables…) and
  `src/templates/` (page layouts: AppShell). Tier is decided by composition, not
  domain vocabulary — the old could-another-product-use-it test is retired, and
  each VCP mapping (status → tone, …) is instead owned by exactly one piece.
  Nineteen pieces moved to `src/atoms/`; Storybook titles now mirror the tiers
  (`Atoms/…`, `Components/<group>/…`, `Patterns/…`, `Templates/…`). Import paths
  changed — a breaking move in principle, free in practice while 0.1.0 is
  unreleased and the package exports everything from the root.
- Components: `StatusPill` — an AV's status as a pill: a `Badge` plus the status
  dot, owning the seven-status vocabulary (`AVStatus` union — a typo is a
  compile error) and the status → tone mapping docs/badge.md promised would live
  in exactly one place. The export's clickable-span `interactive` mode is gone —
  changing a status is the options dropdown's job. "Ready for hand-off" borrows
  the info blue: the export's indigo has no core ramp (the same decision
  `DomainLabel` awaits). No new tokens.
- Patterns: `TopBar` — **the first pattern**, matching the Figma `Top_NavBar`
  set and its two versions: the "Create Added Value" `Button` in
  `primaryAction`, or the linked `Logo` when there is none. Right side: the
  bell (unread = the design's red dot, count in the accessible name), the
  light/dark mode `Toggle` (controlled — the app owns the theme), and the user
  chip (avatar + name + caret; a real named button only with `onUserMenu`).
  Composed entirely from existing atoms — `Logo`, `Toggle`, `IconButton`,
  `Avatar`, `Icon`. Design review (3 Sep 2026) cut the export's inventions: the
  role badge under the user's name (no design for it) and the merged page-title
  anatomy — back/title/status actions are the Figma `AV_Header`, queued as its
  own `AVHeader` pattern. No new tokens. Unblocks `AppShell` down to `Sidebar`.
- **`StatusPill` gains six statuses, closing the audit's vocabulary gap
  (minor).** Batch 3a found the progression buttons moving AVs through six
  states `Status_Tag_General` has no tag for — an AV parked in `For QA` had
  nothing to wear. Lead's call (4 Sep 2026): build them. `AVStatus` now has
  seventeen values — added `For Review`, `Design Review`, `For QA`, `In QA`,
  `Ready for Deploy`, `Confirmed Prod`. **No new treatment**: each reuses a
  tone the mapping already uses (gates warning, work info, verified success),
  and `Review` stays the one filled tag, so the tag set's visual language is
  unchanged. No new tokens.
  `StatusProgression`'s `AVProgressionStatus` is now a literal subset of
  `AVStatus` (`Extract<…>`), so a lifecycle state with no tag is a **compile
  error** — the two vocabularies cannot drift apart again.
  ⚠️ **Figma has not caught up**: the six do not exist in
  `Status_Tag_General`, and the repo is the source of truth, so they need
  adding to the design file.
- Components: `StatusProgression` (Actions) — the "move this Added Value
  along" buttons, read off the Figma **Status Progression Buttons** page
  (eight component sets: two workflows × four viewer roles). **It owns
  status → transitions**, the way `StatusPill` owns status → tone: call sites
  pass workflow/role/status and handle `onTransition`, and `avTransitions()`
  exposes the same list without buttons. Every label is the design's own
  wording rather than generated from the status name, because the design does
  not generate them either ("Move to Handoff" to an assignee, plain "Handoff"
  to an admin). A terminal status renders `null`, matching the design's empty
  variant. One atom used twice, so it is a component, not a pattern. No new
  tokens.
- Patterns: `AVHeader` — the Figma `AV_Header` set: back arrow and title on
  the left, `StatusProgression` on the right, in both `Type` variants
  (`default`, titled by AV id; `new`, titled in words and set larger). The
  design's `Show Move Status Buttons` boolean is `showStatusActions`. **This
  carries the page's `<h1>`**, which is exactly why `TopBar` carries none.
  Back is either a real link (`backHref`) or a history button (`onBack`),
  both at 40px targets against the design's bare 20px glyph. Composed of
  `IconButton`, `Icon` and `StatusProgression` — it owns no lifecycle
  knowledge, it only places it. No new tokens.
- **Audit, batch 3a (docs/figma-audit.md): the design carries two AV status
  vocabularies that disagree.** `Status_Tag_General` (eleven statuses, what
  `StatusPill` displays) and the Status Progression lifecycle share five
  names; the progression adds six QA/deploy states the tag set cannot
  display, so an AV in `For QA` has no tag to wear. Shipped as two distinct
  types (`AVStatus`, `AVProgressionStatus`) so TypeScript keeps them apart —
  **reconciling them is a design decision, not a code one.** Also flagged:
  seven progression variants carry placeholder layer names (`Status4`,
  `Status8`, `Deploy`, `Review`, `Review (completed 1)`) and are therefore
  not modelled, which leaves the `initiator` role offering moves on `Draft`
  only; and the `AV_Header` title's size falls between two ramp steps, so it
  takes the larger.
- Components: three designed states the Figma audit found missing (batch 2,
  docs/figma-audit.md). **`Toast`** gains the design's 4px timer bar — the
  countdown it already ran, made visible; CSS-transition driven so it stays
  smooth without a render per frame, freezing and resuming with the timer, and
  `aria-hidden` because the toast already communicates the wait (it is
  deliberately not `ProgressBar`, which is a semantic meter). **`Dropzone`**
  gains `error`: the design's Error state, with `aria-invalid` and
  `aria-describedby` so the rejection is announced and not merely painted, and
  the zone stays usable for the next attempt. **`EmojiReactionPicker`** gains
  `people` per reaction, rendering the design's Hover Tooltip on the system
  `Tooltip` — so the names open on keyboard focus too, not just hover. No new
  tokens.
- Fixed: `IconButton` no longer sets `title` when a `Tooltip` describes it. Both would
  render, ours and the browser's native bubble on top, with no way for a caller to
  suppress the second.
- Fixed: `Menu`'s shortcut text moves from `text.subtle` to `text.tertiary`. It was
  4.76:1 on the panel but only 4.09:1 once the item was highlighted — the state where
  a keyboard user is actually reading it.
- Components: `Avatar` / `AvatarGroup` (sm/md/lg = 24/32/40) — initials or photo,
  tone derived from the name. No new tokens. The export's six pastels with white
  initials measured 1.83–2.37:1 and failed 1.4.3 across the board, so the hash now
  maps onto the `accent.{blue,green,red,yellow}` hue families rather than the status
  families — a person is not an error. AvatarGroup announces itself as one summary
  ("Ali, Eve and 3 others") rather than a list of images nobody can act on.
- Components: `Badge` (sm/md, six generic tones) — the pale tonal treatment from the
  Figma Tags page. No new tokens. **VCP's status vocabulary is deliberately not here**:
  `accepted`, `for qa`, `confirmed prod` and the rest belong to the `StatusPill`
  pattern, since they only mean something inside VCP.
- Components: `Card` (title, header action, footer, padded) — `surface.elevated` with
  `shadow.card`. No new tokens. Renders a real heading at a caller-chosen level, and
  deliberately takes no click handler: a whole-card target hides the real action from
  keyboards and screen readers.
- Components: `Divider` (horizontal/vertical, optional caption) — decorative by
  default (`role="presentation"`), opt into `separator` semantics when it genuinely
  divides sections. No new tokens.
- Components: `IconButton` (4 variants x sm/md/lg) — Button's variants, sizes and
  focus ring, in a square. No new tokens. **`label` is a required prop and the other
  naming routes are removed from the type**, so an unnamed icon-only control is a
  compile error rather than a review finding.
- Components: `Skeleton` (block/circle/lines, radius tokens) — `aria-hidden`, with the
  line boxes derived from the type ramp so a three-line skeleton occupies exactly three
  lines of body copy. No new tokens. Docs and a story carry the live-region pattern the
  placeholder needs to not be silent.
- Components: `Spinner` (sm/md/lg) — `role="status"`, never `progressbar`. No new
  tokens. Reduced motion swaps the spin for a pulse rather than freezing it, because a
  motionless spinner reads as a hang.
- Components: `Icon` (sm/md/lg = 16/20/24) — a Phosphor glyph at `regular` weight,
  filled with `currentColor`, so colour comes from a text token on the parent and
  dark theme needs no second path. No new tokens. Decorative by default
  (`aria-hidden`); pass `label` for `role="img"` and a name when the glyph is the
  only carrier of meaning. Ships the Phosphor glyphs the VCP Figma library
  references rather than all 1,512 — a `name`-driven lookup cannot be tree-shaken.
  Carries VCP's in-house glyphs alongside them (`caret-triple-up`, which Phosphor
  has no equivalent for); `docs/icon.md` covers how to add either.

- Components: `Button` (primary/secondary/tertiary/danger/link × sm/md/lg,
  loading/disabled), mapped to `action.*` and `accent.critical.*` state tokens.
- Components: `SegmentedControl` (sm/md, fullWidth, disabled options) — a radio
  group on a `surface.neutral.subtle` track. No new tokens. Sizes are 32/40px to
  match Button rather than the export's 28/36, so `md` meets the 40px target rule.
  Known: the selected segment's surface is 1.1:1 against the track, so the
  selected state is carried by the label's colour and weight — see
  `docs/segmented-control.md`.
- Components: `Tabs` (sm/md, fullWidth, counts, disabled tabs) — selected tab takes
  `action.secondary.content.default` for both label and 2px underline; count pill
  uses `type.caption-sm` on `surface.brand.faint` / `surface.neutral.subtle`.
  No new tokens. Exports `tabId()` / `tabPanelId()` so panels can be associated —
  the bar alone is not an accessible tab set.

### Not imported from the Figma export (deliberately)

- `schemes-*` and `state-layers-*` variables — Material theme-builder noise.
- `-2`/`-3` duplicate variables — Figma collection duplication artifacts.
- `button-*` component variables — they referenced the pink `primary` ramp;
  design confirmed (2026-08-18) pink is not a brand colour. The pink ramp is
  removed entirely; `action.*` (vcp-blue) is the button source.
- `secondary` (teal) — kept as `teal-legacy` pending the same design call as
  pink. Design confirmed (2026-09-04) teal is not a brand colour either. The
  ramp is removed entirely; no semantic token ever referenced it, so nothing
  else changes. `Avatar`'s `docs/avatar.md` noted it as a possible stand-in
  for the accent hues the Figma export has that VCP does not — that note is
  updated; there is no substitute ramp for teal now.

### Fixes

- **`Modal`'s close button is neutral, not brand (11 September 2026).** The
  ghost `IconButton` variant paints its icon `action.tertiary` blue, which put
  a blue X in the corner of every dialog competing with the footer's primary
  button for the eye — and dismissing is not an action to invite. It is
  `text.primary` now, 20.17:1 on the panel in light and white in dark, with a
  neutral `surface.neutral.faint` hover. Recoloured through `className`, the
  way `Toast` and `Banner` already tone theirs. `AttachmentPreview`'s close
  button is still the brand blue and was left alone.

- **`Modal`'s stories all started closed, so nothing was testing the dialog
  (11 September 2026).** Every one of the seven stories rendered a trigger
  button and no dialog, which meant Chromatic had never diffed a single pixel
  of the panel, backdrop, header or footer, and the axe check in `npm test`
  had never seen the dialog's markup — so none of the focus-contract or
  labelling claims in `docs/modal.md` were verified by anything. The visual
  stories now render open, and the focus contract is covered by four `play`
  stories: `OpensTrapsAndCloses`, `BackgroundIsInert`, `BackdropClickCloses`
  and `NotDismissible`. `LightAndDark` becomes `DarkTheme` and sets the theme
  global, because a portalled dialog cannot be themed by a wrapper `div` and
  so cannot be shown as a side-by-side pair. `Sizes` is replaced by
  `ExtraWide`; the four widths are now each covered by an open story.

  The one component change rides along because it is the same sheet: **the
  footer loses both its tint and its divider.** It was a `surface.canvas` band
  under a `stroke.default` rule; now the panel's `surface.elevated` carries
  through and whitespace sets the actions apart from the content, the same way
  the header is already separated from the body. Neither removed element was a
  1.4.11 boundary — the buttons carry their own contrast — and `docs/modal.md`
  says so. `Card`'s footer is untouched and still has both. Everything else
  about the focus contract was already right; it was simply unproven.

- **Five findings from the first run of the story tests (10 September 2026).**
  `SidebarItem`'s selected row named a `text.brand` token that does not exist,
  so its label inherited black — 2.32:1 on the dark tint; it is `text.brand.strong`
  now (8.97:1 light, 6.14:1 dark). `ProgressBar` put a passed `aria-label` on its
  wrapper instead of the meter, leaving the meter unnamed. `Dropzone`'s "Choose
  files" kept link blue on the error tint at 4.11:1; it takes the critical content
  colour there. `TopBar` rendered an `<a aria-label>` with no `href` when `homeHref`
  was omitted; the `Logo` now stands alone and names itself. `AppShell`'s scroll
  region could not take focus, so a page of plain text was unreachable from the
  keyboard; it is a focusable group named "Page". The a11y check in `npm test`
  now fails on any violation.

- `cn()` was dropping type classes. tailwind-merge files any `text-…` it doesn't
  recognise as a colour, so `text-label-lg` and `text-action-primary-content-default`
  collided and only the last one survived. **Every `Button` has been rendering at the
  browser's inherited 16px/400 instead of `type.label-lg` (14px/500) since 0.1.0.**
  `cn()` now declares the type ramp as a font-size group, and `npm run lint:tokens`
  fails if that list drifts from `tokens/semantic/type.json`.

### Contrast fixes vs the Figma export (approved by design, 2026-08-18)

- `text.subtle`: slate-400 → slate-500 (was 2.56:1 on white — failed AA).
- `text.tertiary`: slate-500 → slate-600 (keeps the hierarchy distinct after the
  subtle fix; 7.58:1).
- `accent.success.tonal.content.default`: green-800 → green-900 (was exactly
  4.50:1; now 8.24:1).
- Dark theme: `stroke.focused` was left at vcp-blue-500, the same value as light,
  while every other `stroke.*` token was inverted. That is 2.37:1 against the dark
  surfaces — below the 3:1 WCAG 1.4.11 asks of a focus indicator, so the focus ring
  was close to invisible in dark theme on every component, Button included.
  Now vcp-blue-300 (6.33:1), mirroring how `stroke.brand.strong` flips 600 → 300.
  This corrects the earlier "dark theme already passes" note.
- These fixes live in `scripts/import-figma-tokens.mjs`, so re-importing a fresh
  Figma export cannot silently regress them. **Push the same three changes back
  to the Figma variables** so the export catches up with the code.

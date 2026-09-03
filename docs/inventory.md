# Inventory — what exists, what's coming, and which tier it belongs to

The Claude Design export (`VCP Design System.zip`) carries 1,632 files and 660 raw
Figma imports, but the curated system inside it is **83 pieces**. This file is the
worklist for porting them, and the record of which tier each one lands in.

Tier is decided by the composition test in CLAUDE.md (atomic approach,
adopted 3 Sep 2026): **atom** = a single self-contained element; **component**
= one unit assembled from atoms; **pattern** = 2+ components forming a page
section; **template** = a page-level layout. Domain vocabulary may live at any
tier — each mapping is owned by exactly one piece.

Nothing here is a promise about order beyond the dependency notes. Anything marked
**blocked** should not be started until its blocker ships, because it would be
built against something that is about to change.

## Done

Tier reflects the atomic re-tier (PR #54); "Shipped in" stays the historical
record of when each piece landed.

| Tier | Name | Shipped in |
|---|---|---|
| atom | `Button` | 0.1.0 |
| atom | `SegmentedControl` | PR #4 |
| component | `Tabs` | PR #5 |
| component | `Field` | PR #7 |
| atom | `Input`, `Textarea`, `Checkbox`, `RadioGroup`, `Toggle` | PR #7 |
| atom | `Icon` | PR #10 |
| atom | `Avatar`, `Badge`, `Divider`, `IconButton`, `Skeleton`, `Spinner` | PR #15 |
| component | `AvatarGroup`, `Card` | PR #15 |
| component | `Popover`, `Menu`, `Modal`, `Tooltip`, `Toast`, `Banner` | PR #16 |
| atom | `ProgressBar` | PR #38 |
| component | `Chip`, `EmptyState`, `DetailRow` | PR #38 |
| atom | `PaginationDots` | PR #39 |
| component | `Breadcrumb`, `Pagination`, `Accordion` | PR #39 |
| component | `DataTable` | PR #43 |
| atom | `Select` | PR #46 |
| component | `Stepper`, `Dropzone` | PR #46 |
| atom | `DonutChart` | PR #47 |
| component | `Timeline`, `StatCard` | PR #47 |
| component | `FileAttachment`, `AttachmentPreview`, `EmojiReactionPicker` | PR #48 |
| component | `TagEditor`, `RichTextToolbar` | PR #49 |
| component | `DatePicker` | PR #50 |
| component | `SearchSelect` | PR #51 |
| atom | `Logo` | PR #52 |
| component | `StatusPill` | PR #54 |
| pattern | `TopBar` | PR #55 |

## Components — to port

Small vocabulary pieces re-tiered down from the old patterns list: each is
one unit composing an atom or two.

| Components |
|---|
| `UrgencyTag`, `RoleBadge`, `DomainLabel`, `AssigneeStatus`, `DeliverableLink`, `SidebarItem`, `FeatureCard`, `ProblemCard`, `ChangelogCard` |

## Patterns — to port

Organisms: 2+ components forming a page section.

| Area | Patterns |
|---|---|
| Page structure | `Sidebar`, `PageFooter`, `SettingsSection` |
| Status & domain | `StatusProgression`, `DomainCard`, `DomainSelector`, `DomainAccessTable`, `MultipartEditor`, `ReviewPanel`, `WatchersList` |
| Tables and planning | `PlanningTable`, `BudgetTable`, `HolidayTable`, `HolidayForm`, `GanttChart`, `AvailabilityGrid`, `PeriodSelector`, `FilterBar` |
| Collaboration | `CommentItem`, `CommentComposer`, `NotificationItem`, `UserMenu` |
| Marketing | `MarketingHero` |

## Templates — to port

| Templates |
|---|
| `AppShell`, `EmailLayout` |

Dependency notes:

- **`DomainSelector` is blocked** on `DomainLabel`, whose six domain colours
  need an indigo and a pink that have **no core ramp** — a token decision to
  settle before it is built, not during.
- `AppShell` is blocked on `Sidebar` only — `TopBar` has shipped; it composes
  the two plus an optional 390px detail column.
- The four tables were blocked on `DataTable`, which has shipped — they are
  unblocked; specialise it rather than copying it.

## Known gaps carried forward

- **`DomainLabel`'s six domain colours** have no core ramp — roughly two new ramps
  and twelve semantic tokens. Needs a design call before the pattern is built.
- **`SegmentedControl`'s selected surface** is 1.1:1 against its track in light and
  1.4:1 in dark. The state is carried by the label colour change plus `shadow.card`,
  which is a non-colour cue. Defensible and documented; raising the *surface* to 3:1
  would need a new token.
- **Dark theme inverts the segmented control's depth** — `surface.elevated` is darker
  than `surface.neutral.subtle` in dark, so the selected segment reads as a recess
  rather than a raised thumb. A token-semantics question.
- **No 400-weight partner** at 13px or 11px in the type ramp, so `label-md` and
  `label-sm` have nothing to pair with. This ruled out a weight shift between
  selected and unselected states.
- **Dead spacing classes** — `gap-sm`, `mb-xs`, `mb-2xs` appear in
  `Button.stories.tsx` and `Foundations.stories.tsx`. There are no `--spacing-*`
  tokens, so Tailwind emits nothing for them and the layout silently loses its gaps.
  New files use the numeric scale.

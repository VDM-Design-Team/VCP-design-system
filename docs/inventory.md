# Inventory — what exists, what's coming, and which tier it belongs to

The Claude Design export (`VCP Design System.zip`) carries 1,632 files and 660 raw
Figma imports, but the curated system inside it is **83 pieces**. This file is the
worklist for porting them, and the record of which tier each one lands in.

Tier is decided by the test in CLAUDE.md: *could another product use this
unchanged?* Yes → `src/components/`. Only makes sense inside VCP →
`src/patterns/`.

Nothing here is a promise about order beyond the dependency notes. Anything marked
**blocked** should not be started until its blocker ships, because it would be
built against something that is about to change.

## Done

| Tier | Name | Shipped in |
|---|---|---|
| component | `Button` | 0.1.0 |
| component | `SegmentedControl` | PR #4 |
| component | `Tabs` | PR #5 |
| component | `Field` | PR #7 |
| component | `Input` | PR #7 |
| component | `Textarea` | PR #7 |
| component | `Checkbox` | PR #7 |
| component | `RadioGroup` | PR #7 |
| component | `Toggle` | PR #7 |

## Components — to port

Domain-agnostic. Grouped by the Storybook section they belong under.

| Storybook group | Components |
|---|---|
| `Display/` | `Icon`, `Logo`, `Avatar`, `AvatarGroup`, `Badge`, `Chip`, `Card`, `Divider`, `Skeleton`, `Spinner`, `ProgressBar`, `EmptyState`, `DetailRow`, `Timeline`, `DonutChart`, `StatCard`, `DataTable` |
| `Forms/` | `Select`, `SearchSelect`, `DatePicker`, `Dropzone`, `Stepper`, `TagEditor`, `RichTextToolbar` |
| `Actions/` | `IconButton` |
| `Navigation/` | `Breadcrumb`, `Pagination`, `PaginationDots`, `Accordion` |
| `Overlays/` | `Popover`, `Menu`, `Modal`, `Tooltip` |
| `Feedback/` | `Toast`, `Banner` |
| `Display/` | `FileAttachment`, `AttachmentPreview`, `EmojiReactionPicker` |

**`Icon` comes first.** It is the largest single file in the export (122 lines,
a Heroicons v2 wrapper) and a great many of the others render one. Porting
anything icon-bearing before it means stubbing and reworking.

Dependency notes:

- `Menu` needs `Popover`. `SearchSelect` needs `Select` and `Popover`.
- `AvatarGroup` needs `Avatar`. `DataTable` needs `Checkbox` and `Pagination`.
- `Toast` needs a viewport/host decision (portal + live region) — settle it when
  `Toast` is built, and `Banner` follows the same call.

## Patterns — to port

Carry VCP vocabulary or page structure.

| Area | Patterns |
|---|---|
| Page structure | `AppShell`, `TopBar`, `Sidebar`, `SidebarItem`, `PageFooter`, `SettingsSection` |
| Domain vocabulary | `StatusPill`, `UrgencyTag`, `RoleBadge`, `DomainLabel`, `AssigneeStatus`, `StatusProgression` |
| Domain objects | `DomainCard`, `DomainSelector`, `DomainAccessTable`, `DeliverableLink`, `MultipartEditor`, `ReviewPanel`, `WatchersList` |
| Tables and planning | `PlanningTable`, `BudgetTable`, `HolidayTable`, `HolidayForm`, `GanttChart`, `AvailabilityGrid`, `PeriodSelector`, `FilterBar` |
| Collaboration | `CommentItem`, `CommentComposer`, `NotificationItem`, `UserMenu` |
| Marketing / email | `MarketingHero`, `FeatureCard`, `ProblemCard`, `ChangelogCard`, `EmailLayout` |

Dependency notes:

- **`DomainSelector` is blocked** on `Icon`, `Menu` and `DomainLabel`. It was
  deferred once already for exactly this reason. `DomainLabel` additionally colours
  six domains with an indigo and a pink that have **no core ramp** — those ramps are
  a token decision to settle before it is built, not during.
- `AppShell` is blocked on `TopBar` and `Sidebar`; it composes them plus an optional
  390px detail column.
- `TopBar` is blocked on `Logo`, `Menu`, `Avatar` and `IconButton`.
- The four tables are all blocked on `DataTable`; build it once and specialise.

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
- **`docs/button.md` drift** — says `outline-line-brand` where the code says
  `outline-stroke-focused`. (It also said `ghost` where the code says `tertiary`;
  that half was fixed by PR #31.)
- **Dead spacing classes** — `gap-sm`, `mb-xs`, `mb-2xs` appear in
  `Button.stories.tsx` and `Foundations.stories.tsx`. There are no `--spacing-*`
  tokens, so Tailwind emits nothing for them and the layout silently loses its gaps.
  New files use the numeric scale.

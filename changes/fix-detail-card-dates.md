---
bump: minor
---
### Dates in the details card and every cycle read dd/mm/yyyy (November 2026)

Every date reads **dd/mm/yyyy** (decided 6 November), or the person's locale under `DateFormatProvider`. Two places still wrote dates in words:

- **`DetailCard`** wrote Start Date, Due Date, Deployment Date, Date Initiated and Date Accepted as "November 5, 2026". They now read "05/11/2026". Its cycle picker showed the raw ISO dates ("2025-09-20 - 2026-10-02"); it now reads like the tag.
- **Cycles** read "C18 (Sep 20, 2025 - Oct 02, 2026)" in `CycleTag`, `MoveAVToCycleModal`, `FilterBar`'s cycle field and `GanttChart`'s cycle picker. They now read "C18 (20/09/2025 - 02/10/2026)", all from one formatter: `formatDateRange` (new, in the date helpers) and `useDateFormat().range`. `formatCycleRange` stays and takes an optional locale.

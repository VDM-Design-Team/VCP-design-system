---
bump: patch
---
### `DetailCard` — dates read dd/mm/yyyy (November 2026)

The card wrote its dates as words ("November 5, 2026"): Start Date, Due Date, Deployment Date, Date Initiated and Date Accepted. They now read **dd/mm/yyyy** ("05/11/2026"), like every other date in the system (decided 6 November), and follow the person's locale when the product sets one with `DateFormatProvider`.

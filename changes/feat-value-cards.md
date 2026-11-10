---
bump: minor
---
### `ValueCards` — the dashboard's status counts (November 2026)

New pattern, read off the Figma `Value_Cards`: a titled card holding a `StatCard` for each status, with an optional "whose" filter beside the title (Figma lists All, Initiated, Assigned and Team). Figma draws six (Completed, In Review, Overdue, In Progress, Pending, Draft), and the stories show those six: Completed `success`, In Review and In Progress `brand`, Overdue `critical`, Pending `yellow`, Draft `neutral`. Which statuses a role sees is the page's: pass the items, it does no counting.

It reflows with its card's own width (a container query): six cards are one row from 71rem (six 176 cards and five gaps of 16, a 1440 window less the 256 rail), then three by two, two by three and one column; four or fewer are four across, two by two, then one column. Loading shows placeholders, and with no items it says so.

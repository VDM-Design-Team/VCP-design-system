---
bump: minor
---
### `DomainAccessTable` — per-domain access and admin rights (November 2026)

New, built to Figma's `_Accounts_User_Modal_Domain_Access_Table`: a row per domain with an Access checkbox, an Admin checkbox and the Role they add up to (`domainRole`: Admin if ticked, else User if Access, else No Access), shown as a `Tag`. Both boxes are always available, and **Admin implies Access**: ticking Admin also ticks Access, and un-ticking Access also un-ticks Admin, so a row never reads Admin for a domain the person cannot get into. Controlled; one click can report both boxes, so callers update their rows functionally. Admin's tag is blue (`brand`), User's green, No Access grey.

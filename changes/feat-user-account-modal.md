---
bump: minor
---
### `UserAccountModal` — add or edit a user (November 2026)

New pattern, built to Figma's `Accounts_Page_User_Modal`: one dialog in two modes. `new` ("User", empty, no Capacity Points) and `edit` (the user's name as the title, filled, with Capacity Points and its own Save). Both have a photo with Upload (opens the file picker, no crop or remove), Status, Name, Email and Proficiency (the lists are passed in), the Domain Access & Admin Rights table (`DomainAccessTable`) and Submit. It keeps its own draft, reset each time it opens; Name and Email are required and Submit says what is wrong and moves focus; `errors` carries what only the server knows. It saves nothing itself.

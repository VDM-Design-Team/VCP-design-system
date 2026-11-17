---
bump: patch
---
### `DeliverablesCard` — removing a link no longer drops focus (November 2026)

Removing a link took its bin away and left keyboard focus on the page. Once the page has removed the link, focus now moves to the bin of the link that took its place, else the one before it, else the section's + (or the add form's first field while the form is open), as `Attachments` already does for files. A new story removes links for real and checks each landing place.

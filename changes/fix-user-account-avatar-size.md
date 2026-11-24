---
bump: patch
---
### `UserAccountModal` — the photo uses the avatar's own 48 size (November 2026)

The photo in the Add / Edit User dialog was the `lg` avatar (36) stretched to 48 with a `size-12` override. It now uses `Avatar size="3xl"`, the system's 48 (Figma's `Profile_Image` XXL), so nothing is overridden. It looks the same, apart from the initials: they are now the 3xl type step (16) instead of the stretched 36's (14).

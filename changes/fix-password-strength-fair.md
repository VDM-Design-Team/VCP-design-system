---
bump: patch
---
### `PasswordStrength` — Fair is brown, as Figma draws it (November 2026)

Fix: Fair was the bright `caution` yellow (`accent.yellow.medium`), on the reading that Figma painted a bright yellow, at 1.28:1 against the light track. Figma's `_Password_Item_Strength` draws Fair brown, so it is now the `warning` tone (`accent.warning.filled.surface`): 4.00:1 light, 5.42:1 dark, above the 3:1 a meaningful graphic should reach. The other four levels are unchanged. No API change.

---
bump: minor
---
### `Dropzone` checks the files it takes (November 2026)

`Dropzone` now checks **every** file against `accept` and a new `maxSize`, dropped ones too (before, `accept` only filtered the browse dialog and a dropped file of any type or size went straight to `onFiles`). `accept` defaults to PNG, JPG, GIF, DOCX, CSV and PDF and `maxSize` to 10MB, as the default hint already said (`*` takes anything). A file that fails is turned away: the zone says why in its error state ("photo.heic is not a file type we take", "huge.png is 11 MB; the limit is 10 MB") until the next selection, and the new `onReject` gets the same list. Only the files that pass reach `onFiles`. A caller's own `error` still wins.

Behaviour change to know about: a caller that relied on dropped files of any type reaching `onFiles` must now pass `accept="*"`. The accepted types and the limit are as the team understands them and are to be confirmed with design.

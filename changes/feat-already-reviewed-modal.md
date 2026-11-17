---
bump: minor
---
### `AlreadyReviewedModal` — the "Already Reviewed" popup (November 2026)

New component, built to Figma's `Review_Already_Reviewed_Popup`: **"Already Reviewed"**, "This Value has already been reviewed." (Figma's line, without "by the initiator", so it holds whoever reviewed it) and one **Close** at the footer's right, like every dialog's (Figma draws it the dialog's whole width, from the old design; every standard dialog's footer is right-aligned, the Change Log carousel being the one exception). It tells and does nothing else; the page decides when it shows (the design puts it in no flow). `title`, `message` and `closeLabel` can be changed, so the page can name the reviewer. Docs in `docs/already-reviewed-modal.md`; `docs/review-av-modal.md` and `docs/figma-audit.md` no longer say it is not ported.

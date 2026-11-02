---
bump: patch
---
### `Tag`'s ✕ keeps its contrast on hover; `CheckboxMark` is tested against `Checkbox` (November 2026)

Fix: on a tag of any tone but neutral, the ✕ dimmed to 70% on hover, which took eight of the 48 style and tone pairs under the 3:1 a control needs (down to 2.74:1, on light tonal warning). Hover and pressed now take the tag's own hover and pressed tokens, which only move away from the background, and a filled tag shows its tone's hover fill behind the ✕. A new *Removable everywhere* story shows the removable tag at every size and in every style and tone in both themes, and its test checks the ✕ at 3:1 at rest, hovered and pressed on all of them. `docs/tag.md` now says to move focus when a tag is removed.

`CheckboxMark`'s story now shows both themes, and its test compares every mark with a real `Checkbox` in the same state, so the two cannot drift apart unnoticed. No API change.

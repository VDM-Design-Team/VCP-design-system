---
bump: minor
---
### `FileAttachment` and `Dropzone` — the attachments elements, to the design (October 2026)

Follow-up to #126; built to Figma's attachments elements.

**`FileAttachment`**
- **New `domain` prop** — the corner badge for an AV handed over from another domain, with
  its glyph and code: Design DS, Development DV, Governance GV, Content CN, Partners PT,
  QA QA. The mapping is owned by the component. `domainLabel` / `domainIcon` stay for a code
  outside the six. New icon: `file-magnifying-glass`.
- The remove button sits **2 in from the top-right corner** (was flush).
- **Fixed:** a short name was pushed to the card's right edge; it now stays centred under the glyph.
- A remove-only card (`onRemove`, no `onClick`) takes the hover fill, as edit mode draws it.

**`Dropzone`**
- **2 dashed `stroke.default` border** (was 1 dashed `stroke.field`) on `surface.neutral.faint`
  (was `surface.elevated`); **24 padding, 8 gap**; a **32 `paperclip`** in `text.subtle` (was a 24 cloud).
- **Copy:** the label defaults to **"Upload a file"** (was "Choose files") and the hint to
  "PNG, JPG, GIF, DOCX, CSV and PDF file up to 10MB"; line one is 14 regular `text.primary`
  with an underlined link-blue verb, the hint `caption-md-regular`.
- **States:** drag-over is `stroke.focused` on `surface.brand.subtle` (was `brand.base`), and a
  drag **within 16 of the zone** counts; error keeps the **regular fill** with a critical
  stroke (was a red-tinted fill and a warning glyph).
- **Known soft spot:** the resting border is 1.42:1 (light) — under the 3:1 a control boundary
  needs — because the design specifies `stroke.default`. See `docs/dropzone.md`.
- `HandoffAVModal` takes the new copy by dropping its "Attach Files" override.

Migration: callers that relied on "Choose files" or the 1 `stroke.field` border pass `label` or
restyle; nothing else.

---
bump: minor
---
### `DomainLabel` — the domain pill (October 2026)

New component, to Figma's `_Domain_Label`: the small pill that says which domain something came from, a glyph and two letters ("DS", "DV", "GV", "CN", "PT", "QA"), with an optional "Added by {domain}" tooltip. It owns the domain → glyph, code and name mapping. `FileAttachment`'s corner badge now draws through it (unchanged to look at).

### `DeliverableLinkForm`, `DeliverableLink`, `DeliverablesCard` — what an Added Value delivers (October 2026)

New, to Figma's `Deliverables_Card`. **`DeliverableLinkForm`** (component) takes links: a URL and a title, "+ Add another link", Cancel and Add or Save, checked when pressed ("Please enter a link title", "Please enter a valid URL starting with https://"). **`DeliverableLink`** (component) is one added link: its domain label and a hyperlink, with a pencil and a bin on hover that turn it into the form in place. **`DeliverablesCard`** (pattern) is the card: `domain` picks Links (Design) or Video Links and Links (Development), both with Attachments (`FileAttachment`s and a `Dropzone`); `mode` is `view` or `edit`.

### `AttachmentViewer` — open an attached file full screen (October 2026)

New component: a full-screen gallery for attached files, built on `Modal`. Header with the file's glyph, name and "2 of 4", download and close; previous and next arrows; a strip of thumbnails; an image can be zoomed (− + reset, with the percentage; the keys `+ - 0`), a PDF shows in the browser's own viewer, a video plays, and anything else says there is no preview and offers the download. `DeliverablesCard` opens it from a file card, in view or edit. **`Modal` gains `size="full"`** (the whole viewport, no corners). Icons gain `video-camera` (Video Links) and `arrows-clockwise` (reset zoom).

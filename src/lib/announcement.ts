import type { ChangeLogKind } from './changelog-kinds';

/**
 * Announcement — **the one record** the Announcements work shares: the table's rows, the overview's figures, the create/edit dialog's
 * draft, and the System Changelog's cards are all this, or a few fields of it. Each component takes the fields it shows
 * (`Pick<Announcement, …>`), so a page passes one object to all of them and the names cannot drift.
 *
 * - **`kind`** is one of the three (`experimental`, `update`, `feature`), and its glyph, colour and words come from the one owner,
 *   `lib/changelog-kinds`. The UI calls it "Type"; the data calls it `kind` because that is what the owner calls it.
 * - **`version`** is semantic and reads "v1.18.1" (lowercase v), as plain text.
 * - **`date`** is ISO ("2026-01-01"); whatever shows it formats it with `useDateFormat`.
 * - **`description`** is the announcement's text; **`changelogUrl`** is its changelog document, which a card's title links to.
 * - **`features`** is what shipped, one line each.
 */
export interface Announcement {
  id: string | number;
  title: string;
  /** Semantic, as it reads: "v1.18.1". */
  version: string;
  kind: ChangeLogKind;
  /** ISO: "2026-01-01". */
  date: string;
  description?: string;
  /** The changelog document (an `http(s)` address). */
  changelogUrl?: string;
  features: readonly string[];
}

/** Semantic versioning with the lowercase "v": "v1.18.1". The dialog accepts it with or without the "v" and writes it with. */
export const VERSION_PATTERN = /^v?\d+\.\d+\.\d+$/i;

/** "1.18.1" or "V1.18.1" → "v1.18.1". Anything that is not semantic comes back as it was. */
export const formatVersion = (version: string): string => {
  const trimmed = version.trim();
  return VERSION_PATTERN.test(trimmed) ? `v${trimmed.replace(/^v/i, '')}` : version;
};

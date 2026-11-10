import type { IconName } from '../atoms/icon';

/**
 * The three kinds of announcement, and the glyph, colour and words each one has: a flask for something experimental, a megaphone for a
 * release, a rocket for a new feature. **This is the one owner of that mapping**: `ChangeLogModal` (one announcement at a time) and
 * `ChangelogItem` (a release card) both read it, so the two cannot drift apart. Read off Figma's `_Changelog_Main_Content` (`7211:902`).
 *
 * The glyph is decorative wherever it is drawn; `label` is what a screen reader hears, because a colour and a shape are not a label.
 */
export type ChangeLogKind = 'experimental' | 'update' | 'feature';

export interface ChangeLogKindStyle {
  icon: IconName;
  /** The glyph's colour, a token class. */
  className: string;
  /** What the kind is called: "Release". */
  label: string;
}

export const CHANGELOG_KINDS: Record<ChangeLogKind, ChangeLogKindStyle> = {
  experimental: { icon: 'flask', className: 'text-accent-green-strong', label: 'Experimental feature' },
  update: { icon: 'megaphone', className: 'text-accent-yellow-medium', label: 'Release' },
  feature: { icon: 'rocket', className: 'text-accent-info-outline-content-default', label: 'New feature' },
};

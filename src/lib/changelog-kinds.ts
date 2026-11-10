import type { IconName } from '../atoms/icon';
import type { ClassificationTone } from './classification-tones';

/**
 * The three kinds of announcement, and the glyph, colour and words each one has: a flask for something experimental, a megaphone for a
 * release, a rocket for a new feature. **This is the one owner of that mapping**: `ChangeLogModal` (one announcement at a time),
 * `ChangelogItem` (a release card), the Announcements table's Type tag and the announcement dialog's Type list all read it, so none
 * of them can drift apart. Read off Figma's `_Changelog_Main_Content` (`7211:902`).
 *
 * The glyph is decorative wherever it is drawn; `label` is what a screen reader hears, because a colour and a shape are not a label.
 * `name` is the short word a Type tag or a Type list shows ("Feature"); `tone` is that tag's colour, the same hue as the glyph.
 */
export type ChangeLogKind = 'experimental' | 'update' | 'feature';

export interface ChangeLogKindStyle {
  icon: IconName;
  /** The glyph's colour, a token class. */
  className: string;
  /** What the kind is called to a screen reader: "Release". */
  label: string;
  /** The short word a Type tag or list shows: "Update". */
  name: string;
  /** The Type tag's tone: the glyph's hue. */
  tone: ClassificationTone;
}

export const CHANGELOG_KINDS: Record<ChangeLogKind, ChangeLogKindStyle> = {
  experimental: { icon: 'flask', className: 'text-accent-green-strong', label: 'Experimental feature', name: 'Experimental', tone: 'success' },
  update: { icon: 'megaphone', className: 'text-accent-yellow-medium', label: 'Release', name: 'Update', tone: 'warning' },
  feature: { icon: 'rocket', className: 'text-accent-info-outline-content-default', label: 'New feature', name: 'Feature', tone: 'info' },
};

/** The kinds in the order every list shows them: Experimental, Update, Feature. */
export const CHANGELOG_KIND_ORDER: readonly ChangeLogKind[] = ['experimental', 'update', 'feature'];

import * as React from 'react';
import { Button } from '../../atoms/button';
import { Icon, type IconName } from '../../atoms/icon';
import { EmptyState, type EmptyStateProps } from '../empty-state';

/**
 * TableEmpty — what every table says when it has no rows. One look and one set of
 * words, so tables cannot drift apart: the brand-tinted icon tile, a title that names
 * what is missing, and a way out.
 *
 * Two cases, and only two:
 * - **Nothing yet** (`filtered` off): "No accounts yet." with the table's own icon.
 * - **Filtered** (`filtered` on, or a `search`): "No accounts match “zzz”." with a
 *   magnifying glass, a sentence on what to try, and, when the page can put the
 *   filters back (`onReset`), **Reset**, the same word `FilterBar` uses.
 *
 * A table passes its plural noun and its icon, never its own sentences. A table whose
 * Figma draws other words can pass `title`, and it is the one exception.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface TableEmptyProps
  extends Omit<EmptyStateProps, 'title' | 'icon' | 'description' | 'action'> {
  /** The plural of what the table lists, lower case: "accounts", "holidays". Without one the words are generic ("Nothing here yet."). */
  noun?: string;
  /** The table's own glyph for "nothing yet". Filtered always shows the magnifying glass. */
  icon?: IconName;
  /** The filters or the search are why there are no rows. */
  filtered?: boolean;
  /** The search text, if there is one: it names the empty result, and it also means `filtered`. */
  search?: string;
  /** Replaces the title. Only for a table whose Figma draws other words. */
  title?: React.ReactNode;
  /** What to try when filtered. Defaults to a sentence that fits any table; say which fields the search covers when you can. */
  hint?: React.ReactNode;
  /** Puts the filters back. Shows **Reset** under a filtered result. Optional: leave it out (or pass `undefined`) and there is no Reset. */
  onReset?: () => void;
  /** The way forward when there is nothing yet (usually a `Button`). Leave it out when the table's own header already has "New …". */
  action?: React.ReactNode;
}

export const TableEmpty = React.forwardRef<HTMLDivElement, TableEmptyProps>(
  ({ noun, icon = 'list-bullets', filtered, search, title, hint, onReset, action, ...props }, ref) => {
    const text = search?.trim();
    const isFiltered = Boolean(filtered || text);
    const words = isFiltered
      ? noun
        ? text
          ? `No ${noun} match “${text}”.`
          : `No ${noun} match these filters.`
        : text
          ? `Nothing matches “${text}”.`
          : 'Nothing matches these filters.'
      : noun
        ? `No ${noun} yet.`
        : 'Nothing here yet.';
    return (
      <EmptyState
        ref={ref}
        icon={<Icon name={isFiltered ? 'magnifying-glass' : icon} size="lg" />}
        title={title ?? words}
        description={isFiltered ? (hint ?? 'Try a different search, or change the filters.') : undefined}
        action={
          isFiltered
            ? onReset && (
                <Button size="sm" variant="secondary" onClick={onReset}>
                  Reset
                </Button>
              )
            : action
        }
        {...props}
      />
    );
  },
);
TableEmpty.displayName = 'TableEmpty';

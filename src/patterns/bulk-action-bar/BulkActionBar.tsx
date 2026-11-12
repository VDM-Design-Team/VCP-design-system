import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { Menu, type MenuItem } from '../../components/menu';

/**
 * BulkActionBar — the bar that appears over an AV table once rows are selected: **"4 Selected ✕"**, then one dropdown per thing you can change (**Status**,
 * **Urgency**, **Type**, **Cycle**) and **Delete**. Built to Figma's `Bulk_Action_Bar_AV_Table` (`_Bulk_Action_Bar_Selected_Items_Chip`,
 * `_Bulk_Action_Bar_Action_Button`) and `Bulk_Actions_Dropdowns`.
 *
 * - **The chip** says how many are selected and clears them (it is a button: "Clear selection").
 * - **Each action is a menu** that opens **upward** (the bar sits at the bottom of the window) with a category-style heading ("Urgency") and the choices the page gives it. A choice
 *   can have **its own submenu** (Status: Pending Review › Accept, Reject; shown with a right caret). Picking one
 *   only *asks*: `onSelect(key)` — the page then opens a confirmation (`BulkActionConfirmModal`) before anything changes.
 * - **The actions are `Button`'s `neutral-tertiary`** (`neutral.textual.content`, with its hover and pressed), the same palette the date picker's carets use; **Delete** is its `critical-tertiary` (red text, no fill); it only asks too (`onDelete`).
 * - **It shows only while something is selected** (`count > 0`), and one selected looks the same as many ("1 Selected").
 *
 * **On a narrow screen it keeps its size**: nothing wraps or shrinks, and the bar scrolls sideways inside itself (it is `max-w-full`), **clipped to its rounded corners** so the scrollbar never pokes out of them. Its menus float over the bar's scrolling (`Menu`'s default `fixed` strategy), so it never clips them.
 *
 * **Focus never drops.** At 0 the bar draws nothing, so a button in it that had focus goes with it (after a confirmed Delete, or the chip): pass `returnFocusRef`, the table's select-all checkbox, and focus goes there once the selection empties.
 *
 * It is a `toolbar` named "Bulk actions". Placing it (stuck to the bottom, centred over the table) is the page's: it is just the bar.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface BulkAction {
  key: string;
  /** The button's words: "Status". */
  label: string;
  /** The menu's heading: "Move to Status". Defaults to `label`. */
  heading?: string;
  /** The choices. The page owns what they are (statuses differ by domain; cycles by date). */
  items: MenuItem[];
  /** A search box over the choices (the Cycle menu has one: there are many cycles). */
  searchable?: boolean;
  /** A choice was made: the item's `key`. It only asks; the page confirms. */
  onSelect: (itemKey?: string) => void;
}

export interface BulkActionBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
  /** How many rows are selected. At 0 the bar is not drawn. */
  count: number;
  /** The chip was pressed: the page clears the selection. */
  onClear: () => void;
  actions: readonly BulkAction[];
  /** **Delete** was pressed. Leave it out to hide the button. */
  onDelete?: () => void;
  /**
   * Where focus goes when the selection empties and the bar goes with it (after a confirmed Delete, a bulk change that clears the selection, or the chip): the table's select-all checkbox. Without it focus falls to the page.
   * It only moves focus that has been lost: if the person has put it somewhere, it stays.
   */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

export function BulkActionBar({ className, count, onClear, actions, onDelete, returnFocusRef, ...props }: BulkActionBarProps) {
  /* The bar draws nothing at 0, so whatever had focus in it goes with it: after a confirmed Delete (its dialog gives focus back to a button that is gone) or the "N Selected ✕" chip.
     When the selection empties and focus has fallen to the page, it goes where the caller said. */
  const before = React.useRef(count);
  React.useEffect(() => {
    const had = before.current;
    before.current = count;
    if (had <= 0 || count > 0 || !returnFocusRef) return undefined;
    /* After a dialog has handed focus back to the button that has gone. */
    const timer = setTimeout(() => {
      const active = document.activeElement;
      if (!active || active === document.body) returnFocusRef.current?.focus();
    }, 0);
    return () => clearTimeout(timer);
  }, [count, returnFocusRef]);

  if (count <= 0) return null;
  return (
    /* The outer box is the card (rounded, bordered, shadowed) and **clips**, so the scrollbar that appears on a narrow screen stays inside its rounded corners instead of poking out of them. The
       scrolling is the inner box's. */
    <div
      className={cn(
        'inline-flex max-w-full overflow-hidden rounded-md border border-stroke-strong bg-surface-elevated font-sans shadow-elevation-3',
        className,
      )}
      {...props}
    >
      <div role="toolbar" aria-label="Bulk actions" className="flex items-center gap-4 overflow-x-auto px-3 py-2">
        <button
          type="button"
          onClick={onClear}
          className={cn(
            'inline-flex h-7 shrink-0 items-center gap-1 whitespace-nowrap rounded-sm border border-stroke-default px-3 text-label-sm-regular text-text-secondary transition-colors',
            'hover:bg-surface-neutral-subtle',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
          )}
        >
          {count} Selected
          <Icon name="x" size="sm" aria-hidden="true" />
          <span className="sr-only">: clear the selection</span>
        </button>
        {actions.map((action) => (
          <Menu
            key={action.key}
            align="left"
            placement="top"
            heading={action.heading ?? action.label}
            searchable={action.searchable}
            items={action.items}
            onSelect={action.onSelect}
            trigger={
              /* `neutral-tertiary`: the neutral palette, as the date picker's carets use, not the ghost button's brand blue, which would make every action read as a call to action. */
              <Button variant="neutral-tertiary" size="sm" className="shrink-0" iconLeft={<Icon name="caret-up" size="sm" aria-hidden="true" />}>
                {action.label}
              </Button>
            }
          />
        ))}
        {onDelete && (
          <Button variant="critical-tertiary" size="sm" className="shrink-0" onClick={onDelete}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
BulkActionBar.displayName = 'BulkActionBar';

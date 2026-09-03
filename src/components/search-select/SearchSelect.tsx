import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../icon';
import { Avatar } from '../avatar';

/**
 * SearchSelect — a choice found by typing: people pickers, long supplier
 * lists, anything past the few dozen options where `Select`'s native popup
 * stops scaling. Single or `multiple`; options can lead with an `Avatar`.
 *
 * This is the combobox `Select`'s docs promised — and the one place the
 * custom-listbox tax is worth paying, so it is paid properly: the input is a
 * real `role="combobox"` with `aria-expanded`/`aria-controls` and
 * `aria-activedescendant`; the list is a `listbox` of `option`s
 * (`aria-multiselectable` when `multiple`); ArrowUp/Down move the active
 * option, Enter picks it, Escape closes, and focus never leaves the input —
 * the export's plain input over a stack of buttons had none of that wiring.
 *
 * Filtering is internal, on `label` (which is a `string` for exactly that
 * reason — filtering and Avatar initials both need the words). Options are
 * data: anything VCP-flavoured about *who* is listed belongs to the pattern
 * that calls this.
 *
 * The panel is positioned inline (absolute, below the field), not through
 * `Popover` — Popover moves focus into its panel, and a combobox must keep
 * focus in the input. No flipping, same as Popover's own stance.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface SearchSelectOption {
  value: string;
  /** A string on purpose — it is what filtering matches and Avatar initials use. */
  label: string;
  /** `false` suppresses the leading avatar for this option. */
  avatar?: boolean;
}

export interface SearchSelectProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Strings are shorthand for `{ value, label }`. */
  options?: ReadonlyArray<string | SearchSelectOption>;
  /** A string when single, an array when `multiple`. */
  value?: string | readonly string[];
  /** Hands back a string (single) or the next array (`multiple`). */
  onChange?: (value: string & string[]) => void;
  placeholder?: string;
  /** Replaces an option row's content. Selection visuals stay yours to draw. */
  renderOption?: (option: SearchSelectOption, selected: boolean) => React.ReactNode;
  emptyText?: string;
  multiple?: boolean;
  /** Suppress every avatar — for option sets that are not people. */
  avatars?: boolean;
  disabled?: boolean;
}

export const SearchSelect = React.forwardRef<HTMLDivElement, SearchSelectProps>(
  (
    {
      className,
      options = [],
      value,
      onChange,
      placeholder = 'Search…',
      renderOption,
      emptyText = 'No matches',
      multiple,
      avatars = true,
      disabled,
      ...props
    },
    ref,
  ) => {
    const listId = React.useId();
    const [query, setQuery] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [active, setActive] = React.useState(0);

    const normalized = options.map((o) =>
      typeof o === 'string' ? { value: o, label: o } : o,
    );
    const list = query
      ? normalized.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
      : normalized;
    const selected: readonly string[] = Array.isArray(value) ? value : value ? [value as string] : [];
    const activeIndex = Math.min(active, list.length - 1);
    const activeOption = list[activeIndex];
    /* Ids are index-based — option values are arbitrary strings ("Marvin
       Ode"), and an id with a space is invalid HTML that some AT refuse to
       resolve through aria-activedescendant. */
    const optionId = (i: number) => `${listId}-opt-${i}`;

    const pick = (v: string) => {
      if (multiple) {
        const next = selected.includes(v)
          ? selected.filter((x) => x !== v)
          : [...selected, v];
        onChange?.(next as string & string[]);
      } else {
        onChange?.(v as string & string[]);
        setOpen(false);
        setQuery('');
      }
    };

    const show = (o: boolean) => {
      setOpen(o);
      if (o) setActive(0);
    };

    return (
      <div ref={ref} className={cn('relative font-sans', className)} {...props}>
        <div
          className={cn(
            'flex h-10 items-center gap-2 rounded-md border bg-surface-elevated px-3 transition-colors',
            'border-stroke-field focus-within:border-stroke-focused',
            'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stroke-focused',
            'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:bg-surface-neutral-subtle has-[input:disabled]:border-stroke-subtle',
          )}
        >
          <Icon
            name="magnifying-glass"
            size="sm"
            aria-hidden="true"
            className="shrink-0 text-text-tertiary"
          />
          <input
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && activeOption ? optionId(activeIndex) : undefined}
            disabled={disabled}
            value={query}
            placeholder={placeholder}
            onFocus={() => show(true)}
            onBlur={() => show(false)}
            onChange={(e) => {
              setQuery(e.target.value);
              show(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                open ? setActive((a) => Math.min(a + 1, list.length - 1)) : show(true);
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              }
              if (e.key === 'Enter' && open && activeOption) {
                e.preventDefault();
                pick(activeOption.value);
              }
              if (e.key === 'Escape') show(false);
            }}
            className={cn(
              'min-w-0 flex-1 border-0 bg-transparent text-body-md text-text-primary outline-none',
              'placeholder:text-text-subtle',
              'disabled:cursor-not-allowed disabled:text-text-disabled',
            )}
          />
          {selected.length > 0 && (
            /* How many are chosen while the field shows the query instead. */
            <span
              aria-label={`${selected.length} selected`}
              className="shrink-0 font-numeric text-caption-md text-text-brand-medium"
            >
              {selected.length}
            </span>
          )}
        </div>
        <div
          role="listbox"
          id={listId}
          aria-multiselectable={multiple || undefined}
          hidden={!open}
          className={cn(
            'absolute inset-x-0 top-full z-50 mt-1.5 max-h-56 overflow-y-auto',
            'rounded-md border border-stroke-subtle bg-surface-elevated p-1 shadow-menu',
          )}
        >
          {list.length === 0 ? (
            <div className="px-2.5 py-3 text-center text-body-sm text-text-subtle">
              {emptyText}
            </div>
          ) : (
            list.map((o, i) => {
              const isSelected = selected.includes(o.value);
              const isActive = o.value === activeOption?.value;
              return (
                <div
                  key={o.value}
                  role="option"
                  id={optionId(i)}
                  aria-selected={isSelected}
                  /* mousedown, prevented, so the input never blurs. */
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(o.value);
                  }}
                  onMouseMove={() => setActive(i)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-2 text-body-sm',
                    isSelected
                      ? 'bg-surface-brand-faint text-text-brand-strong'
                      : 'text-text-secondary',
                    isActive && !isSelected && 'bg-surface-neutral-faint',
                    isActive && isSelected && 'bg-surface-brand-subtle',
                  )}
                >
                  {renderOption ? (
                    renderOption(o, isSelected)
                  ) : (
                    <>
                      {avatars && o.avatar !== false && <Avatar size="sm" name={o.label} />}
                      <span className="min-w-0 flex-1 truncate">{o.label}</span>
                      {isSelected && (
                        <Icon name="check" size="sm" aria-hidden="true" className="shrink-0" />
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  },
);
SearchSelect.displayName = 'SearchSelect';

import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { Icon } from '../../atoms/icon';

/**
 * UserSelect — one person from a list you can search: an assignee, an
 * initiator, a filter by user. The field shows the person picked; the panel
 * opens with a search field over avatar rows.
 *
 * Built to Figma's `_Filter_User` field and `Filter_Menu_User_Dropdown`
 * (`Filters` page): a text-field-shaped trigger reading "Select User", and a
 * menu with `Search…` at the top, an **Unassigned** row, then the people with
 * their avatars.
 *
 * Where `SearchSelect` is a text input that clears itself after a pick (so it
 * cannot show who was chosen) and `MultiSelect` ticks several, this is the one
 * that picks one and says who. Options are data: who may be listed is the
 * caller's business.
 *
 * **The wiring.** The trigger is a `<button aria-haspopup="listbox">`. Open,
 * focus moves to the search input, which is the combobox (`aria-controls`,
 * `aria-activedescendant`, `aria-autocomplete="list"`) over a `listbox` of
 * `option`s: ArrowUp and ArrowDown move, Enter picks and closes, Escape closes
 * and puts focus back on the trigger, Tab closes, and a click away closes.
 * Rows pick on a prevented `mousedown`, so a click never blurs the search.
 *
 * The panel is positioned inline (absolute, under the field), like
 * `SearchSelect`: no flipping, and it clips inside an `overflow: hidden`
 * ancestor.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface UserSelectOption {
  value: string;
  /** A string on purpose: it is what the field says, what search matches and what the avatar's initials use. */
  label: string;
  /** A photo. Without one the avatar shows initials. */
  src?: string;
  /** The "Unassigned" row: a plain person glyph instead of an avatar. */
  unassigned?: boolean;
}

export interface UserSelectProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  options?: ReadonlyArray<UserSelectOption>;
  /** The picked `value`. `''` (or omitted) shows the placeholder. */
  value?: string;
  onChange?: (value: string) => void;
  /** Shown while nothing is picked. */
  placeholder?: string;
  /** The search field's placeholder. */
  searchPlaceholder?: string;
  /** What the panel says when the search finds no one. */
  emptyText?: string;
  disabled?: boolean;
  /** Critical border + `aria-invalid`. Pair with a visible message. */
  invalid?: boolean;
  /** Id of the trigger button, for a `Field` label's `htmlFor`. */
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export const UserSelect = React.forwardRef<HTMLDivElement, UserSelectProps>(
  (
    {
      className,
      options = [],
      value = '',
      onChange,
      placeholder = 'Select user',
      searchPlaceholder = 'Search…',
      emptyText = 'No matches',
      disabled,
      invalid,
      id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const listId = React.useId();
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const searchRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const [active, setActive] = React.useState(0);

    const picked = options.find((o) => o.value === value);
    const list = query
      ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
      : options;
    const activeIndex = Math.min(active, list.length - 1);
    const activeOption = list[activeIndex];
    /* Index-based ids: values are arbitrary strings. */
    const optionId = (i: number) => `${listId}-opt-${i}`;

    const openPanel = () => {
      if (disabled) return;
      setQuery('');
      const at = options.findIndex((o) => o.value === value);
      setActive(Math.max(0, at));
      setOpen(true);
    };
    const closePanel = (restoreFocus = false) => {
      setOpen(false);
      if (restoreFocus) triggerRef.current?.focus();
    };
    const pick = (o: UserSelectOption) => {
      onChange?.(o.value);
      closePanel(true);
    };

    /* Focus the search the moment the panel opens. */
    React.useEffect(() => {
      if (open) searchRef.current?.focus();
    }, [open]);

    return (
      <div
        ref={ref}
        className={cn('relative font-sans', className)}
        onBlur={(e) => {
          onBlur?.(e);
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) closePanel();
        }}
        {...props}
      >
        <button
          ref={triggerRef}
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          onClick={() => (open ? closePanel() : openPanel())}
          className={cn(
            'flex h-10 w-full items-center gap-2 rounded-md border bg-surface-elevated px-3 text-left transition-colors',
            invalid ? 'border-accent-critical-outline-border-default' : 'border-stroke-strong',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
            'disabled:cursor-not-allowed disabled:border-stroke-subtle disabled:bg-surface-neutral-subtle',
          )}
        >
          <span
            className={cn(
              'min-w-0 flex-1 truncate',
              picked
                ? 'text-body-sm-medium text-text-primary'
                : 'text-body-sm-regular text-text-subtle',
              disabled && 'text-text-disabled',
            )}
          >
            {picked ? picked.label : placeholder}
          </span>
          <Icon
            name="caret-down"
            size="sm"
            aria-hidden="true"
            className={cn(
              'shrink-0 text-text-tertiary transition-transform motion-reduce:transition-none',
              open && 'rotate-180',
            )}
          />
        </button>

        <div
          hidden={!open}
          className="absolute inset-x-0 top-full z-50 mt-1.5 overflow-hidden rounded-md border border-stroke-subtle bg-surface-elevated shadow-menu"
        >
          <input
            ref={searchRef}
            type="text"
            role="combobox"
            aria-label={searchPlaceholder}
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && activeOption ? optionId(activeIndex) : undefined}
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, list.length - 1));
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              }
              if (e.key === 'Enter' && activeOption) {
                e.preventDefault();
                pick(activeOption);
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                closePanel(true);
              }
              if (e.key === 'Tab') closePanel();
            }}
            className={cn(
              'block w-full border-0 border-b border-stroke-brand-medium bg-transparent px-3 py-2.5',
              'text-body-sm-regular text-text-primary outline-none placeholder:text-text-subtle',
            )}
          />
          {list.length === 0 && (
            /* Outside the listbox: a listbox may hold only options. */
            <div className="px-2.5 py-3 text-center text-caption-md-regular text-text-subtle">
              {emptyText}
            </div>
          )}
          <div
            role="listbox"
            id={listId}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            hidden={list.length === 0}
            className="max-h-64 overflow-y-auto p-1"
          >
            {list.map((o, i) => {
                const isSelected = o.value === value;
                return (
                  <div
                    key={o.value}
                    role="option"
                    id={optionId(i)}
                    aria-selected={isSelected}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pick(o);
                    }}
                    onMouseMove={() => setActive(i)}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-2 text-body-sm-regular',
                      isSelected
                        ? 'bg-surface-brand-faint text-text-brand-strong'
                        : 'text-text-primary',
                      i === activeIndex && !isSelected && 'bg-surface-neutral-faint',
                      i === activeIndex && isSelected && 'bg-surface-brand-subtle',
                    )}
                  >
                    {o.unassigned ? (
                      <span
                        aria-hidden="true"
                        className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-neutral-subtle text-text-secondary"
                      >
                        <Icon name="user" size="sm" />
                      </span>
                    ) : (
                      <Avatar size="sm" name={o.label} src={o.src} />
                    )}
                    <span className="min-w-0 flex-1 truncate">{o.label}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  },
);
UserSelect.displayName = 'UserSelect';

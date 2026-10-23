import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { Icon } from '../../atoms/icon';
import { Input } from '../../atoms/input';
import { Tag } from '../../atoms/tag';

/**
 * UserSelect — people from a list you can search: an assignee, an initiator, a
 * filter by user. **One** person (the default) or **several** (`multiple`). The
 * field shows who is picked; the panel opens with a search field over avatar
 * rows.
 *
 * The panel is the system's **dropdown-with-search** look, taken from Figma's
 * Edit Viewers dropdown (`Detail_Card_Edit_Viewers`, `7457:91275`): a boxed
 * "Search by name" field with a magnifier, 12 from the panel's edges, over rows
 * 40 tall — a 24 avatar and the name, tinted `brand.faint` on hover and
 * `brand.subtle` pressed. Any dropdown that gains a search field takes this
 * shape. (The viewers dropdown also lists assigned people under a "3 Viewers"
 * heading with a remove button on each; that feature is not built here, and
 * a picked row is marked with a check instead, so a filter can show everyone.)
 *
 * - **Single:** a pick closes the panel and the field says who.
 * - **Multiple:** a pick toggles and the panel stays open. The field shows a
 *   summary ("Amy Lee", "3 selected") or, with `display="tags"`, a removable
 *   tag per person.
 *
 * Where `SearchSelect` is a text input that clears itself after a pick (so it
 * cannot show who was chosen) and `MultiSelect` ticks values from a plain list,
 * this is the people picker. Options are data: who may be listed is the
 * caller's business.
 *
 * **The wiring.** The trigger is a `<button aria-haspopup="listbox">`. Open,
 * focus moves to the search field, which is the combobox (`aria-controls`,
 * `aria-activedescendant`, `aria-autocomplete="list"`) over a `listbox` of
 * `option`s (`aria-multiselectable` when `multiple`): ArrowUp and ArrowDown
 * move, Enter picks, Escape closes and puts focus back on the trigger, Tab
 * closes, and a click away closes. Rows pick on a prevented `mousedown`, so a
 * click never blurs the search. The tags' ✕ buttons sit beside the trigger,
 * never inside it.
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

export type UserSelectDisplay = 'summary' | 'tags';

interface UserSelectBase
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  options?: ReadonlyArray<UserSelectOption>;
  /** Shown while nothing is picked. */
  placeholder?: string;
  /** The search field's placeholder and accessible name. */
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

export interface UserSelectSingleProps extends UserSelectBase {
  multiple?: false;
  /** The picked `value`. `''` (or omitted) shows the placeholder. */
  value?: string;
  onChange?: (value: string) => void;
  display?: never;
}

export interface UserSelectMultipleProps extends UserSelectBase {
  /** Several people: a pick toggles and the panel stays open. */
  multiple: true;
  /** The picked values. Uncontrolled (empty to start) when omitted. */
  value?: readonly string[];
  onChange?: (value: string[]) => void;
  /** How the field shows the picks. */
  display?: UserSelectDisplay;
}

export type UserSelectProps = UserSelectSingleProps | UserSelectMultipleProps;

export const UserSelect = React.forwardRef<HTMLDivElement, UserSelectProps>(
  (
    {
      className,
      options = [],
      multiple,
      value,
      onChange,
      display = 'summary',
      placeholder = 'Select user',
      searchPlaceholder = 'Search by name',
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
    const [inner, setInner] = React.useState<readonly string[]>([]);

    /* One shape inside: the picked values, as an array. */
    const picked: readonly string[] = multiple
      ? ((value as readonly string[] | undefined) ?? inner)
      : value
        ? [value as string]
        : [];
    const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v;

    const list = query
      ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
      : options;
    const activeIndex = Math.min(active, list.length - 1);
    const activeOption = list[activeIndex];
    /* Index-based ids: values are arbitrary strings. */
    const optionId = (i: number) => `${listId}-opt-${i}`;

    const commit = (next: string[]) => {
      if (value === undefined) setInner(next);
      (onChange as ((v: string[]) => void) | undefined)?.(next);
    };

    const openPanel = () => {
      if (disabled) return;
      setQuery('');
      setActive(Math.max(0, options.findIndex((o) => picked.includes(o.value))));
      setOpen(true);
    };
    const closePanel = (restoreFocus = false) => {
      setOpen(false);
      if (restoreFocus) triggerRef.current?.focus();
    };
    const pick = (o: UserSelectOption) => {
      if (multiple) {
        commit(picked.includes(o.value) ? picked.filter((x) => x !== o.value) : [...picked, o.value]);
      } else {
        (onChange as ((v: string) => void) | undefined)?.(o.value);
        closePanel(true);
      }
    };

    /* Focus the search the moment the panel opens. */
    React.useEffect(() => {
      if (open) searchRef.current?.focus();
    }, [open]);

    const summary =
      picked.length === 0
        ? null
        : picked.length === 1
          ? labelOf(picked[0]!)
          : `${picked.length} selected`;
    const showTags = !!multiple && display === 'tags' && picked.length > 0;

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
        <div
          className={cn(
            'flex min-h-10 items-center gap-2 rounded-md border bg-surface-elevated py-1 pr-3 pl-3 transition-colors',
            invalid ? 'border-accent-critical-outline-border-default' : 'border-stroke-strong',
            'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stroke-focused',
            disabled && 'cursor-not-allowed border-stroke-subtle bg-surface-neutral-subtle',
          )}
        >
          {showTags && (
            <span className="flex flex-wrap gap-2">
              {picked.map((v) => (
                <Tag
                  key={v}
                  size="sm"
                  onRemove={disabled ? undefined : () => commit(picked.filter((x) => x !== v))}
                >
                  {labelOf(v)}
                </Tag>
              ))}
            </span>
          )}
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
              'flex h-8 min-w-12 flex-1 items-center justify-between gap-2 rounded-sm text-left outline-none',
              summary && !showTags
                ? 'text-body-sm-medium text-text-primary'
                : 'text-body-sm-regular text-text-subtle',
              showTags && 'justify-end',
              'disabled:cursor-not-allowed disabled:text-text-disabled',
            )}
          >
            {showTags ? (
              /* The tags carry the value; the button still needs a name. */
              <span className="sr-only">{`${picked.length} selected. ${placeholder}`}</span>
            ) : (
              <span className="min-w-0 truncate">{summary ?? placeholder}</span>
            )}
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
        </div>

        <div
          hidden={!open}
          className="absolute inset-x-0 top-full z-50 mt-1.5 overflow-hidden rounded-md border border-stroke-subtle bg-surface-elevated py-1 shadow-menu"
        >
          <div className="p-3">
            <Input
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
              fullWidth
              leadingIcon={<Icon name="magnifying-glass" size="sm" />}
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
            />
          </div>
          {list.length === 0 && (
            /* Outside the listbox: a listbox may hold only options. */
            <div className="px-3 pt-1 pb-3 text-caption-md-semibold text-text-tertiary">
              {emptyText}
            </div>
          )}
          <div
            role="listbox"
            id={listId}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-multiselectable={multiple || undefined}
            hidden={list.length === 0}
            className="max-h-64 overflow-y-auto"
          >
            {list.map((o, i) => {
              const isSelected = picked.includes(o.value);
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
                    'flex h-10 cursor-pointer items-center gap-1.5 px-3 text-body-sm-medium text-text-secondary',
                    i === activeIndex && 'bg-surface-brand-faint',
                    'active:bg-surface-brand-subtle',
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
                  {isSelected && (
                    <Icon
                      name="check"
                      size="sm"
                      aria-hidden="true"
                      className="shrink-0 text-text-brand-strong"
                    />
                  )}
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

import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { Button } from '../../atoms/button';
import { CheckboxMark } from '../../atoms/checkbox';
import { Icon } from '../../atoms/icon';
import { Input } from '../../atoms/input';
import { Tag } from '../../atoms/tag';

/**
 * SearchSelect — the system's dropdown for picking from a list that is too long,
 * or too rich, for the native `Select`: people, tags, statuses. **One field, one
 * panel.** The field shows what is picked; pressing it opens a panel with an
 * optional search box over the rows.
 *
 * - **One or several.** A pick closes the panel and the picked row carries a
 *   trailing check (the default). With `multiple`, a pick toggles, the panel
 *   stays open and each row leads with a checkbox.
 * - **The field shows the value**: the name, "3 selected", or with
 *   `display="tags"` a removable tag per pick.
 * - **Search is in the panel, never in the field.** It is on by default
 *   (`searchable={false}` for a short list) and filters the options you pass.
 *   See "Decisions" in docs/search-select.md before changing that: it is the
 *   point of this component.
 * - **Rows** can be grouped under headings (`group`), lead with an avatar
 *   (`avatars`, `avatar`, `src`) or the "Unassigned" glyph (`unassigned`), and
 *   be disabled.
 * - **`confirm`** (multiple) drafts the ticks behind a Clear all / Apply
 *   footer: `onChange` fires only on Apply, and Escape or a click away throws
 *   the draft out.
 *
 * The panel is the dropdown-with-search look from Figma's Edit Viewers
 * dropdown (`7457:91275`): a boxed search field with a magnifier 12 from the
 * edges, rows 40 tall — an avatar, the name, `brand.faint` on hover and
 * `brand.subtle` pressed. Group headings, the checkbox rows and the Apply
 * footer come from the filter menus (`Filters` page).
 *
 * **The wiring.** The trigger is a `<button aria-haspopup="listbox">`. With
 * search, opening moves focus to the search field, which is the combobox
 * (`aria-controls`, `aria-activedescendant`, `aria-autocomplete="list"`) over a
 * `listbox` of `option`s (`aria-multiselectable` when `multiple`). Without
 * search the trigger itself is the select-only combobox and keeps focus.
 * ArrowUp and ArrowDown move, Enter picks, Escape closes and returns focus to
 * the trigger, Tab closes, a click away closes. Rows pick on a prevented
 * `mousedown`, so a click never blurs the field. The tags' ✕ buttons sit beside
 * the trigger, never inside it, and the trigger is a `<button>` so a `Field`
 * label's `htmlFor` reaches it.
 *
 * The panel is positioned inline (absolute, under the field): no flipping, and
 * it clips inside an `overflow: hidden` ancestor.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface SearchSelectOption {
  value: string;
  /** A string on purpose: the field, the tags, search and the avatar's initials all use it. */
  label: string;
  /** Rows sharing a `group` sit under one heading, in the order first seen; ungrouped rows lead. */
  group?: string;
  disabled?: boolean;
  /** `true` leads the row with an avatar (initials), `false` suppresses the one `avatars` turns on. */
  avatar?: boolean;
  /** A photo for the avatar. Implies `avatar`. */
  src?: string;
  /** The "Unassigned" row: a person glyph instead of an avatar. */
  unassigned?: boolean;
}

export type SearchSelectDisplay = 'summary' | 'tags';

interface SearchSelectBase
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Strings are shorthand for `{ value, label }`. */
  options?: ReadonlyArray<string | SearchSelectOption>;
  /** Shown in the field while nothing is picked. */
  placeholder?: string;
  /** Show the search box in the panel. On by default; turn it off for a short list. */
  searchable?: boolean;
  /** The search box's placeholder and accessible name. */
  searchPlaceholder?: string;
  /** What the panel says when there are no rows. */
  emptyText?: string;
  /** Lead every row with an avatar — for a list of people. Per-option `avatar` overrides. */
  avatars?: boolean;
  disabled?: boolean;
  /** Critical border + `aria-invalid`. Pair with a visible message. */
  invalid?: boolean;
  /** Id of the trigger button, for a `Field` label's `htmlFor`. */
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export interface SearchSelectSingleProps extends SearchSelectBase {
  multiple?: false;
  /** The picked `value`. `''` shows the placeholder. Uncontrolled when omitted. */
  value?: string;
  onChange?: (value: string) => void;
  display?: never;
  confirm?: never;
  applyLabel?: never;
  clearLabel?: never;
}

export interface SearchSelectMultipleProps extends SearchSelectBase {
  /** Several picks: a pick toggles and the panel stays open. */
  multiple: true;
  /** The picked values. Uncontrolled (empty to start) when omitted. */
  value?: readonly string[];
  /** The next array. With `confirm`, only on Apply. */
  onChange?: (value: string[]) => void;
  /** How the field shows the picks. */
  display?: SearchSelectDisplay;
  /** Draft the ticks in the panel, with a Clear all / Apply footer. */
  confirm?: boolean;
  applyLabel?: string;
  clearLabel?: string;
}

export type SearchSelectProps = SearchSelectSingleProps | SearchSelectMultipleProps;

const normalize = (o: string | SearchSelectOption): SearchSelectOption =>
  typeof o === 'string' ? { value: o, label: o } : o;

export const SearchSelect = React.forwardRef<HTMLDivElement, SearchSelectProps>(
  (
    {
      className,
      options = [],
      multiple,
      value,
      onChange,
      display = 'summary',
      confirm,
      applyLabel = 'Apply',
      clearLabel = 'Clear all',
      placeholder = 'Select…',
      searchable = true,
      searchPlaceholder = 'Search',
      emptyText = 'No matches',
      avatars,
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
    /* The panel's working copy while `confirm` is on. */
    const [draft, setDraft] = React.useState<readonly string[]>([]);

    const all = options.map(normalize);
    const labelOf = (v: string) => all.find((o) => o.value === v)?.label ?? v;
    const committed: readonly string[] =
      value === undefined ? inner : multiple ? (value as readonly string[]) : value ? [value as string] : [];
    const shown = multiple && confirm && open ? draft : committed;

    const list = searchable && query
      ? all.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
      : all;
    const firstEnabled = (rows: SearchSelectOption[]) => Math.max(0, rows.findIndex((o) => !o.disabled));
    const activeIndex = Math.min(active, list.length - 1);
    const activeOption = list[activeIndex];
    /* Index-based ids: values are arbitrary strings. */
    const optionId = (i: number) => `${listId}-opt-${i}`;

    const commit = (next: string[]) => {
      if (value === undefined) setInner(next);
      if (multiple) (onChange as ((v: string[]) => void) | undefined)?.(next);
      else (onChange as ((v: string) => void) | undefined)?.(next[0] ?? '');
    };

    const openPanel = () => {
      if (disabled) return;
      setQuery('');
      setDraft(committed);
      const at = all.findIndex((o) => committed.includes(o.value));
      setActive(at >= 0 ? at : firstEnabled(all));
      setOpen(true);
    };
    const closePanel = (restoreFocus = false) => {
      setOpen(false);
      if (restoreFocus) triggerRef.current?.focus();
    };
    const pick = (o: SearchSelectOption) => {
      if (o.disabled) return;
      if (multiple) {
        const next = shown.includes(o.value) ? shown.filter((x) => x !== o.value) : [...shown, o.value];
        if (confirm) setDraft(next);
        else commit([...next]);
      } else {
        commit([o.value]);
        closePanel(true);
      }
    };
    const apply = () => {
      commit([...draft]);
      closePanel(true);
    };

    const step = (dir: 1 | -1) => {
      let i = activeIndex;
      for (let n = 0; n < list.length; n++) {
        i = (i + dir + list.length) % list.length;
        if (!list[i]?.disabled) return setActive(i);
      }
    };

    /* One key model for the trigger and the search field. In the search field a
       space is a character and Home/End move the caret, so those two defer. */
    const onKeyDown = (e: React.KeyboardEvent, inSearch: boolean) => {
      if (disabled) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          open ? step(1) : openPanel();
          break;
        case 'ArrowUp':
          e.preventDefault();
          open ? step(-1) : openPanel();
          break;
        case 'Home':
        case 'End':
          if (inSearch || !open) break;
          e.preventDefault();
          setActive(e.key === 'Home' ? 0 : list.length - 1);
          break;
        case 'Enter':
        case ' ':
          if (e.key === ' ' && inSearch) break;
          e.preventDefault();
          if (!open) openPanel();
          else if (activeOption) pick(activeOption);
          break;
        case 'Escape':
          if (open) {
            e.preventDefault();
            closePanel(true);
          }
          break;
        case 'Tab':
          closePanel();
          break;
      }
    };

    /* With search, focus moves into it the moment the panel opens. */
    React.useEffect(() => {
      if (open && searchable) searchRef.current?.focus();
    }, [open, searchable]);

    /* Groups from the rows that survive the search; ungrouped lead. */
    const groups: Array<{ name?: string; rows: Array<{ option: SearchSelectOption; index: number }> }> = [];
    list.forEach((option, index) => {
      let g = groups.find((x) => x.name === option.group);
      if (!g) {
        g = { name: option.group, rows: [] };
        groups.push(g);
      }
      g.rows.push({ option, index });
    });
    const ordered = [...groups].sort((a, b) => Number(!!a.name) - Number(!!b.name));

    const summary =
      committed.length === 0
        ? null
        : committed.length === 1
          ? labelOf(committed[0]!)
          : `${committed.length} selected`;
    const showTags = !!multiple && display === 'tags' && committed.length > 0;
    /* Without a search box the trigger is the combobox. */
    const triggerIsCombobox = !searchable;

    return (
      <div
        ref={ref}
        className={cn('relative font-sans', className)}
        onBlur={(e) => {
          onBlur?.(e);
          /* Focus left the whole control, not just moved into the panel. */
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
              {committed.map((v) => (
                <Tag
                  key={v}
                  size="sm"
                  onRemove={disabled ? undefined : () => commit(committed.filter((x) => x !== v))}
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
            role={triggerIsCombobox ? 'combobox' : undefined}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            aria-activedescendant={
              triggerIsCombobox && open && activeOption ? optionId(activeIndex) : undefined
            }
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-invalid={invalid || undefined}
            disabled={disabled}
            onKeyDown={(e) => onKeyDown(e, false)}
            onClick={(e) => {
              /* Keyboard activation is handled in onKeyDown (detail 0). */
              if (e.detail === 0) return;
              open ? closePanel() : openPanel();
            }}
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
              <span className="sr-only">{`${committed.length} selected. ${placeholder}`}</span>
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
          {searchable && (
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
                onKeyDown={(e) => onKeyDown(e, true)}
              />
            </div>
          )}
          {list.length === 0 && (
            /* Outside the listbox: a listbox may hold only options. */
            <div
              className={cn(
                'px-3 pb-3 text-caption-md-semibold text-text-tertiary',
                searchable ? 'pt-1' : 'pt-2',
              )}
            >
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
            /* Reachable by keyboard when it scrolls, though focus never needs it. */
            tabIndex={-1}
          >
            {ordered.map((g, gi) => (
              <div
                key={g.name ?? '__none'}
                role={g.name ? 'group' : 'presentation'}
                aria-labelledby={g.name ? `${listId}-grp-${gi}` : undefined}
              >
                {g.name && (
                  <div
                    id={`${listId}-grp-${gi}`}
                    className="mx-3 mt-1 border-b border-stroke-subtle py-1.5 text-caption-md-semibold text-text-tertiary"
                  >
                    {g.name}
                  </div>
                )}
                {g.rows.map(({ option, index }) => {
                  const isSelected = shown.includes(option.value);
                  const withAvatar = !option.unassigned && (option.src ? true : (option.avatar ?? avatars));
                  return (
                    <div
                      key={option.value}
                      role="option"
                      id={optionId(index)}
                      aria-selected={isSelected}
                      aria-disabled={option.disabled || undefined}
                      /* mousedown, prevented, so focus never leaves the field. */
                      onMouseDown={(e) => {
                        e.preventDefault();
                        pick(option);
                      }}
                      onMouseMove={() => !option.disabled && setActive(index)}
                      className={cn(
                        'flex h-10 cursor-pointer items-center gap-3 px-3 text-body-sm-medium text-text-secondary',
                        index === activeIndex && !option.disabled && 'bg-surface-brand-faint',
                        !option.disabled && 'active:bg-surface-brand-subtle',
                        option.disabled && 'cursor-not-allowed text-text-disabled',
                      )}
                    >
                      {/* Several picks: a checkbox says so before anyone clicks. The row is the control. */}
                      {multiple && <CheckboxMark checked={isSelected} disabled={option.disabled} />}
                      <span className="flex min-w-0 flex-1 items-center gap-1.5">
                        {option.unassigned ? (
                          <span
                            aria-hidden="true"
                            className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-neutral-subtle text-text-secondary"
                          >
                            <Icon name="user" size="sm" />
                          </span>
                        ) : (
                          withAvatar && <Avatar size="sm" name={option.label} src={option.src} />
                        )}
                        <span className="min-w-0 truncate">{option.label}</span>
                      </span>
                      {/* One pick: a trailing check. */}
                      {!multiple && isSelected && (
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
            ))}
          </div>
          {multiple && confirm && (
            <div className="flex justify-end gap-2 border-t border-stroke-subtle p-2">
              <Button
                variant="secondary"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setDraft([])}
              >
                {clearLabel}
              </Button>
              <Button size="sm" onMouseDown={(e) => e.preventDefault()} onClick={apply}>
                {applyLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  },
);
SearchSelect.displayName = 'SearchSelect';

import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { Chip } from '../chip';

/**
 * MultiSelect — several choices from a fixed list, from a dropdown field. The
 * field shows what is picked, as grey chips you can remove one by one
 * (`display="chips"`, Figma's Tags filter) or as a short summary
 * (`display="summary"`, "In Progress" or "3 selected"); the panel is a list of
 * checkbox rows, optionally under group headings.
 *
 * Built to Figma's filter fields and their menus (`Filters` page: `_Filter_Tags`
 * and the status menu). Where `SearchSelect` finds a choice by typing and
 * `Select` takes one from the platform's own popup, this is the fixed list you
 * tick several things from.
 *
 * **`confirm`** is the status menu's Clear all / Apply footer. Ticks are then a
 * draft: `onChange` fires only on Apply, Clear all empties the draft, and Escape
 * or clicking away throws it out. Without it, every tick is applied at once.
 *
 * **The wiring** is the select-only combobox: a `<button role="combobox">` with
 * `aria-expanded`, `aria-controls` and `aria-activedescendant`, so focus stays
 * on it while arrows move through a `listbox` of `option`s
 * (`aria-multiselectable`). It is a `<button>` so a `Field` label's `htmlFor`
 * reaches it. The chips' ✕ buttons are siblings of it, never inside it: a
 * button may not contain a button.
 *
 * The panel is positioned inline (absolute, under the field), like
 * `SearchSelect`: no flipping, and it clips inside an `overflow: hidden`
 * ancestor.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface MultiSelectOption {
  value: string;
  /** A string on purpose: it is what the chip and the summary say. */
  label: string;
  /** Rows sharing a `group` sit under one heading, in the order first seen. */
  group?: string;
  disabled?: boolean;
}

export type MultiSelectDisplay = 'chips' | 'summary';

export interface MultiSelectProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Strings are shorthand for `{ value, label }`. */
  options?: ReadonlyArray<string | MultiSelectOption>;
  /** The picked values. Uncontrolled (empty to start) when omitted. */
  value?: readonly string[];
  /** The next array. With `confirm`, only on Apply. */
  onChange?: (value: string[]) => void;
  placeholder?: string;
  /** How the field shows what is picked. */
  display?: MultiSelectDisplay;
  /** Draft the ticks in the panel, with a Clear all / Apply footer. */
  confirm?: boolean;
  applyLabel?: string;
  clearLabel?: string;
  /** What the panel says when there are no options. */
  emptyText?: string;
  disabled?: boolean;
  /** Red border, for a failed validation. */
  invalid?: boolean;
  /** Id of the combobox button, for a `Field` label's `htmlFor`. */
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

const normalize = (o: string | MultiSelectOption): MultiSelectOption =>
  typeof o === 'string' ? { value: o, label: o } : o;

export const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      className,
      options = [],
      value,
      onChange,
      placeholder = 'Select…',
      display = 'chips',
      confirm,
      applyLabel = 'Apply',
      clearLabel = 'Clear all',
      emptyText = 'No options',
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
    const [open, setOpen] = React.useState(false);
    const [active, setActive] = React.useState(0);
    const [inner, setInner] = React.useState<readonly string[]>([]);
    /* The panel's working copy while `confirm` is on. */
    const [draft, setDraft] = React.useState<readonly string[]>([]);

    const items = options.map(normalize);
    const labelOf = (v: string) => items.find((o) => o.value === v)?.label ?? v;
    const committed = value ?? inner;
    const shown = confirm && open ? draft : committed;

    const commit = (next: string[]) => {
      if (value === undefined) setInner(next);
      onChange?.(next);
    };

    const toggle = (v: string) => {
      const next = shown.includes(v) ? shown.filter((x) => x !== v) : [...shown, v];
      if (confirm) setDraft(next);
      else commit(next);
    };

    const openPanel = () => {
      if (disabled) return;
      setDraft(committed);
      setActive(Math.max(0, items.findIndex((o) => !o.disabled)));
      setOpen(true);
    };
    const closePanel = () => setOpen(false);
    const apply = () => {
      commit([...draft]);
      closePanel();
      triggerRef.current?.focus();
    };

    /* Groups in first-seen order; ungrouped rows lead. Option ids are
       index-based because values are arbitrary strings. */
    const optionId = (i: number) => `${listId}-opt-${i}`;
    const groups: Array<{ name?: string; rows: Array<{ option: MultiSelectOption; index: number }> }> = [];
    items.forEach((option, index) => {
      let g = groups.find((x) => x.name === option.group);
      if (!g) {
        g = { name: option.group, rows: [] };
        groups.push(g);
      }
      g.rows.push({ option, index });
    });
    const ungroupedFirst = [...groups].sort((a, b) => Number(!!a.name) - Number(!!b.name));

    const step = (dir: 1 | -1) => {
      let i = active;
      for (let n = 0; n < items.length; n++) {
        i = (i + dir + items.length) % items.length;
        if (!items[i]?.disabled) return setActive(i);
      }
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
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
          if (!open) break;
          e.preventDefault();
          setActive(e.key === 'Home' ? 0 : items.length - 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (!open) openPanel();
          else if (items[active] && !items[active].disabled) toggle(items[active].value);
          break;
        case 'Escape':
          if (open) {
            e.preventDefault();
            closePanel();
          }
          break;
        case 'Tab':
          closePanel();
          break;
      }
    };

    const summary =
      committed.length === 0
        ? null
        : committed.length === 1
          ? labelOf(committed[0]!)
          : `${committed.length} selected`;

    return (
      <div
        ref={ref}
        className={cn('relative font-sans', className)}
        onBlur={(e) => {
          onBlur?.(e);
          /* Focus left the whole control, not just moved to the panel. */
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) closePanel();
        }}
        {...props}
      >
        <div
          className={cn(
            'flex min-h-10 items-center gap-1.5 rounded-md border bg-surface-elevated py-1 pr-3 pl-3 transition-colors',
            invalid ? 'border-accent-critical-outline-border-default' : 'border-stroke-strong',
            'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stroke-focused',
            disabled && 'cursor-not-allowed border-stroke-subtle bg-surface-neutral-subtle',
          )}
        >
          {display === 'chips' && committed.length > 0 && (
            <span className="flex flex-wrap gap-1.5">
              {committed.map((v) => (
                <Chip
                  key={v}
                  tone="neutral"
                  label={labelOf(v)}
                  onRemove={disabled ? undefined : () => commit(committed.filter((x) => x !== v))}
                />
              ))}
            </span>
          )}
          <button
            ref={triggerRef}
            id={id}
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            aria-activedescendant={open && items[active] ? optionId(active) : undefined}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-invalid={invalid || undefined}
            disabled={disabled}
            onKeyDown={onKeyDown}
            onClick={(e) => {
              /* Keyboard activation is handled in onKeyDown (detail 0). */
              if (e.detail === 0) return;
              open ? closePanel() : openPanel();
            }}
            className={cn(
              'flex h-8 min-w-12 flex-1 items-center justify-between gap-2 rounded-sm text-left outline-none',
              display === 'summary' && summary
                ? 'text-body-sm-medium text-text-primary'
                : 'text-body-sm-regular text-text-subtle',
              display === 'chips' && committed.length > 0 && 'justify-end',
              'disabled:cursor-not-allowed disabled:text-text-disabled',
            )}
          >
            {display === 'summary' && summary ? (
              <span className="min-w-0 truncate">{summary}</span>
            ) : display === 'chips' && committed.length > 0 ? (
              /* The chips carry the value; the button still needs a name. */
              <span className="sr-only">{`${committed.length} selected. ${placeholder}`}</span>
            ) : (
              <span className="min-w-0 truncate">{placeholder}</span>
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
          className="absolute inset-x-0 top-full z-50 mt-1.5 overflow-hidden rounded-md border border-stroke-subtle bg-surface-elevated shadow-menu"
        >
          <div
            role="listbox"
            id={listId}
            aria-multiselectable="true"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            className="max-h-64 overflow-y-auto p-1"
            /* Reachable by keyboard when it scrolls, though focus never needs it. */
            tabIndex={-1}
          >
            {items.length === 0 ? (
              <div className="px-2.5 py-3 text-center text-caption-md-regular text-text-subtle">
                {emptyText}
              </div>
            ) : (
              ungroupedFirst.map((g, gi) => (
                <div
                  key={g.name ?? '__none'}
                  role={g.name ? 'group' : 'presentation'}
                  aria-labelledby={g.name ? `${listId}-grp-${gi}` : undefined}
                >
                  {g.name && (
                    <div
                      id={`${listId}-grp-${gi}`}
                      className="mx-1 mt-1 border-b border-stroke-subtle px-1.5 py-1.5 text-caption-md-semibold text-text-tertiary"
                    >
                      {g.name}
                    </div>
                  )}
                  {g.rows.map(({ option, index }) => {
                    const isSelected = shown.includes(option.value);
                    return (
                      <div
                        key={option.value}
                        role="option"
                        id={optionId(index)}
                        aria-selected={isSelected}
                        aria-disabled={option.disabled || undefined}
                        /* mousedown, prevented, so focus never leaves the button. */
                        onMouseDown={(e) => {
                          e.preventDefault();
                          if (!option.disabled) toggle(option.value);
                        }}
                        onMouseMove={() => !option.disabled && setActive(index)}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-sm px-2.5 py-2 text-body-sm-regular text-text-primary',
                          index === active && 'bg-surface-neutral-faint',
                          option.disabled && 'cursor-not-allowed text-text-disabled',
                        )}
                      >
                        {/* Decorative: the row is the control, aria-selected its state. */}
                        <span
                          aria-hidden="true"
                          className={cn(
                            'grid size-4 shrink-0 place-items-center rounded-xs border text-action-primary-content-default',
                            isSelected
                              ? 'border-action-primary-surface-default bg-action-primary-surface-default'
                              : 'border-stroke-strong bg-surface-base',
                            option.disabled && 'border-stroke-subtle bg-surface-neutral-faint',
                          )}
                        >
                          {isSelected && <Icon name="check" className="size-3" />}
                        </span>
                        <span className="min-w-0 flex-1">{option.label}</span>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
          {confirm && (
            <div className="flex justify-end gap-2 border-t border-stroke-subtle p-2">
              <Button variant="secondary" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={() => setDraft([])}>
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
MultiSelect.displayName = 'MultiSelect';

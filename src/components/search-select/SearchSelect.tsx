import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { Button } from '../../atoms/button';
import { CheckboxMark } from '../../atoms/checkbox';
import { Icon, type IconName } from '../../atoms/icon';
import { Input } from '../../atoms/input';
import { Tag, type TagTone } from '../../atoms/tag';

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
 *   `display="tags"` a removable tag per pick. Tags stay on one line: the ones
 *   that fit show, a "+N" stands for the rest (a long label is cut with "…", its
 *   ✕ stays), and "+N" opens the field out to show every tag, each removable
 *   where it stands. It folds back on a click away, Escape, Tab out or "Show
 *   less" — never because a tag was removed.
 * - **Search is in the panel, never in the field.** It is on by default
 *   (`searchable={false}` for a short list) and filters the options you pass.
 *   See "Decisions" in docs/search-select.md before changing that: it is the
 *   point of this component.
 * - **Rows** can be grouped under headings (`group`) and disabled, and say what
 *   they are with `rows`: plain `text` (the default), `avatar` (people),
 *   `icon` (a glyph and text) or `tag` (each row drawn as a `Tag`). For
 *   anything else, `renderOption` draws a row's content; the checkbox, the
 *   check, the states and the ARIA stay the component's.
 * - **`confirm`** (multiple) drafts the ticks behind a Clear all / Apply
 *   footer: `onChange` fires only on Apply, and Escape or a click away throws
 *   the draft out.
 *
 * The panel is `Menu`'s dropdown — the same surface, edge, radius, shadow and
 * 4 of padding, with rows built like `Menu`'s items (40 tall, `radius.sm`,
 * `label-sm-medium`, `brand.faint` on hover) — plus the boxed search field of
 * Figma's Edit Viewers dropdown (`7457:91275`). Group headings, the checkbox
 * rows and the Apply footer come from the filter menus (`Filters` page).
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
 * A click inside the panel that lands on nothing does nothing: the field keeps
 * focus and the panel stays open. The panel is positioned inline (absolute,
 * under the field, as wide as its longest row, at least the field's width and at
 * most 24rem; a longer label is cut with "…"): no flipping, and it clips inside an
 * `overflow: hidden` ancestor.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface SearchSelectOption {
  value: string;
  /** A string on purpose: the row, search, and the avatar's initials all use it (and the field too, unless `shortLabel` is set). */
  label: string;
  /**
   * What the field, the tags and the announcements say when the row's `label` is too long for them —
   * "C33" in the field for a row that reads "C33 (May 25, 2026 - Jun 08, 2026)". Search still matches
   * the full `label`.
   */
  shortLabel?: string;
  /** Rows sharing a `group` sit under one heading, in the order first seen; ungrouped rows lead. */
  group?: string;
  disabled?: boolean;
  /** `rows="avatar"`: a photo for the avatar. Without one the avatar shows initials. */
  src?: string;
  /** `rows="avatar"`: the "Unassigned" row, a person glyph instead of an avatar. */
  unassigned?: boolean;
  /** `rows="icon"`: the glyph before the label. */
  icon?: IconName;
  /** `rows="tag"`: the tag's tone. Defaults to `neutral`. */
  tone?: TagTone;
}

/** What a row looks like. `text` is plain; the others add one thing to it. */
export type SearchSelectRows = 'text' | 'avatar' | 'icon' | 'tag';

/** What `renderOption` is told about the row it draws. */
export interface SearchSelectRowState {
  selected: boolean;
  /** The keyboard or pointer is on this row. */
  active: boolean;
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
  /**
   * What each row looks like: `text` (default), `avatar` (people), `icon` (a glyph and
   * text) or `tag` (each row drawn as a `Tag`).
   */
  rows?: SearchSelectRows;
  /**
   * Draws a row's content yourself, replacing what `rows` would. The checkbox or check,
   * the hover and pressed states, the keyboard and the ARIA are still the component's, so
   * keep it to content: no buttons or links in there.
   */
  renderOption?: (option: SearchSelectOption, state: SearchSelectRowState) => React.ReactNode;
  disabled?: boolean;
  /**
   * Draws the field as plain text inside a bar rather than as a bordered input: no
   * border or fill, the value semibold with a brand caret, a tint on hover. For a
   * picker that lives in another control's toolbar (the Gantt chart's period bar), where
   * a boxed field would fight the bar. One line, one pick. The field hugs its value and centres in the width you give the control, and the panel opens from that width's left edge.
   */
  inline?: boolean;
  /** Critical border + `aria-invalid`. Pair with a visible message (or use `error`). */
  invalid?: boolean;
  /**
   * An error message under the field, in the critical colour. Implies `invalid` and is
   * announced with the field (`aria-describedby`).
   */
  error?: React.ReactNode;
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

/* What the `rows` presets put in a row, between the checkbox and the check. */
function rowContent(option: SearchSelectOption, rows: SearchSelectRows): React.ReactNode {
  const label = <span className="min-w-0 truncate">{option.label}</span>;
  switch (rows) {
    case 'avatar':
      return (
        <>
          {option.unassigned ? (
            <span
              aria-hidden="true"
              className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-neutral-subtle text-text-secondary"
            >
              <Icon name="user" size="sm" />
            </span>
          ) : (
            <Avatar size="sm" name={option.label} src={option.src} />
          )}
          {label}
        </>
      );
    case 'icon':
      return (
        <>
          {option.icon && (
            <Icon name={option.icon} size="sm" aria-hidden="true" className="shrink-0 text-text-secondary" />
          )}
          {label}
        </>
      );
    case 'tag':
      return (
        <Tag size="sm" tone={option.tone ?? 'neutral'} className="min-w-0">
          {option.label}
        </Tag>
      );
    default:
      return label;
  }
}

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
      rows = 'text',
      renderOption,
      disabled,
      inline,
      invalid,
      error,
      id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      onBlur,
      onKeyDown: onWrapperKeyDown,
      ...props
    },
    ref,
  ) => {
    const listId = React.useId();
    const tagsId = React.useId();
    const errorId = React.useId();
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const fieldRef = React.useRef<HTMLDivElement>(null);
    const rowRef = React.useRef<HTMLDivElement>(null);
    const toggleRef = React.useRef<HTMLButtonElement | null>(null);
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const searchRef = React.useRef<HTMLInputElement>(null);
    /* Focus the next place after a tag is removed or "+N" is pressed, since the
       focused control is replaced; a blur in the meantime must not fold the field. */
    const pendingFocus = React.useRef<{ tag: string | null } | { toggle: true } | null>(null);
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const [active, setActive] = React.useState(0);
    const [inner, setInner] = React.useState<readonly string[]>([]);
    /* The panel's working copy while `confirm` is on. */
    const [draft, setDraft] = React.useState<readonly string[]>([]);
    /* Tags: opened out to show all of them, how many fit on one line, and whether
       the opened-out tags actually wrap (else there is nothing to fold back). */
    const [expanded, setExpanded] = React.useState(false);
    const [fit, setFit] = React.useState<number | null>(null);
    const [wrapped, setWrapped] = React.useState(false);
    const [tick, setTick] = React.useState(0);
    const [announce, setAnnounce] = React.useState('');

    const all = options.map(normalize);
    /* What the field, the tags and the announcements say: the short label when there is one. */
    const labelOf = (v: string) => {
      const o = all.find((x) => x.value === v);
      return o ? (o.shortLabel ?? o.label) : v;
    };
    const committed: readonly string[] =
      value === undefined ? inner : multiple ? (value as readonly string[]) : value ? [value as string] : [];
    const shown = multiple && confirm && open ? draft : committed;
    const isInvalid = !!invalid || !!error;

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

    /* Removing a tag leaves the field as it is (still opened out, if it was) and
       moves focus to the neighbouring ✕, so nobody loses their place. */
    const removeTag = (v: string) => {
      const at = committed.indexOf(v);
      const next = committed.filter((x) => x !== v);
      pendingFocus.current = { tag: next[at] ?? next[at - 1] ?? null };
      setAnnounce(`Removed ${labelOf(v)}, ${next.length} selected`);
      commit(next);
    };
    const setOpenedOut = (next: boolean) => {
      pendingFocus.current = { toggle: true };
      setExpanded(next);
      /* The replacing button appears a layout pass later (or not at all, if nothing wraps
         or everything fits): give it two frames, then hand focus to the trigger instead. */
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (pendingFocus.current && 'toggle' in pendingFocus.current) {
            pendingFocus.current = null;
            triggerRef.current?.focus();
          }
        }),
      );
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
    const tagsKey = committed.join('\u0000');
    /* Without a search box the trigger is the combobox. */
    const triggerIsCombobox = !searchable;

    /* ---- Tags on one line: measure how many fit, the rest become "+N". ---- */
    const measuring = showTags && !expanded && fit === null;
    const visible = !showTags ? 0 : expanded ? committed.length : Math.min(fit ?? committed.length, committed.length);
    const hiddenCount = measuring ? 0 : committed.length - visible;

    const tagEls = () =>
      Array.from(rowRef.current?.querySelectorAll<HTMLElement>(':scope > [data-select-tag]') ?? []);

    /* Re-measure whenever the picks, the width or the open-out state change. */
    React.useLayoutEffect(() => {
      if (showTags && !expanded) setFit(null);
    }, [tagsKey, tick, expanded, showTags]);
    React.useLayoutEffect(() => {
      if (!showTags || expanded || fit !== null) return;
      const row = rowRef.current;
      if (!row) return;
      const tags = tagEls();
      const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      const plus = toggleRef.current;
      const plusWidth = plus ? plus.offsetWidth : 0;
      /* The "+N" sits in the row after the tags, so the row is the room for both. */
      const roomWithoutPlus = row.clientWidth;
      const widths = tags.map((t) => t.offsetWidth);
      const total = widths.reduce((sum, w, i) => sum + w + (i ? gap : 0), 0);
      if (total <= roomWithoutPlus) {
        setFit(tags.length);
        return;
      }
      const room = roomWithoutPlus - plusWidth - gap;
      let used = 0;
      let count = 0;
      for (let i = 0; i < widths.length; i++) {
        const next = used + widths[i]! + (i ? gap : 0);
        if (next > room) break;
        used = next;
        count = i + 1;
      }
      setFit(Math.max(1, count));
    }, [fit, showTags, expanded]);
    /* Opened out: do the tags wrap? If not, there is nothing to fold back. */
    React.useLayoutEffect(() => {
      if (!showTags || !expanded) {
        setWrapped(false);
        return;
      }
      const tags = tagEls();
      setWrapped(tags.length > 1 && tags.some((t) => t.offsetTop > tags[0]!.offsetTop + 1));
    }, [expanded, tagsKey, tick, showTags]);
    React.useEffect(() => {
      const field = fieldRef.current;
      if (!field || typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(() => setTick((t) => t + 1));
      observer.observe(field);
      return () => observer.disconnect();
    }, []);

    /* Focus lands somewhere sensible once a removed tag or the toggle is replaced. */
    React.useEffect(() => {
      const pending = pendingFocus.current;
      if (!pending) return;
      if ('toggle' in pending) {
        /* Wait for the replacing button; setOpenedOut hands focus to the trigger if none comes. */
        if (toggleRef.current) {
          pendingFocus.current = null;
          toggleRef.current.focus();
        }
        return;
      }
      pendingFocus.current = null;
      const target = pending.tag
        ? rowRef.current?.querySelector<HTMLElement>(`button[aria-label="Remove ${labelOf(pending.tag)}"]`)
        : null;
      (target && target.offsetParent !== null ? target : triggerRef.current)?.focus();
    });

    /* A click anywhere outside folds an opened-out field back. */
    React.useEffect(() => {
      if (!expanded) return;
      const away = (e: MouseEvent) => {
        if (!wrapperRef.current?.contains(e.target as Node)) setExpanded(false);
      };
      document.addEventListener('mousedown', away);
      return () => document.removeEventListener('mousedown', away);
    }, [expanded]);

    const setWrapperRef = (node: HTMLDivElement | null) => {
      wrapperRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    const disabledTag = disabled ? 'border border-stroke-subtle bg-surface-elevated' : undefined;
    const toggleClass =
      'inline-flex h-6 shrink-0 items-center rounded-sm px-2 text-caption-md-medium outline-none transition-colors ' +
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused';

    return (
      <div
        ref={setWrapperRef}
        className={cn('font-sans', className)}
        onBlur={(e) => {
          onBlur?.(e);
          /* Focus left the whole control, not just moved into the panel — or a
             removed tag is about to hand focus on (see pendingFocus). */
          if (pendingFocus.current) return;
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            closePanel();
            setExpanded(false);
          }
        }}
        onKeyDown={(e) => {
          onWrapperKeyDown?.(e);
          /* Escape folds an opened-out field back (an open panel takes Escape first). */
          if (e.key === 'Escape' && expanded && !open) {
            e.preventDefault();
            setOpenedOut(false);
          }
        }}
        {...props}
      >
        <div className="relative">
          <div
            ref={fieldRef}
            onClick={(e) => {
              /* Empty space in the field opens the panel, as the trigger does. */
              if (disabled) return;
              if (e.target === e.currentTarget || e.target === rowRef.current) {
                triggerRef.current?.focus();
                open ? closePanel() : openPanel();
              }
            }}
            className={cn(
              inline
                ? 'mx-auto flex h-7 w-max max-w-full items-center rounded-sm border border-transparent px-2 transition-colors hover:bg-surface-brand-subtle'
                : 'flex min-h-10 items-center gap-2 rounded-md border bg-surface-elevated py-1 pr-3 pl-3 transition-colors',
              /* Input's, class for class: the border turns focused with the ring, and an error holds its colour through focus. */
              !inline &&
                (isInvalid
                  ? 'border-accent-critical-outline-border-default'
                  : 'border-stroke-strong focus-within:border-stroke-focused'),
              'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stroke-focused',
              disabled && (inline ? 'cursor-not-allowed' : 'cursor-not-allowed border-stroke-subtle bg-surface-neutral-subtle'),
            )}
          >
            {showTags && (
              <div
                id={tagsId}
                ref={rowRef}
                className={cn(
                  'flex min-w-0 flex-1 gap-2',
                  expanded ? 'flex-wrap py-0.5' : 'flex-nowrap overflow-hidden',
                )}
              >
                {committed.map((v, i) => (
                  <Tag
                    key={v}
                    data-select-tag=""
                    size="sm"
                    tone={rows === 'tag' ? (all.find((o) => o.value === v)?.tone ?? 'neutral') : 'neutral'}
                    onRemove={disabled ? undefined : () => removeTag(v)}
                    className={cn('shrink-0', disabledTag, i >= visible && 'hidden')}
                  >
                    {labelOf(v)}
                  </Tag>
                ))}
                {!expanded && (hiddenCount > 0 || measuring) && (
                  <button
                    ref={(node) => {
                      toggleRef.current = node;
                    }}
                    type="button"
                    aria-expanded={false}
                    aria-controls={tagsId}
                    aria-label={measuring ? undefined : `Show ${hiddenCount} more`}
                    aria-hidden={measuring || undefined}
                    tabIndex={measuring ? -1 : undefined}
                    onClick={() => setOpenedOut(true)}
                    className={cn(
                      toggleClass,
                      'bg-surface-neutral-subtle text-text-secondary hover:bg-surface-neutral-medium',
                      disabledTag,
                      measuring && 'invisible',
                    )}
                  >
                    {`+${measuring ? committed.length : hiddenCount}`}
                  </button>
                )}
                {expanded && wrapped && (
                  <button
                    ref={(node) => {
                      toggleRef.current = node;
                    }}
                    type="button"
                    aria-expanded
                    aria-controls={tagsId}
                    onClick={() => setOpenedOut(false)}
                    className={cn(toggleClass, 'text-text-brand-strong hover:underline')}
                  >
                    Show less
                  </button>
                )}
              </div>
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
              aria-invalid={isInvalid || undefined}
              aria-describedby={error ? errorId : undefined}
              disabled={disabled}
              onKeyDown={(e) => onKeyDown(e, false)}
              onClick={(e) => {
                /* Keyboard activation is handled in onKeyDown (detail 0). */
                if (e.detail === 0) return;
                open ? closePanel() : openPanel();
              }}
              className={cn(
                'flex items-center justify-between rounded-sm text-left outline-none',
                inline ? 'h-7 gap-1' : 'h-8 gap-2',
                showTags ? 'w-6 shrink-0 justify-end' : 'min-w-12 flex-1',
                summary && !showTags
                  ? inline
                    ? 'text-body-sm-semibold text-text-primary'
                    : 'text-body-sm-medium text-text-primary'
                  : 'text-body-sm-regular text-text-subtle',
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
                  'shrink-0 transition-transform motion-reduce:transition-none',
                  inline ? 'text-text-brand-medium' : 'text-text-tertiary',
                  open && 'rotate-180',
                )}
              />
            </button>
          </div>

          <div
            hidden={!open}
            /* A click that lands on nothing must not take focus: the field keeps it and the
               panel stays open. Only the search box is allowed to take it. */
            onMouseDown={(e) => {
              if (!(e.target as HTMLElement).closest('input')) e.preventDefault();
            }}
            /* As wide as its longest row (never narrower than the field, never wider than 24rem), so a
               narrow field does not cut its options off. Anchored to the field's left edge. */
            className="absolute top-full left-0 z-50 mt-1.5 w-max max-w-96 min-w-full overflow-hidden rounded-md border border-stroke-default bg-surface-elevated p-1 shadow-menu"
          >
            {searchable && (
              <div className="p-2">
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
                    const isActive = index === activeIndex && !option.disabled;
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
                          'flex min-h-10 cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-label-sm-medium text-text-secondary',
                          isActive && 'bg-surface-brand-faint text-text-primary',
                          !option.disabled && 'active:bg-surface-brand-subtle',
                          option.disabled && 'cursor-not-allowed text-text-disabled',
                        )}
                      >
                        {/* Several picks: a checkbox says so before anyone clicks. The row is the control. */}
                        {multiple && <CheckboxMark checked={isSelected} disabled={option.disabled} />}
                        <span className="flex min-w-0 flex-1 items-center gap-1.5">
                          {renderOption
                            ? renderOption(option, { selected: isSelected, active: index === activeIndex })
                            : rowContent(option, rows)}
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
              <div className="-mx-1 -mb-1 mt-1 flex justify-end gap-2 border-t border-stroke-subtle p-2">
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

        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-caption-md-medium text-accent-critical-outline-content-default"
          >
            {error}
          </p>
        )}
        {/* Removing a tag moves focus on, so say what happened. */}
        <span aria-live="polite" className="sr-only">
          {announce}
        </span>
      </div>
    );
  },
);
SearchSelect.displayName = 'SearchSelect';

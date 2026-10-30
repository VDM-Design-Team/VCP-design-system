import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { Button } from '../../atoms/button';
import { CheckboxMark } from '../../atoms/checkbox';
import { Icon, type IconName } from '../../atoms/icon';
import { Spinner } from '../../atoms/spinner';
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
  /** `sm` 32 tall, `md` 40 (default), as `Select`. */
  size?: 'sm' | 'md';
  /** Fill the container's width. Off by default, as `Input` and `Select`; the panel still grows to its rows. */
  fullWidth?: boolean;
  /**
   * The rows are on their way: the field is `aria-busy`, a spinner stands in for the caret, and
   * the panel says "Loading…" in place of the rows.
   */
  loading?: boolean;
  /**
   * Search happens on your server: called with the text on every change in the search box (and
   * with `''` when the panel opens), and the component then stops filtering `options` itself, so
   * you pass what matches. Debounce it on your side; pair it with `loading` while the request runs.
   * Picked values that are not in the current `options` still show, by their value.
   */
  onSearch?: (query: string) => void;
  /** What the panel says while `loading`. */
  loadingText?: string;
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
      size = 'md',
      fullWidth = false,
      loading,
      onSearch,
      loadingText = 'Loading…',
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
    const valueId = React.useId();
    const generatedTriggerId = React.useId();
    const triggerId = id ?? generatedTriggerId;
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

    /* Rows in the order they are drawn: ungrouped first, then each group in the order first seen.
       Arrow keys, Home / End and the active row all index this list, so they match the screen. */
    const arrange = (rows: SearchSelectOption[]) => {
      /* Not `sort`: it sends `undefined` (the ungrouped rows' name) to the end without asking. */
      const names: string[] = [];
      rows.forEach((o) => {
        if (o.group && !names.includes(o.group)) names.push(o.group);
      });
      return [...rows.filter((o) => !o.group), ...names.flatMap((name) => rows.filter((o) => o.group === name))];
    };
    const arranged = arrange(all);
    const list = arrange(
      searchable && query && !onSearch
        ? all.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
        : all,
    );
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
      onSearch?.('');
      setDraft(committed);
      const at = arranged.findIndex((o) => committed.includes(o.value));
      setActive(at >= 0 ? at : firstEnabled(arranged));
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
          /* With Clear all / Apply the panel is a stop on the way: Tab walks on into it, and
             the panel closes when focus leaves the whole control. Without them Tab just leaves. */
          if (!(multiple && confirm)) closePanel();
          break;
      }
    };

    /* The active row stays in view as the arrows move it, and when the panel opens on a far-down pick. */
    React.useEffect(() => {
      if (open && activeOption) {
        document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: 'nearest' });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, activeIndex]);

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
    const ordered = groups;

    const summary =
      committed.length === 0
        ? null
        : committed.length === 1
          ? labelOf(committed[0]!)
          : `${committed.length} selected`;
    /* The trigger is named by its label and then its value ("Assignee Amy Lee"), so a screen reader
       hears what was picked. An `aria-label` is named by the trigger itself; a `<label for>` (a Field)
       is found through the button's `labels`, and given an id if it has none. */
    const [labelIds, setLabelIds] = React.useState<string[]>([]);
    React.useLayoutEffect(() => {
      if (ariaLabel || ariaLabelledBy) return;
      const ids = Array.from(triggerRef.current?.labels ?? []).map((label, i) => {
        if (!label.id) label.id = `${listId}-label-${i}`;
        return label.id;
      });
      setLabelIds((prev) => (prev.join(' ') === ids.join(' ') ? prev : ids));
    });
    const hasValue = committed.length > 0;
    const nameParts = ariaLabelledBy ? [ariaLabelledBy] : ariaLabel ? [triggerId] : labelIds;
    const triggerName = hasValue && nameParts.length > 0 ? [...nameParts, valueId].join(' ') : ariaLabelledBy;
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
      /* Found by the tag's own value, never through a selector: a label can hold any character. */
      const target = pending.tag
        ? tagEls()
            .find((el) => el.dataset.selectTag === pending.tag)
            ?.querySelector<HTMLElement>('button')
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
        aria-busy={loading || undefined}
        className={cn('font-sans', fullWidth ? 'w-full' : 'inline-block min-w-48 max-w-full', className)}
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
              'flex items-center gap-2 rounded-md border bg-surface-elevated py-1 pr-3 pl-3 transition-colors',
              size === 'sm' ? 'min-h-8' : 'min-h-10',
              /* Input's, class for class: the border turns focused with the ring, and an error holds its colour through focus. */
              isInvalid
                ? 'border-accent-critical-outline-border-default'
                : 'border-stroke-strong focus-within:border-stroke-focused',
              'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stroke-focused',
              disabled && 'cursor-not-allowed border-stroke-subtle bg-surface-neutral-subtle',
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
                    data-select-tag={v}
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
              id={triggerId}
              type="button"
              role={triggerIsCombobox ? 'combobox' : undefined}
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-controls={listId}
              aria-activedescendant={
                triggerIsCombobox && open && activeOption ? optionId(activeIndex) : undefined
              }
              aria-label={ariaLabel}
              aria-labelledby={triggerName}
              aria-invalid={isInvalid || undefined}
              aria-describedby={error ? errorId : undefined}
              disabled={disabled}
              onKeyDown={(e) => onKeyDown(e, false)}
              /* Enter and Space are handled on keydown, which also stops the click the browser
                 would send (Enter on keydown, Space on keyup, so keyup is stopped too). Every
                 click that does arrive is a real one: a mouse, a screen reader's browse mode,
                 voice control, a switch, `element.click()`. */
              onKeyUp={(e) => {
                if (e.key === ' ') e.preventDefault();
              }}
              onClick={() => (open ? closePanel() : openPanel())}
              className={cn(
                'flex items-center justify-between gap-2 rounded-sm text-left outline-none',
                size === 'sm' ? 'h-6' : 'h-8',
                showTags ? 'w-6 shrink-0 justify-end' : 'min-w-12 flex-1',
                summary && !showTags
                  ? 'text-body-sm-medium text-text-primary'
                  : 'text-body-sm-regular text-text-subtle',
                size === 'sm' && 'text-caption-md-regular',
                'disabled:cursor-not-allowed disabled:text-text-disabled',
              )}
            >
              {showTags ? (
                /* The tags carry the value; the button still needs a name. */
                <span id={valueId} className="sr-only">{`${committed.length} selected. ${placeholder}`}</span>
              ) : (
                <span id={valueId} className="min-w-0 truncate">
                  {summary ?? placeholder}
                </span>
              )}
              {loading ? (
                <Spinner size="sm" decorative className="shrink-0 text-text-tertiary" />
              ) : (
                <Icon
                  name="caret-down"
                  size="sm"
                  aria-hidden="true"
                  className={cn(
                    'shrink-0 text-text-tertiary transition-transform motion-reduce:transition-none',
                    open && 'rotate-180',
                  )}
                />
              )}
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
                    onSearch?.(e.target.value);
                  }}
                  onKeyDown={(e) => onKeyDown(e, true)}
                />
              </div>
            )}
            {loading && (
              <div role="status" className={cn('px-3 pb-3 text-caption-md-semibold text-text-tertiary', searchable ? 'pt-1' : 'pt-2')}>
                {loadingText}
              </div>
            )}
            {!loading && list.length === 0 && (
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
              hidden={loading || list.length === 0}
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

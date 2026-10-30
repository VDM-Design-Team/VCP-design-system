import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';

/**
 * MentionInput — a text field where typing `@` opens a list of members, typing more
 * letters filters it, and choosing one turns the text into a tag inside the field.
 *
 * Built to match how comments already work: a real tag in the text, not an "@name"
 * string. It is plain text and tags only: no bold, no lists, no links, and a paste is
 * always plain text. That narrowness is what keeps a hand-rolled editor trustworthy.
 *
 * **The value is segments, not HTML.** A run of text, or a mention carrying the
 * member's `id` and `label`. `mentionedIds(value)` is the list of people to notify;
 * `plainText(value)` is the words. In the DOM a tag is
 * `<span data-type="mention" data-id data-label contenteditable="false">@Label</span>`,
 * the same markup TipTap's mention extension writes, so an app on TipTap reads the same
 * ids and the same labels.
 *
 * **The list is a combobox listbox.** Focus stays in the field; ↑ ↓ move through the
 * options (`aria-activedescendant`), Enter or Tab choose, Escape closes. It draws like
 * `Menu` (the system's menu look) but is its own list, because a `Menu` takes focus.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type MentionSegment =
  | { type: 'text'; text: string }
  | { type: 'mention'; id: string; label: string };

export interface MentionMember {
  id: string;
  name: string;
}

/** The ids of everyone mentioned, in order, without repeats — who to notify. */
export function mentionedIds(value: readonly MentionSegment[]): string[] {
  const ids: string[] = [];
  for (const segment of value) {
    if (segment.type === 'mention' && !ids.includes(segment.id)) ids.push(segment.id);
  }
  return ids;
}

/** The words, with each tag as "@Label". */
export function plainText(value: readonly MentionSegment[]): string {
  return value.map((s) => (s.type === 'text' ? s.text : `@${s.label}`)).join('');
}

const MENTION_SELECTOR = '[data-type="mention"]';

/** The tag's look, shared by the field (a DOM node) and a posted comment (`MentionTag`). */
export const MENTION_TAG_CLASS =
  'mx-px inline-block rounded-sm bg-surface-brand-faint px-1.5 py-0.5 text-body-sm-medium text-text-brand-strong';

/** A mention as it reads in a posted comment: the same tag the field draws. */
export function MentionTag({ label, id }: { label: string; id?: string }) {
  return (
    <span data-type="mention" data-id={id} data-label={label} className={MENTION_TAG_CLASS}>
      @{label}
    </span>
  );
}
const MAX_QUERY = 30;
const MAX_OPTIONS = 8;

/** Segments out of the field's DOM. A line break is a newline; a tag is a mention. */
function readSegments(root: HTMLElement): MentionSegment[] {
  const out: MentionSegment[] = [];
  const pushText = (text: string) => {
    if (!text) return;
    const last = out[out.length - 1];
    if (last && last.type === 'text') last.text += text;
    else out.push({ type: 'text', text });
  };
  const walk = (node: Node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        /* A browser types a space after a tag as a no-break space; to the value it is a space. */
        pushText((child.textContent ?? '').replace(/\u00a0/g, ' '));
      } else if (child instanceof HTMLElement) {
        if (child.matches(MENTION_SELECTOR)) {
          out.push({
            type: 'mention',
            id: child.dataset.id ?? '',
            label: child.dataset.label ?? '',
          });
        } else if (child.tagName === 'BR') {
          pushText('\n');
        } else {
          walk(child);
        }
      }
    });
  };
  walk(root);
  return out;
}

const sameSegments = (a: readonly MentionSegment[], b: readonly MentionSegment[]) =>
  JSON.stringify(a) === JSON.stringify(b);

function makeTag(id: string, label: string): HTMLSpanElement {
  const span = document.createElement('span');
  span.dataset.type = 'mention';
  span.dataset.id = id;
  span.dataset.label = label;
  span.contentEditable = 'false';
  span.className = MENTION_TAG_CLASS;
  span.textContent = `@${label}`;
  return span;
}

function writeSegments(root: HTMLElement, value: readonly MentionSegment[]) {
  root.replaceChildren();
  for (const segment of value) {
    if (segment.type === 'mention') {
      root.appendChild(makeTag(segment.id, segment.label));
    } else {
      segment.text.split('\n').forEach((line, i) => {
        if (i > 0) root.appendChild(document.createElement('br'));
        if (line) root.appendChild(document.createTextNode(line));
      });
    }
  }
}

function placeCaretAtEnd(root: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(root);
  range.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

/* The caret as a count of what the value counts: a character is 1, a tag is 1, a line break is 1.
   Enough to put the caret back after the field is rewritten from a saved value. */
function caretOffset(root: HTMLElement): number {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !root.contains(selection.anchorNode)) {
    return readLength(root);
  }
  const range = document.createRange();
  range.setStart(root, 0);
  range.setEnd(selection.anchorNode as Node, selection.anchorOffset);
  const holder = document.createElement('div');
  holder.appendChild(range.cloneContents());
  return readLength(holder);
}

function readLength(root: HTMLElement): number {
  return readSegments(root).reduce(
    (n, segment) => n + (segment.type === 'mention' ? 1 : segment.text.length),
    0,
  );
}

function placeCaretAt(root: HTMLElement, offset: number) {
  let left = offset;
  const range = document.createRange();
  range.selectNodeContents(root);
  range.collapse(false);
  const walk = (node: Node): boolean => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const length = (child.textContent ?? '').length;
        if (left <= length) {
          range.setStart(child, left);
          range.collapse(true);
          return true;
        }
        left -= length;
      } else if (child instanceof HTMLElement) {
        if (child.matches(MENTION_SELECTOR) || child.tagName === 'BR') {
          if (left === 0) {
            range.setStartBefore(child);
            range.collapse(true);
            return true;
          }
          left -= 1;
          if (left === 0) {
            range.setStartAfter(child);
            range.collapse(true);
            return true;
          }
        } else if (walk(child)) return true;
      }
    }
    return false;
  };
  walk(root);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

/** One step of the field's own undo history: what it held and where the caret was. */
interface HistoryEntry {
  value: MentionSegment[];
  caret: number;
}

/* The list's own limits, in px of layout maths and not styling: its tallest height (the
   `max-h-64` it used to carry), the gap to the `@`, and how near the screen's edge it may go. */
const LIST_MAX_HEIGHT = 256;
const LIST_GAP = 4;
const LIST_EDGE = 8;

interface ListPlace {
  left: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
}

interface Trigger {
  node: Text;
  start: number;
  end: number;
  query: string;
}

/** The "@query" the caret is in, if any: an `@` at the start or after a space, no newline since. */
function findTrigger(root: HTMLElement): Trigger | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) return null;
  const node = selection.anchorNode;
  if (!node || node.nodeType !== Node.TEXT_NODE || !root.contains(node)) return null;
  const before = (node as Text).data.slice(0, selection.anchorOffset);
  const at = before.lastIndexOf('@');
  if (at === -1) return null;
  if (at > 0 && !/\s/.test(before[at - 1])) return null;
  const query = before.slice(at + 1);
  /* "@ " is an @ followed by a space: ordinary text, not the start of a mention. */
  if (/^\s/.test(query)) return null;
  if (query.includes('\n') || query.length > MAX_QUERY) return null;
  return { node: node as Text, start: at, end: selection.anchorOffset, query };
}

export interface MentionInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'children'> {
  /** Who can be mentioned. */
  members: readonly MentionMember[];
  /** Controlled content. Pair with `onChange`. */
  value?: readonly MentionSegment[];
  /** Starting content when uncontrolled. */
  defaultValue?: readonly MentionSegment[];
  onChange?: (value: MentionSegment[]) => void;
  /** Shown while the field is empty. */
  placeholder?: string;
  disabled?: boolean;
  /** Ctrl or Cmd + Enter. A plain Enter is a line break. */
  onSubmit?: () => void;
  /** Focus the field when it mounts. */
  autoFocus?: boolean;
}

export const MentionInput = React.forwardRef<HTMLDivElement, MentionInputProps>(
  function MentionInput(
    {
      className,
      members,
      value,
      defaultValue,
      onChange,
      placeholder = 'Type @ to mention and notify a member',
      disabled = false,
      onSubmit,
      autoFocus,
      ...props
    },
    ref,
  ) {
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const listId = React.useId();
    const [trigger, setTrigger] = React.useState<Trigger | null>(null);
    const [active, setActive] = React.useState(0);

    const options = React.useMemo(() => {
      if (!trigger) return [];
      const q = trigger.query.toLowerCase();
      return members
        .filter((m) => m.name.toLowerCase().includes(q))
        .sort(
          (a, b) =>
            Number(b.name.toLowerCase().startsWith(q)) - Number(a.name.toLowerCase().startsWith(q)),
        )
        .slice(0, MAX_OPTIONS);
    }, [members, trigger]);
    const open = options.length > 0;
    const optionId = (i: number) => `${listId}-option-${i}`;

    /* Where the list sits: under the `@` it belongs to, or above it when the screen cuts
       the bottom off, and never past the screen's edges. It is measured from the `@`
       character's own box, so it follows the word being typed and not the whole field. */
    const listRef = React.useRef<HTMLUListElement | null>(null);
    const [place, setPlace] = React.useState<ListPlace | null>(null);

    /* The list is drawn in a portal, positioned from the viewport, so a scrolling parent (a
       Modal's body) can never cut it off. Like `Tooltip`, into the nearest `.dark` so the
       theme follows it, else the page. */
    const [host, setHost] = React.useState<HTMLElement | null>(null);
    React.useLayoutEffect(() => {
      setHost((rootRef.current?.closest('.dark') as HTMLElement | null) ?? document.body);
    }, []);

    const position = React.useCallback(() => {
      const list = listRef.current;
      if (!list || !trigger) return;
      const at = document.createRange();
      try {
        at.setStart(trigger.node, trigger.start);
        at.setEnd(trigger.node, trigger.start + 1);
      } catch {
        return;
      }
      const anchor = at.getBoundingClientRect();
      const wanted = Math.min(list.scrollHeight, LIST_MAX_HEIGHT);
      const below = window.innerHeight - anchor.bottom - LIST_GAP - LIST_EDGE;
      const above = anchor.top - LIST_GAP - LIST_EDGE;
      const flip = wanted > below && above > below;
      const maxHeight = Math.min(LIST_MAX_HEIGHT, flip ? above : below);
      const left = Math.min(
        Math.max(anchor.left, LIST_EDGE),
        window.innerWidth - list.offsetWidth - LIST_EDGE,
      );
      setPlace(
        flip
          ? { left, bottom: window.innerHeight - anchor.top + LIST_GAP, maxHeight }
          : { left, top: anchor.bottom + LIST_GAP, maxHeight },
      );
    }, [trigger]);

    React.useLayoutEffect(() => {
      if (!open) {
        setPlace(null);
        return;
      }
      position();
    }, [open, options, position, host]);

    /* The highlighted option stays in view as the arrows move it past the list's edge. */
    React.useEffect(() => {
      if (open) listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
    }, [open, active]);

    React.useEffect(() => {
      if (!open) return;
      window.addEventListener('resize', position);
      window.addEventListener('scroll', position, true);
      return () => {
        window.removeEventListener('resize', position);
        window.removeEventListener('scroll', position, true);
      };
    }, [open, position]);

    /* The field's own undo history. The browser's cannot be used: a tag is put in by hand
       (`plaintext-only` strips markup from `insertHTML`), which its undo does not track, so
       the first Cmd+Z did nothing and the second scrambled the text. Every change, typing and
       choosing a member alike, is a step here, and Undo and Redo walk them. */
    const history = React.useRef<{ steps: HistoryEntry[]; at: number; time: number; type: string }>({
      steps: [],
      at: -1,
      time: 0,
      type: '',
    });
    const record = (type: string) => {
      const root = rootRef.current;
      if (!root) return;
      const h = history.current;
      const entry = { value: readSegments(root), caret: caretOffset(root) };
      const current = h.steps[h.at];
      if (current && sameSegments(current.value, entry.value)) {
        current.caret = entry.caret;
        return;
      }
      const now = Date.now();
      /* Typing in one run, or deleting in one run, is a single step. */
      const joins =
        h.at > 0 &&
        h.at === h.steps.length - 1 &&
        type === h.type &&
        (type === 'insertText' || type === 'deleteContentBackward') &&
        now - h.time < 1000;
      h.steps.length = h.at + 1;
      if (joins) h.steps[h.at] = entry;
      else {
        h.steps.push(entry);
        h.at = h.steps.length - 1;
      }
      h.time = now;
      h.type = type;
    };
    const travel = (direction: -1 | 1) => {
      const root = rootRef.current;
      const h = history.current;
      const next = h.at + direction;
      if (!root || next < 0 || next >= h.steps.length) return;
      h.at = next;
      h.type = '';
      const step = h.steps[next];
      writeSegments(root, step.value);
      placeCaretAt(root, step.caret);
      setTrigger(null);
      onChange?.(readSegments(root));
    };

    React.useEffect(() => {
      const root = rootRef.current;
      if (!root) return;
      const onBeforeInput = (event: InputEvent) => {
        if (event.inputType === 'historyUndo') {
          event.preventDefault();
          travel(-1);
        } else if (event.inputType === 'historyRedo') {
          event.preventDefault();
          travel(1);
        }
      };
      root.addEventListener('beforeinput', onBeforeInput);
      return () => root.removeEventListener('beforeinput', onBeforeInput);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onChange]);

    /* Write the starting content once, and any later change that did not come from
       typing (a controlled value that moved). Typing already put its own change in the
       DOM, so an equal value is left alone and the caret is not disturbed. */
    React.useLayoutEffect(() => {
      const root = rootRef.current;
      if (!root) return;
      const wanted = value ?? defaultValue ?? [];
      if (!sameSegments(readSegments(root), wanted)) {
        writeSegments(root, wanted);
        /* The value moved without the user typing (cleared after a send, say): a fresh history. */
        history.current = { steps: [], at: -1, time: 0, type: '' };
      }
      if (history.current.at === -1) {
        history.current = { steps: [{ value: readSegments(root), caret: readLength(root) }], at: 0, time: 0, type: '' };
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    React.useEffect(() => {
      if (autoFocus && rootRef.current) {
        rootRef.current.focus();
        placeCaretAtEnd(rootRef.current);
      }
    }, [autoFocus]);

    const emit = (type = 'other') => {
      const root = rootRef.current;
      if (!root) return;
      /* Chrome leaves a lone <br> in an emptied field, which would hide the placeholder. */
      if (!root.textContent && !root.querySelector(MENTION_SELECTOR)) root.replaceChildren();
      record(type);
      onChange?.(readSegments(root));
    };

    const refresh = () => {
      const root = rootRef.current;
      setTrigger(root ? findTrigger(root) : null);
      setActive(0);
    };

    const choose = (member: MentionMember) => {
      const root = rootRef.current;
      if (!root || !trigger) return;
      const range = document.createRange();
      range.setStart(trigger.node, trigger.start);
      range.setEnd(trigger.node, trigger.end);
      range.deleteContents();
      const tag = makeTag(member.id, member.name);
      const space = document.createTextNode(' ');
      range.insertNode(space);
      range.insertNode(tag);
      const caret = document.createRange();
      caret.setStartAfter(space);
      caret.collapse(true);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(caret);
      setTrigger(null);
      emit('mention');
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      /* While an IME is composing (Chinese, Japanese, Korean), Enter and the arrows belong to it:
         they pick a candidate, not a member or a line break. 229 is the keyCode older browsers
         send for the same thing. */
      if (event.nativeEvent.isComposing || event.keyCode === 229) return;
      if (open) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setActive((i) => (i + 1) % options.length);
          return;
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setActive((i) => (i - 1 + options.length) % options.length);
          return;
        }
        if (event.key === 'Enter' || (event.key === 'Tab' && !event.shiftKey)) {
          event.preventDefault();
          choose(options[active]);
          return;
        }
        if (event.key === 'Escape') {
          /* Closes the list, and only the list. */
          event.preventDefault();
          event.stopPropagation();
          setTrigger(null);
          return;
        }
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        if (event.metaKey || event.ctrlKey) {
          onSubmit?.();
        } else {
          /* A line break the browser undoes properly, rather than the block it would
             otherwise start. */
          document.execCommand('insertLineBreak');
          emit('insertLineBreak');
        }
      }
    };

    const onPaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault();
      document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
    };

    return (
      <div className="relative">
        <div
          {...props}
          ref={(node) => {
            rootRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          role="textbox"
          aria-multiline="true"
          aria-disabled={disabled || undefined}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open ? optionId(active) : undefined}
          aria-haspopup="listbox"
          contentEditable={disabled ? false : 'plaintext-only'}
          suppressContentEditableWarning
          spellCheck
          data-placeholder={placeholder}
          tabIndex={disabled ? -1 : 0}
          onInput={(event) => {
            emit((event.nativeEvent as InputEvent).inputType);
            refresh();
          }}
          onKeyDown={(event) => {
            props.onKeyDown?.(event);
            if (!event.defaultPrevented) onKeyDown(event);
          }}
          /* Only the keys that move the caret without typing; the rest are handled on
             keydown, and refreshing on them would reopen a list Escape just closed or
             send the highlight back to the top. */
          onKeyUp={(event) => {
            if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) refresh();
          }}
          onClick={refresh}
          onBlur={(event) => {
            props.onBlur?.(event);
            setTrigger(null);
          }}
          onPaste={onPaste}
          className={cn(
            'min-h-25 w-full whitespace-pre-wrap break-words rounded-sm border border-stroke-strong',
            'bg-surface-elevated p-4 font-sans text-body-sm-regular text-text-primary',
            'focus:outline-2 focus:-outline-offset-2 focus:outline-stroke-focused',
            /* The placeholder: an empty field has no children, so `:empty` matches. */
            'empty:before:pointer-events-none empty:before:text-text-subtle',
            'empty:before:content-[attr(data-placeholder)]',
            disabled && 'cursor-not-allowed bg-surface-neutral-subtle text-text-disabled',
            className,
          )}
        />

        {open &&
          host &&
          createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label="Members"
            /* Placed in `position()`: until it has measured, it sits hidden at the corner. */
            style={
              place
                ? { left: place.left, top: place.top, bottom: place.bottom, maxHeight: place.maxHeight }
                : { left: 0, top: 0, visibility: 'hidden' }
            }
            className="fixed z-50 w-max max-w-72 min-w-48 overflow-y-auto rounded-md border border-stroke-default bg-surface-elevated p-1 font-sans shadow-menu"
          >
            {options.map((member, i) => (
              <li
                key={member.id}
                id={optionId(i)}
                role="option"
                aria-selected={i === active}
                /* mousedown, not click: a click would blur the field first and close
                   the list before the choice landed. */
                onMouseDown={(event) => {
                  event.preventDefault();
                  choose(member);
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  'flex min-h-10 cursor-pointer items-center rounded-sm px-3 py-2',
                  'text-label-sm-medium text-text-secondary',
                  i === active && 'bg-surface-brand-faint text-text-primary',
                )}
              >
                <span className="truncate">{member.name}</span>
              </li>
            ))}
          </ul>,
            host,
          )}

        {/* The list opening is not otherwise announced: focus never leaves the field. */}
        <span role="status" className="sr-only">
          {open ? 'Members list. Use the up and down arrow keys.' : ''}
        </span>
      </div>
    );
  },
);
MentionInput.displayName = 'MentionInput';

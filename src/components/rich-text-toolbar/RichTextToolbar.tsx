import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon, type IconName } from '../../atoms/icon';

/**
 * RichTextToolbar — the formatting toolbar that **floats over the text you have
 * selected**, as in any text editor: inline styles, lists, a link, a quote,
 * code, history, in divided groups. It owns no editor state — it reports
 * commands and paints `active` — and it does not position itself: the editor
 * places it (see docs/rich-text-toolbar.md), because only the editor knows where
 * the selection is.
 *
 * The look is the card the design draws: raised on `surface.elevated` with a
 * `stroke.subtle` edge and the menu shadow, 8 corners, 6 of padding, 4 between
 * controls; 32 square buttons with 16 glyphs; 24-high dividers between three
 * groups. The four text styles are line icons, not letters.
 *
 * **Which commands it shows is the editor's choice** (`commands`). Not every editor
 * can do everything — the default set is the design's twelve; a comment editor adds
 * `image`; a minimal one might offer only bold, italic and link. The order and the
 * groups never change, only what is in them, and a group with nothing left drops
 * its divider.
 *
 * A real APG toolbar, which the design's own markup is not: `role="toolbar"`,
 * **one tab stop** — Arrow keys move between the enabled buttons (wrapping),
 * Home/End jump — and every button is named, not just `title`-hinted. Only the
 * stateful commands (the text styles, the lists, quote, code) carry
 * `aria-pressed`; link, unlink and history are plain buttons.
 *
 * **It arrives and leaves softly.** Shown, it dissolves in with a tiny drop (4 down,
 * 150ms); hidden through `open={false}`, it fades out in place and only then leaves the
 * DOM. The motion is on an inner card, so the positioning the editor puts on the
 * toolbar itself (a `translate`, a `top`) is never animated. `prefers-reduced-motion`
 * gets no motion at all.
 *
 * **Pressing a button never costs the selection.** The toolbar swallows
 * `mousedown`, so clicking "Bold" does not move focus out of the editor and
 * collapse the text it is meant to bold. Keyboard use is unaffected.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type RichTextCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'ol'
  | 'ul'
  | 'link'
  | 'unlink'
  | 'quote'
  | 'code'
  | 'undo'
  | 'redo'
  | 'image';

/** Every command the toolbar knows, in display order. */
export const ALL_RICH_TEXT_COMMANDS: readonly RichTextCommand[] = [
  'bold',
  'italic',
  'underline',
  'strike',
  'ol',
  'ul',
  'link',
  'unlink',
  'quote',
  'code',
  'image',
  'undo',
  'redo',
];

/**
 * What it shows when `commands` is not given: the design's twelve. `image` is not
 * among them — it needs an editor that can insert one, so a caller opts in.
 */
export const DEFAULT_RICH_TEXT_COMMANDS: readonly RichTextCommand[] =
  ALL_RICH_TEXT_COMMANDS.filter((c) => c !== 'image');

export interface RichTextToolbarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Which stateful commands are on — `{ bold: true }`. */
  active?: Partial<Record<RichTextCommand, boolean>>;
  /**
   * Which commands to show. Defaults to `DEFAULT_RICH_TEXT_COMMANDS` (twelve, no
   * image). Pass `[...DEFAULT_RICH_TEXT_COMMANDS, 'image']` for a comment editor, or a
   * shorter list for a smaller one. Order and grouping are fixed; this only filters.
   */
  commands?: readonly RichTextCommand[];
  /**
   * Commands that are shown but cannot be used right now — typically `undo` with
   * nothing to undo, `redo` with nothing to redo, `unlink` off a link. The toolbar owns
   * no editor state, so the editor says which: `{ undo: !canUndo, redo: !canRedo }`.
   */
  disabledCommands?: Partial<Record<RichTextCommand, boolean>>;
  onCommand?: (command: RichTextCommand) => void;
  /**
   * Whether the toolbar is showing. Default `true`. Flip it to `false` instead of
   * unmounting it and the toolbar fades out before it leaves the DOM; unmount it
   * outright and it simply disappears.
   */
  open?: boolean;
  /** The toolbar's accessible name. */
  label?: string;
}

/** How long the fade takes, in ms — the exit unmounts after this. */
const MOTION_MS = 150;

interface Spec {
  command: RichTextCommand;
  name: string;
  icon: IconName;
}

/* Stateful commands get aria-pressed; link, unlink and history do not. */
const TOGGLABLE = new Set<RichTextCommand>([
  'bold',
  'italic',
  'underline',
  'strike',
  'ol',
  'ul',
  'quote',
  'code',
]);

/* The design's three groups, in its order. */
const GROUPS: Spec[][] = [
  [
    { command: 'bold', name: 'Bold', icon: 'text-b' },
    { command: 'italic', name: 'Italic', icon: 'text-italic' },
    { command: 'underline', name: 'Underline', icon: 'text-underline' },
    { command: 'strike', name: 'Strikethrough', icon: 'text-strikethrough' },
  ],
  [
    { command: 'ol', name: 'Numbered list', icon: 'list-numbers' },
    { command: 'ul', name: 'Bulleted list', icon: 'list-bullets' },
  ],
  [
    { command: 'link', name: 'Link', icon: 'link' },
    { command: 'unlink', name: 'Unlink', icon: 'link-break' },
    { command: 'quote', name: 'Block quote', icon: 'quotes' },
    { command: 'code', name: 'Code block', icon: 'code' },
    /* Insert image sits left of history, so undo and redo stay the rightmost pair. */
    { command: 'image', name: 'Insert image', icon: 'image' },
    { command: 'undo', name: 'Undo', icon: 'arrow-u-up-left' },
    { command: 'redo', name: 'Redo', icon: 'arrow-u-up-right' },
  ],
];

export const RichTextToolbar = React.forwardRef<HTMLDivElement, RichTextToolbarProps>(
  (
    {
      className,
      active = {},
      commands = DEFAULT_RICH_TEXT_COMMANDS,
      open = true,
      disabledCommands = {},
      onCommand,
      label = 'Text formatting',
      onKeyDown,
      onMouseDown,
      ...props
    },
    ref,
  ) => {
    /* Roving tabindex: one stop in the Tab order, arrows walk the enabled buttons.
       A disabled button cannot take focus, so it is skipped rather than stranding
       the tab stop on something the keyboard cannot reach. */
    const shown = new Set(commands);
    /* The groups that still have something in them, each with only what is shown. */
    const groups = GROUPS.map((g) => g.filter((s) => shown.has(s.command))).filter((g) => g.length);
    const visible = groups.flat().map((s) => s.command);
    const enabled = visible.filter((c) => !disabledCommands[c]);
    const [focused, setFocused] = React.useState<RichTextCommand>(visible[0]);
    const stop = enabled.includes(focused) ? focused : enabled[0];
    const buttons = React.useRef(new Map<RichTextCommand, HTMLButtonElement>());

    /* Presence: stay mounted while the fade-out plays, then leave. */
    const [mounted, setMounted] = React.useState(open);
    React.useEffect(() => {
      if (open) {
        setMounted(true);
        return undefined;
      }
      const id = window.setTimeout(() => setMounted(false), MOTION_MS);
      return () => window.clearTimeout(id);
    }, [open]);

    const go = (next: RichTextCommand | undefined) => {
      if (!next) return;
      setFocused(next);
      buttons.current.get(next)?.focus();
    };
    const move = (delta: number) => {
      const i = enabled.indexOf(stop);
      go(enabled[(i + delta + enabled.length) % enabled.length]);
    };

    if (!open && !mounted) return null;

    return (
      <div
        ref={ref}
        role="toolbar"
        aria-label={label}
        aria-orientation="horizontal"
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented) return;
          if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
          if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
          if (e.key === 'Home') { e.preventDefault(); go(enabled[0]); }
          if (e.key === 'End') { e.preventDefault(); go(enabled[enabled.length - 1]); }
        }}
        /* Keep the editor's selection: a press on a button must not move focus. */
        onMouseDown={(e) => {
          onMouseDown?.(e);
          e.preventDefault();
        }}
        data-state={open ? 'open' : 'closed'}
        className={cn('inline-flex', className)}
        {...props}
      >
        {/* The card is the animated layer, so a caller's positioning on the toolbar
            itself (a translate, a top) is never part of the motion. */}
        <div
          className={cn(
            /* The design's card: 8 corners, 6 padding, 4 between controls. */
            'inline-flex items-center gap-1 rounded-md border border-stroke-subtle bg-surface-elevated p-1.5 font-sans shadow-menu',
            /* In: dissolve and drop 4. Out: dissolve. */
            'transition-[opacity,translate] duration-150 ease-out starting:-translate-y-1 starting:opacity-0 motion-reduce:transition-none',
            !open && 'pointer-events-none opacity-0',
          )}
        >
          {groups.map((group, gi) => (
            <React.Fragment key={gi}>
              {gi > 0 && (
                <span
                  role="separator"
                  aria-orientation="vertical"
                  className="h-6 w-px shrink-0 bg-stroke-default"
                />
              )}
              <div className="flex items-center gap-1">
                {group.map((spec) => {
                  const on = TOGGLABLE.has(spec.command) && !!active[spec.command];
                  return (
                    <button
                      key={spec.command}
                      ref={(el) => {
                        if (el) buttons.current.set(spec.command, el);
                        else buttons.current.delete(spec.command);
                      }}
                      type="button"
                      tabIndex={open && spec.command === stop ? 0 : -1}
                      aria-label={spec.name}
                      title={spec.name}
                      aria-pressed={TOGGLABLE.has(spec.command) ? on : undefined}
                      disabled={disabledCommands[spec.command]}
                      onClick={() => onCommand?.(spec.command)}
                      onFocus={() => setFocused(spec.command)}
                      className={cn(
                        /* 32 square, 8 corners, a 16 glyph — the design's p-2 button. */
                        'grid size-8 cursor-pointer place-items-center rounded-md transition-colors',
                        on
                          ? 'bg-surface-brand-faint text-text-brand-strong hover:bg-surface-brand-subtle'
                          : 'text-text-primary hover:bg-surface-neutral-subtle active:bg-surface-neutral-medium',
                        'disabled:cursor-not-allowed disabled:text-text-disabled disabled:hover:bg-transparent',
                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
                      )}
                    >
                      <Icon name={spec.icon} size="sm" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  },
);
RichTextToolbar.displayName = 'RichTextToolbar';

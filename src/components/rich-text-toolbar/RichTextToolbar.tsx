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
 * A real APG toolbar, which the design's own markup is not: `role="toolbar"`,
 * **one tab stop** — Arrow keys move between the enabled buttons (wrapping),
 * Home/End jump — and every button is named, not just `title`-hinted. Only the
 * stateful commands (the text styles, the lists, quote, code) carry
 * `aria-pressed`; link, unlink and history are plain buttons.
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
  | 'redo';

export interface RichTextToolbarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Which stateful commands are on — `{ bold: true }`. */
  active?: Partial<Record<RichTextCommand, boolean>>;
  /** Dead commands — typically `{ undo: true, unlink: true }`. */
  disabledCommands?: Partial<Record<RichTextCommand, boolean>>;
  onCommand?: (command: RichTextCommand) => void;
  /** The toolbar's accessible name. */
  label?: string;
}

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
    { command: 'undo', name: 'Undo', icon: 'arrow-u-up-left' },
    { command: 'redo', name: 'Redo', icon: 'arrow-u-up-right' },
  ],
];

const COMMANDS = GROUPS.flat().map((s) => s.command);

export const RichTextToolbar = React.forwardRef<HTMLDivElement, RichTextToolbarProps>(
  (
    {
      className,
      active = {},
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
    const enabled = COMMANDS.filter((c) => !disabledCommands[c]);
    const [focused, setFocused] = React.useState<RichTextCommand>(COMMANDS[0]);
    const stop = enabled.includes(focused) ? focused : enabled[0];
    const buttons = React.useRef(new Map<RichTextCommand, HTMLButtonElement>());

    const go = (next: RichTextCommand | undefined) => {
      if (!next) return;
      setFocused(next);
      buttons.current.get(next)?.focus();
    };
    const move = (delta: number) => {
      const i = enabled.indexOf(stop);
      go(enabled[(i + delta + enabled.length) % enabled.length]);
    };

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
        className={cn(
          /* The design's card: 8 corners, 6 padding, 4 between controls. */
          'inline-flex items-center gap-1 rounded-md border border-stroke-subtle bg-surface-elevated p-1.5 font-sans shadow-menu',
          className,
        )}
        {...props}
      >
        {GROUPS.map((group, gi) => (
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
                    tabIndex={spec.command === stop ? 0 : -1}
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
    );
  },
);
RichTextToolbar.displayName = 'RichTextToolbar';

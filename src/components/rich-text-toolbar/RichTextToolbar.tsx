import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon, type IconName } from '../../atoms/icon';

/**
 * RichTextToolbar — the formatting strip above a rich editor: inline styles,
 * lists, inserts, history, in divided groups. It owns no editor state; it
 * reports commands and paints `active`.
 *
 * A real APG toolbar: `role="toolbar"`, **one tab stop** — Arrow keys move
 * between buttons (wrapping), Home/End jump — because eleven tab stops before
 * the text area is the classic toolbar failure. Only the stateful commands
 * (bold…ol) carry `aria-pressed`; undo/redo/inserts are plain buttons, where
 * the export pressed everything.
 *
 * The letter glyphs (B, I, U, S) are the convention the world reads; their
 * names ("Bold", "Italic") do the announcing. Buttons are 28 — the
 * pointer-dense exemption, and the keyboard path is the arrow keys, not
 * hunting tab stops.
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
  | 'ul'
  | 'ol'
  | 'link'
  | 'image'
  | 'file'
  | 'undo'
  | 'redo';

export interface RichTextToolbarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Which stateful commands are on — `{ bold: true }`. */
  active?: Partial<Record<RichTextCommand, boolean>>;
  /** Dead commands — typically `{ undo: true }` at history's start. */
  disabledCommands?: Partial<Record<RichTextCommand, boolean>>;
  onCommand?: (command: RichTextCommand) => void;
  /** The toolbar's accessible name. */
  label?: string;
}

type Spec =
  | { command: RichTextCommand; name: string; letter: string; letterClass: string }
  | { command: RichTextCommand; name: string; icon: IconName };

/* Stateful commands get aria-pressed; inserts and history do not. */
const TOGGLABLE = new Set<RichTextCommand>(['bold', 'italic', 'underline', 'strike', 'ul', 'ol']);

const GROUPS: Spec[][] = [
  [
    { command: 'bold', name: 'Bold', letter: 'B', letterClass: 'font-bold' },
    { command: 'italic', name: 'Italic', letter: 'I', letterClass: 'italic' },
    { command: 'underline', name: 'Underline', letter: 'U', letterClass: 'underline' },
    { command: 'strike', name: 'Strikethrough', letter: 'S', letterClass: 'line-through' },
  ],
  [
    { command: 'ul', name: 'Bulleted list', icon: 'list-bullets' },
    { command: 'ol', name: 'Numbered list', icon: 'list-numbers' },
  ],
  [
    { command: 'link', name: 'Insert link', icon: 'link' },
    { command: 'image', name: 'Insert image', icon: 'image' },
    { command: 'file', name: 'Insert file', icon: 'paperclip' },
  ],
  [
    { command: 'undo', name: 'Undo', icon: 'arrow-u-up-left' },
    { command: 'redo', name: 'Redo', icon: 'arrow-u-up-right' },
  ],
];

const COMMANDS = GROUPS.flat().map((s) => s.command);

export const RichTextToolbar = React.forwardRef<HTMLDivElement, RichTextToolbarProps>(
  (
    { className, active = {}, disabledCommands = {}, onCommand, label = 'Text formatting', ...props },
    ref,
  ) => {
    /* Roving tabindex: one stop in the Tab order, arrows walk the buttons. */
    const [focused, setFocused] = React.useState<RichTextCommand>(COMMANDS[0]);
    const buttons = React.useRef(new Map<RichTextCommand, HTMLButtonElement>());

    const move = (delta: number) => {
      const i = COMMANDS.indexOf(focused);
      const next = COMMANDS[(i + delta + COMMANDS.length) % COMMANDS.length];
      setFocused(next);
      buttons.current.get(next)?.focus();
    };
    const jump = (index: number) => {
      const next = COMMANDS[index < 0 ? COMMANDS.length - 1 : 0];
      setFocused(next);
      buttons.current.get(next)?.focus();
    };

    return (
      <div
        ref={ref}
        role="toolbar"
        aria-label={label}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
          if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
          if (e.key === 'Home') { e.preventDefault(); jump(0); }
          if (e.key === 'End') { e.preventDefault(); jump(-1); }
        }}
        className={cn(
          'flex flex-wrap items-center gap-0.5 border-b border-stroke-subtle p-1 font-sans',
          className,
        )}
        {...props}
      >
        {GROUPS.map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && <span aria-hidden="true" className="mx-1 h-4 w-px bg-stroke-subtle" />}
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
                  tabIndex={spec.command === focused ? 0 : -1}
                  aria-label={spec.name}
                  title={spec.name}
                  aria-pressed={TOGGLABLE.has(spec.command) ? on : undefined}
                  disabled={disabledCommands[spec.command]}
                  onClick={() => onCommand?.(spec.command)}
                  onFocus={() => setFocused(spec.command)}
                  className={cn(
                    'grid size-7 place-items-center rounded-sm transition-colors',
                    /* text.brand.strong, not medium — the letters are real
                       label-md text, and medium was 3.51:1 on the tint in dark. */
                    on
                      ? 'bg-surface-brand-faint text-text-brand-strong'
                      : 'text-text-secondary hover:bg-surface-brand-base hover:text-text-brand-medium',
                    'disabled:pointer-events-none disabled:text-text-disabled',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
                  )}
                >
                  {'icon' in spec ? (
                    <Icon name={spec.icon} size="sm" aria-hidden="true" />
                  ) : (
                    <span aria-hidden="true" className={cn('text-label-md', spec.letterClass)}>
                      {spec.letter}
                    </span>
                  )}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  },
);
RichTextToolbar.displayName = 'RichTextToolbar';

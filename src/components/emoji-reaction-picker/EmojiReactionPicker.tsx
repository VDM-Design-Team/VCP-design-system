import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../icon';
import { Popover } from '../popover';

/**
 * EmojiReactionPicker — the reaction row under a comment: existing reactions
 * as toggleable pills, and a "+" that opens the system `Popover` with the
 * palette. State lives with the caller — this renders and reports.
 *
 * Pills are toggle buttons: `aria-pressed` says whether *you* reacted, and
 * the pressed treatment (brand tint + stronger border) echoes it. Each pill's
 * accessible name says what a glance says — "3 reactions, 👍, you reacted" —
 * because "thumbs up 3" alone answers neither question a reader has.
 *
 * The palette buttons close the popover on pick and hand focus back to the
 * trigger (Popover's own contract). The default palette is a neutral eight;
 * callers with team culture opinions pass their own.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface EmojiReaction {
  emoji: string;
  count: number;
  /** Whether the current user reacted — drives `aria-pressed` and the tint. */
  mine?: boolean;
}

export interface EmojiReactionPickerProps
  /* Both shadow native handlers on purpose, as Accordion's onToggle does. */
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'onToggle'> {
  /** The palette in the popover. */
  emoji?: readonly string[];
  /** A palette pick. The popover closes itself. */
  onSelect?: (emoji: string) => void;
  /** Existing reaction pills, rendered before the trigger. */
  reactions?: readonly EmojiReaction[];
  /** A pill toggle. */
  onToggle?: (emoji: string) => void;
}

const DEFAULT_EMOJI = ['👍', '👎', '🎉', '🎯', '👀', '🔥', '🤔', '✅'] as const;

const pillBase = cn(
  'inline-flex h-6 items-center gap-1 rounded-full border px-2 font-sans transition-colors',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
);

export const EmojiReactionPicker = React.forwardRef<HTMLDivElement, EmojiReactionPickerProps>(
  ({ className, emoji = DEFAULT_EMOJI, onSelect, reactions = [], onToggle, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);

    return (
      <div ref={ref} className={cn('flex flex-wrap items-center gap-1.5', className)} {...props}>
        {reactions.map((r) => (
          <button
            key={r.emoji}
            type="button"
            aria-pressed={r.mine || undefined}
            aria-label={`${r.count} ${r.count === 1 ? 'reaction' : 'reactions'}, ${r.emoji}${r.mine ? ', you reacted' : ''}`}
            onClick={() => onToggle?.(r.emoji)}
            className={cn(
              pillBase,
              r.mine
                ? 'border-stroke-brand-strong bg-surface-brand-faint text-text-brand-strong'
                : 'border-stroke-subtle bg-surface-elevated text-text-secondary hover:bg-surface-neutral-faint',
            )}
          >
            <span aria-hidden="true">{r.emoji}</span>
            <span aria-hidden="true" className="font-numeric text-caption-md">
              {r.count}
            </span>
          </button>
        ))}
        <Popover
          open={open}
          onOpenChange={setOpen}
          trigger={
            <button
              type="button"
              aria-label="Add reaction"
              className={cn(
                pillBase,
                'border-stroke-subtle bg-surface-elevated text-text-tertiary hover:bg-surface-neutral-faint hover:text-text-secondary',
              )}
            >
              <Icon name="plus" className="size-3" aria-hidden="true" />
            </button>
          }
          content={
            <div role="group" aria-label="Pick a reaction" className="grid grid-cols-4 gap-1">
              {emoji.map((e) => (
                <button
                  key={e}
                  type="button"
                  aria-label={`React with ${e}`}
                  onClick={() => {
                    onSelect?.(e);
                    setOpen(false);
                  }}
                  className={cn(
                    'grid size-9 place-items-center rounded-sm text-heading-md leading-none transition-colors',
                    'hover:bg-surface-neutral-faint',
                    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-focused',
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          }
        />
      </div>
    );
  },
);
EmojiReactionPicker.displayName = 'EmojiReactionPicker';

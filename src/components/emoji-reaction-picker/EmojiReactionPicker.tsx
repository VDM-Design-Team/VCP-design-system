import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { Popover } from '../popover';
import { Tooltip } from '../tooltip';

/**
 * EmojiReactionPicker — the reaction row under a comment: existing reactions
 * as toggleable pills, a standalone thumbs-up quick-react, and a "+" that
 * opens the system `Popover` with the full palette. State lives with the
 * caller — this renders and reports.
 *
 * Pills are toggle buttons: `aria-pressed` says whether *you* reacted, and
 * the pressed treatment (brand tint + `stroke.focused` border) echoes it.
 * Each pill's accessible name says what a glance says — "3 reactions, 👍,
 * you reacted" — because "thumbs up 3" alone answers neither question a
 * reader has.
 *
 * **Two textual icon buttons sit before the pills** (design audit, 24 Sep
 * 2026): a bare thumbs-up for the single most common reaction, and the
 * "add reaction" trigger — a smiley with a small plus mark, not a bare "+".
 * Both use `neutral.textual.content`, not the bordered pill treatment —
 * they are not reactions themselves, they are ways to add one. The
 * thumbs-up button toggles the same `👍` reaction a pill would; if one
 * already exists in `reactions`, this button reflects its `mine` state
 * rather than duplicating it.
 *
 * **Overflow.** Past `maxVisible` reaction pills, the rest collapse into a
 * trailing "+N" chip (Figma's `_Notification_Popover_Emoji_Reaction`,
 * `Type=Overflowing`). The exact cutoff isn't a confirmed design rule — only
 * that some cutoff exists — so `maxVisible` defaults to a reasonable 5 and
 * is a prop specifically so a caller can override it.
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
  /**
   * Who reacted, for the hover tooltip the design draws (Figma
   * `_Comment_Emoji_Reaction`, State=Hover Tooltip). Omit it and the pill
   * has no tooltip — a count with no names to show has nothing to add.
   */
  people?: readonly string[];
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
  /** A pill toggle — also fired by the standalone thumbs-up button. */
  onToggle?: (emoji: string) => void;
  /**
   * Reaction pills shown before the rest collapse into a trailing "+N" chip.
   * Figma draws an overflow state but doesn't fix a specific number — pick
   * what reads well for the width this renders in.
   */
  maxVisible?: number;
}

const DEFAULT_EMOJI = ['👍', '👎', '🎉', '🎯', '👀', '🔥', '🤔', '✅'] as const;

/** "Eve", "Eve and Marvin", "Eve, Marvin and 3 others" — AvatarGroup's phrasing. */
function formatReactors(people: readonly string[]): string {
  if (people.length === 1) return people[0];
  if (people.length === 2) return `${people[0]} and ${people[1]}`;
  const rest = people.length - 2;
  return `${people[0]}, ${people[1]} and ${rest} ${rest === 1 ? 'other' : 'others'}`;
}

const pillBase = cn(
  'inline-flex h-6 items-center gap-1 rounded-full border px-2 font-sans transition-colors',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
);

/* No fill, no border — a way to add a reaction, not a reaction itself.
   Same shape TypeTag/UrgencyTag use for their own textual style. */
const textualIconButton = cn(
  'inline-flex size-6 shrink-0 items-center justify-center rounded-full transition-colors',
  'text-neutral-textual-content-default hover:text-neutral-textual-content-hover',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
);

export const EmojiReactionPicker = React.forwardRef<HTMLDivElement, EmojiReactionPickerProps>(
  (
    {
      className,
      emoji = DEFAULT_EMOJI,
      onSelect,
      reactions = [],
      onToggle,
      maxVisible = 5,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const visible = reactions.slice(0, maxVisible);
    const overflow = reactions.length - visible.length;
    const mineThumbsUp = reactions.find((r) => r.emoji === '👍')?.mine;

    return (
      <div ref={ref} className={cn('flex flex-wrap items-center gap-1.5', className)} {...props}>
        <button
          type="button"
          aria-pressed={mineThumbsUp || undefined}
          aria-label={mineThumbsUp ? 'Remove thumbs up reaction' : 'React with thumbs up'}
          onClick={() => onToggle?.('👍')}
          className={cn(textualIconButton, mineThumbsUp && 'text-text-brand-medium')}
        >
          <Icon name="thumbs-up" size="sm" aria-hidden="true" />
        </button>
        {visible.map((r) => {
          const pill = (
            <button
              type="button"
              aria-pressed={r.mine || undefined}
              aria-label={`${r.count} ${r.count === 1 ? 'reaction' : 'reactions'}, ${r.emoji}${r.mine ? ', you reacted' : ''}`}
              onClick={() => onToggle?.(r.emoji)}
              className={cn(
                pillBase,
                /* stroke.focused, not stroke.brand.strong — design audit,
                   24 Sep 2026. The count's own colour is set on its span
                   above; this button's base text colour only affects the
                   emoji, which ignores it (emoji render in their native
                   colours, never currentColor). */
                r.mine
                  ? 'border-stroke-focused bg-surface-brand-faint'
                  : 'border-stroke-subtle bg-surface-elevated text-text-secondary hover:bg-surface-neutral-faint',
              )}
            >
              {/* Same size as the count beside it — the export left the emoji
                  unsized, so it rendered at the ambient body size next to a
                  much smaller number. */}
              <span aria-hidden="true" className="text-caption-md leading-none">
                {r.emoji}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  'font-numeric text-caption-md',
                  r.mine && 'text-text-brand-medium',
                )}
              >
                {r.count}
              </span>
            </button>
          );
          /* The design's Hover Tooltip state — who reacted, on the system
             `Tooltip` (which also opens on keyboard focus, so the names are
             not pointer-only). No `people`, no tooltip. */
          return r.people && r.people.length > 0 ? (
            <Tooltip key={r.emoji} content={formatReactors(r.people)}>
              {pill}
            </Tooltip>
          ) : (
            <React.Fragment key={r.emoji}>{pill}</React.Fragment>
          );
        })}
        {overflow > 0 && (
          <span
            className={cn(pillBase, 'border-stroke-subtle bg-surface-elevated text-text-secondary')}
            aria-label={`${overflow} more ${overflow === 1 ? 'reaction' : 'reactions'}`}
          >
            +{overflow}
          </span>
        )}
        {/*
          Tooltip wraps the whole Popover, not just its trigger button.
          Popover's own contract clones `trigger` directly (ref, onClick,
          aria-expanded/-controls) — nesting Tooltip inside that clone would
          break it, since Tooltip's ref and its `{...props}` spread land on
          its own wrapping <span>, not on the button inside. Wrapping the
          other way round costs nothing here: the tooltip text repeats the
          button's own `aria-label` verbatim, so a screen-reader user loses
          nothing by `aria-describedby` landing on Popover's wrapper div
          instead of the button itself, and hover/focus still bubble to
          Tooltip's span correctly either way.
        */}
        <Tooltip content="Add reaction">
          <Popover
            open={open}
            onOpenChange={setOpen}
            trigger={
              <button type="button" aria-label="Add reaction" className={textualIconButton}>
                {/* Smiley with a small plus mark, not a bare "+" — design
                    audit, 24 Sep 2026. */}
                <span className="relative grid size-5 place-items-center">
                  <Icon name="smiley" size="sm" aria-hidden="true" />
                  <Icon
                    name="plus"
                    aria-hidden="true"
                    className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-surface-elevated"
                  />
                </span>
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
        </Tooltip>
      </div>
    );
  },
);
EmojiReactionPicker.displayName = 'EmojiReactionPicker';

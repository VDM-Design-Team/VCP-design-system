import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { Popover } from '../popover';
import { Tooltip } from '../tooltip';

/**
 * EmojiReactionPicker — the reaction row under a comment: a standalone
 * thumbs-up quick-react, an "add reaction" trigger that opens the system
 * `Popover` with the full palette, and then the existing reactions as
 * toggleable pills. State lives with the caller — this renders and reports.
 *
 * Pills are toggle buttons: `aria-pressed` says whether *you* reacted, and
 * the brand-coloured outline echoes it. Each pill's accessible name says what
 * a glance says — "3 reactions, 👍, you reacted" — because "thumbs up 3"
 * alone answers neither question a reader has.
 *
 * **Two textual icon buttons lead the row** (design audit, 24 Sep 2026): a
 * bare thumbs-up for the single most common reaction, and the "add reaction"
 * trigger — a `smiley-plus` glyph. Both use `neutral.textual.content` and turn
 * `text.brand.medium` on hover, not the bordered pill treatment — they are not
 * reactions themselves, they are ways to add one. The thumbs-up button toggles
 * the same `👍` reaction a pill would; if one already exists in `reactions`,
 * this button reflects its `mine` state rather than duplicating it.
 *
 * **Pills are the outline style**: transparent at rest — for other people's
 * reactions and your own alike — with `neutral.outline.surface` hover and
 * pressed fills. Other people's reactions darken border and content on hover;
 * yours rests at `stroke.focused` + `text.brand.medium` (the 24 Sep audit's
 * default) and only reaches the `strong` pair on hover.
 *
 * **Overflow.** Past `maxVisible` reaction pills, the rest collapse into a
 * trailing "+N" chip (Figma's `_Notification_Popover_Emoji_Reaction`,
 * `Type=Overflowing`). The exact cutoff isn't a confirmed design rule — only
 * that some cutoff exists — so `maxVisible` defaults to a reasonable 5 and
 * is a prop specifically so a caller can override it.
 *
 * The palette buttons close the popover on pick and hand focus back to the
 * trigger (Popover's own contract). The default palette is three named
 * categories; callers with team culture opinions pass `categories`, or a flat
 * `emoji` list for an ungrouped grid.
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
  /**
   * The emoji's short name for the tooltip ("thumbsup" → "reacted with
   * :thumbsup:"). Known emoji resolve on their own; pass this for one that
   * doesn't, or to override. With no name at all the tooltip shows the glyph.
   */
  name?: string;
}

/** A titled group of emoji in the palette. */
export interface EmojiCategory {
  name: string;
  emoji: readonly string[];
}

export interface EmojiReactionPickerProps
  /* Both shadow native handlers on purpose, as Accordion's onToggle does. */
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'onToggle'> {
  /**
   * A flat, ungrouped palette. Wins over `categories` when both are given —
   * it is the simple way to hand the popover a short custom list.
   */
  emoji?: readonly string[];
  /** The palette in the popover, grouped under category names. */
  categories?: readonly EmojiCategory[];
  /** A palette pick. The popover closes itself. */
  onSelect?: (emoji: string) => void;
  /** Existing reaction pills, rendered after the two icon buttons. */
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

/* Written as escapes so the variation selector cannot be lost in an edit: U+2764
   and U+26A0 are text-presentation characters by default, and only render as the colour
   emoji when followed by U+FE0F. */
const HEART = '\u2764\uFE0F';
const WARNING = '\u26A0\uFE0F';

export const DEFAULT_EMOJI_CATEGORIES: readonly EmojiCategory[] = [
  {
    name: 'Hand Gestures',
    emoji: ['👍', '👎', '🙌', '👋', '👌', '👏', '🫶', '🤝', '🤘', '🙏', '💪'],
  },
  {
    name: 'Smileys & People',
    emoji: ['👀', '😄', '🤔', '😅', '😂', '😮', '😊', '🤩'],
  },
  {
    name: 'Symbols',
    emoji: ['🔥', '💯', '🎉', '✅', HEART, WARNING, '🚀', '💥'],
  },
];

/** Short names for the tooltip's "reacted with :name:". Keyed without U+FE0F. */
const EMOJI_NAMES: Readonly<Record<string, string>> = {
  '👍': 'thumbsup',
  '👎': 'thumbsdown',
  '🙌': 'raised_hands',
  '👋': 'wave',
  '👌': 'ok_hand',
  '👏': 'clap',
  '🫶': 'heart_hands',
  '🤝': 'handshake',
  '🤘': 'metal',
  '🙏': 'pray',
  '💪': 'muscle',
  '👀': 'eyes',
  '😄': 'smile',
  '🤔': 'thinking_face',
  '😅': 'sweat_smile',
  '😂': 'joy',
  '😮': 'open_mouth',
  '😊': 'blush',
  '🤩': 'star_struck',
  '🔥': 'fire',
  '💯': '100',
  '🎉': 'tada',
  '✅': 'white_check_mark',
  '\u2764': 'heart',
  '\u26A0': 'warning',
  '🚀': 'rocket',
  '💥': 'boom',
};

function emojiName(emoji: string): string | undefined {
  return EMOJI_NAMES[emoji.replace(/️/g, '')];
}

/** "Eve", "Eve and Marvin", "Eve, Marvin and 3 others" — AvatarGroup's phrasing. */
function formatReactors(people: readonly string[]): string {
  if (people.length === 1) return people[0];
  if (people.length === 2) return `${people[0]} and ${people[1]}`;
  const rest = people.length - 2;
  return `${people[0]}, ${people[1]} and ${rest} ${rest === 1 ? 'other' : 'others'}`;
}

/* Outline style, for other people's reactions and your own alike: no fill at
   rest, `neutral.outline.surface` hover and pressed. Only border and content
   differ between the two (see `pillOthers` / `pillMine`). */
const pillBase = cn(
  'inline-flex h-6 items-center gap-1 rounded-full border px-2 font-sans transition-colors',
  'bg-neutral-outline-surface-default',
  'hover:bg-neutral-outline-surface-hover active:bg-neutral-outline-surface-pressed',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
);

const pillOthers = cn(
  'border-neutral-outline-border-default text-neutral-outline-content-default',
  'hover:border-neutral-outline-border-hover hover:text-neutral-outline-content-hover',
);

/* stroke.focused + text.brand.medium at rest — the 24 Sep 2026 audit's
   default. The strong pair is hover only. */
const pillMine = cn(
  'border-stroke-focused text-text-brand-medium',
  'hover:border-stroke-brand-strong hover:text-text-brand-strong',
);

/* No fill, no border — a way to add a reaction, not a reaction itself.
   Same shape TypeTag/UrgencyTag use for their own textual style. A small glyph
   (`Icon` size sm) inside `p-1` (space.4) padding makes the space.24 button. */
const textualIconButton = cn(
  'inline-flex shrink-0 items-center justify-center rounded-full p-1 transition-colors',
  'text-neutral-textual-content-default hover:text-text-brand-medium',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
);

const emojiCell = cn(
  'grid size-9 place-items-center rounded-xs text-title-md-semibold leading-none transition-colors',
  'hover:bg-surface-neutral-faint active:bg-surface-neutral-medium',
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-focused',
);

export const EmojiReactionPicker = React.forwardRef<HTMLDivElement, EmojiReactionPickerProps>(
  (
    {
      className,
      emoji,
      categories = DEFAULT_EMOJI_CATEGORIES,
      onSelect,
      reactions = [],
      onToggle,
      maxVisible = 5,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const idBase = React.useId();
    const visible = reactions.slice(0, maxVisible);
    const overflow = reactions.length - visible.length;
    const mineThumbsUp = reactions.find((r) => r.emoji === '👍')?.mine;

    const pick = (e: string) => {
      onSelect?.(e);
      setOpen(false);
    };
    const cell = (e: string) => (
      <button
        key={e}
        type="button"
        aria-label={`React with ${e}`}
        onClick={() => pick(e)}
        className={emojiCell}
      >
        {e}
      </button>
    );

    return (
      <div ref={ref} className={cn('flex flex-wrap items-center gap-2', className)} {...props}>
        <button
          type="button"
          aria-pressed={mineThumbsUp || undefined}
          aria-label={mineThumbsUp ? 'Remove thumbs up reaction' : 'React with thumbs up'}
          onClick={() => onToggle?.('👍')}
          className={cn(textualIconButton, mineThumbsUp && 'text-text-brand-medium')}
        >
          <Icon name="thumbs-up" size="sm" aria-hidden="true" />
        </button>
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
                {/* The design's SmileyPlus — the plus is part of the glyph. */}
                <Icon name="smiley-plus" size="sm" aria-hidden="true" />
              </button>
            }
            content={
              emoji ? (
                <div role="group" aria-label="Pick a reaction" className="grid grid-cols-8">
                  {emoji.map(cell)}
                </div>
              ) : (
                <div role="group" aria-label="Pick a reaction" className="flex flex-col gap-3">
                  {categories.map((c, i) => (
                    <div
                      key={c.name}
                      role="group"
                      aria-labelledby={`${idBase}-cat-${i}`}
                      className="flex flex-col"
                    >
                      <span
                        id={`${idBase}-cat-${i}`}
                        className="font-sans text-caption-md-medium text-text-tertiary"
                      >
                        {c.name}
                      </span>
                      <div className="grid grid-cols-8">{c.emoji.map(cell)}</div>
                    </div>
                  ))}
                </div>
              )
            }
          />
        </Tooltip>
        {visible.map((r) => {
          const name = r.name ?? emojiName(r.emoji);
          const pill = (
            <button
              type="button"
              aria-pressed={r.mine || undefined}
              aria-label={`${r.count} ${r.count === 1 ? 'reaction' : 'reactions'}, ${r.emoji}${r.mine ? ', you reacted' : ''}`}
              onClick={() => onToggle?.(r.emoji)}
              className={cn(pillBase, r.mine ? pillMine : pillOthers)}
            >
              {/* Same size as the count beside it — the export left the emoji
                  unsized, so it rendered at the ambient body size next to a
                  much smaller number. Emoji render in their native colours,
                  so the pill's text colour only reaches the count. */}
              <span aria-hidden="true" className="text-caption-md-regular leading-none">
                {r.emoji}
              </span>
              <span aria-hidden="true" className="font-numeric text-caption-md-regular">
                {r.count}
              </span>
            </button>
          );
          /* The design's Hover Tooltip state — who reacted, on the system
             `Tooltip` (which also opens on keyboard focus, so the names are
             not pointer-only). No `people`, no tooltip. */
          return r.people && r.people.length > 0 ? (
            <Tooltip
              key={r.emoji}
              content={
                <>
                  <strong>{formatReactors(r.people)}</strong> reacted with{' '}
                  {name ? `:${name}:` : r.emoji}
                </>
              }
            >
              {pill}
            </Tooltip>
          ) : (
            <React.Fragment key={r.emoji}>{pill}</React.Fragment>
          );
        })}
        {overflow > 0 && (
          <span
            className={cn(
              'inline-flex h-6 items-center rounded-full border px-2 font-sans',
              'border-neutral-outline-border-default text-neutral-outline-content-default',
            )}
            aria-label={`${overflow} more ${overflow === 1 ? 'reaction' : 'reactions'}`}
          >
            +{overflow}
          </span>
        )}
      </div>
    );
  },
);
EmojiReactionPicker.displayName = 'EmojiReactionPicker';

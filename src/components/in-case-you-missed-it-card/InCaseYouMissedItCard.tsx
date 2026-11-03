import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { Divider } from '../../atoms/divider';
import { Icon, type IconName } from '../../atoms/icon';
import { Tag, type TagTone } from '../../atoms/tag';

/**
 * InCaseYouMissedItCard — one Added Value that has been waiting: who raised it and when, its title, and what is
 * wrong with it — Overdue, Due Soon, Awaiting Review or Pending — with how long. Built to Figma's `_ICYM_Card`
 * (`4361:20247`, four types) on `_ICYM_Card_Base` (Default / Hover / Pressed).
 *
 * **It owns the type vocabulary**, once: each type is a tag (a tone and a glyph) and a message in the tone's own colour.
 *
 * | Type | Tag | Message |
 * |---|---|---|
 * | `overdue` | critical, `warning-fill` | "since 3 days ago" |
 * | `due-soon` | critical, `hourglass-low-fill` | "in 3 days" |
 * | `awaiting-review` | warning, `clock-user` | "since 3 days ago" |
 * | `pending` | warning, `clock` | "since 3 days ago" |
 *
 * You give it `days` and it writes the message, so no call site words it differently.
 *
 * - **The card opens the Added Value** (`onOpen`): the whole face is one button, with a hover lift
 *   (`shadow.elevation.2`) and a pressed fill. It sits in 8 of padding so that shadow is never clipped by a scroller.
 * - **Its accessible name is the title** (who and when, and the type and message, are its description), so a list of cards
 *   reads as a list of titles.
 * - **The ✕ dismisses it** (`onDismiss`): a tonal red disc in the top-right corner, a sibling of the face (never
 *   inside it — a button does not contain a button), shown on hover and on focus, always on touch. Whether a
 *   dismissed card stays away across a refresh is the caller's: the design says it must, "even after logging out
 *   and in".
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export type MissedItemType = 'overdue' | 'due-soon' | 'awaiting-review' | 'pending';

/** Every type, most urgent first — for legends, filters and tests. */
export const MISSED_ITEM_TYPES: readonly MissedItemType[] = ['overdue', 'due-soon', 'awaiting-review', 'pending'];

interface TypeStyle {
  label: string;
  icon: IconName;
  tone: TagTone;
  /** The message's own colour: the tone's, as the design draws it. */
  messageClassName: string;
  message: (days: number) => string;
}

const days = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`;

const TYPE: Record<MissedItemType, TypeStyle> = {
  overdue: {
    label: 'Overdue',
    icon: 'warning-fill',
    tone: 'critical',
    messageClassName: 'text-accent-critical-outline-content-default',
    message: (n) => `since ${days(n)} ago`,
  },
  'due-soon': {
    label: 'Due Soon',
    icon: 'hourglass-low-fill',
    tone: 'critical',
    messageClassName: 'text-accent-critical-outline-content-default',
    message: (n) => `in ${days(n)}`,
  },
  'awaiting-review': {
    label: 'Awaiting Review',
    icon: 'clock-user',
    tone: 'warning',
    messageClassName: 'text-accent-warning-tonal-content-default',
    message: (n) => `since ${days(n)} ago`,
  },
  pending: {
    label: 'Pending',
    icon: 'clock',
    tone: 'warning',
    messageClassName: 'text-accent-warning-tonal-content-default',
    message: (n) => `since ${days(n)} ago`,
  },
};

export interface InCaseYouMissedItCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  type: MissedItemType;
  /** The Added Value's title. Two lines at most, then cut with "…". */
  title: string;
  /** Who raised it. */
  user: { name: string; src?: string };
  /** When, already written — "6 months ago". This card does no relative time. */
  created: string;
  /** How many days overdue, waiting, or until it is due. Written into the message for the type. */
  days: number;
  /** The card was pressed — open the Added Value. */
  onOpen?: () => void;
  /** The ✕ was pressed. Omit it and there is no ✕. */
  onDismiss?: () => void;
  /** Names the ✕. Defaults to "Dismiss ${title}". */
  dismissLabel?: string;
}

export const InCaseYouMissedItCard = React.forwardRef<HTMLDivElement, InCaseYouMissedItCardProps>(
  ({ className, type, title, user, created, days: count, onOpen, onDismiss, dismissLabel, ...props }, ref) => {
    const t = TYPE[type];
    /* The face is named by its title, and described by who/when and the type/message, so a list of cards reads as a list of
       titles and the rest comes second. */
    const ids = React.useId();
    const titleId = `${ids}-title`;
    const metaId = `${ids}-meta`;
    const statusId = `${ids}-status`;
    return (
      <div
        ref={ref}
        /* 8 around the face, so the hover shadow is never clipped by a scrolling parent. */
        className={cn('group/card relative w-full min-w-0 p-2 font-sans', className)}
        {...props}
      >
        <button
          type="button"
          onClick={onOpen}
          aria-labelledby={titleId}
          aria-describedby={`${metaId} ${statusId}`}
          className={cn(
            'flex w-full flex-col gap-3 rounded-sm border border-stroke-default bg-surface-elevated p-4 text-left transition-shadow',
            'hover:shadow-elevation-2 active:bg-surface-neutral-faint active:shadow-none',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
          )}
        >
          {/* With a ✕ the time keeps clear of its corner: the disc reaches about 30 in from the face's right edge, and the face's own padding is 16. */}
          <span
            id={metaId}
            className={cn(
              'flex items-center justify-between gap-2 text-caption-md-regular text-text-tertiary',
              onDismiss && 'pr-6',
            )}
          >
            <span className="flex min-w-0 items-center gap-1">
              <Avatar name={user.name} src={user.src} size="xs" aria-hidden="true" />
              <span className="truncate">{user.name}</span>
            </span>
            <span className="shrink-0 whitespace-nowrap">{created}</span>
          </span>

          <span id={titleId} className="line-clamp-2 text-label-sm-semibold text-text-secondary">
            {title}
          </span>

          <span id={statusId} className="flex flex-col gap-3">
            <Divider />
            <span className="flex items-center gap-2">
              <Tag tone={t.tone} size="sm" icon={<Icon name={t.icon} size="sm" />}>
                {t.label}
              </Tag>
              <span className={cn('whitespace-nowrap text-caption-md-medium', t.messageClassName)}>
                {t.message(count)}
              </span>
            </span>
          </span>
        </button>

        {onDismiss && (
          /* The design's `_Tonal_Remove_Button`: 48 to press, a 24 disc to look at. Hand-built for now — the system's
             `RemoveButton` atom (tonal: a 20 disc, 40 to press, the same critical tokens) is in PR 212 and not on `main`
             yet; swap to it when it lands, so every ✕ in the system is one piece. */
          <button
            type="button"
            aria-label={dismissLabel ?? `Dismiss ${title}`}
            onClick={onDismiss}
            className={cn(
              'group/dismiss absolute top-1.5 right-1.5 grid size-12 place-items-center rounded-pill',
              'opacity-0 transition-opacity group-hover/card:opacity-100 group-focus-within/card:opacity-100 pointer-coarse:opacity-100',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
            )}
          >
            <span
              className={cn(
                'grid size-6 place-items-center rounded-pill bg-accent-critical-tonal-surface-default text-accent-critical-outline-content-default transition-colors',
                'group-hover/dismiss:bg-accent-critical-tonal-surface-hover group-active/dismiss:bg-accent-critical-tonal-surface-pressed',
              )}
            >
              <Icon name="x" size="sm" aria-hidden="true" />
            </span>
          </button>
        )}
      </div>
    );
  },
);
InCaseYouMissedItCard.displayName = 'InCaseYouMissedItCard';

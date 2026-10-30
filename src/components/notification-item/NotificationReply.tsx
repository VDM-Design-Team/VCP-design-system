import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { Button } from '../../atoms/button';
import { Icon, type IconName } from '../../atoms/icon';
import {
  MentionInput,
  MentionTag,
  mentionedIds,
  plainText,
  type MentionMember,
  type MentionSegment,
} from '../../atoms/mention-input';

/**
 * The reply parts of a notification: the small control under a comment ("Reply", "Show
 * Reply", "Edit", "Delete"), the composer a reply is written in, and the card a posted
 * reply is drawn as.
 *
 * **These belong to `NotificationItem` and are not exported.** They are drawn to the
 * notification popover's own design (`Notification_Popover_Comment_Reply`: a 24 avatar and
 * a bordered card), which differs from the comment section's thread (a 32 avatar, a thread
 * line). Calling them "Comment…" pieces would suggest the comments page can use them, and it
 * cannot without becoming something else. If the comments page is built and the two designs
 * converge, what they share can be pulled out then, under a name that fits both.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

/* ------------------------------------------------------------------ */
/* The control                                                         */
/* ------------------------------------------------------------------ */

export type ReplyControlKind = 'reply' | 'edit' | 'delete' | 'show' | 'hide';

/* Figma's `_Comment_Control_Icon`: ArrowUUpLeft, PencilSimple, Trash, CaretDown, CaretUp. */
const GLYPH: Record<ReplyControlKind, IconName> = {
  reply: 'arrow-u-up-left',
  edit: 'pencil-simple',
  delete: 'trash',
  show: 'caret-down',
  hide: 'caret-up',
};

interface ReplyControlProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  kind: ReplyControlKind;
  label: string;
}

/**
 * `_Comment_Control_Button`: 36 tall, `radius.md`, a 16 glyph and a 14 regular label 8
 * apart in `neutral.textual.content`, the link colour on hover (Figma's `text.brand.medium`
 * is 3.88:1 on a dark surface). No horizontal padding, as drawn. A real `<button>`.
 */
export const ReplyControl = React.forwardRef<HTMLButtonElement, ReplyControlProps>(
  function ReplyControl({ className, kind, label, type = 'button', ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex h-9 items-center gap-2 rounded-md font-sans text-body-sm-regular',
          'text-neutral-textual-content-default transition-colors',
          'hover:text-text-link-default',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
          className,
        )}
        {...props}
      >
        <Icon name={GLYPH[kind]} size="sm" />
        {label}
      </button>
    );
  },
);

/* ------------------------------------------------------------------ */
/* The posted reply                                                    */
/* ------------------------------------------------------------------ */

/** The words of a reply, each mention as the tag the field drew. */
function ReplyText({ value }: { value: readonly MentionSegment[] }) {
  return (
    <>
      {value.map((segment, i) =>
        segment.type === 'mention' ? (
          <MentionTag key={i} id={segment.id} label={segment.label} />
        ) : (
          <React.Fragment key={i}>{segment.text}</React.Fragment>
        ),
      )}
    </>
  );
}

interface ReplyCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  author: { name: string; src?: string };
  value: readonly MentionSegment[];
  /** Under the card: Edit and Delete. */
  actions?: React.ReactNode;
}

/**
 * `_Notification_Popover_Comment_Reply_Item` (`Replied`): a 24 avatar, then a
 * `surface.elevated` card with a `stroke.default` border, `radius.md`, 12 / 8 padding and
 * `body-sm-regular`, the actions 8 below. The avatar is decoration; the name is not in the
 * card, so put it in the surrounding text where it matters.
 */
export const ReplyCard = React.forwardRef<HTMLDivElement, ReplyCardProps>(function ReplyCard(
  { className, author, value, actions, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn('flex items-start gap-2 font-sans', className)} {...props}>
      <Avatar name={author.name} src={author.src} size="sm" className="shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="whitespace-pre-wrap break-words rounded-md border border-stroke-default bg-surface-elevated px-3 py-2 text-body-sm-regular text-text-primary">
          <ReplyText value={value} />
        </p>
        {actions && <div className="flex items-center gap-4">{actions}</div>}
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* The composer                                                        */
/* ------------------------------------------------------------------ */

interface ReplyComposerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit' | 'onChange' | 'defaultValue'> {
  user: { name: string; src?: string };
  members: readonly MentionMember[];
  /** The reply being edited. */
  defaultValue?: readonly MentionSegment[];
  /** "Reply", or "Save" when editing. */
  submitLabel: string;
  onSubmit: (value: MentionSegment[], mentionedIds: string[]) => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

/**
 * `Replying` and `Editing Reply`: a 24 avatar, the `MentionInput`, and a small primary and a
 * small outlined button 8 apart, 12 below it. The primary waits for text. Ctrl or Cmd + Enter
 * sends; Escape cancels, after closing an open member list.
 */
export const ReplyComposer = React.forwardRef<HTMLDivElement, ReplyComposerProps>(
  function ReplyComposer(
    { className, user, members, defaultValue, submitLabel, onSubmit, onCancel, autoFocus, ...props },
    ref,
  ) {
    const [value, setValue] = React.useState<MentionSegment[]>([...(defaultValue ?? [])]);
    const empty = plainText(value).trim() === '';
    const send = () => {
      if (!empty) onSubmit(value, mentionedIds(value));
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-start gap-2 font-sans', className)}
        {...props}
        /* Escape reaches here only when the member list did not take it. */
        onKeyDown={(event) => {
          props.onKeyDown?.(event);
          if (event.key === 'Escape' && !event.defaultPrevented) {
            event.stopPropagation();
            onCancel();
          }
        }}
      >
        <Avatar name={user.name} src={user.src} size="sm" className="shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <MentionInput
            aria-label="Write a reply"
            members={members}
            value={value}
            autoFocus={autoFocus}
            onChange={setValue}
            onSubmit={send}
          />
          <div className="flex items-center gap-2">
            <Button size="sm" disabled={empty} onClick={send}>
              {submitLabel}
            </Button>
            <Button size="sm" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

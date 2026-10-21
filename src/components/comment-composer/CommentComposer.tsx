import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { Button } from '../../atoms/button';
import {
  MentionInput,
  mentionedIds,
  plainText,
  type MentionMember,
  type MentionSegment,
} from '../mention-input';

/**
 * CommentComposer — where a comment or a reply is written: the writer's avatar, a
 * `MentionInput`, and the two buttons under it ("Reply" and "Cancel", or "Save" and
 * "Cancel" when editing).
 *
 * Read off Figma's `Notification_Popover_Comment_Reply` (`Replying` and `Editing Reply`)
 * and the comment section's `New_Comment`: a 24 avatar, then a column with the field and
 * the buttons 12 below it, the buttons a small primary and a small outlined one 8 apart.
 *
 * The primary button waits until there is something to send. Ctrl or Cmd + Enter sends;
 * Escape cancels (unless a member list is open, when it closes that first).
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface CommentComposerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit' | 'onChange' | 'defaultValue'> {
  /** Who is writing. The avatar is decoration. */
  user: { name: string; src?: string };
  /** Who can be mentioned. */
  members: readonly MentionMember[];
  /** Controlled content. Pair with `onChange`. */
  value?: readonly MentionSegment[];
  /** Starting content when uncontrolled — the reply being edited. */
  defaultValue?: readonly MentionSegment[];
  onChange?: (value: MentionSegment[]) => void;
  /** The primary button's word: "Reply", "Save". */
  submitLabel?: string;
  /** Sent. Receives the segments and the ids of everyone mentioned. */
  onSubmit: (value: MentionSegment[], mentionedIds: string[]) => void;
  onCancel: () => void;
  cancelLabel?: string;
  /** Names the field for assistive tech. */
  fieldLabel?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export const CommentComposer = React.forwardRef<HTMLDivElement, CommentComposerProps>(
  function CommentComposer(
    {
      className,
      user,
      members,
      value,
      defaultValue,
      onChange,
      submitLabel = 'Reply',
      onSubmit,
      onCancel,
      cancelLabel = 'Cancel',
      fieldLabel = 'Write a reply',
      placeholder,
      autoFocus,
      ...props
    },
    ref,
  ) {
    const [inner, setInner] = React.useState<MentionSegment[]>([...(defaultValue ?? [])]);
    const current = (value ?? inner) as MentionSegment[];
    const empty = plainText(current).trim() === '';

    const send = () => {
      if (empty) return;
      onSubmit(current, mentionedIds(current));
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
            aria-label={fieldLabel}
            members={members}
            value={value ?? inner}
            placeholder={placeholder}
            autoFocus={autoFocus}
            onChange={(next) => {
              setInner(next);
              onChange?.(next);
            }}
            onSubmit={send}
          />
          <div className="flex items-center gap-2">
            <Button size="sm" disabled={empty} onClick={send}>
              {submitLabel}
            </Button>
            <Button size="sm" variant="secondary" onClick={onCancel}>
              {cancelLabel}
            </Button>
          </div>
        </div>
      </div>
    );
  },
);
CommentComposer.displayName = 'CommentComposer';

import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { CommentFormActions } from '../comment-form-actions';
import {
  MentionInput,
  plainText,
  type MentionMember,
  type MentionSegment,
} from '../mention-input';

/**
 * CommentComposer — the box a comment is written in: an optional avatar, the mention
 * field, and the send button (with Cancel, when there is a way out) underneath.
 *
 * Read off the Figma `New_Comment`'s writing half (`Comment Section` in
 * `2877:6757`): the 32 initials avatar and, 16 across, a column of the box and its
 * button, 16 apart. The same piece is the **reply box** and the **edit box** under a
 * comment: those are this without the avatar and with a Cancel, so there is one box to
 * learn, not three.
 *
 * **The box is `MentionInput`, so `@` mentions work.** The value is its segments;
 * `mentionedIds(value)` is who to notify and `plainText(value)` the words. Ctrl or
 * Cmd + Enter sends, as the button does. The send button is dim while there is nothing to
 * send (a box with only a mention in it is not empty).
 *
 * **`onSubmit` may be async, and the box is honest about it.** Return a promise and the
 * button shows its spinner (and cannot be pressed twice) until it settles; the box clears
 * when it resolves and **keeps what was typed if it rejects**. Report the error in your own
 * handler; the box only promises not to lose the text. Return nothing and it clears
 * straight away. Control `value` yourself and none of this applies: what the box holds is
 * yours.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface CommentComposerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit' | 'onChange' | 'children' | 'defaultValue'> {
  /** Who is writing. Giving it draws their avatar beside the box; leave it off for a reply or edit box. */
  user?: { name: string; src?: string };
  /** Who can be mentioned. */
  members: readonly MentionMember[];
  /** Controlled content (segments). Pair with `onChange`. */
  value?: readonly MentionSegment[];
  /** Starting content when uncontrolled — an edit box starts with the comment. */
  defaultValue?: readonly MentionSegment[];
  onChange?: (value: MentionSegment[]) => void;
  /** Sends it: the button, or Ctrl or Cmd + Enter. Gets the segments. May return a promise. */
  onSubmit?: (value: MentionSegment[]) => void | Promise<void>;
  /** A send is in flight that you are tracking yourself. (A promise from `onSubmit` is tracked for you.) */
  loading?: boolean;
  /** The box's placeholder. Default "Type @ to mention and notify a member". */
  placeholder?: string;
  /** The box's accessible name. Default "Add a comment". */
  inputLabel?: string;
  /** Focus the box when it appears — what a reply or edit box wants. */
  autoFocus?: boolean;
  /** Which comment box it is: `comment` (default, "Add Comment", no Cancel), `reply` or `save` (each with a Cancel). The words are fixed. */
  variant?: 'comment' | 'reply' | 'save';
  /** Fires when Cancel is clicked. Give it for `reply` and `save`, which draw a Cancel. */
  onCancel?: () => void;
}

export const CommentComposer = React.forwardRef<HTMLDivElement, CommentComposerProps>(
  (
    {
      className,
      user,
      members,
      value,
      defaultValue,
      onChange,
      onSubmit,
      variant = 'comment',
      onCancel,
      loading,
      placeholder,
      inputLabel = 'Add a comment',
      autoFocus,
      ...props
    },
    ref,
  ) => {
    const [inner, setInner] = React.useState<readonly MentionSegment[]>(defaultValue ?? []);
    const [busy, setBusy] = React.useState(false);
    const controlled = value !== undefined;
    const current = controlled ? value : inner;
    const empty = plainText(current).trim() === '' && !current.some((s) => s.type === 'mention');

    /* A send that resolves after the box has gone (a reply box closes with its comment) must not set state. */
    const mounted = React.useRef(true);
    React.useEffect(() => {
      mounted.current = true;
      return () => {
        mounted.current = false;
      };
    }, []);

    const change = (next: MentionSegment[]) => {
      if (!controlled) setInner(next);
      onChange?.(next);
    };

    const submit = async () => {
      if (empty || loading || busy) return;
      const sent = [...current];
      try {
        const result = onSubmit?.(sent);
        if (result instanceof Promise) {
          setBusy(true);
          await result;
        }
        if (mounted.current && !controlled) setInner([]);
      } catch {
        /* Rejected: the text stays, and reporting the error is the caller's. */
      } finally {
        if (mounted.current) setBusy(false);
      }
    };

    return (
      <div ref={ref} className={cn('flex items-start gap-4 font-sans', className)} {...props}>
        {user && (
          /* The design's Profile_Initials: the neutral avatar with the everyday border and the tertiary text. */
          <Avatar
            size="md"
            name={user.name}
            src={user.src}
            className="border border-stroke-default text-text-tertiary"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <MentionInput
            aria-label={inputLabel}
            members={members}
            value={current}
            onChange={change}
            onSubmit={submit}
            placeholder={placeholder}
            autoFocus={autoFocus}
          />
          {variant === 'comment' ? (
            <CommentFormActions variant="comment" onSubmit={submit} disabled={empty} loading={loading || busy} />
          ) : (
            <CommentFormActions
              variant={variant}
              onSubmit={submit}
              disabled={empty}
              loading={loading || busy}
              onCancel={onCancel ?? (() => {})}
            />
          )}
        </div>
      </div>
    );
  },
);
CommentComposer.displayName = 'CommentComposer';

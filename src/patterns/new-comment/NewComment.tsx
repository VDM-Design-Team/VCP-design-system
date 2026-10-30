import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { CommentFormActions } from '../../components/comment-form-actions';
import { CommentSortChip, type CommentSort } from '../../components/comment-sort-chip';
import {
  MentionInput,
  plainText,
  type MentionMember,
  type MentionSegment,
} from '../../atoms/mention-input';

/**
 * NewComment — the top of a comment list: the "Comments" title with the sort
 * switch, and under it the box a person writes a new comment in, with their
 * avatar beside it and the Add Comment button below.
 *
 * Read off the Figma `New_Comment` (`2877:6757`): a 16-gap column of a 32 tall
 * title row (the title in 16 regular `text.tertiary`, the sort chip at the far
 * end) and a row of the 32 initials avatar and a 16-gap column of the box and
 * its button. It is a pattern — an avatar, the mention box, the form buttons
 * and the sort chip, composed into one section of a page.
 *
 * **The box is `MentionInput`, so `@` mentions work.** The value is its segments;
 * `mentionedIds(value)` is who to notify and `plainText(value)` the words.
 * Ctrl or Cmd + Enter sends, as the button does.
 *
 * **Add Comment is dim while the box is empty**, as the design's Reply is.
 * Figma draws it live at rest; a button that sends nothing is worse than a dim
 * one. `loading` is the send in flight.
 *
 * **It clears after a send unless you control the value.** Uncontrolled, the box
 * empties as `onSubmit` returns; controlled (`value`), what happens is yours, so
 * you can keep the text if the send fails.
 *
 * The title is a real heading (`h2`, or the level you pass) and the section is
 * named by it, so a screen reader can jump to the comments.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface NewCommentProps
  extends Omit<
      React.HTMLAttributes<HTMLElement>,
      'onSubmit' | 'onChange' | 'children' | 'title' | 'defaultValue'
    > {
  /** Who is writing. Drives the avatar's initials, or a photo with `src`. */
  user: { name: string; src?: string };
  /** Who can be mentioned. */
  members: readonly MentionMember[];
  /** The text above the box. Default "Comments". */
  title?: string;
  /** The heading level of the title: 2 (default), 3 or 4. */
  headingLevel?: 2 | 3 | 4;
  /** The current sort order. Giving this or `onSortChange` draws the sort chip. */
  sort?: CommentSort;
  /** Fires with the order the chip switches to. */
  onSortChange?: (sort: CommentSort) => void;
  /** Controlled content (segments). Pair with `onChange`. */
  value?: readonly MentionSegment[];
  /** Starting content when uncontrolled. */
  defaultValue?: readonly MentionSegment[];
  onChange?: (value: MentionSegment[]) => void;
  /** Sends the comment: the button, or Ctrl or Cmd + Enter. Gets the segments. */
  onSubmit?: (value: MentionSegment[]) => void;
  /** The send is in flight: the button shows its spinner and cannot be pressed twice. */
  loading?: boolean;
  /** The box's placeholder. Default "Type @ to mention and notify a member". */
  placeholder?: string;
  /** The box's accessible name. Default "Add a comment". */
  inputLabel?: string;
}

export const NewComment = React.forwardRef<HTMLElement, NewCommentProps>(
  (
    {
      className,
      user,
      members,
      title = 'Comments',
      headingLevel = 2,
      sort,
      onSortChange,
      value,
      defaultValue,
      onChange,
      onSubmit,
      loading,
      placeholder,
      inputLabel = 'Add a comment',
      ...props
    },
    ref,
  ) => {
    const headingId = React.useId();
    const [inner, setInner] = React.useState<readonly MentionSegment[]>(defaultValue ?? []);
    const controlled = value !== undefined;
    const current = controlled ? value : inner;
    const empty = plainText(current).trim() === '' && !current.some((s) => s.type === 'mention');

    const change = (next: MentionSegment[]) => {
      if (!controlled) setInner(next);
      onChange?.(next);
    };

    const submit = () => {
      if (empty || loading) return;
      onSubmit?.([...current]);
      if (!controlled) setInner([]);
    };

    const Heading = `h${headingLevel}` as const;

    return (
      <section
        ref={ref}
        aria-labelledby={headingId}
        className={cn('flex flex-col gap-4 font-sans', className)}
        {...props}
      >
        <div className="flex min-h-8 items-center justify-between gap-2">
          <Heading id={headingId} className="m-0 text-body-md-regular text-text-tertiary">
            {title}
          </Heading>
          {(sort !== undefined || onSortChange) && (
            <CommentSortChip sort={sort} onSortChange={onSortChange} />
          )}
        </div>
        <div className="flex items-start gap-4">
          {/* The design's Profile_Initials: the neutral avatar with the everyday border and the
              tertiary text, which the plain avatar does not wear. */}
          <Avatar
            size="md"
            name={user.name}
            src={user.src}
            className="border border-stroke-default text-text-tertiary"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <MentionInput
              aria-label={inputLabel}
              members={members}
              value={current}
              onChange={change}
              onSubmit={submit}
              placeholder={placeholder}
            />
            <CommentFormActions
              variant="comment"
              onSubmit={submit}
              disabled={empty}
              loading={loading}
            />
          </div>
        </div>
      </section>
    );
  },
);
NewComment.displayName = 'NewComment';

import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';

/**
 * CommentFormActions — the buttons under a comment box: the one that sends it
 * ("Add Comment", "Reply", "Save") and, when there is a way out, "Cancel".
 *
 * Read off the Figma `_Comment_Controls` (Save, Reply Enabled, Reply Disabled)
 * and `_Comment_Button` (Add Comment, with its loading state). Both are the
 * system's own small `Button`: a primary one with 36 height, 12 side padding and
 * `radius.sm`, and a `secondary` Cancel beside it, 8 apart. So this is not a
 * new look; it is the one arrangement three screens need — writing a new
 * comment (no Cancel), replying, and editing — kept in one place so they
 * cannot drift.
 *
 * **Cancel is `secondary`, not the text-only Cancel the Figma frames draw.**
 * Beside a primary button the system's Cancel is the outlined `secondary`
 * (`HandoffAVModal`, `RejectPendingAVModal`, `ReviewAVModal`); `tertiary` is for
 * dense toolbars, icon-only actions and table rows, or the third step of a
 * three-button ladder. Two outlined buttons need more than the frame's 4 between
 * them, so the gap is 8, as the system's spacing scale gives.
 *
 * `disabled` is the design's "Reply Disabled": the send button dims while the
 * box is empty, and Cancel stays usable. `loading` is the design's loading
 * state; it shows the system spinner, not the design's arrows glyph, so every
 * button that waits looks the same.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface CommentFormActionsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onSubmit'> {
  /** The send button's words: "Add Comment", "Reply" or "Save". */
  submitLabel?: string;
  /** Sends it. */
  onSubmit?: () => void;
  /** Dims the send button — the box is empty, or nothing changed. Cancel stays usable. */
  disabled?: boolean;
  /** The send is in flight: a spinner, and no second click. */
  loading?: boolean;
  /** Draws Cancel and fires when it is clicked. Leave it off for a new comment, which has nothing to cancel. */
  onCancel?: () => void;
  /** Cancel's words. Default "Cancel". */
  cancelLabel?: string;
}

export const CommentFormActions = React.forwardRef<HTMLDivElement, CommentFormActionsProps>(
  (
    {
      className,
      submitLabel = 'Add Comment',
      onSubmit,
      disabled,
      loading,
      onCancel,
      cancelLabel = 'Cancel',
      ...props
    },
    ref,
  ) => (
    <div ref={ref} className={cn('flex items-center gap-2', className)} {...props}>
      <Button size="sm" disabled={disabled} loading={loading} onClick={onSubmit}>
        {submitLabel}
      </Button>
      {onCancel && (
        <Button size="sm" variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
      )}
    </div>
  ),
);
CommentFormActions.displayName = 'CommentFormActions';

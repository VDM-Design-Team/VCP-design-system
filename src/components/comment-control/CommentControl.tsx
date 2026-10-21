import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon, type IconName } from '../../atoms/icon';

/**
 * CommentControl — the small text button under a comment: an icon and a word, such as
 * "Reply", "Edit", "Delete", "Show Reply", "Hide Reply".
 *
 * Read off Figma's `_Comment_Control_Button` (Default and Hover): 36 tall, `radius.md`,
 * a 16 glyph and a 14 regular label 8 apart, `neutral.textual.content` and the brand
 * colour on hover. The glyph for each action is Figma's `_Comment_Control_Icon`
 * (`ArrowUUpLeft` for reply, `PencilSimple` for edit, `Trash` for delete, `CaretDown` and
 * `CaretUp` for show and hide); `kind` picks it, so no call site names a glyph.
 *
 * It is a real `<button>`. Where it expands something (Show Reply / Hide Reply) pass
 * `aria-expanded`, and `aria-controls` for what it opens.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type CommentControlKind = 'reply' | 'edit' | 'delete' | 'show' | 'hide';

const GLYPH: Record<CommentControlKind, IconName> = {
  reply: 'arrow-u-up-left',
  edit: 'pencil-simple',
  delete: 'trash',
  show: 'caret-down',
  hide: 'caret-up',
};

export interface CommentControlProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Which action: picks the glyph. */
  kind: CommentControlKind;
  /** The word: "Reply", "Show Reply", "Show 3 Replies". */
  label: string;
}

export const CommentControl = React.forwardRef<HTMLButtonElement, CommentControlProps>(
  function CommentControl({ className, kind, label, type = 'button', ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex h-9 items-center gap-2 rounded-md font-sans text-body-sm-regular',
          'text-neutral-textual-content-default transition-colors',
          'hover:text-text-link-default',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
          'disabled:cursor-not-allowed disabled:text-text-disabled',
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
CommentControl.displayName = 'CommentControl';

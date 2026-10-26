import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';

/**
 * UserLabel — a person, named in place: their avatar, their name and, under it,
 * their role ("John", "Assignee"). For a table cell, a card header, a line in a
 * list. When the person is something to press or remove, it is a `Chip`; when
 * it is only the avatar, it is an `Avatar`.
 *
 * Built to Figma's `Profile_Image_Name_Label` (`6185:80437`), whose two sizes
 * are `size="md"` (Figma's Default: a 32 avatar, the name in `body-sm-medium`,
 * the role in `caption-md-medium`) and `size="sm"` (Figma's S: a 24 avatar and
 * one step down in type). The role is pulled up directly under the name so the two
 * sit close (6 up on `md`, 4 on `sm`; the type's own line heights would leave a gap),
 * and is `text.tertiary` against the name's `text.primary`.
 *
 * The visible name carries the person, so the avatar beside it is decoration
 * (`aria-hidden`, as `Avatar` does when its name is already on screen). The
 * name and role truncate with "…" when the label is squeezed.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type UserLabelSize = 'md' | 'sm';

export interface UserLabelProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** What the label says: "John", or "Francis M.". */
  name: string;
  /** The line under the name — "Assignee", "Initiator", "Admin". Left out, the label is just avatar and name. */
  role?: string;
  /** The full name, when `name` is short: it drives the avatar's initials ("John Doe" → "JD"). Defaults to `name`. */
  fullName?: string;
  /** A photo. Without one the avatar shows initials. */
  src?: string;
  /** 32 avatar and body type (`md`, default), or 24 avatar and caption type (`sm`). */
  size?: UserLabelSize;
}

export const UserLabel = React.forwardRef<HTMLSpanElement, UserLabelProps>(function UserLabel(
  { className, name, role, fullName, src, size = 'md', ...props },
  ref,
) {
  const small = size === 'sm';
  return (
    <span
      ref={ref}
      className={cn('inline-flex max-w-full min-w-0 items-center font-sans', small ? 'gap-1' : 'gap-2', className)}
      {...props}
    >
      <Avatar name={fullName ?? name} src={src} size={small ? 'sm' : 'md'} />
      <span className="flex min-w-0 flex-col">
        <span
          className={cn(
            'truncate text-text-primary',
            small ? 'text-caption-md-medium' : 'text-body-sm-medium',
          )}
        >
          {name}
        </span>
        {role && (
          <span
            className={cn(
              /* Pulled up under the name so the two sit close, as the Assignee chip's do. */
              'truncate text-text-tertiary',
              small ? '-mt-1 text-caption-sm-medium' : '-mt-1.5 text-caption-md-medium',
            )}
          >
            {role}
          </span>
        )}
      </span>
    </span>
  );
});
UserLabel.displayName = 'UserLabel';

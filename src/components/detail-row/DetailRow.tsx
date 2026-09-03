import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon, type IconName } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';

/**
 * DetailRow — one label/value line in a details panel: a fixed 132 label
 * column, the value taking the rest, an optional edit affordance on the right.
 * Stack them and the labels align into a scannable column.
 *
 * The export reached for `Icon` and `IconButton` through a global registry
 * hack; here they are ordinary imports. The edit affordance is the system's
 * own `IconButton` (`tertiary`, `sm` — the table-row exemption from the 40
 * target applies, this is a pointer-dense surface), swapping pencil for check
 * while `editing`. The button's name is `Edit ${label}` — which is why `label`
 * is a `string`, not a node: the row's identity has to be speakable.
 *
 * This renders a `<div>` row, not `<dt>/<dd>` — a details panel mixes rows
 * with editors and dividers, where a definition list's strict content model
 * fights the markup. The label/value relationship is carried visually and by
 * the edit button's accessible name.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface DetailRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The field name. A string — it also names the edit button. */
  label: string;
  /** The value. Text, a Badge, an AvatarGroup, an editor while `editing`. */
  children?: React.ReactNode;
  /** Glyph before the label. Decorative — the label is right there. */
  icon?: IconName;
  /** Renders the edit affordance. Fires for both pencil and confirm-tick. */
  onEdit?: () => void;
  /** Swaps the pencil for a check and the name to `Confirm ${label}`. */
  editing?: boolean;
  /** `top` for multi-line values — the label stays with the first line. */
  align?: 'center' | 'top';
}

export const DetailRow = React.forwardRef<HTMLDivElement, DetailRowProps>(
  ({ className, label, children, icon, onEdit, editing, align = 'center', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex min-h-8 gap-3',
        align === 'top' ? 'items-start' : 'items-center',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          /* w-33 = the export's 132 label column, on the spacing scale. */
          'flex w-33 shrink-0 items-center gap-1.5 font-sans text-label-md text-text-tertiary',
          /* Optically level with the value's first line when top-aligned. */
          align === 'top' && 'pt-1',
        )}
      >
        {icon && <Icon name={icon} size="sm" className="shrink-0 text-text-subtle" />}
        <span className="min-w-0 truncate">{label}</span>
      </span>
      <div className="min-w-0 flex-1 font-sans text-body-md text-text-primary">{children}</div>
      {onEdit && (
        <IconButton
          variant="tertiary"
          size="sm"
          icon={editing ? 'check' : 'pencil-simple'}
          label={`${editing ? 'Confirm' : 'Edit'} ${label}`}
          onClick={onEdit}
          className={cn('shrink-0', align === 'top' && '-mt-1')}
        />
      )}
    </div>
  ),
);
DetailRow.displayName = 'DetailRow';

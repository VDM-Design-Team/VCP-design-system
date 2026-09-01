import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { Avatar, type AvatarProps } from '../avatar';

/** A person in the stack. A bare string is shorthand for `{ name }`. */
export type AvatarGroupPerson = Pick<AvatarProps, 'name' | 'initials' | 'src' | 'tone'>;
export type AvatarGroupEntry = string | AvatarGroupPerson;

/**
 * AvatarGroup — an overlapping stack of people, with the tail collapsed into a
 * `+N` chip.
 *
 * It composes `Avatar`, and per CLAUDE.md that keeps it a component, not a
 * pattern: nothing here knows a thing about VCP.
 *
 * Sizes are `Avatar`'s own three steps and are passed straight down, so the
 * stack and a lone avatar next to it are never a pixel apart. The overlap is a
 * quarter of the avatar, expressed on Tailwind's numeric scale.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const overlap = cva('', {
  variants: {
    size: { sm: '-ml-1.5', md: '-ml-2', lg: '-ml-2.5' },
  },
  defaultVariants: { size: 'md' },
});

/**
 * The `+N` chip. Neutral on purpose — it is a count, not a person, so it must
 * not look like one more tone in the hash.
 */
const overflow = cva(
  [
    'inline-grid shrink-0 place-items-center overflow-hidden rounded-pill',
    'select-none font-sans',
    'bg-surface-neutral-subtle text-text-secondary',
    'ring-2 ring-surface-elevated',
  ],
  {
    variants: {
      size: { sm: 'size-6 text-label-sm', md: 'size-8 text-label-md', lg: 'size-10 text-label-lg' },
    },
    defaultVariants: { size: 'md' },
  },
);

export interface AvatarGroupProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof overlap> {
  /** The people, in the order they should read. Strings are treated as names. */
  people: readonly AvatarGroupEntry[];
  /** How many avatars to draw before collapsing the rest into `+N`. */
  max?: number;
  /**
   * What the stack *is* — `"Assignees"`, `"Reviewers"`, `"Attending"`. Prefixed
   * to the announced summary, so it reads "Assignees: Ali Rahman, Eve Chen and
   * 3 others". Without it the summary is just the names.
   */
  label?: string;
}

/** "Ali Rahman, Eve Chen and 3 others" — the stack, in words. */
function summarise(names: readonly string[], others: number): string {
  const parts = [...names];
  if (others > 0) parts.push(others === 1 ? '1 other' : `${others} others`);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

const toPerson = (entry: AvatarGroupEntry): AvatarGroupPerson =>
  typeof entry === 'string' ? { name: entry } : entry;

export const AvatarGroup = React.forwardRef<HTMLSpanElement, AvatarGroupProps>(
  ({ className, people, max = 4, size, label, ...props }, ref) => {
    const shown = people.slice(0, Math.max(0, max)).map(toPerson);
    const collapsed = people.length - shown.length;

    /* Someone with neither a name nor initials cannot be announced by name, so
       they are counted among the "others" rather than silently dropped. */
    const named = shown
      .map((person) => person.name?.trim() || person.initials?.trim() || '')
      .filter((value) => value.length > 0);
    const others = collapsed + (shown.length - named.length);

    const summary = summarise(named, others);
    const announced = (label ? [label, summary].filter(Boolean).join(': ') : summary) || undefined;

    if (shown.length === 0 && collapsed <= 0) return null;

    return (
      /*
       * One labelled image, not a list.
       *
       * A stack of avatars is a glanceable summary of who is involved — a
       * sighted user takes the whole thing in at once and does not step through
       * it. `role="list"` would turn that one glance into N stops, and the
       * avatars are not interactive, so there is nothing at those stops to do.
       * So the group is a single `role="img"` whose `aria-label` says exactly
       * what is drawn: the people who are shown, then the count of those who are
       * not. Everything inside is presentational under that role — including the
       * `+N` chip, whose meaning is already in the label as "and 3 others".
       *
       * If the individual people need to be reachable — links to profiles, a
       * remove button each — this component is the wrong shape. Render a real
       * list of controls with visible names.
       */
      <span
        ref={ref}
        className={cn('inline-flex items-center', className)}
        role={announced ? 'img' : undefined}
        aria-label={announced}
        aria-hidden={announced ? undefined : true}
        {...props}
      >
        {shown.map((person, index) => (
          <span
            key={`${index}-${person.name ?? person.initials ?? ''}`}
            className={cn('inline-flex', index > 0 && overlap({ size }))}
          >
            <Avatar {...person} size={size} ring />
          </span>
        ))}
        {collapsed > 0 && (
          <span aria-hidden="true" className={cn(overflow({ size }), overlap({ size }))}>
            +{collapsed}
          </span>
        )}
      </span>
    );
  },
);
AvatarGroup.displayName = 'AvatarGroup';

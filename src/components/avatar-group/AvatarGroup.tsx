import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { Avatar, type AvatarProps } from '../../atoms/avatar';
import { Tooltip } from '../../atoms/tooltip';

/** A person in the stack. A bare string is shorthand for `{ name }`. */
export type AvatarGroupPerson = Pick<AvatarProps, 'name' | 'initials' | 'src' | 'tone'> & {
  /** What they are to this stack ("Assignee", "Reviewer"). Shown after the name in the hover tooltip and read after the name in the stack's announcement. */
  role?: string;
};
export type AvatarGroupEntry = string | AvatarGroupPerson;

/**
 * AvatarGroup — an overlapping stack of people, with the tail collapsed into a
 * `+N` chip.
 *
 * It composes `Avatar`, and per CLAUDE.md that keeps it a component, not a
 * pattern: nothing here knows a thing about VCP.
 *
 * Sizes are `Avatar`'s own four steps and are passed straight down, so the
 * stack and a lone avatar next to it are never a pixel apart. The overlap is a
 * quarter of the avatar, expressed on Tailwind's numeric scale.
 *
 * **The leftmost person is on top**, with each one after it tucked behind the
 * one before (design review, 5 Oct 2026) — the `+N` chip is furthest back. The
 * paint order is the opposite of the DOM order, so it is set with `z-index`
 * rather than by reversing the markup, which would also reverse the reading
 * order.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const overlap = cva('', {
  variants: {
    size: { xs: '-ml-1', sm: '-ml-1.5', md: '-ml-2', lg: '-ml-2.25' },
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
      size: {
        xs: 'size-4 text-caption-sm-medium',
        sm: 'size-6 text-caption-md-medium',
        md: 'size-8 text-caption-md-medium',
        lg: 'size-9 text-label-sm-medium',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export interface AvatarGroupProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof overlap> {
  /** The people, in the order they should read. Strings are treated as names. */
  people: readonly AvatarGroupEntry[];
  /** How many avatars to draw before collapsing the rest into `+N`. The chip only appears for two or more people: if one would be left out, they are drawn instead of a `+1`. */
  max?: number;
  /**
   * What the stack *is* — `"Assignees"`, `"Reviewers"`, `"Attending"`. Prefixed
   * to the announced summary, so it reads "Assignees: Ali Rahman, Eve Chen and
   * 3 others". Without it the summary is just the names.
   */
  label?: string;
  /**
   * Say who each avatar is on hover: a tooltip with the person's name (and `role`, when given), and one on the `+N` chip listing the people it hides. **For the pointer only**: the stack stays
   * one labelled image with no extra tab stops, and a keyboard or screen-reader user gets the same names (and roles) from its label.
   */
  tooltips?: boolean;
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

/** "Ali Rahman (Assignee)", or just the name. */
const withRole = (name: string, role?: string) => (role?.trim() ? `${name} (${role.trim()})` : name);
const nameOf = (person: AvatarGroupPerson) => person.name?.trim() || person.initials?.trim() || '';

export const AvatarGroup = React.forwardRef<HTMLSpanElement, AvatarGroupProps>(
  ({ className, people, max = 4, size, label, tooltips, ...props }, ref) => {
    /* A `+1` chip hides one person it could have shown in the same space, so the chip only appears for two or more: when `max` would leave exactly one out, that person is drawn too. */
    const limit = Math.max(0, max);
    const shown = people.slice(0, people.length - limit === 1 ? people.length : limit).map(toPerson);
    const collapsed = people.length - shown.length;

    /* Someone with neither a name nor initials cannot be announced by name, so
       they are counted among the "others" rather than silently dropped. */
    const named = shown.filter((person) => nameOf(person)).map((person) => withRole(nameOf(person), person.role));
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
        className={cn('isolate inline-flex items-center', className)}
        role={announced ? 'img' : undefined}
        aria-label={announced}
        aria-hidden={announced ? undefined : true}
        {...props}
      >
        {shown.map((person, index) => {
          const { role: _role, ...avatar } = person;
          const slot = (
            <span
              key={`${index}-${person.name ?? person.initials ?? ''}`}
              className={cn('relative inline-flex', index > 0 && overlap({ size }))}
              /* Leftmost highest: the first person is on top of everyone after them. */
              style={{ zIndex: shown.length - index }}
            >
              <Avatar {...avatar} size={size} ring />
            </span>
          );
          const text = nameOf(person);
          /* For the pointer only: the wrapper is not focusable, so the stack stays one stop. `describe={false}`: the stack's label already says it. */
          return tooltips && text ? (
            <Tooltip
              key={`${index}-${person.name ?? person.initials ?? ''}`}
              describe={false}
              content={withRole(text, person.role)}
              className={cn(index > 0 && overlap({ size }))}
              style={{ zIndex: shown.length - index }}
            >
              <span className="inline-flex">
                <Avatar {...avatar} size={size} ring />
              </span>
            </Tooltip>
          ) : (
            slot
          );
        })}
        {collapsed > 0 &&
          (() => {
            const chip = (
              <span aria-hidden="true" className={cn('relative', overflow({ size }), !tooltips && overlap({ size }))} style={tooltips ? undefined : { zIndex: 0 }}>
                +{collapsed}
              </span>
            );
            const hidden = people.slice(shown.length).map(toPerson).filter((person) => nameOf(person));
            return tooltips && hidden.length > 0 ? (
              /* Furthest back — behind the last person shown. */
              <Tooltip
                describe={false}
                /* A run of names, with commas: "Priya Nair (Designer), Sofia Almeida". */
                content={hidden.map((person) => withRole(nameOf(person), person.role)).join(', ')}
                className={overlap({ size })}
                style={{ zIndex: 0 }}
              >
                {chip}
              </Tooltip>
            ) : (
              chip
            );
          })()}
      </span>
    );
  },
);
AvatarGroup.displayName = 'AvatarGroup';

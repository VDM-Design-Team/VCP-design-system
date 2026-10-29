import * as React from 'react';
import { Icon } from '../../atoms/icon';
import { Tooltip, type TooltipProps } from '../tooltip';

/**
 * GanttTooltip — the card a Gantt bar shows on hover or focus: the work item's
 * title with a link glyph, then a few label/value lines under it
 * ("Status: AB Testing", "Initiator: User 1", "Est. Due Date: 05/04/2025").
 *
 * Figma draws it as the generic Tooltip with a filled content slot, so that is
 * what this is: `Tooltip` carries all the behaviour (hover and focus open,
 * `aria-describedby`, Escape, a pointer bridge) and this only supplies the
 * content. Nothing in the card is interactive, which is why the link glyph is
 * decoration: it tells a sighted user the bar opens the item, and the bar
 * itself — the trigger — is the link.
 *
 * It opens under the pointer rather than at the middle of the bar (`followPointer`),
 * since a bar can be far wider than the card and run off the screen.
 *
 * The title truncates rather than wrapping, as Figma's does, so every card is
 * the same width; the lines are a description list, label bold and value
 * regular.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface GanttTooltipDetail {
  /** The field name, without the colon — "Status". */
  label: string;
  /** Its value — "AB Testing". */
  value: React.ReactNode;
}

export interface GanttTooltipProps extends Omit<TooltipProps, 'content'> {
  /** The work item's name. Truncated to one line; the full text is the trigger's name. */
  title: string;
  /** The label/value lines under the title, in order. */
  details: GanttTooltipDetail[];
}

export const GanttTooltip = React.forwardRef<HTMLSpanElement, GanttTooltipProps>(
  ({ title, details, children, ...props }, ref) => (
    <Tooltip
      ref={ref}
      content={
        /* w-56 + the bubble's 12 side padding = the 248 card Figma draws. */
        <span className="flex w-56 flex-col gap-1 text-left">
          <span className="flex items-center gap-2.5">
            <span className="min-w-0 flex-1 truncate font-sans text-caption-md-bold text-text-primary">
              {title}
            </span>
            {/* Decorative: the bar is the link, this just says so. */}
            <Icon name="link-simple-horizontal" size={16} className="shrink-0 text-text-brand-medium" />
          </span>
          <dl className="m-0 font-sans text-caption-sm-regular text-text-primary">
            {details.map(({ label, value }) => (
              <div key={label}>
                <dt className="inline text-caption-sm-semibold">{label}:</dt>{' '}
                <dd className="m-0 inline">{value}</dd>
              </div>
            ))}
          </dl>
        </span>
      }
      /* A bar can be far wider than the card: open it under the cursor, on screen. */
      followPointer
      {...props}
    >
      {children}
    </Tooltip>
  ),
);
GanttTooltip.displayName = 'GanttTooltip';

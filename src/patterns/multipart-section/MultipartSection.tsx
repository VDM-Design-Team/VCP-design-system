import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { ProgressBar } from '../../atoms/progress-bar';
import { Tooltip } from '../../atoms/tooltip';
import { MultipartRow, type MultipartRowProps } from '../../components/multipart-row';

/**
 * MultipartSection — the card on an Added Value's page that lists its parts: a **Multipart** heading (with an info hint), "33% (1/3 parts
 * completed)", a progress bar, and one `MultipartRow` per part. Built to Figma's `Multipart_Section`; in editing, **Add Part** sits under
 * the rows (the full-width outlined button in Figma's edit page).
 *
 * - **The progress is the parts'**: a part is done when its `completed` is true, or when its `status` is `Completed`. The summary and the
 *   bar are worked out here from `parts`, so they can never disagree with the rows.
 * - **It scrolls sideways when it is squeezed**, as Figma's "Small Screen Width": the rows keep a floor width and the list gets a scrollbar,
 *   and is a focusable region (arrow keys scroll) only while it actually overflows.
 * - **`hint`** is the info glyph's words. Figma draws the glyph but not its text, so without `hint` there is no glyph.
 * - **It does nothing itself.** `onOpenPart` and `onAddPart` only ask: opening the part, and asking for the new part's title
 *   (`ChildPartModal`), are the page's.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface MultipartPart
  extends Pick<
    MultipartRowProps,
    'title' | 'assignee' | 'capacityPoints' | 'dueDate' | 'dueProximity' | 'status' | 'customStatus' | 'completed'
  > {
  id: string | number;
}

export interface MultipartSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** The parts, in order: the first is part 1. */
  parts: readonly MultipartPart[];
  /** What the info glyph says. */
  hint?: string;
  /** A part's title was pressed. Opening it is the page's. */
  onOpenPart?: (part: MultipartPart) => void;
  /** **Add Part** was pressed (editing only: leave it out to hide the button). Asking for the title is the page's. */
  onAddPart?: () => void;
}

export function MultipartSection({ className, parts, hint, onOpenPart, onAddPart, ...props }: MultipartSectionProps) {
  const total = parts.length;
  const done = parts.filter((part) => part.completed ?? part.status === 'Completed').length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const summary = `${percent}% (${done}/${total} parts completed)`;
  const headingId = React.useId();

  /* The list scrolls sideways when the rows cannot fit; it is a focusable region only then (an unfocusable scroller fails axe). */
  const scroller = React.useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = React.useState(false);
  React.useEffect(() => {
    const el = scroller.current;
    if (!el) return undefined;
    const measure = () => setOverflowing(el.scrollWidth > el.clientWidth + 1);
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [total]);

  return (
    <section
      aria-labelledby={headingId}
      className={cn('flex flex-col gap-2 rounded-md bg-surface-elevated p-4 font-sans', className)}
      {...props}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <h2 id={headingId} className="m-0 text-body-md-semibold text-text-primary">
            Multipart
          </h2>
          {hint && (
            <Tooltip content={hint}>
              <button
                type="button"
                aria-label="About Multipart"
                className={cn(
                  'grid size-5 shrink-0 place-items-center rounded-sm text-text-tertiary',
                  'hover:text-text-secondary',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
                )}
              >
                <Icon name="info" size="md" />
              </button>
            </Tooltip>
          )}
        </div>
        <span className="text-body-sm-regular text-text-tertiary">{summary}</span>
      </div>
      <ProgressBar value={percent} aria-label={`Multipart progress: ${summary}`} />
      <div
        ref={scroller}
        className="overflow-x-auto pb-2"
        tabIndex={overflowing ? 0 : undefined}
        role={overflowing ? 'region' : undefined}
        aria-label={overflowing ? 'Parts, scrolls sideways' : undefined}
      >
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {parts.map((part, index) => (
            <li key={part.id} className="list-none">
              <MultipartRow
                number={index + 1}
                title={part.title}
                assignee={part.assignee}
                capacityPoints={part.capacityPoints}
                dueDate={part.dueDate}
                dueProximity={part.dueProximity}
                status={part.status}
                customStatus={part.customStatus}
                completed={part.completed}
                onOpen={onOpenPart ? () => onOpenPart(part) : undefined}
              />
            </li>
          ))}
        </ul>
      </div>
      {onAddPart && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          fullWidth
          iconLeft={<Icon name="plus" size="sm" />}
          onClick={onAddPart}
        >
          Add Part
        </Button>
      )}
    </section>
  );
}
MultipartSection.displayName = 'MultipartSection';

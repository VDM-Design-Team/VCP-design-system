import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { ProgressBar } from '../../atoms/progress-bar';
import { InfoHint } from '../../components/info-hint';
import { MultipartRow, MultipartRowGroup, isPartCompleted, type MultipartRowProps } from '../../components/multipart-row';

/**
 * MultipartSection — the card on an Added Value's page that lists its parts: a **Multipart** heading (with an info hint), "33% (1/3 parts
 * completed)", a progress bar, and one `MultipartRow` per part. Built to Figma's `Multipart_Section`; in editing, **Add Part** sits under
 * the rows (the full-width outlined button in Figma's edit page).
 *
 * - **The progress is the parts'**: a part is done when its `completed` is true, or when its `status` is `Completed`. The summary and the
 *   bar are worked out here from `parts`, so they can never disagree with the rows.
 * - **The rows share one grid** (`MultipartRowGroup`), so their points, dates and status tags line up in columns, and the status column is only
 *   as wide as the widest tag. **Under 48rem wide the rows stack** instead (number and title on top, the rest beneath).
 * - **`hint`** is the info glyph's words. Figma draws the glyph but not its text, so without `hint` there is no glyph.
 * - **It does nothing itself.** `onOpenPart`, `onEditPartTitle` and `onAddPart` only ask: opening the part, and asking for a part's title
 *   (`ChildPartModal`, to add one or to rename one), are the page's.
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
  /** A part's edit button (shown when its row is hovered or focused) was pressed. Asking for the new title (`ChildPartModal`, `edit`) is the page's. */
  onEditPartTitle?: (part: MultipartPart) => void;
  /** **Add Part** was pressed (editing only: leave it out to hide the button). Asking for the title is the page's. */
  onAddPart?: () => void;
}

export function MultipartSection({ className, parts, hint, onOpenPart, onEditPartTitle, onAddPart, ...props }: MultipartSectionProps) {
  const total = parts.length;
  const done = parts.filter(isPartCompleted).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const summary = `${percent}% (${done}/${total} parts completed)`;
  const headingId = React.useId();

  return (
    <section
      aria-labelledby={headingId}
      className={cn('flex flex-col gap-4 rounded-md bg-surface-elevated p-4 font-sans', className)}
      {...props}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <h2 id={headingId} className="m-0 text-title-sm-semibold text-text-primary">
              Multipart
            </h2>
            {hint && <InfoHint label="Multipart" content={hint} />}
          </div>
          <span className="text-label-sm-medium text-text-tertiary">{summary}</span>
        </div>
        <ProgressBar value={percent} aria-label="Multipart progress" />
      </div>
      <div className="flex flex-col gap-3">
        <MultipartRowGroup>
          {parts.map((part, index) => (
            <MultipartRow
              key={part.id}
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
              onEditTitle={onEditPartTitle ? () => onEditPartTitle(part) : undefined}
            />
          ))}
        </MultipartRowGroup>
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
      </div>
    </section>
  );
}
MultipartSection.displayName = 'MultipartSection';

import * as React from 'react';
import { cn } from '../../lib/cn';
import { IconButton } from '../../atoms/icon-button';
import type { DescriptionCardProps, DescriptionCardType } from '../description-card';

/**
 * DescriptionSection — one block of an Added Value's description: a title with an optional
 * round add button after it, the numbered `DescriptionCard`s under it, and the files attached to
 * it with a paperclip to attach more. Read off the Figma `Description_Card_Content`, in its edit
 * and view variants.
 *
 * **There are four sections, and `type` picks one.** `problem`, `solution`, `deliverable`,
 * `desired-outcome`: the type fixes the title ("Problems", "Solutions", "Acceptance Criteria /
 * Deliverables", "Desired outcome"), the colour of the cards inside it, and which controls it can
 * have. A section is not a free-form container, so the title is not a prop. The cards need no
 * `type` or `position` of their own: the section gives each its type and its number, and a
 * default "Remove problem 2" name, unless the card sets its own. Desired outcome is one card with
 * no add button and no attachments.
 *
 * **It always folds.** A caret button at the right of the header (down when folded, up when
 * open) hides the cards and the files, which are hidden, not unmounted, so what was typed is
 * still there when it opens again. Only that button is the toggle; the title is plain text.
 * Controlled with `open` and `onOpenChange`, or uncontrolled with `defaultOpen`.
 *
 * **It is the frame, not the content.** The cards are `children` (the caller owns the list, and
 * each card says whether it is being read or edited) and the files are `attachments`. What the
 * section decides is the layout and which controls exist: the add button only when `onAdd` is
 * given and the paperclip only when `onAttach` is, so the same section reads as a view (no
 * controls, the cards in their reading look) or as an editor, by what the page passes.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
/* THE mapping — section type → title, the noun in the controls' names, and which controls exist.
   Desired outcome is one card: nothing to add, and no files. */
const SECTION: Record<
  DescriptionCardType,
  { title: string; noun: string; addable: boolean; attachable: boolean }
> = {
  problem: { title: 'Problems', noun: 'problem', addable: true, attachable: true },
  solution: { title: 'Solutions', noun: 'solution', addable: true, attachable: true },
  deliverable: {
    title: 'Acceptance Criteria / Deliverables',
    noun: 'deliverable',
    addable: true,
    attachable: true,
  },
  'desired-outcome': { title: 'Desired outcome', noun: 'desired outcome', addable: false, attachable: false },
};

export interface DescriptionSectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Which section this is. Fixes the title, the cards' colour and which controls it can have. */
  type: DescriptionCardType;
  /** The heading level to draw the title as. Default `h2`: a section sits directly under the page's own `h1`. */
  headingLevel?: 'h2' | 'h3' | 'h4';
  /** Controlled: whether the cards and files are showing. */
  open?: boolean;
  /** Uncontrolled: whether it starts open. Default `true`. */
  defaultOpen?: boolean;
  /** Fires with the next state when the header is pressed. */
  onOpenChange?: (open: boolean) => void;
  /** Renders the round add button after the title, and fires when it is pressed. Not on desired outcome. */
  onAdd?: () => void;
  /** The add button's accessible name. Default "Add problem", "Add solution". */
  addLabel?: string;
  /** Renders the paperclip under the cards, and fires when it is pressed. Not on desired outcome. */
  onAttach?: () => void;
  /** The paperclip's accessible name. Default "Attach files". */
  attachLabel?: string;
  /** The files attached, as `FileAttachment`s. They sit to the left of the paperclip. */
  attachments?: React.ReactNode;
  /** The cards: `DescriptionCard`s, in order, with no `type` or `position`. Each is drawn as a list item. */
  children?: React.ReactNode;
}

export const DescriptionSection = React.forwardRef<HTMLElement, DescriptionSectionProps>(
  (
    {
      className,
      type,
      headingLevel: Heading = 'h2',
      open: openProp,
      defaultOpen = true,
      onOpenChange,
      onAdd,
      addLabel,
      onAttach,
      attachLabel = 'Attach files',
      attachments,
      children,
      ...props
    },
    ref,
  ) => {
    const headingId = React.useId();
    const bodyId = React.useId();
    const [innerOpen, setInnerOpen] = React.useState(defaultOpen);
    const open = openProp ?? innerOpen;
    /* While it opens or folds the body clips its content; once settled it does not, so the cards'
       focus rings are not cut off. Cleared after the transition (a little over its length). */
    const [animating, setAnimating] = React.useState(false);
    const firstRender = React.useRef(true);
    React.useEffect(() => {
      if (firstRender.current) {
        firstRender.current = false;
        return;
      }
      setAnimating(true);
      const timer = window.setTimeout(() => setAnimating(false), 250);
      return () => window.clearTimeout(timer);
    }, [open]);
    const toggle = () => {
      if (openProp === undefined) setInnerOpen(!open);
      onOpenChange?.(!open);
    };
    const { title, noun, addable, attachable } = SECTION[type];
    const canAdd = addable && Boolean(onAdd);
    const canAttach = attachable && Boolean(onAttach);
    /* Each card gets the section's type and its place in the list, and a name for its remove
       button, unless it says otherwise. */
    const cards = React.Children.toArray(children).map((card, i) =>
      React.isValidElement<DescriptionCardProps>(card)
        ? React.cloneElement(card, {
            type: card.props.type ?? type,
            position: card.props.position ?? i + 1,
            removeLabel: card.props.removeLabel ?? `Remove ${noun} ${card.props.position ?? i + 1}`,
          })
        : card,
    );
    const hasAttachRow = canAttach || (attachable && React.Children.count(attachments) > 0);

    return (
      <section
        ref={ref}
        aria-labelledby={headingId}
        className={cn('flex flex-col rounded-md bg-surface-elevated p-6 font-sans', className)}
        {...props}
      >
        <div className="flex items-center gap-2">
          <Heading id={headingId} className="text-title-sm-bold text-text-primary">
            {title}
          </Heading>
          {canAdd && (
            <IconButton
              icon="plus"
              variant="primary"
              size="xs"
              label={addLabel ?? `Add ${noun}`}
              onClick={onAdd}
              /* 24 to look at, 40 to press: the target reaches 8 past the circle on every side. */
              className="relative before:absolute before:-inset-2"
            />
          )}
          {/* The fold button: its name says what pressing it does, and which section. */}
          <IconButton
            icon={open ? 'caret-up' : 'caret-down'}
            variant="tertiary"
            size="md"
            label={`${open ? 'Collapse' : 'Expand'} ${title}`}
            aria-controls={bodyId}
            onClick={toggle}
            className="ml-auto -my-2 -mr-2 text-text-secondary"
          />
        </div>

        {/* The body slides: its row grows from nothing to its content (and back) over 200, and is
            inert and unseen while folded, so a keyboard and a screen reader skip it. */}
        <div
          id={bodyId}
          inert={!open}
          className={cn(
            'grid transition-[grid-template-rows,visibility] duration-200 ease-out motion-reduce:transition-none',
            open ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]',
          )}
        >
          <div className={cn('min-h-0', (!open || animating) && 'overflow-hidden')}>
            {/* Folding: the content dissolves quickly and lifts a little while the row closes, so it
                is not seen being squeezed. Opening is as it was (no fade), the row alone. */}
            <div
              className={cn(
                'flex flex-col gap-4 pt-4',
                open
                  ? 'translate-y-0 opacity-100'
                  : '-translate-y-2 opacity-0 transition-[opacity,translate] duration-100 ease-in motion-reduce:transition-none',
              )}
            >
              {cards.length > 0 && (
                <ol className="flex flex-col gap-4">
                  {cards.map((card, i) => (
                    <li key={React.isValidElement(card) && card.key != null ? card.key : i}>{card}</li>
                  ))}
                </ol>
              )}

              {hasAttachRow && (
                <div className="flex items-center justify-end gap-2">
                  {attachable && attachments && <div className="flex min-w-0 flex-wrap justify-end gap-2.5">{attachments}</div>}
                  {canAttach && (
                    <IconButton
                      icon="paperclip"
                      variant="tertiary"
                      size="md"
                      label={attachLabel}
                      onClick={onAttach}
                      /* The glyph in the neutral outline palette, through its states. */
                      className="text-neutral-outline-content-default hover:text-neutral-outline-content-hover active:text-neutral-outline-content-pressed"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  },
);
DescriptionSection.displayName = 'DescriptionSection';

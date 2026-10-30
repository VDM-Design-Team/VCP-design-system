import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';

/**
 * DescriptionSection — one block of an Added Value's description: a title ("Problems",
 * "Solutions", "Desired Outcome") with an optional round add button after it, the numbered
 * `DescriptionCard`s under it, and the files attached to it with a paperclip to attach more.
 * Read off the Figma `Description_Card_Content`, in its edit and view variants.
 *
 * **It can fold.** With `collapsible` the title becomes a disclosure: the whole header is one
 * button with a caret at the right (down when folded, up when open), and the body (the cards and
 * the files) is hidden, not unmounted, so what was typed is still there when it opens again.
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
export interface DescriptionSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** The section's name: "Problems", "Solutions". */
  title: string;
  /** The heading level to draw the title as. Default `h2`: a section sits directly under the page's own `h1`. */
  headingLevel?: 'h2' | 'h3' | 'h4';
  /** Makes the header a disclosure that folds the cards and files away. */
  collapsible?: boolean;
  /** Controlled: whether the body is showing. Only with `collapsible`. */
  open?: boolean;
  /** Uncontrolled: whether it starts open. Default `true`. */
  defaultOpen?: boolean;
  /** Fires with the next state when the header is pressed. */
  onOpenChange?: (open: boolean) => void;
  /** Renders the round add button after the title, and fires when it is pressed. */
  onAdd?: () => void;
  /** The add button's accessible name. Default "Add" plus the title: "Add Problems". */
  addLabel?: string;
  /** Renders the paperclip under the cards, and fires when it is pressed. */
  onAttach?: () => void;
  /** The paperclip's accessible name. Default "Attach files". */
  attachLabel?: string;
  /** The files attached, as `FileAttachment`s. They sit to the left of the paperclip. */
  attachments?: React.ReactNode;
  /** The cards: `DescriptionCard`s, in order. Each is drawn as a list item. */
  children?: React.ReactNode;
}

export const DescriptionSection = React.forwardRef<HTMLElement, DescriptionSectionProps>(
  (
    {
      className,
      title,
      headingLevel: Heading = 'h2',
      collapsible,
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
    const open = !collapsible || (openProp ?? innerOpen);
    const toggle = () => {
      if (openProp === undefined) setInnerOpen(!open);
      onOpenChange?.(!open);
    };
    const cards = React.Children.toArray(children);
    const hasAttachRow = Boolean(onAttach) || React.Children.count(attachments) > 0;

    return (
      <section
        ref={ref}
        aria-labelledby={headingId}
        className={cn('flex flex-col gap-4 rounded-md bg-surface-elevated p-6 font-sans', className)}
        {...props}
      >
        {/* The header. With `collapsible` the whole row is the toggle, through a stretched
            target on the title's button, so the add button can sit in the row above it
            without being nested in the button. */}
        <div className="relative flex items-center gap-2">
          <Heading id={headingId} className="text-title-sm-bold text-text-primary">
            {collapsible ? (
              <button
                type="button"
                aria-expanded={open}
                aria-controls={bodyId}
                onClick={toggle}
                className={cn(
                  'text-left outline-none after:absolute after:inset-0 after:rounded-sm',
                  'focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-stroke-focused',
                )}
              >
                {title}
              </button>
            ) : (
              title
            )}
          </Heading>
          {onAdd && (
            <IconButton
              icon="plus"
              variant="primary"
              size="xs"
              label={addLabel ?? `Add ${title}`}
              onClick={onAdd}
              /* 24 to look at, 40 to press: the target reaches 8 past the circle on every side. */
              className="relative z-10 before:absolute before:-inset-2"
            />
          )}
          {collapsible && (
            <Icon
              name={open ? 'caret-up' : 'caret-down'}
              size="md"
              aria-hidden="true"
              className="ml-auto shrink-0 text-text-secondary"
            />
          )}
        </div>

        <div id={bodyId} hidden={!open} className="flex flex-col gap-4">
          {cards.length > 0 && (
            <ol className="flex flex-col gap-4">
              {cards.map((card, i) => (
                <li key={React.isValidElement(card) && card.key != null ? card.key : i}>{card}</li>
              ))}
            </ol>
          )}

          {hasAttachRow && (
            <div className="flex items-center justify-end gap-2">
              {attachments && <div className="flex min-w-0 flex-wrap justify-end gap-2.5">{attachments}</div>}
              {onAttach && (
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
      </section>
    );
  },
);
DescriptionSection.displayName = 'DescriptionSection';

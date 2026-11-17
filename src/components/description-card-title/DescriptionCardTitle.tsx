import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { Input } from '../../atoms/input';
import { Field } from '../field';

/**
 * DescriptionCardTitle — the card at the top of an Added Value page that names
 * it: to read, the AV's reference over its title ("VCP-1234" / "Collapsible
 * sidebar for improved tables"); to edit, the **Title** field.
 *
 * Read off Figma's `Description_Card_Title` and its `_Description_Card_Title_Base`
 * (`State`: Viewing / Editing Placeholder / Editing Filled / Disabled, plus the
 * `Multipart Child` switch): an elevated card, 16 in, 8 radius; the reference 16
 * regular, the title 16 semibold `text.primary`. **The reference is `text.secondary`**, not Figma's
 * `text.primary`, so the title stands out (decided 17 November 2026; a recorded difference from Figma).
 *
 * **It is a component, not an atom, because it holds a `Field` with an `Input`.**
 * It was an atom that only read, and the AV page built its own editing title
 * beside it; the two are now one piece, so the page and the stories show the same
 * card in every state.
 *
 * **The AV page has two headers, and this is the second.** `AVHeader` is the ID
 * row — back arrow, the reference as the page's `<h1>`, the status buttons. This
 * card carries the *title*, so it is the page's first sub-heading: an `<h2>` by
 * default. The reference here is plain text, not a second heading.
 *
 * A long title wraps; it is never cut, because it is the one place the whole
 * title is shown.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface DescriptionCardTitleParent {
  /** The parent's reference, "VCP-4321". */
  ref: string;
  /** Where the parent is. Given, the reference is a link that opens it in a new tab. */
  href?: string;
  /** The reference was pressed. Given without `href`, it is a button. */
  onOpen?: () => void;
}

export interface DescriptionCardTitleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'onChange'> {
  /** The AV's reference, "VCP-1234". Shown above the title when reading. */
  reference?: string;
  /** The AV's title: the text to read, or the field's value. */
  title: string;
  /** The title's heading level when reading. `2` under the page's `<h1>` (`AVHeader`); `3` if it sits deeper. */
  headingLevel?: 2 | 3;
  /** Edit the title: the card is the **Title** field instead of the text. */
  editing?: boolean;
  /** Editing: the title changed. With `editing` and no `onChange`, the field is read-only. */
  onChange?: (title: string) => void;
  /** Editing: the field's label. Default "Title". */
  label?: string;
  /** Editing: the empty field's prompt. Default "Type in the title". */
  placeholder?: string;
  /** Editing: what is wrong with the title (a required field left empty). */
  error?: string;
  /** Editing: the title cannot be changed (Figma's Disabled state): the field is greyed and takes no focus. */
  disabled?: boolean;
  /** Reading, a part of a multipart set: "Multipart Child of VCP-4321" at the card's right edge, in secondary text, the parent's code underlined (Figma `_Child_Multipart_Title_Tag`). */
  parent?: DescriptionCardTitleParent;
}

export const DescriptionCardTitle = React.forwardRef<HTMLDivElement, DescriptionCardTitleProps>(
  (
    {
      className,
      reference,
      title,
      headingLevel = 2,
      editing = false,
      onChange,
      label = 'Title',
      placeholder = 'Type in the title',
      error,
      disabled,
      parent,
      ...props
    },
    ref,
  ) => {
    const Heading = headingLevel === 3 ? 'h3' : 'h2';
    /* A link with an address, a real button with only `onOpen` (an `<a>` without `href` takes no Tab and has no role), plain text with neither.
       No ↗ after it, as Figma draws it (decided 17 November 2026), unlike the table's Parent chip; a screen reader is still told it opens a new tab. */
    const parentClass =
      'rounded-sm text-text-link-default underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused';
    const parentLink = parent?.href ? (
      <a href={parent.href} target="_blank" rel="noreferrer" onClick={parent.onOpen} className={parentClass}>
        {parent.ref}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    ) : parent?.onOpen ? (
      <button type="button" onClick={parent.onOpen} className={parentClass}>
        {parent.ref}
      </button>
    ) : (
      parent && <span>{parent.ref}</span>
    );

    return (
      <div ref={ref} className={cn('flex flex-col rounded-md bg-surface-elevated p-4 font-sans text-text-primary', className)} {...props}>
        {editing ? (
          <Field label={label} error={error}>
            <Input
              fullWidth
              value={title}
              placeholder={placeholder}
              disabled={disabled}
              readOnly={!onChange}
              onChange={(event) => onChange?.(event.target.value)}
            />
          </Field>
        ) : (
          <>
            {(reference || parent) && (
              <div className="flex flex-wrap items-center justify-between gap-x-4">
                {reference && <p className="text-title-sm-regular text-text-secondary">{reference}</p>}
                {parent && (
                  <span className="ml-auto inline-flex items-center gap-1 text-title-sm-regular text-text-secondary">
                    <Icon name="arrows-split" size={20} aria-hidden="true" />
                    <span>Multipart Child of</span>
                    {parentLink}
                  </span>
                )}
              </div>
            )}
            <Heading className="text-body-md-semibold break-words">{title}</Heading>
          </>
        )}
      </div>
    );
  },
);
DescriptionCardTitle.displayName = 'DescriptionCardTitle';

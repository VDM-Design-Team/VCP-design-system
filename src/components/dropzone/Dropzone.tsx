import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';

/**
 * Dropzone — the file target: click to browse, or drag files onto it. Hands
 * the caller `File[]` and nothing more; upload state, previews, and lists are
 * the caller's (or `FileAttachment`'s, to port).
 *
 * The export hid the `<input type="file">` with `display:none`, which removes
 * it from the tab order — a drop target only pointers could reach. Here the
 * input is visually hidden but real (`sr-only`): Tab reaches it, Enter/Space
 * open the browse dialog, and the zone paints the shared `focus-within` ring.
 * Drag-and-drop is the pointer bonus on top, never the only way in.
 *
 * Built to Figma's `_Attachment_Drop_Container` (design review, 5 Oct 2026): a
 * 2 dashed `stroke.default` border over `surface.neutral.faint`, 24 padding,
 * 8 between a 48 paperclip and two lines — "Upload a file or drag and drop" in
 * 14 regular (the link in link blue, the rest `text.primary`), then the accepted
 * types in `text.tertiary`, `caption-md-regular`. Three states:
 *
 * - **Regular** — as above.
 * - **Drag-over** — `stroke.focused` over `surface.brand.subtle`. A file dragged
 *   over the zone *or the 16 around it* counts, so the target is generous: while
 *   a file is being dragged anywhere on the page, a hit area 16 wider than the
 *   zone on every side takes the drop. (Only while dragging — at rest it would
 *   swallow clicks meant for whatever sits beside the zone.)
 * - **Error** — the same fill, with a `accent.critical.outline.border` stroke.
 *
 * The dash length is the browser's: a 2 dashed border draws roughly 4 dashes in
 * Chromium, which is what Figma's 4 dash pattern asks for. CSS cannot set it
 * exactly without an SVG border.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface DropzoneProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'size'> {
  /** The selection, from browse or drop. Dropped files are not filtered by `accept`. */
  onFiles?: (files: File[]) => void;
  /** The linked verb in "Upload a file or drag and drop". */
  label?: string;
  /** Accepted-types line under the label. */
  hint?: string;
  /**
   * The rejection, in words — "That file is 24 MB; the limit is 10 MB". The
   * design's Error state (Figma `_Attachment_Drop_Container`): critical
   * border and message, replacing `hint`. The zone stays usable so the user
   * can immediately try another file.
   */
  error?: React.ReactNode;
  /** Forwarded to the input; also the browse dialog's filter. */
  accept?: string;
  multiple?: boolean;
  /** Merged onto the zone, not the hidden input. */
  className?: string;
}

export const Dropzone = React.forwardRef<HTMLInputElement, DropzoneProps>(
  (
    {
      className,
      onFiles,
      label = 'Upload a file',
      hint = 'PNG, JPG, GIF, DOCX, CSV and PDF file up to 10MB',
      error,
      multiple = true,
      disabled,
      ...props
    },
    ref,
  ) => {
    const messageId = React.useId();
    const [over, setOver] = React.useState(false);
    /* A file is being dragged somewhere on the page — arms the wider hit area. */
    const [dragging, setDragging] = React.useState(false);

    React.useEffect(() => {
      if (disabled) return undefined;
      const carriesFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes('Files');
      const start = (e: DragEvent) => {
        if (carriesFiles(e)) setDragging(true);
      };
      const stop = () => {
        setDragging(false);
        setOver(false);
      };
      /* Leaving the window altogether has no `relatedTarget`. */
      const leave = (e: DragEvent) => {
        if (e.relatedTarget === null) stop();
      };
      window.addEventListener('dragenter', start);
      window.addEventListener('dragend', stop);
      window.addEventListener('drop', stop);
      window.addEventListener('dragleave', leave);
      return () => {
        window.removeEventListener('dragenter', start);
        window.removeEventListener('dragend', stop);
        window.removeEventListener('drop', stop);
        window.removeEventListener('dragleave', leave);
      };
    }, [disabled]);

    const take = (list: FileList | null) => {
      const files = Array.from(list ?? []);
      if (files.length) onFiles?.(files);
    };

    return (
      <label
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={(e) => {
          /* Moving between the zone's own children also fires this. */
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
        }}
        onDrop={(e) => {
          if (disabled) return;
          e.preventDefault();
          setOver(false);
          take(e.dataTransfer.files);
        }}
        className={cn(
          'relative flex flex-col items-center gap-2 rounded-md border-2 border-dashed p-6 text-center transition-colors',
          'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stroke-focused',
          /* The drop's vicinity: a hit area 16 wider on every side, live only
             while a file is being dragged (see the note above). */
          'before:pointer-events-none before:absolute before:-inset-4',
          dragging && !disabled && 'before:pointer-events-auto',
          over
            ? 'border-stroke-focused bg-surface-brand-subtle'
            : error
              ? 'border-accent-critical-outline-border-default bg-surface-neutral-faint'
              : 'border-stroke-default bg-surface-neutral-faint',
          disabled
            ? 'cursor-not-allowed border-stroke-subtle bg-surface-neutral-subtle'
            : cn('cursor-pointer', !over && !error && 'hover:border-stroke-focused'),
          className,
        )}
      >
        {/* Real and focusable, just not visible — the keyboard path in. */}
        <input
          ref={ref}
          type="file"
          className="sr-only"
          multiple={multiple}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          onChange={(e) => {
            take(e.target.files);
            /* Same file twice in a row still fires. */
            e.target.value = '';
          }}
          {...props}
        />
        <Icon
          name="paperclip"
          aria-hidden="true"
          className={cn(
            'size-12 shrink-0',
            disabled
              ? 'text-text-disabled'
              : error
                ? 'text-accent-critical-tonal-content-default'
                : 'text-text-tertiary',
          )}
        />
        <span
          className={cn(
            'font-sans text-body-sm-regular',
            disabled ? 'text-text-disabled' : 'text-text-primary',
          )}
        >
          {/* The link: the system's link style (blue, underlined, no underline
              on hover). The whole zone opens the browse dialog; this is what
              says so. While a file is dragged over, the fill is
              `surface.brand.subtle`, where link blue is 3.4:1 in light and 4.16:1
              in dark — under the 4.5:1 text needs, and its hover and pressed
              shades are no better in dark — so the link takes the line's own
              colour there and keeps its underline. */}
          <span
            className={cn(
              !disabled &&
                'underline underline-offset-4 hover:no-underline ' +
                  (over
                    ? 'text-text-primary'
                    : 'text-text-link-default hover:text-text-link-hover'),
            )}
          >
            {label}
          </span>{' '}
          or drag and drop
        </span>
        {(error || hint) && (
          <span
            id={messageId}
            className={cn(
              'font-sans text-caption-md-regular',
              error
                ? 'text-accent-critical-tonal-content-default'
                : disabled
                  ? 'text-text-disabled'
                  : 'text-text-tertiary',
            )}
          >
            {error ?? hint}
          </span>
        )}
      </label>
    );
  },
);
Dropzone.displayName = 'Dropzone';

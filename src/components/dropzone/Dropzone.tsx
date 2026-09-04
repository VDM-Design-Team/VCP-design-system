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
 * The dashed border is `stroke.field` — the form-control resting border, the
 * same one Input wears, because that is what this is; the export's
 * `stroke.default` measured 2.56:1 against the 3:1 a control's boundary
 * needs. Drag-over swaps to the focused stroke over `surface.brand.base`.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface DropzoneProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'size'> {
  /** The selection, from browse or drop. Dropped files are not filtered by `accept`. */
  onFiles?: (files: File[]) => void;
  /** The linked verb in "Choose files or drag and drop". */
  label?: string;
  /** Accepted-types line under the label — "PDF or PNG, up to 10 MB". */
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
    { className, onFiles, label = 'Choose files', hint, error, multiple = true, disabled, ...props },
    ref,
  ) => {
    const messageId = React.useId();
    const [over, setOver] = React.useState(false);

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
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          if (disabled) return;
          e.preventDefault();
          setOver(false);
          take(e.dataTransfer.files);
        }}
        className={cn(
          'flex flex-col items-center gap-1 rounded-md border border-dashed px-6 py-6 text-center transition-colors',
          'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stroke-focused',
          over
            ? 'border-stroke-focused bg-surface-brand-base'
            : error
              ? 'border-accent-critical-outline-border-default bg-accent-critical-tonal-surface-default'
              : 'border-stroke-field bg-surface-elevated',
          disabled
            ? 'cursor-not-allowed border-stroke-subtle bg-surface-neutral-subtle'
            : 'cursor-pointer hover:border-stroke-focused',
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
          name={error ? 'warning-circle' : 'cloud-arrow-up'}
          size="lg"
          aria-hidden="true"
          className={cn(
            'mb-1',
            disabled
              ? 'text-text-disabled'
              : error
                ? 'text-accent-critical-tonal-content-default'
                : 'text-text-tertiary',
          )}
        />
        <span
          className={cn(
            'font-sans text-body-sm',
            disabled ? 'text-text-disabled' : 'text-text-secondary',
          )}
        >
          <span className={cn('text-label-md', !disabled && 'text-text-link-default')}>
            {label}
          </span>{' '}
          or drag and drop
        </span>
        {(error || hint) && (
          <span
            id={messageId}
            className={cn(
              'font-sans text-label-sm',
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

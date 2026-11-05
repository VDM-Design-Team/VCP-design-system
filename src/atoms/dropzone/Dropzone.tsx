import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../icon';

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
 * 1 dashed edge over `surface.neutral.faint`, 24 padding — in `stroke.strong`, not the
 * design's `stroke.default`, a deliberate exception (see docs/dropzone.md) —
 * 8 between a 32 paperclip in `text.subtle` and two lines — "Upload a file or drag and drop" in
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
 * The edge is an SVG rectangle, not a CSS border: a CSS dashed border cannot set its dash, and a 1
 * stroke's come out too short to read as a dash. The dashes are 6 long with 4 between. The stroke is 1
 * (it was 2), to sit beside the 1 borders of the fields and cards around a drop area.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
/** The types the default hint names — PNG, JPG, GIF, DOCX, CSV and PDF — as an `accept` string. */
export const DEFAULT_ACCEPT = '.png,.jpg,.jpeg,.gif,.docx,.csv,.pdf';
/** The size the default hint names: 10MB, in bytes. */
export const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;

/** Why a file was turned away. */
export interface DropzoneRejection {
  file: File;
  reason: 'type' | 'size';
  /** In words, as the zone shows it. */
  message: string;
}

/** Does `file` match an `accept` string (`.png`, `application/pdf`, an `image` family; `*` takes anything)? */
export const acceptsFile = (file: File, accept: string): boolean => {
  const tokens = accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0 || tokens.includes('*') || tokens.includes('*/*')) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some((token) =>
    token.startsWith('.') ? name.endsWith(token) : token.endsWith('/*') ? type.startsWith(token.slice(0, -1)) : type === token,
  );
};

const megabytes = (bytes: number) => `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;

export interface DropzoneProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'size'> {
  /** The files that were taken, from browse or drop. **Both are checked** against `accept` and `maxSize`; the ones that fail go to `onReject` instead. */
  onFiles?: (files: File[]) => void;
  /** The files that were turned away, each with its reason. The zone also says so itself (its error state) until the next selection. */
  onReject?: (rejections: DropzoneRejection[]) => void;
  /** The largest file, in bytes. Defaults to 10MB, as the default `hint` says. */
  maxSize?: number;
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
  /** The types taken: the browse dialog's filter **and the check on every file**, dropped ones too. Defaults to PNG, JPG, GIF, DOCX, CSV and PDF; `*` takes anything. */
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
      onReject,
      accept = DEFAULT_ACCEPT,
      maxSize = DEFAULT_MAX_SIZE,
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
    const labelId = React.useId();
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

    /* What the zone itself says about the last selection's refusals; the caller's `error` wins. */
    const [refused, setRefused] = React.useState<string | null>(null);

    const take = (list: FileList | null) => {
      const files = Array.from(list ?? []);
      if (!files.length) return;
      const taken: File[] = [];
      const rejections: DropzoneRejection[] = [];
      for (const file of files) {
        if (!acceptsFile(file, accept)) {
          rejections.push({ file, reason: 'type', message: `${file.name} is not a file type we take (${hint}).` });
        } else if (file.size > maxSize) {
          rejections.push({ file, reason: 'size', message: `${file.name} is ${megabytes(file.size)}; the limit is ${megabytes(maxSize)}.` });
        } else taken.push(file);
      }
      setRefused(
        rejections.length === 0 ? null : rejections.length === 1 ? rejections[0].message : `${rejections.length} files were not added. ${rejections[0].message}`,
      );
      if (rejections.length) onReject?.(rejections);
      if (taken.length) onFiles?.(taken);
    };
    const shownError = error ?? refused;

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
          'group/zone relative flex flex-col items-center gap-2 rounded-md p-6 text-center transition-colors',
          'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stroke-focused',
          /* The drop's vicinity: a hit area 16 wider on every side, live only
             while a file is being dragged (see the note above). */
          'before:pointer-events-none before:absolute before:-inset-4',
          dragging && !disabled && 'before:pointer-events-auto',
          over ? 'bg-surface-brand-subtle' : 'bg-surface-neutral-faint',
          disabled ? 'cursor-not-allowed bg-surface-neutral-subtle' : 'cursor-pointer',
          className,
        )}
      >
        {/* The dashed edge, drawn: a CSS dashed border cannot set its dash, and a 1 stroke's are too short.
            6 long, 4 apart, on a rectangle with `radius.md`'s corners. It takes the state's colour from the
            zone's text colour (`stroke="currentColor"`), so the state classes below are the only place the
            colour is chosen. It straddles the zone's edge, half a pixel either side. */}
        <svg
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 size-full overflow-visible transition-colors',
            disabled
              ? 'text-stroke-subtle'
              : over
                ? 'text-stroke-focused'
                : shownError
                  ? 'text-accent-critical-outline-border-default'
                  : 'text-stroke-strong group-hover/zone:text-stroke-focused',
          )}
        >
          <rect
            width="100%"
            height="100%"
            rx="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="6 4"
          />
        </svg>
        {/* Real and focusable, just not visible — the keyboard path in. */}
        <input
          ref={ref}
          type="file"
          className="sr-only"
          multiple={multiple}
          accept={accept}
          disabled={disabled}
          aria-invalid={shownError ? true : undefined}
          /* The zone's <label> wraps the hint or error too, so without this they are in the name *and*
             the description, and heard twice. Named by its call to action, the hint is said once. A
             caller's own aria-label or aria-labelledby still wins. */
          aria-labelledby={props['aria-label'] ? undefined : labelId}
          aria-describedby={shownError || hint ? messageId : undefined}
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
            'size-8 shrink-0',
            /* `text.subtle` in every state but disabled (design review): the
               error and drag-over states are told by the stroke and fill. */
            disabled ? 'text-text-disabled' : 'text-text-subtle',
          )}
        />
        <span
          id={labelId}
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
        {(shownError || hint) && (
          <span
            id={messageId}
            className={cn(
              'font-sans text-caption-md-regular',
              shownError
                ? 'text-accent-critical-outline-content-default'
                : disabled
                  ? 'text-text-disabled'
                  : 'text-text-tertiary',
            )}
          >
            {shownError ?? hint}
          </span>
        )}
      </label>
    );
  },
);
Dropzone.displayName = 'Dropzone';

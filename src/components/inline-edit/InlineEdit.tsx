import * as React from 'react';
import { cn } from '../../lib/cn';
import { IconButton } from '../../atoms/icon-button';

/**
 * InlineEdit — a value you can change in place: read it, press the pen, change
 * it with whatever control fits (a text field, a select, a date), then confirm
 * or cancel. It is the cell-sized version of an edit page, for the one field
 * you want to fix without leaving the table.
 *
 * **It owns the frame, not the control.** `children` is what is shown; `editor`
 * is the control shown while editing — an `Input`, a `Select`, a `DatePicker`
 * in a popover. InlineEdit adds the pen, the confirm and cancel buttons, the
 * keys and the focus handling around it, so every editable cell behaves the
 * same however different its control is. It never holds the draft: the caller
 * does, because only the caller knows what "valid" and "saved" mean.
 *
 * **States.** Reading: the value, with a pen that appears on hover or focus
 * (it is always in the tab order, so a keyboard user never has to find it by
 * hovering). Editing: the control, a confirm (check) and a cancel (x).
 *
 * **Keys.** Enter confirms (from a single-line field — not from a `textarea`
 * or a button, where it already means something); Escape cancels. Focus moves
 * into the control on entering and returns to the pen on leaving, so a
 * keyboard user is never dropped at the top of the page.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface InlineEditProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  /** The value as it reads. */
  children: React.ReactNode;
  /** The control shown while editing. Owned by the caller, with its draft. */
  editor: React.ReactNode;
  /** What is being edited — "points", "due date". Names the pen: "Edit points". */
  label: string;
  /** Controlled. Omit to let the component hold it. */
  editing?: boolean;
  defaultEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  /** Confirm pressed (or Enter). The component closes after this returns, unless `editing` is controlled. */
  onConfirm?: () => void;
  /** Cancel pressed (or Escape). */
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  /** No pen, no editing — the value just reads. */
  disabled?: boolean;
}

export const InlineEdit = React.forwardRef<HTMLDivElement, InlineEditProps>(
  (
    {
      className,
      children,
      editor,
      label,
      editing,
      defaultEditing = false,
      onEditingChange,
      onConfirm,
      onCancel,
      confirmLabel = 'Save',
      cancelLabel = 'Cancel',
      disabled,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const [inner, setInner] = React.useState(defaultEditing);
    const controlled = editing !== undefined;
    const isEditing = !disabled && (controlled ? editing : inner);
    const setEditing = (next: boolean) => {
      if (!controlled) setInner(next);
      onEditingChange?.(next);
    };

    const root = React.useRef<HTMLDivElement | null>(null);
    const pen = React.useRef<HTMLButtonElement | null>(null);
    const wasEditing = React.useRef(isEditing);

    /* Into the control on opening; back to the pen on closing. */
    React.useEffect(() => {
      if (isEditing && !wasEditing.current) {
        root.current
          ?.querySelector<HTMLElement>('[data-inline-editor] :is(input, select, textarea, button, [tabindex])')
          ?.focus();
      }
      if (!isEditing && wasEditing.current) pen.current?.focus();
      wasEditing.current = isEditing;
    }, [isEditing]);

    const confirm = () => {
      onConfirm?.();
      setEditing(false);
    };
    const cancel = () => {
      onCancel?.();
      setEditing(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || !isEditing) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        cancel();
      } else if (event.key === 'Enter') {
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'button') {
          event.preventDefault();
          confirm();
        }
      }
    };

    return (
      <div
        ref={(node) => {
          root.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn('group/inline-edit flex min-w-0 items-center gap-1', className)}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {isEditing ? (
          <>
            <div data-inline-editor="" className="min-w-0 flex-1">
              {editor}
            </div>
            <IconButton icon="check" label={confirmLabel} size="sm" onClick={confirm} />
            <IconButton icon="x" label={cancelLabel} size="sm" onClick={cancel} />
          </>
        ) : (
          <>
            <div className="min-w-0">{children}</div>
            {!disabled && (
              /* Hidden until the cell is hovered or something in it has focus,
                 and never `display:none` — it stays tabbable and announced. */
              <IconButton
                ref={pen}
                icon="pencil-simple"
                label={`Edit ${label}`}
                size="sm"
                onClick={() => setEditing(true)}
                className={cn(
                  'opacity-0 transition-opacity',
                  'group-hover/inline-edit:opacity-100 group-focus-within/inline-edit:opacity-100 focus-visible:opacity-100',
                  'motion-reduce:transition-none',
                )}
              />
            )}
          </>
        )}
      </div>
    );
  },
);
InlineEdit.displayName = 'InlineEdit';

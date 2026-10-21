import * as React from 'react';
import { cn } from '../../lib/cn';
import { IconButton } from '../../atoms/icon-button';
import { DatePicker, type DatePickerProps } from '../date-picker';
import { Popover } from '../popover';

/**
 * InlineDateEdit — a date you can change in place. The date reads as text; a
 * calendar button appears on hover or focus; it opens a `DatePicker` in a
 * popover, and choosing a day changes the value and closes it. The picker's own
 * footer button reads "Cancel" and just closes.
 *
 * Read off Figma (`5714:45152`): the date, a calendar disc beside it, the picker
 * below. **There is no confirm step**, unlike `InlineEdit` — picking a day *is*
 * the decision, and a second "are you sure" on a calendar would be the only
 * calendar in the product that asks. If a change must be reviewed first, use
 * `InlineEdit` with the picker as its `editor`.
 *
 * The button is the same 24 tonal disc as `InlineEdit`'s (Figma's
 * `_Planning_Table_Icon_Button`, `Type=Date Picker`), always in the tab order
 * and only drawn on hover, keyboard focus, or while the picker is open.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface InlineDateEditProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  /** The date, ISO `yyyy-mm-dd`. */
  value?: string;
  /** Fires with the chosen ISO date; the popover then closes. */
  onChange?: (iso: string) => void;
  /** What the date is — "due date". Names the button: "Change due date". */
  label: string;
  /** How the date reads. Default: the ISO string, as the design draws it. */
  format?: (iso: string) => string;
  /** Shown while there is no date. */
  placeholder?: string;
  /** `min`, `max`, `today` and the rest go to the `DatePicker`. */
  picker?: Omit<DatePickerProps, 'value' | 'onChange' | 'mode' | 'clearable' | 'onClear' | 'clearLabel'>;
  /** Which edge of the picker lines up with the button. `right` for a date in the last columns, so it opens leftwards. */
  align?: 'left' | 'right';
  /** No button; the date just reads. */
  disabled?: boolean;
}

export const InlineDateEdit = React.forwardRef<HTMLDivElement, InlineDateEditProps>(
  (
    { className, value, onChange, label, format = (iso) => iso, placeholder = 'No date', picker, align = 'left', disabled, ...props },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    /* Opened from the keyboard (a click with no pointer, `detail === 0`)? Then
       focus moves into the picker. Opened with the mouse, focus stays on the
       button: moving it in by script and back out on close would leave the
       browser treating the button as keyboard-focused, and it would stay drawn
       after the pointer had left. */
    const [byKeyboard, setByKeyboard] = React.useState(false);
    return (
      <div
        ref={ref}
        className={cn('group/inline-edit flex min-w-0 items-center gap-1', className)}
        {...props}
      >
        <span className="min-w-0 whitespace-nowrap text-body-sm-regular text-text-primary">
          {value ? format(value) : <span className="text-text-tertiary">{placeholder}</span>}
        </span>
        {!disabled && (
          <Popover
            open={open}
            onOpenChange={setOpen}
            width="auto"
            align={align}
            panelClassName="p-0"
            autoFocus={byKeyboard}
            trigger={
              /* The button itself is the trigger — `Popover` wires `aria-expanded`
                 onto it, so it cannot sit inside a `Tooltip` wrapper. Its name
                 shows as the native hover hint. */
              <IconButton
                icon="calendar-blank"
                label={`Change ${label}`}
                variant="tonal"
                size="xs"
                onClick={(event) => setByKeyboard(event.detail === 0)}
                className={cn(
                  'opacity-0 transition-opacity',
                  /* Hover, keyboard focus, or the picker being open — not any focus:
                     closing the picker returns focus here, and a button that
                     stayed drawn would look like the cell were still hovered. */
                  'group-hover/inline-edit:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100',
                  'motion-reduce:transition-none',
                )}
              />
            }
            content={
              <DatePicker
                {...picker}
                mode="day"
                value={value}
                onChange={(iso) => {
                  onChange?.(iso);
                  setOpen(false);
                }}
                clearLabel="Cancel"
                onClear={() => setOpen(false)}
                className="border-0 shadow-none"
              />
            }
          />
        )}
      </div>
    );
  },
);
InlineDateEdit.displayName = 'InlineDateEdit';

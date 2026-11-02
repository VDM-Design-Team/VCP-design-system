import * as React from 'react';
import { Icon } from '../../atoms/icon';
import { Input } from '../../atoms/input';
import { DatePicker, type DatePickerProps } from '../date-picker';
import { Popover } from '../popover';

/**
 * DateField — a date in a form: a field that shows it, and a calendar that picks it. Built to Figma's date
 * fields (a calendar glyph, then `2026-03-02`) in the Add Required Details dialog and the detail card.
 *
 * It is `Input` as the trigger — read-only, so the keyboard cannot type a malformed date — with a
 * `DatePicker` in a `Popover`. The field is a `combobox` (it opens a calendar, and that role allows the
 * expanded state the popover sets). The calendar opens with `strategy="fixed"`, so a scrolling dialog or table
 * cannot clip it, and picking a day closes it.
 *
 * **Estimated dates.** `estimated` writes "(est.)" after the date — a value the system calculated rather than
 * a person set, as the Planning table writes it. Picking a day yourself is the caller's cue to clear it.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface DateFieldProps {
  /** The date, ISO `yyyy-mm-dd`. Empty shows the placeholder. */
  value?: string;
  /** Fires with the chosen ISO date; the calendar then closes. */
  onChange?: (iso: string) => void;
  /** A calculated date, not one a person set — reads "(est.)". */
  estimated?: boolean;
  /** Shown while there is no date. */
  placeholder?: string;
  /** Names the field when no `Field` label does. */
  'aria-label'?: string;
  /** From a `Field`: the control's id, and the message it is described by. */
  id?: string;
  'aria-describedby'?: string;
  invalid?: boolean;
  disabled?: boolean;
  /** `min`, `max`, `today` and the rest go to the `DatePicker`. */
  picker?: Omit<DatePickerProps, 'value' | 'onChange' | 'mode' | 'clearable' | 'onClear' | 'clearLabel'>;
  className?: string;
}

export const DateField = React.forwardRef<HTMLInputElement, DateFieldProps>(
  (
    {
      value,
      onChange,
      estimated,
      placeholder = '-',
      id,
      invalid,
      disabled,
      picker,
      className,
      'aria-label': ariaLabel,
      'aria-describedby': describedBy,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    return (
      <Popover
        open={open}
        onOpenChange={setOpen}
        align="left"
        className={className ?? 'w-full'}
        /* As `InlineDateEdit` sets it: the panel is the picker, no wider and with no padding of its own. */
        width="auto"
        strategy="fixed"
        panelClassName="p-0"
        trigger={
          <Input
            ref={ref}
            id={id}
            readOnly
            role="combobox"
            fullWidth
            disabled={disabled}
            invalid={invalid}
            aria-label={ariaLabel}
            aria-describedby={describedBy}
            leadingIcon={<Icon name="calendar-blank" size="sm" />}
            placeholder={placeholder}
            value={value ? `${value}${estimated ? ' (est.)' : ''}` : ''}
            onClick={() => !disabled && setOpen(true)}
          />
        }
        content={
          <DatePicker
            mode="day"
            value={value}
            onChange={(iso) => {
              onChange?.(iso);
              setOpen(false);
            }}
            {...picker}
          />
        }
      />
    );
  },
);
DateField.displayName = 'DateField';

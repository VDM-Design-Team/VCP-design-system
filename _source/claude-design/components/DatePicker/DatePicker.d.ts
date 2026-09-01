import * as React from 'react';
export interface DatePickerProps {
  /** ISO yyyy-mm-dd. */
  value?: string;
  onChange?: (iso: string) => void;
  /** Controlled visible month (ISO date inside it). */
  month?: string;
  onMonthChange?: (iso: string) => void;
  /** ISO date → load level; paints a capacity dot under the day. */
  capacity?: Record<string, 'low' | 'medium' | 'high'>;
  /** ISO dates from the Holiday Registry — tinted and marked. */
  holidays?: string[];
  /** Set with value to shade a range. */
  rangeEnd?: string;
  min?: string;
  max?: string;
  style?: React.CSSProperties;
}
export declare function DatePicker(props: DatePickerProps): JSX.Element;
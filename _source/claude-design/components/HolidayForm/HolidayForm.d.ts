import * as React from 'react';
export interface HolidayFormValue {
  name?: string;
  type?: string;
  start?: string;
  end?: string;
  /** 'some' reveals the domain checkboxes. */
  scope?: 'all' | 'some';
  domains?: string[];
  recurring?: boolean;
}
export interface HolidayFormProps {
  value?: HolidayFormValue;
  onChange?: (value: HolidayFormValue) => void;
  domains?: string[];
  style?: React.CSSProperties;
}
export declare function HolidayForm(props: HolidayFormProps): JSX.Element;
import * as React from 'react';
export interface RadioOption {
  value: string;
  label: React.ReactNode;
  /** Secondary description under the label. */
  hint?: React.ReactNode;
  disabled?: boolean;
}
export interface RadioGroupProps {
  options?: Array<string | RadioOption>;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  orientation?: 'vertical' | 'horizontal';
  disabled?: boolean;
  style?: React.CSSProperties;
}
export declare function RadioGroup(props: RadioGroupProps): JSX.Element;
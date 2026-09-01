import * as React from 'react';
export interface CheckboxProps {
  label?: React.ReactNode;
  checked?: boolean;
  /** Mixed state — parent row of a partially selected group. */
  indeterminate?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  style?: React.CSSProperties;
}
export declare function Checkbox(props: CheckboxProps): JSX.Element;
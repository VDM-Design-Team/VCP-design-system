import * as React from 'react';
export interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Toggle(props: ToggleProps): JSX.Element;
import * as React from 'react';
export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  /** Centred caption inside the rule. */
  label?: string;
  style?: React.CSSProperties;
}
export declare function Divider(props: DividerProps): JSX.Element;
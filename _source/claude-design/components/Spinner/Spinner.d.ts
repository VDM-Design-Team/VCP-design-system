import * as React from 'react';
export interface SpinnerProps {
  size?: number;
  thickness?: number;
  /** Visible text and the aria-label. */
  label?: string;
  style?: React.CSSProperties;
}
export declare function Spinner(props: SpinnerProps): JSX.Element;
import * as React from 'react';
export interface IconButtonProps {
  icon?: React.ReactNode;
  /** Required for a11y — becomes aria-label and the tooltip. */
  label: string;
  variant?: 'ghost' | 'filled' | 'outlined' | 'danger';
  size?: number;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
import * as React from 'react';
export interface BannerProps {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title?: React.ReactNode;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  onDismiss?: () => void;
  /** Right-aligned action slot. */
  action?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Banner(props: BannerProps): JSX.Element;
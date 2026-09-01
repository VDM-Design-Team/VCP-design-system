import * as React from 'react';
export interface EmailLayoutProps {
  /** Hidden inbox-preview line. */
  preheader?: string;
  heading?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  logoSrc?: string;
  style?: React.CSSProperties;
}
export declare function EmailLayout(props: EmailLayoutProps): JSX.Element;
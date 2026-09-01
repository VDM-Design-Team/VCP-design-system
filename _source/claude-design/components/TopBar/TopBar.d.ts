import * as React from 'react';
export interface TopBarProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Shows the back chevron. */
  onBack?: () => void;
  /** Small line above the title — e.g. the AV id. */
  breadcrumb?: React.ReactNode;
  /** Left of the bell — page-level buttons. */
  actions?: React.ReactNode;
  user?: { name: string; src?: string };
  notifications?: number;
  /** Role badge next to the user name. */
  role?: string;
  style?: React.CSSProperties;
}
export declare function TopBar(props: TopBarProps): JSX.Element;
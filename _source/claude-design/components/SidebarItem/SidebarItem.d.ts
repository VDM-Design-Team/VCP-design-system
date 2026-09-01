import * as React from 'react';
export interface SidebarItemProps {
  label: string;
  icon?: React.ReactNode;
  /** Active route — tinted surface + brand text. */
  selected?: boolean;
  /** Icon-only rail mode. */
  collapsed?: boolean;
  badge?: string | number;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export declare function SidebarItem(props: SidebarItemProps): JSX.Element;
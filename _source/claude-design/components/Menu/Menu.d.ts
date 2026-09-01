import * as React from 'react';
export interface MenuItem {
  key?: string;
  label?: React.ReactNode;
  icon?: string;
  shortcut?: string;
  tone?: 'default' | 'danger';
  disabled?: boolean;
  onClick?: () => void;
  /** Renders a rule instead of an item. */
  divider?: boolean;
}
export interface MenuProps {
  items?: MenuItem[];
  onSelect?: (key?: string) => void;
  /** Defaults to a ghost ellipsis IconButton. */
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: 'left' | 'right';
  style?: React.CSSProperties;
}
export declare function Menu(props: MenuProps): JSX.Element;
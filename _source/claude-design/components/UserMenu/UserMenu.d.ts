import * as React from 'react';
import type { MenuItem } from '../Menu/Menu';
import type { RoleName } from '../RoleBadge/RoleBadge';
export interface UserMenuProps {
  user?: { name?: string; src?: string };
  role?: RoleName;
  items?: MenuItem[];
  onSelect?: (key?: string) => void;
  /** Appended below a divider as a danger item. */
  onSignOut?: () => void;
  style?: React.CSSProperties;
}
export declare function UserMenu(props: UserMenuProps): JSX.Element;
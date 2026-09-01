import * as React from 'react';
export type UserRole = 'user' | 'admin' | 'superAdmin';
export interface SidebarNavItem { key: string; label: string; icon: string }
export interface SidebarProps {
  /** Drives which nav items render. user = 6 items, admin adds Manage, superAdmin is a different 4. */
  role?: UserRole;
  active?: string;
  onNavigate?: (key: string) => void;
  /** 76px icon-only rail. */
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  /** Domain switcher above the nav — User and Admin only. */
  showDomainSelector?: boolean;
  domain?: string;
  onDomainChange?: (domain: string) => void;
  domains?: string[];
  /** Primary CTA above 'Report a problem' — e.g. Create Added Value. */
  footerAction?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Sidebar(props: SidebarProps): JSX.Element;
export declare const NAV_BY_ROLE: Record<UserRole, SidebarNavItem[]>;
import * as React from 'react';
import type { UserRole } from '../Sidebar/Sidebar';
export interface AppShellProps {
  /** Selects the sidebar nav set and the role badge in the top bar. */
  role?: UserRole;
  active?: string;
  onNavigate?: (key: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  showDomainSelector?: boolean;
  domain?: string;
  onDomainChange?: (domain: string) => void;
  /** Primary CTA in the sidebar footer. */
  sidebarFooter?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  onBack?: () => void;
  actions?: React.ReactNode;
  user?: { name: string; src?: string };
  notifications?: number;
  /** Fills the fixed 390px right column. Omit for a single-column page. */
  detail?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function AppShell(props: AppShellProps): JSX.Element;
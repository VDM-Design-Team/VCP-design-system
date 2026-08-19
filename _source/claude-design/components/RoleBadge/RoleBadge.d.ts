import * as React from 'react';
export type RoleName = 'User' | 'Admin' | 'Admin Dev' | 'Super Admin';
export interface RoleBadgeProps {
  role?: RoleName;
  showIcon?: boolean;
  style?: React.CSSProperties;
}
export declare function RoleBadge(props: RoleBadgeProps): JSX.Element;
export declare const ROLE_STYLES: Record<RoleName, { bg: string; fg: string; icon: string }>;
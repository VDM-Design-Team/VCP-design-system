import * as React from 'react';
export interface StatCardProps {
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  /** e.g. '+12%'. */
  delta?: React.ReactNode;
  deltaTone?: 'up' | 'down' | 'flat';
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function StatCard(props: StatCardProps): JSX.Element;
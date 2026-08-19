import * as React from 'react';
export interface ProgressBarProps {
  value?: number;
  max?: number;
  /** Consumption status — budget dashboards switch tone as points run down. */
  tone?: 'brand' | 'success' | 'warning' | 'danger';
  height?: number;
  showLabel?: boolean;
  label?: string;
  style?: React.CSSProperties;
}
export declare function ProgressBar(props: ProgressBarProps): JSX.Element;
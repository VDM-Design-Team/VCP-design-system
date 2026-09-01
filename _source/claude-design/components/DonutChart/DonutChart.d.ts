import * as React from 'react';
export interface DonutChartProps {
  value?: number;
  max?: number;
  size?: number;
  thickness?: number;
  /** Half-donut gauge, as used on Cycle Summary. */
  half?: boolean;
  /** Overrides the centred percentage text. */
  label?: React.ReactNode;
  caption?: React.ReactNode;
  /** Omit to auto-escalate: blue → amber at 75% → red at 90%. */
  tone?: 'success' | 'warning' | 'danger' | string;
  style?: React.CSSProperties;
}
export declare function DonutChart(props: DonutChartProps): JSX.Element;
import * as React from 'react';
export interface GanttTask {
  id?: string;
  title: string;
  /** ISO date string. */
  start: string;
  end: string;
  assignee?: string;
  points?: number;
  severity?: 'critical' | 'high' | 'medium' | 'low';
}
export interface GanttChartProps {
  tasks?: GanttTask[];
  /** Chart window, ISO dates. */
  start: string;
  end: string;
  /** Draws the dashed today marker. */
  today?: string;
  onTaskClick?: (task: GanttTask) => void;
  rowHeight?: number;
  style?: React.CSSProperties;
}
export declare function GanttChart(props: GanttChartProps): JSX.Element;
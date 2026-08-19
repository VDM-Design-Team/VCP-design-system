import * as React from 'react';
import type { AVStatus } from '../StatusPill/StatusPill';
import type { Urgency } from '../UrgencyTag/UrgencyTag';
export interface PlanningRow {
  id: string;
  title: string;
  urgency?: Urgency;
  type?: string;
  initiator?: string;
  assignee?: string;
  startDate?: string;
  points?: number;
  dueDate?: string;
  /** Renders the due date in danger red. */
  overdue?: boolean;
  status?: AVStatus;
}
export interface PlanningGroup {
  key?: string;
  label: string;
  /** 'backlog' groups get the neutral header tint, cycles get the brand tint. */
  type?: 'cycle' | 'backlog';
  points?: number;
  collapsed?: boolean;
  rows?: PlanningRow[];
}
export interface PlanningTableProps {
  groups?: PlanningGroup[];
  onRowClick?: (row: PlanningRow) => void;
  onToggleGroup?: (key: string) => void;
  style?: React.CSSProperties;
}
export declare function PlanningTable(props: PlanningTableProps): JSX.Element;
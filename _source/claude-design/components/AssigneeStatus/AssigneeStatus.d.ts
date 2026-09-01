import * as React from 'react';
export type AssigneeStatusValue = 'Available' | 'At capacity' | 'Overloaded' | 'On holiday';
export interface AssigneeStatusProps {
  name: string;
  status?: AssigneeStatusValue;
  /** Points assigned — with capacity, renders a tooltip. */
  load?: number;
  capacity?: number;
  showAvatar?: boolean;
  style?: React.CSSProperties;
}
export declare function AssigneeStatus(props: AssigneeStatusProps): JSX.Element;
export declare const ASSIGNEE_STATUSES: Record<AssigneeStatusValue, { bg: string; fg: string; dot: string }>;
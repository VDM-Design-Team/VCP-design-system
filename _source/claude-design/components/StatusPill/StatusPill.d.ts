import * as React from 'react';
export type AVStatus = 'Draft' | 'In progress' | 'Ready for review' | 'Ready for hand-off' | 'Completed' | 'Blocked' | 'Archive';
export interface StatusPillProps {
  status?: AVStatus;
  /** Adds hover affordance for click-to-change-status. */
  interactive?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export declare function StatusPill(props: StatusPillProps): JSX.Element;
export declare const STATUSES: Record<AVStatus, { bg: string; fg: string }>;
import * as React from 'react';
export interface ProblemCardProps {
  /** Rank shown inside the severity strap. */
  index?: number | string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  children?: React.ReactNode;
  /** Attachment row under the body. */
  attachments?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export declare function ProblemCard(props: ProblemCardProps): JSX.Element;
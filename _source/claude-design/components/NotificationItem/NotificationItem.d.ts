import * as React from 'react';
export interface NotificationItemProps {
  kind?: 'handoff' | 'comment' | 'accepted' | 'rejected' | 'assigned' | 'overdue';
  title?: React.ReactNode;
  body?: React.ReactNode;
  timestamp?: React.ReactNode;
  /** Tints the row and shows the unread dot. */
  unread?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export declare function NotificationItem(props: NotificationItemProps): JSX.Element;
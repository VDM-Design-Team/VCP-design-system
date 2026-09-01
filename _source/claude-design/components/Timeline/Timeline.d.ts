import * as React from 'react';
export interface TimelineItem {
  id?: string;
  title: React.ReactNode;
  timestamp?: React.ReactNode;
  actor?: string;
  detail?: React.ReactNode;
  /** Colours the node. */
  kind?: 'created' | 'status' | 'handoff' | 'comment' | 'accepted' | 'rejected' | 'edit';
  /** Icon name for the node. */
  icon?: string;
}
export interface TimelineProps {
  items?: TimelineItem[];
  style?: React.CSSProperties;
}
export declare function Timeline(props: TimelineProps): JSX.Element;
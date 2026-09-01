import * as React from 'react';
export interface ChangelogCardProps {
  version?: string;
  date?: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  tags?: string[];
  /** With count > 1, renders the carousel dots. */
  index?: number;
  count?: number;
  onNavigate?: (index: number) => void;
  style?: React.CSSProperties;
}
export declare function ChangelogCard(props: ChangelogCardProps): JSX.Element;
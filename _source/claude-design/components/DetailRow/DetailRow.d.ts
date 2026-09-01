import * as React from 'react';
export interface DetailRowProps {
  label: React.ReactNode;
  children?: React.ReactNode;
  /** Heroicon name shown before the label. */
  icon?: string;
  onEdit?: () => void;
  /** Swaps the edit affordance to a confirm tick. */
  editing?: boolean;
  /** 'top' for multi-line values. */
  align?: 'center' | 'top';
  style?: React.CSSProperties;
}
export declare function DetailRow(props: DetailRowProps): JSX.Element;
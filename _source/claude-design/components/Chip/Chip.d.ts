import * as React from 'react';
export interface ChipProps {
  label: React.ReactNode;
  /** Leading node — typically an <Avatar size={22} />. */
  avatar?: React.ReactNode;
  /** Numeric suffix, separated by a hairline rule. */
  count?: number;
  onRemove?: () => void;
  selected?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export declare function Chip(props: ChipProps): JSX.Element;
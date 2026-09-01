import * as React from 'react';
export interface SegmentedControlProps {
  options?: Array<string | { value: string; label: string }>;
  value?: string;
  onChange?: (value: string) => void;
  size?: 'default' | 'small';
  style?: React.CSSProperties;
}
export declare function SegmentedControl(props: SegmentedControlProps): JSX.Element;
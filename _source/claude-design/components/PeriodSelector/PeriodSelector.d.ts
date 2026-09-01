import * as React from 'react';
export interface PeriodSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  /** Ordered list — the arrows step through it. */
  periods?: string[];
  label?: string;
  style?: React.CSSProperties;
}
export declare function PeriodSelector(props: PeriodSelectorProps): JSX.Element;
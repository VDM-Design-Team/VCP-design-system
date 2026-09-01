import * as React from 'react';
export interface FilterBarFilter {
  key: string;
  label: string;
  options: Array<string | { value: string; label: string }>;
  value?: string;
  onChange?: (value: string) => void;
  width?: number;
}
export interface FilterBarProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterBarFilter[];
  onReset?: () => void;
  /** VCP right-aligns the filter row above tables. */
  align?: 'left' | 'right';
  trailing?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function FilterBar(props: FilterBarProps): JSX.Element;
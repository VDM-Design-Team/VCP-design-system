import * as React from 'react';
export interface SearchSelectOption {
  value: string;
  label: React.ReactNode;
  /** false suppresses the leading avatar. */
  avatar?: boolean;
}
export interface SearchSelectProps {
  options?: Array<string | SearchSelectOption>;
  /** String for single select, array when multiple. */
  value?: string | string[];
  onChange?: (value: any) => void;
  placeholder?: string;
  renderOption?: (option: SearchSelectOption, selected: boolean) => React.ReactNode;
  emptyText?: string;
  multiple?: boolean;
  style?: React.CSSProperties;
}
export declare function SearchSelect(props: SearchSelectProps): JSX.Element;
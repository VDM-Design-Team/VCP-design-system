import * as React from 'react';
export interface PaginationDotsProps {
  count?: number;
  index?: number;
  onChange?: (index: number) => void;
  style?: React.CSSProperties;
}
export declare function PaginationDots(props: PaginationDotsProps): JSX.Element;
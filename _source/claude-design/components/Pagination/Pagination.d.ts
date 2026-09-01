import * as React from 'react';
export interface PaginationProps {
  page?: number;
  pageCount?: number;
  onChange?: (page: number) => void;
  style?: React.CSSProperties;
}
export declare function Pagination(props: PaginationProps): JSX.Element;
import * as React from 'react';
export interface DataTableColumn<Row = any> {
  key: string;
  label: string;
  /** Any grid track value — '120px', '1fr', 'minmax(0,2fr)'. */
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'right';
  render?: (row: Row) => React.ReactNode;
}
export interface DataTableProps<Row = any> {
  columns?: DataTableColumn<Row>[];
  rows?: Row[];
  onRowClick?: (row: Row) => void;
  /** Key of the currently sorted column. */
  sort?: string;
  onSortChange?: (key: string) => void;
  /** Adds the leading checkbox column with a header select-all. */
  selectable?: boolean;
  selected?: Array<string | number>;
  onSelectedChange?: (ids: Array<string | number>) => void;
  empty?: React.ReactNode;
  /** 44px rows instead of 56px. */
  dense?: boolean;
  style?: React.CSSProperties;
}
export declare function DataTable<Row = any>(props: DataTableProps<Row>): JSX.Element;
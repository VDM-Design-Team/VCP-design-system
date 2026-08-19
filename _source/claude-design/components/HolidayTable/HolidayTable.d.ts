import * as React from 'react';
import type { DomainName } from '../DomainLabel/DomainLabel';
export interface HolidayRow {
  id?: string;
  name: string;
  /** Display date, e.g. '27 Jul 2026'. */
  date: string;
  type?: string;
  appliesTo?: Array<DomainName | 'All domains'>;
  addedBy?: string;
  recurring?: boolean;
}
export interface HolidayTableProps {
  rows?: HolidayRow[];
  /** Admin / Super Admin — adds the edit + delete column. */
  editable?: boolean;
  onEdit?: (row: HolidayRow) => void;
  onDelete?: (row: HolidayRow) => void;
  style?: React.CSSProperties;
}
export declare function HolidayTable(props: HolidayTableProps): JSX.Element;
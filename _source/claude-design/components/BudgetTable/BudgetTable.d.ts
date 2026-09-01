import * as React from 'react';
import type { DomainName } from '../DomainLabel/DomainLabel';
export interface BudgetRow {
  domain: DomainName;
  allocated?: number;
  consumed?: number;
}
export interface BudgetTableProps {
  rows?: BudgetRow[];
  /** Admin / Super Admin — turns Allocated into an editable input. */
  editable?: boolean;
  onChange?: (domain: DomainName, allocated: number) => void;
  style?: React.CSSProperties;
}
export declare function BudgetTable(props: BudgetTableProps): JSX.Element;
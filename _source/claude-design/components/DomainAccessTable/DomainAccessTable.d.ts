import * as React from 'react';
import type { DomainName } from '../DomainLabel/DomainLabel';
export type AccessLevel = 'None' | 'View' | 'Contribute' | 'Admin';
export interface DomainAccessRow { domain: DomainName; level?: AccessLevel }
export interface DomainAccessTableProps {
  rows?: DomainAccessRow[];
  onChange?: (domain: DomainName, level: AccessLevel) => void;
  /** Renders ticks instead of radios. */
  readOnly?: boolean;
  style?: React.CSSProperties;
}
export declare function DomainAccessTable(props: DomainAccessTableProps): JSX.Element;
import * as React from 'react';
import type { DomainName } from '../DomainLabel/DomainLabel';
export interface DomainSelectorProps {
  domains?: DomainName[];
  value?: DomainName;
  onChange?: (domain: any) => void;
  /** Icon-only, for the collapsed sidebar rail. */
  collapsed?: boolean;
  style?: React.CSSProperties;
}
export declare function DomainSelector(props: DomainSelectorProps): JSX.Element;
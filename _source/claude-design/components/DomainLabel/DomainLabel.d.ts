import * as React from 'react';
export type DomainName = 'Design' | 'Development' | 'Governance' | 'Partners & Campaigns' | 'Marketing' | 'Operations';
export interface DomainLabelProps {
  domain?: DomainName;
  size?: 'default' | 'small';
  style?: React.CSSProperties;
}
export declare function DomainLabel(props: DomainLabelProps): JSX.Element;
export declare const DOMAINS: Record<DomainName, { bg: string; fg: string }>;
import * as React from 'react';
import type { DomainName } from '../DomainLabel/DomainLabel';
export interface DomainCardProps {
  domain: DomainName;
  lead?: string;
  members?: number;
  activeValues?: number;
  /** With consumed, renders the budget bar. */
  allocated?: number;
  consumed?: number;
  onClick?: () => void;
  onEdit?: () => void;
  style?: React.CSSProperties;
}
export declare function DomainCard(props: DomainCardProps): JSX.Element;
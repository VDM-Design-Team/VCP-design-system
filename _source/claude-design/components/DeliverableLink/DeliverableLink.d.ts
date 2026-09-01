import * as React from 'react';
import type { DomainName } from '../DomainLabel/DomainLabel';
export interface DeliverableLinkProps {
  label?: string;
  url?: string;
  /** Tags the link with its owning domain. */
  domain?: DomainName;
  /** 'filled' shows the link, 'editing' the input, 'empty' the placeholder. */
  state?: 'filled' | 'editing' | 'empty';
  onEdit?: () => void;
  onDelete?: () => void;
  onChange?: (url: string) => void;
  style?: React.CSSProperties;
}
export declare function DeliverableLink(props: DeliverableLinkProps): JSX.Element;
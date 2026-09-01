import * as React from 'react';
export interface BreadcrumbProps {
  items?: Array<string | { key?: string; label: string }>;
  onNavigate?: (key: string) => void;
  style?: React.CSSProperties;
}
export declare function Breadcrumb(props: BreadcrumbProps): JSX.Element;
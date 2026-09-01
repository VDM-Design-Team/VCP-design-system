import * as React from 'react';
export interface PageFooterProps {
  year?: number | string;
  org?: string;
  links?: Array<{ label: string; href?: string }>;
  /** Build string, e.g. 'v2.14'. */
  version?: string;
  style?: React.CSSProperties;
}
export declare function PageFooter(props: PageFooterProps): JSX.Element;
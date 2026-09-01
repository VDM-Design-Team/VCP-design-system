import * as React from 'react';
export interface LogoProps {
  height?: number;
  /** 'dark' inverts the mark for use on the brand navy. */
  mode?: 'light' | 'dark';
  /** Icon-only mark for the collapsed rail. */
  collapsed?: boolean;
  style?: React.CSSProperties;
}
export declare function Logo(props: LogoProps): JSX.Element;
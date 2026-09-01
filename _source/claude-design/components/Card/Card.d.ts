import * as React from 'react';
export interface CardProps {
  title?: React.ReactNode;
  /** Right-aligned header slot — usually a Button or IconButton. */
  action?: React.ReactNode;
  footer?: React.ReactNode;
  padded?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
}
export declare function Card(props: CardProps): JSX.Element;
import * as React from 'react';
export interface FeatureCardProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  /** 'brand' inverts onto the navy surface. */
  tone?: 'surface' | 'brand';
  style?: React.CSSProperties;
}
export declare function FeatureCard(props: FeatureCardProps): JSX.Element;
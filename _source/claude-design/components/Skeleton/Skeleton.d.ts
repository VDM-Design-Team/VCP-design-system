import * as React from 'react';
export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number;
  /** Square it with width and render a circle — avatar placeholders. */
  circle?: boolean;
  /** Render N stacked lines, last one short. */
  lines?: number;
  style?: React.CSSProperties;
}
export declare function Skeleton(props: SkeletonProps): JSX.Element;
import * as React from 'react';
export interface AvatarGroupProps {
  /** Names, or Avatar prop objects. */
  people?: Array<string | { name?: string; initials?: string; src?: string }>;
  /** Overflow beyond this collapses into a +N chip. */
  max?: number;
  size?: number;
  style?: React.CSSProperties;
}
export declare function AvatarGroup(props: AvatarGroupProps): JSX.Element;
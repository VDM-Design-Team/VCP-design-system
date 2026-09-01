import * as React from 'react';
export interface AvatarProps {
  /** Full name — drives the tone and the tooltip. */
  name?: string;
  /** Override the derived initials. */
  initials?: string;
  src?: string;
  size?: number;
  /** White ring, for overlapping stacks. */
  ring?: boolean;
  style?: React.CSSProperties;
}
export declare function Avatar(props: AvatarProps): JSX.Element;
import * as React from 'react';
export interface DropzoneProps {
  onFiles?: (files: File[]) => void;
  /** Accepted-types line under the label. */
  hint?: string;
  label?: string;
  style?: React.CSSProperties;
}
export declare function Dropzone(props: DropzoneProps): JSX.Element;
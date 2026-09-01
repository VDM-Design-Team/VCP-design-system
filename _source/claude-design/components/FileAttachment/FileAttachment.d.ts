import * as React from 'react';
export interface FileAttachmentProps {
  name: string;
  /** Human-readable size, e.g. '1.2 MB'. */
  size?: string;
  kind?: 'image' | 'pdf' | 'doc' | 'csv' | 'video';
  /** Image src for a real preview. */
  thumb?: string;
  onRemove?: () => void;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export declare function FileAttachment(props: FileAttachmentProps): JSX.Element;
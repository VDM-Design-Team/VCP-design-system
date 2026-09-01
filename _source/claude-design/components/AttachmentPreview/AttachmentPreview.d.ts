import * as React from 'react';
export interface AttachmentPreviewProps {
  name: string;
  /** Image source — required for an inline image preview. */
  src?: string;
  kind?: 'image' | 'doc';
  size?: string;
  onClose?: () => void;
  onDownload?: () => void;
  style?: React.CSSProperties;
}
export declare function AttachmentPreview(props: AttachmentPreviewProps): JSX.Element;
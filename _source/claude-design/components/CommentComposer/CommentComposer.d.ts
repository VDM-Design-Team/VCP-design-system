import * as React from 'react';
export interface CommentComposerProps {
  author?: string;
  /** Controlled value; omit for internal state. */
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  loading?: boolean;
  style?: React.CSSProperties;
}
export declare function CommentComposer(props: CommentComposerProps): JSX.Element;
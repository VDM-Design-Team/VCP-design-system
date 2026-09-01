import * as React from 'react';
export interface ModalProps {
  open?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** Right-aligned action row. */
  footer?: React.ReactNode;
  onClose?: () => void;
  width?: number;
  style?: React.CSSProperties;
}
export declare function Modal(props: ModalProps): JSX.Element | null;
import * as React from 'react';
export interface PopoverProps {
  content?: React.ReactNode;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: 'top' | 'bottom';
  width?: number;
  style?: React.CSSProperties;
}
export declare function Popover(props: PopoverProps): JSX.Element;
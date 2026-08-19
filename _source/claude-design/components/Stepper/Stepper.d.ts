import * as React from 'react';
export interface StepperProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  /** Inline unit, e.g. 'pts'. */
  suffix?: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export declare function Stepper(props: StepperProps): JSX.Element;
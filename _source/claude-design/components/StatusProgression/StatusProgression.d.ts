import * as React from 'react';
export interface StatusProgressionProps {
  /** Ordered workflow. Defaults to the standard VCP flow. */
  steps?: string[];
  /** The active step — everything before it renders as complete. */
  current?: string;
  onStepClick?: (step: string) => void;
  /** Paints the current step red for a blocked Added Value. */
  blocked?: boolean;
  style?: React.CSSProperties;
}
export declare function StatusProgression(props: StatusProgressionProps): JSX.Element;
export declare const FLOW: string[];
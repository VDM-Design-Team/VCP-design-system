import * as React from 'react';
export type Urgency = 'Low' | 'Medium' | 'High' | 'Critical' | 'Due soon';
export interface UrgencyTagProps {
  urgency?: Urgency;
  style?: React.CSSProperties;
}
export declare function UrgencyTag(props: UrgencyTagProps): JSX.Element;
export declare const URGENCIES: Record<Urgency, { bg: string; fg: string; fire: number }>;
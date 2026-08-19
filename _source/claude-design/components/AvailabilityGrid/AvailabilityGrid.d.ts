import * as React from 'react';
export type LoadLevel = 'free' | 'light' | 'busy' | 'full' | 'holiday';
export interface AvailabilityDay { key?: string; label: string; weekend?: boolean }
export interface AvailabilityPerson {
  name: string;
  /** day key → load level. */
  load?: Record<string, LoadLevel>;
  /** day key → points shown inside the cell. */
  points?: Record<string, number | string>;
}
export interface AvailabilityGridProps {
  people?: AvailabilityPerson[];
  days?: AvailabilityDay[];
  onCellClick?: (person: AvailabilityPerson, day: AvailabilityDay) => void;
  style?: React.CSSProperties;
}
export declare function AvailabilityGrid(props: AvailabilityGridProps): JSX.Element;
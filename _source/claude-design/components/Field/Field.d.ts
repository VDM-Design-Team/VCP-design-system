import * as React from 'react';
export interface FieldProps {
  label?: React.ReactNode;
  required?: boolean;
  /** Renders the small blue + affordance next to the label (repeatable groups). */
  onAdd?: () => void;
  helper?: string;
  /** Replaces helper and turns it red. */
  error?: string;
  htmlFor?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Field(props: FieldProps): JSX.Element;
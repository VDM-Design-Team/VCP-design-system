import * as React from 'react';
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  /** Red border — pair with Field's error. */
  invalid?: boolean;
  size?: 'small' | 'large';
}
export declare function Input(props: InputProps): JSX.Element;
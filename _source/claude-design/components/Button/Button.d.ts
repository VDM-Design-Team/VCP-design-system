import * as React from 'react';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. filled = primary action, outlined = secondary, text = tertiary. */
  variant?: 'filled' | 'outlined' | 'text';
  /** Figma names these Button_Small (36px) and Button_Normal (40px). `large` is an alias of `normal`. */
  size?: 'small' | 'normal' | 'large';
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}
export declare function Button(props: ButtonProps): JSX.Element;
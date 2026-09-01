import * as React from 'react';
export interface AccordionItem {
  key?: string;
  title: React.ReactNode;
  /** Right-aligned count or hint in the header. */
  meta?: React.ReactNode;
  content?: React.ReactNode;
}
export interface AccordionProps {
  items?: AccordionItem[];
  /** Controlled open keys; omit for internal state. */
  openKeys?: string[];
  onToggle?: (key: string) => void;
  /** Allow several panels open at once (uncontrolled mode). */
  multiple?: boolean;
  style?: React.CSSProperties;
}
export declare function Accordion(props: AccordionProps): JSX.Element;
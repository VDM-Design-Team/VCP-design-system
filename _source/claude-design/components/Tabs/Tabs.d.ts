import * as React from 'react';
export interface TabsProps {
  tabs?: Array<string | { key: string; label: string; count?: number }>;
  value?: string;
  onChange?: (key: string) => void;
  style?: React.CSSProperties;
}
export declare function Tabs(props: TabsProps): JSX.Element;
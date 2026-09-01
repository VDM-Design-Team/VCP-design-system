import * as React from 'react';
import type { DomainName } from '../DomainLabel/DomainLabel';
export interface MultipartPart {
  domain?: DomainName;
  /** dd-mm-yyyy. */
  date?: string;
  points?: number;
}
export interface MultipartEditorProps {
  parts?: MultipartPart[];
  onChange?: (parts: MultipartPart[]) => void;
  onAdd?: () => void;
  onRemove?: (index: number) => void;
  domains?: string[];
  style?: React.CSSProperties;
}
export declare function MultipartEditor(props: MultipartEditorProps): JSX.Element;
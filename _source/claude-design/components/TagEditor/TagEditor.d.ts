import * as React from 'react';
export interface Tag { label: string; colour?: string }
export interface TagEditorProps {
  tags?: Tag[];
  onAdd?: (tag: Tag) => void;
  onRemove?: (tag: Tag) => void;
  onColourChange?: (colour: string) => void;
  /** false renders a read-only tag list. */
  editable?: boolean;
  style?: React.CSSProperties;
}
export declare function TagEditor(props: TagEditorProps): JSX.Element;
export declare const TAG_COLOURS: string[];
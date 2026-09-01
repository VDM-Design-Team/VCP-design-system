import * as React from 'react';
export type RichTextCommand = 'bold' | 'italic' | 'underline' | 'strike' | 'ul' | 'ol' | 'link' | 'image' | 'file' | 'undo' | 'redo';
export interface RichTextToolbarProps {
  /** Which commands are currently on, e.g. { bold: true }. */
  active?: Partial<Record<RichTextCommand, boolean>>;
  onCommand?: (command: RichTextCommand) => void;
  style?: React.CSSProperties;
}
export declare function RichTextToolbar(props: RichTextToolbarProps): JSX.Element;
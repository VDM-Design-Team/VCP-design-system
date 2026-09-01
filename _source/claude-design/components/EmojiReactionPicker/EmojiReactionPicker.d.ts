import * as React from 'react';
export interface EmojiReaction { emoji: string; count: number; mine?: boolean }
export interface EmojiReactionPickerProps {
  /** Palette shown in the popover. */
  emoji?: string[];
  onSelect?: (emoji: string) => void;
  /** Existing reaction pills rendered before the trigger. */
  reactions?: EmojiReaction[];
  onToggle?: (emoji: string) => void;
  style?: React.CSSProperties;
}
export declare function EmojiReactionPicker(props: EmojiReactionPickerProps): JSX.Element;
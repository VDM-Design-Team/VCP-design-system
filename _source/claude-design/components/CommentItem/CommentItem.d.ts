import * as React from 'react';
export interface CommentReaction { emoji: string; count: number; mine?: boolean }
export interface CommentItemProps {
  author: string;
  avatarSrc?: string;
  timestamp?: React.ReactNode;
  children?: React.ReactNode;
  reactions?: CommentReaction[];
  replyCount?: number;
  onReply?: () => void;
  onReact?: (emoji: string) => void;
  edited?: boolean;
  style?: React.CSSProperties;
}
export declare function CommentItem(props: CommentItemProps): JSX.Element;
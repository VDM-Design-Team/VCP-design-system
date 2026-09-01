import * as React from 'react';
export interface WatchersListProps {
  watchers?: Array<string | { name: string }>;
  onAdd?: () => void;
  onRemove?: (watcher: string | { name: string }) => void;
  editable?: boolean;
  /** Overflow beyond this collapses to +N. */
  max?: number;
  style?: React.CSSProperties;
}
export declare function WatchersList(props: WatchersListProps): JSX.Element;
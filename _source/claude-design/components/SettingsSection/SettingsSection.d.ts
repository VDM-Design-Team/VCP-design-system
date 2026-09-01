import * as React from 'react';
export interface SettingsSectionProps {
  title: React.ReactNode;
  /** Explanatory copy under the title, in the left column. */
  description?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  /** Red title, for destructive sections. */
  danger?: boolean;
  style?: React.CSSProperties;
}
export declare function SettingsSection(props: SettingsSectionProps): JSX.Element;
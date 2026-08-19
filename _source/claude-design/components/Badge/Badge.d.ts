import * as React from 'react';
export interface BadgeProps {
  /**
   * Status name from the Figma Tags page, or a generic alias.
   * File fills: accepted/in progress/review/reopened/design review/for review/for qa/in qa/
   * ready for deploy/confirmed prod = rgb(219,234,254) · completed = rgb(220,252,231) ·
   * pending/initiated = rgb(254,249,194) · draft/backlog = rgb(226,232,240) ·
   * rejected = rgb(255,226,226).
   */
  tone?: 'accepted' | 'in progress' | 'review' | 'reopened' | 'design review' | 'for review'
    | 'for qa' | 'in qa' | 'ready for deploy' | 'confirmed prod' | 'completed' | 'pending'
    | 'initiated' | 'draft' | 'backlog' | 'rejected'
    | 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
  /** Figma Tag sizes: large = 28px / 14px, medium = 24px / 12px. */
  size?: 'large' | 'medium' | 'default' | 'small';
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Badge(props: BadgeProps): JSX.Element;

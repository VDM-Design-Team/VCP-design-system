import * as React from 'react';
export interface ReviewCriterion { label: React.ReactNode; met?: boolean }
export interface ReviewPanelProps {
  decision?: 'accepted' | 'changes' | 'rejected';
  onDecisionChange?: (decision: string) => void;
  /** Required when the decision is 'rejected' or 'changes'. */
  reason?: string;
  onReasonChange?: (reason: string) => void;
  criteria?: ReviewCriterion[];
  onCriterionToggle?: (index: number) => void;
  /** Past the deployment date — adds the warning and the overdue-reason field. */
  overdue?: boolean;
  style?: React.CSSProperties;
}
export declare function ReviewPanel(props: ReviewPanelProps): JSX.Element;
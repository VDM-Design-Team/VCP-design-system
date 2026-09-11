import * as React from 'react';
import { cn } from '../../lib/cn';
import { Select } from '../../atoms/select';
import { Input } from '../../atoms/input';

/**
 * RejectionReason — the reason someone gives for rejecting an Added Value: a
 * `Select` of named reasons, the chosen reason's explanation underneath, and a
 * free-text box when the reason is `Other`.
 *
 * Read off the Figma `Pending_Rejection_Reason` (`7847:105965`) and
 * `Handoff_Rejection_Reason` (`7262:7492`), audit batch 4, 11 September 2026.
 *
 * **Two modals need this and they use different reason sets**, which is why it
 * is its own component rather than something each one builds: the *pending*
 * rejection has five reasons, the *handoff* rejection has six, and the shape
 * is identical. Both sets live here as exported constants, the way `Sidebar`
 * owns its nav vocabulary — they are drawn in the design file, not configured
 * per domain, so there is one place for them.
 *
 * **The explanation under the select is the design's own wording**, not a
 * summary of it. It is what tells the person rejecting what the reason
 * actually covers, so it is data on the reason rather than prose at the call
 * site.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface RejectionReasonOption {
  /** Stable identity, never shown. What `value` matches and `onChange` reports. */
  value: string;
  /** The design's own label. */
  label: string;
  /** What the reason covers, shown under the select once it is chosen. */
  description?: string;
  /** Opens the free-text box. Exactly one reason in a set should set it. */
  freeText?: boolean;
}

/**
 * The five reasons for rejecting an Added Value that is still `Pending` —
 * before anyone has worked on it. Straight from the Figma set.
 */
export const PENDING_REJECTION_REASONS: readonly RejectionReasonOption[] = [
  {
    value: 'incomplete',
    label: 'Incomplete or Unclear Submission',
    description: 'Missing key details or not clear enough to review and proceed.',
  },
  {
    value: 'duplicate',
    label: 'Duplicate',
    description: 'Overlaps with an existing, completed, or previously rejected AV.',
  },
  {
    value: 'out-of-scope',
    label: 'Out of Scope',
    description:
      "Falls outside the Domain's responsibilities, was submitted to the wrong Domain, or falls outside VCP's defined scope.",
  },
  {
    value: 'needs-refinement',
    label: 'Needs Refinement',
    description: 'The problem is valid, but the proposed solution needs further development.',
  },
  { value: 'other', label: 'Other', freeText: true },
];

/**
 * The six reasons for rejecting a handoff — work that has been delivered and
 * is being sent back. Straight from the Figma set.
 */
export const HANDOFF_REJECTION_REASONS: readonly RejectionReasonOption[] = [
  {
    value: 'functionality',
    label: 'Functionality',
    description:
      'The delivery is complete but missing something that was requested in the Value such as a feature, interaction, or required deliverable.',
  },
  {
    value: 'design-mismatch',
    label: 'Design Mismatch',
    description:
      'The functionality works, but the visual design, layout, or styling does not match the expected or approved design.',
  },
  {
    value: 'execution-refinement',
    label: 'Execution Refinement',
    description:
      'The delivery is generally correct, but the execution quality needs improvements, adjustments, or fixes.',
  },
  {
    value: 'request-refinement',
    label: 'Request Refinement',
    description:
      'The original request lacked clarity, contained missing details, or caused misinterpretation, leading to an incorrect or incomplete delivery.',
  },
  {
    value: 'misalignment',
    label: 'Misalignment / Not Needed',
    description:
      "The work is no longer needed, doesn't fit the intended direction, or the Value shouldn't proceed (e.g., miscommunication, duplicate, outdated, or incorrectly scoped).",
  },
  { value: 'other', label: 'Other', freeText: true },
];

export interface RejectionReasonProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Which set of reasons. Use one of the two exported constants. */
  reasons: readonly RejectionReasonOption[];
  /** The chosen reason's `value`. Controlled. */
  value?: string;
  onChange?: (value: string) => void;
  /** The free text, when the chosen reason asks for it. Controlled. */
  detail?: string;
  onDetailChange?: (detail: string) => void;
  /** The select's accessible name. */
  label?: string;
  placeholder?: string;
  /** The free-text box's placeholder — the design's own wording. */
  detailPlaceholder?: string;
  disabled?: boolean;
  /** Critical border on the select. Pair it with a message from `Field`. */
  invalid?: boolean;
}

export const RejectionReason = React.forwardRef<HTMLDivElement, RejectionReasonProps>(
  (
    {
      className,
      reasons,
      value,
      onChange,
      detail,
      onDetailChange,
      label = 'Rejection reason',
      placeholder = 'Select Rejection Reason',
      detailPlaceholder = 'Specify the rejection reason (optional)',
      disabled,
      invalid,
      ...props
    },
    ref,
  ) => {
    const id = React.useId();
    const descriptionId = `${id}-description`;

    const chosen = reasons.find((reason) => reason.value === value);

    return (
      <div ref={ref} className={cn('flex flex-col gap-2', className)} {...props}>
        <Select
          options={reasons.map(({ value: v, label: l }) => ({ value: v, label: l }))}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          aria-label={label}
          /* The explanation describes the choice, so it is wired to the
             control rather than left as loose text beside it. */
          aria-describedby={chosen?.description ? descriptionId : undefined}
          disabled={disabled}
          invalid={invalid}
          fullWidth
        />

        {chosen?.description && (
          <p id={descriptionId} className="text-body-sm text-text-tertiary">
            {chosen.description}
          </p>
        )}

        {chosen?.freeText && (
          <Input
            fullWidth
            value={detail ?? ''}
            onChange={(event) => onDetailChange?.(event.target.value)}
            placeholder={detailPlaceholder}
            aria-label={`${label} — details`}
            disabled={disabled}
          />
        )}
      </div>
    );
  },
);
RejectionReason.displayName = 'RejectionReason';
